import type { Operation, Transaction, TransactionData, UnsignedTransaction } from '../types/transaction.js';
import { ValidationError } from '../errors/index.js';
import { base64Encode } from '../utils/encoding.js';
import { sha256 } from '../utils/hash.js';
import { isValidAddress } from '../utils/address.js';
import { Signer, serializeSignature } from './Signer.js';

/**
 * Builder for creating and signing transactions
 */
export class TransactionBuilder {
  private from: string;
  private operations: Operation[] = [];
  private _nonce?: number;
  private _timestamp?: number;

  constructor(from: string) {
    if (!isValidAddress(from)) {
      throw new ValidationError(`Invalid address: ${from}`);
    }
    this.from = from;
  }

  /**
   * Add a SET operation
   * @param key - The key to set
   * @param value - The value (string or Buffer)
   */
  set(key: string, value: string | Uint8Array): TransactionBuilder {
    if (!key) {
      throw new ValidationError('Key cannot be empty');
    }
    const encodedValue = base64Encode(value);
    this.operations.push({
      type: 'SET',
      key,
      value: encodedValue,
    });
    return this;
  }

  /**
   * Add a DELETE operation
   * @param key - The key to delete
   */
  delete(key: string): TransactionBuilder {
    if (!key) {
      throw new ValidationError('Key cannot be empty');
    }
    this.operations.push({
      type: 'DELETE',
      key,
    });
    return this;
  }

  /**
   * Add a TRANSFER operation to send tokens to an address
   * @param toAddress - The recipient address (0x-prefixed)
   * @param amount - Amount in wei as string (for big numbers) or bigint
   */
  transfer(toAddress: string, amount: string | bigint): TransactionBuilder {
    if (!isValidAddress(toAddress)) {
      throw new ValidationError(`Invalid recipient address: ${toAddress}`);
    }

    // Convert amount to bytes (big-endian)
    const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
    if (amountBigInt <= 0n) {
      throw new ValidationError('Transfer amount must be positive');
    }

    const amountBytes = this.bigIntToBytes(amountBigInt);
    const encodedAmount = base64Encode(amountBytes);

    // Balance key format: balance:<address>
    const balanceKey = `balance:${toAddress.toLowerCase()}`;

    this.operations.push({
      type: 'TRANSFER',
      key: balanceKey,
      value: encodedAmount,
    });
    return this;
  }

  /**
   * Add a MINT operation (authority-only)
   * @param toAddress - The recipient address (0x-prefixed)
   * @param amount - Amount in wei as string (for big numbers) or bigint
   */
  mint(toAddress: string, amount: string | bigint): TransactionBuilder {
    if (!isValidAddress(toAddress)) {
      throw new ValidationError(`Invalid recipient address: ${toAddress}`);
    }

    const amountBigInt = typeof amount === 'string' ? BigInt(amount) : amount;
    if (amountBigInt <= 0n) {
      throw new ValidationError('Mint amount must be positive');
    }

    const amountBytes = this.bigIntToBytes(amountBigInt);
    const encodedAmount = base64Encode(amountBytes);

    const balanceKey = `balance:${toAddress.toLowerCase()}`;

    this.operations.push({
      type: 'MINT',
      key: balanceKey,
      value: encodedAmount,
    });
    return this;
  }

  /**
   * Convert bigint to big-endian byte array
   */
  private bigIntToBytes(value: bigint): Uint8Array {
    if (value === 0n) {
      return new Uint8Array([0]);
    }

    const hex = value.toString(16);
    const paddedHex = hex.length % 2 === 0 ? hex : '0' + hex;
    const bytes = new Uint8Array(paddedHex.length / 2);
    for (let i = 0; i < paddedHex.length; i += 2) {
      bytes[i / 2] = parseInt(paddedHex.substring(i, i + 2), 16);
    }
    return bytes;
  }

  /**
   * Add a raw operation
   */
  addOperation(op: Operation): TransactionBuilder {
    this.operations.push(op);
    return this;
  }

  /**
   * Set a custom nonce (defaults to Date.now())
   */
  withNonce(nonce: number): TransactionBuilder {
    this._nonce = nonce;
    return this;
  }

  /**
   * Set a custom timestamp (defaults to current Unix timestamp)
   */
  withTimestamp(timestamp: number): TransactionBuilder {
    this._timestamp = timestamp;
    return this;
  }

  /**
   * Build an unsigned transaction
   */
  build(): UnsignedTransaction {
    if (this.operations.length === 0) {
      throw new ValidationError('Transaction must have at least one operation');
    }

    const timestamp = this._timestamp ?? Math.floor(Date.now() / 1000);
    const nonce = this._nonce ?? Date.now();

    const data: TransactionData = {
      operations: this.operations,
    };

    return {
      from: this.from,
      timestamp,
      data,
      nonce,
    };
  }

  /**
   * Build and sign the transaction
   */
  async buildAndSign(signer: Signer): Promise<Transaction> {
    // Verify signer address matches
    if (signer.address.toLowerCase() !== this.from.toLowerCase()) {
      throw new ValidationError(`Signer address ${signer.address} does not match transaction from address ${this.from}`);
    }

    const unsigned = this.build();

    // Compute hash: SHA256 of JSON stringified transaction
    // Order must be: from, timestamp, data, nonce (to match Go implementation)
    const hashData = {
      from: unsigned.from,
      timestamp: unsigned.timestamp,
      data: unsigned.data,
      nonce: unsigned.nonce,
    };
    const hashString = JSON.stringify(hashData);
    const hash = sha256(hashString);

    // Sign the hash
    const signatureResult = await signer.sign(hash);
    const signature = serializeSignature(signatureResult);

    return {
      id: Array.from(hash),
      from: unsigned.from,
      timestamp: unsigned.timestamp,
      data: unsigned.data,
      nonce: unsigned.nonce,
      signature,
    };
  }
}
