import type { Transaction } from './transaction.js';

/**
 * Blockchain metadata
 */
export interface ChainInfo {
  height: number;
  current_hash: string;
  genesis_hash: string;
  authorities: string[];
}

/**
 * Block header information
 */
export interface BlockHeader {
  version: number;
  height: number;
  previous_hash: string;
  timestamp: number;
  merkle_root: string;
  state_root: string;
  producer_addr: string;
  nonce: number;
}

/**
 * Complete block with transactions
 */
export interface Block {
  header: BlockHeader;
  transactions: Transaction[];
  signature: string;
}
