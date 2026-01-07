/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Response from transaction submission
 */
export interface SubmitTransactionResponse {
  transaction_hash: string;
  status: 'submitted';
}

/**
 * Balance information for an address
 */
export interface BalanceInfo {
  address: string;
  balance: string;  // Balance in wei (as string for big numbers)
  balance_formatted: string;  // Human-readable format (e.g., "33.33M PDR")
}

/**
 * Token configuration
 */
export interface TokenInfo {
  name: string;
  symbol: string;
  decimals: number;
  total_supply?: string;
}

/**
 * Gas configuration
 */
export interface GasConfig {
  enabled: boolean;
  base_fee: string;     // Base fee in wei
  per_byte_fee: string; // Per-byte fee in wei
}

/**
 * Gas estimation result
 */
export interface GasEstimate {
  transaction_size: number;
  base_fee: string;
  per_byte_fee: string;
  size_fee: string;
  total_fee: string;
  total_fee_formatted: string;
}
