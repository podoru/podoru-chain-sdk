/**
 * Base error class for Podoru SDK
 */
export class PodoruError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PodoruError';
    Object.setPrototypeOf(this, PodoruError.prototype);
  }
}

/**
 * Error from API requests
 */
export class ApiError extends PodoruError {
  readonly statusCode: number;
  readonly response?: unknown;

  constructor(message: string, statusCode: number, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Error during transaction processing
 */
export class TransactionError extends PodoruError {
  readonly transactionHash?: string;

  constructor(message: string, transactionHash?: string) {
    super(message);
    this.name = 'TransactionError';
    this.transactionHash = transactionHash;
    Object.setPrototypeOf(this, TransactionError.prototype);
  }
}

/**
 * Error during transaction signing
 */
export class SigningError extends PodoruError {
  constructor(message: string) {
    super(message);
    this.name = 'SigningError';
    Object.setPrototypeOf(this, SigningError.prototype);
  }
}

/**
 * Validation error for invalid inputs
 */
export class ValidationError extends PodoruError {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * WebSocket connection error
 */
export class WebSocketError extends PodoruError {
  readonly code?: number;

  constructor(message: string, code?: number) {
    super(message);
    this.name = 'WebSocketError';
    this.code = code;
    Object.setPrototypeOf(this, WebSocketError.prototype);
  }
}
