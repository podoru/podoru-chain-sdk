import type { ChainInfo, Block } from '../types/chain.js';
import type { Transaction } from '../types/transaction.js';
import type { SubmitTransactionResponse } from '../types/api.js';
import type { StateValueResponse, PrefixQueryResult } from '../types/state.js';
import type { NodeInfo, Peer, MempoolInfo, HealthResponse } from '../types/node.js';
import { ApiError } from '../errors/index.js';

/**
 * Configuration for PodoruClient
 */
export interface PodoruClientConfig {
  baseUrl: string;
  timeout?: number;
  headers?: Record<string, string>;
}

/**
 * REST API client for Podoru Chain
 */
export class PodoruClient {
  private baseUrl: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: PodoruClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.timeout = config.timeout ?? 30000;
    this.headers = config.headers ?? {};
  }

  /**
   * Internal fetch helper with error handling
   */
  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...this.headers,
          ...options?.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new ApiError(`API Error: ${response.status} - ${errorText}`, response.status);
      }

      const json = (await response.json()) as { success?: boolean; data?: T; error?: string };

      // Unwrap the {success: true, data: ...} response format
      if (json.success === false) {
        throw new ApiError(json.error || 'Unknown error', 400, json);
      }

      if (json.success && json.data !== undefined) {
        return json.data;
      }

      return json as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      throw new ApiError(`Network error: ${error instanceof Error ? error.message : 'unknown'}`, 0);
    }
  }

  // ===== Chain Endpoints =====

  /**
   * Get blockchain information
   */
  async getChainInfo(): Promise<ChainInfo> {
    return this.fetch<ChainInfo>('/api/v1/chain/info');
  }

  /**
   * Get block by hash
   */
  async getBlockByHash(hash: string): Promise<Block> {
    return this.fetch<Block>(`/api/v1/block/${hash}`);
  }

  /**
   * Get block by height
   */
  async getBlockByHeight(height: number): Promise<Block> {
    return this.fetch<Block>(`/api/v1/block/height/${height}`);
  }

  /**
   * Get the latest block
   */
  async getLatestBlock(): Promise<Block> {
    return this.fetch<Block>('/api/v1/block/latest');
  }

  // ===== Transaction Endpoints =====

  /**
   * Get transaction by hash
   */
  async getTransaction(hash: string): Promise<Transaction> {
    return this.fetch<Transaction>(`/api/v1/transaction/${hash}`);
  }

  /**
   * Submit a signed transaction
   */
  async submitTransaction(tx: Transaction): Promise<SubmitTransactionResponse> {
    return this.fetch<SubmitTransactionResponse>('/api/v1/transaction', {
      method: 'POST',
      body: JSON.stringify({ transaction: tx }),
    });
  }

  // ===== State Endpoints =====

  /**
   * Get a single state value
   */
  async getState(key: string): Promise<StateValueResponse> {
    return this.fetch<StateValueResponse>(`/api/v1/state/${encodeURIComponent(key)}`);
  }

  /**
   * Get multiple state values in a batch
   */
  async batchGetState(keys: string[]): Promise<Record<string, string | null>> {
    return this.fetch<Record<string, string | null>>('/api/v1/state/batch', {
      method: 'POST',
      body: JSON.stringify({ keys }),
    });
  }

  /**
   * Query state by key prefix
   */
  async queryByPrefix(prefix: string, limit?: number): Promise<PrefixQueryResult> {
    return this.fetch<PrefixQueryResult>('/api/v1/state/query/prefix', {
      method: 'POST',
      body: JSON.stringify({ prefix, limit: limit ?? 100 }),
    });
  }

  // ===== Node Endpoints =====

  /**
   * Get node information
   */
  async getNodeInfo(): Promise<NodeInfo> {
    return this.fetch<NodeInfo>('/api/v1/node/info');
  }

  /**
   * Get connected peers
   */
  async getPeers(): Promise<Peer[]> {
    return this.fetch<Peer[]>('/api/v1/node/peers');
  }

  /**
   * Health check
   */
  async getHealth(): Promise<HealthResponse> {
    return this.fetch<HealthResponse>('/api/v1/node/health');
  }

  // ===== Mempool Endpoints =====

  /**
   * Get mempool information and pending transactions
   */
  async getMempool(): Promise<MempoolInfo> {
    return this.fetch<MempoolInfo>('/api/v1/mempool');
  }
}
