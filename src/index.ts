// Client exports
export { PodoruClient, WebSocketClient } from './client/index.js';
export type { PodoruClientConfig, WebSocketClientConfig } from './client/index.js';

// Transaction exports
export { TransactionBuilder, WalletSigner, serializeSignature } from './transaction/index.js';
export type { Signer, SignatureResult } from './transaction/index.js';

// Error exports
export {
  PodoruError,
  ApiError,
  TransactionError,
  SigningError,
  ValidationError,
  WebSocketError,
} from './errors/index.js';

// Utility exports
export {
  base64Encode,
  base64Decode,
  base64DecodeBytes,
  hexToBytes,
  bytesToHex,
  sha256,
  sha256Hex,
  isValidAddress,
  normalizeAddress,
  addressEquals,
} from './utils/index.js';

// Type exports
export type {
  // API types
  ApiResponse,
  SubmitTransactionResponse,
  // Chain types
  ChainInfo,
  BlockHeader,
  Block,
  // Transaction types
  OperationType,
  Operation,
  TransactionData,
  Transaction,
  UnsignedTransaction,
  // State types
  StateEntry,
  PrefixQueryResult,
  StateValueResponse,
  // Node types
  NodeInfo,
  Peer,
  MempoolInfo,
  HealthResponse,
  // Event types
  EventType,
  BlockEvent,
  TransactionEvent,
  ChainUpdateEvent,
  MempoolUpdateEvent,
  WebSocketEvent,
  EventDataMap,
} from './types/index.js';
