import type {
  EventType,
  WebSocketEvent,
  BlockEvent,
  TransactionEvent,
  ChainUpdateEvent,
  MempoolUpdateEvent,
  EventDataMap,
} from '../types/events.js';
import { WebSocketError } from '../errors/index.js';

/**
 * WebSocket close event (cross-platform)
 */
export interface WsCloseEvent {
  code: number;
  reason: string;
  wasClean: boolean;
}

/**
 * Configuration for WebSocketClient
 */
export interface WebSocketClientConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

type EventCallback<T> = (event: T) => void;

/**
 * WebSocket client for real-time Podoru Chain events
 */
export class WebSocketClient {
  private url: string;
  private reconnectInterval: number;
  private maxReconnectAttempts: number;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private subscriptions: Set<EventType> = new Set();
  private listeners: Map<string, Set<EventCallback<unknown>>> = new Map();
  private shouldReconnect = true;

  constructor(config: WebSocketClientConfig) {
    this.url = config.url;
    this.reconnectInterval = config.reconnectInterval ?? 3000;
    this.maxReconnectAttempts = config.maxReconnectAttempts ?? Infinity;
  }

  /**
   * Check if connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to the WebSocket server
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          // Resubscribe to events after reconnection
          if (this.subscriptions.size > 0) {
            this.sendSubscription(Array.from(this.subscriptions));
          }
          this.emit('connect', undefined);
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as WebSocketEvent;
            this.emit(data.type, data);
          } catch {
            // Ignore parse errors
          }
        };

        this.ws.onerror = () => {
          const error = new WebSocketError('WebSocket error');
          this.emit('error', error);
        };

        this.ws.onclose = (event) => {
          this.emit('disconnect', event);
          if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            setTimeout(() => this.connect(), this.reconnectInterval);
          }
        };
      } catch (error) {
        reject(new WebSocketError(`Failed to connect: ${error instanceof Error ? error.message : 'unknown'}`));
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    this.shouldReconnect = false;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Subscribe to event types
   */
  subscribe(events: EventType[]): void {
    events.forEach((event) => this.subscriptions.add(event));
    if (this.isConnected) {
      this.sendSubscription(events);
    }
  }

  /**
   * Unsubscribe from event types
   */
  unsubscribe(events: EventType[]): void {
    events.forEach((event) => this.subscriptions.delete(event));
    if (this.isConnected) {
      this.sendUnsubscription(events);
    }
  }

  private sendSubscription(events: EventType[]): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ action: 'subscribe', events }));
    }
  }

  private sendUnsubscription(events: EventType[]): void {
    if (this.ws && this.isConnected) {
      this.ws.send(JSON.stringify({ action: 'unsubscribe', events }));
    }
  }

  /**
   * Register event listener
   */
  on<K extends EventType>(
    event: K,
    callback: EventCallback<WebSocketEvent<EventDataMap[K]>>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback as EventCallback<unknown>);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback as EventCallback<unknown>);
    };
  }

  /**
   * Listen for new block events
   */
  onBlock(callback: (event: BlockEvent) => void): () => void {
    return this.on('new_block', (event) => callback(event.data));
  }

  /**
   * Listen for new transaction events
   */
  onTransaction(callback: (event: TransactionEvent) => void): () => void {
    return this.on('new_transaction', (event) => callback(event.data));
  }

  /**
   * Listen for chain update events
   */
  onChainUpdate(callback: (event: ChainUpdateEvent) => void): () => void {
    return this.on('chain_update', (event) => callback(event.data));
  }

  /**
   * Listen for mempool update events
   */
  onMempoolUpdate(callback: (event: MempoolUpdateEvent) => void): () => void {
    return this.on('mempool_update', (event) => callback(event.data));
  }

  /**
   * Listen for connection events
   */
  onConnect(callback: () => void): () => void {
    if (!this.listeners.has('connect')) {
      this.listeners.set('connect', new Set());
    }
    this.listeners.get('connect')!.add(callback as EventCallback<unknown>);
    return () => {
      this.listeners.get('connect')?.delete(callback as EventCallback<unknown>);
    };
  }

  /**
   * Listen for disconnect events
   */
  onDisconnect(callback: (event: WsCloseEvent) => void): () => void {
    if (!this.listeners.has('disconnect')) {
      this.listeners.set('disconnect', new Set());
    }
    this.listeners.get('disconnect')!.add(callback as EventCallback<unknown>);
    return () => {
      this.listeners.get('disconnect')?.delete(callback as EventCallback<unknown>);
    };
  }

  /**
   * Listen for error events
   */
  onError(callback: (error: Error) => void): () => void {
    if (!this.listeners.has('error')) {
      this.listeners.set('error', new Set());
    }
    this.listeners.get('error')!.add(callback as EventCallback<unknown>);
    return () => {
      this.listeners.get('error')?.delete(callback as EventCallback<unknown>);
    };
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}
