/**
 * WebSocket event types
 */
export type EventType = 'new_block' | 'new_transaction' | 'chain_update' | 'mempool_update';

/**
 * New block event data
 */
export interface BlockEvent {
  height: number;
  hash: string;
  timestamp: number;
  transaction_count: number;
  producer: string;
  previous_hash: string;
}

/**
 * New transaction event data
 */
export interface TransactionEvent {
  hash: string;
  from: string;
  timestamp: number;
  status: 'pending' | 'confirmed';
  nonce: number;
}

/**
 * Chain update event data
 */
export interface ChainUpdateEvent {
  height: number;
  current_hash: string;
  authorities: string[];
}

/**
 * Mempool update event data
 */
export interface MempoolUpdateEvent {
  count: number;
  recent_hashes: string[];
}

/**
 * Generic WebSocket event wrapper
 */
export interface WebSocketEvent<T = unknown> {
  type: EventType;
  data: T;
  timestamp: number;
}

/**
 * Map event types to their data types
 */
export interface EventDataMap {
  new_block: BlockEvent;
  new_transaction: TransactionEvent;
  chain_update: ChainUpdateEvent;
  mempool_update: MempoolUpdateEvent;
}
