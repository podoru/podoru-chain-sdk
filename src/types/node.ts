import type { Transaction } from './transaction.js';

/**
 * Node information
 */
export interface NodeInfo {
  version: string;
  node_type: string;
  address: string;
  p2p_address: string;
}

/**
 * Connected peer information
 */
export interface Peer {
  id: string;
  address: string;
  connected_at: number;
}

/**
 * Mempool information with pending transactions
 */
export interface MempoolInfo {
  count: number;
  transactions: Transaction[];
}

/**
 * Health check response
 */
export interface HealthResponse {
  status: string;
}
