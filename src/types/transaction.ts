/**
 * Operation type for key-value store
 */
export type OperationType = 'SET' | 'DELETE' | 'MINT' | 'TRANSFER';

/**
 * Single operation on the key-value store
 */
export interface Operation {
  type: OperationType;
  key: string;
  value?: string; // Base64 encoded, omitted for DELETE
}

/**
 * Transaction data containing operations
 */
export interface TransactionData {
  operations: Operation[];
}

/**
 * Complete signed transaction
 */
export interface Transaction {
  id: number[];           // Transaction hash as byte array
  from: string;           // 0x-prefixed Ethereum-style address
  timestamp: number;      // Unix timestamp in seconds
  data: TransactionData;
  signature: number[];    // 65 bytes: r(32) + s(32) + v(1)
  nonce: number;
}

/**
 * Unsigned transaction (before signing)
 */
export interface UnsignedTransaction {
  from: string;
  timestamp: number;
  data: TransactionData;
  nonce: number;
}
