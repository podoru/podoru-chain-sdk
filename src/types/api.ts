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
