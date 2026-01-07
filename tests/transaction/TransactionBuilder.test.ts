import { describe, it, expect, beforeEach } from 'vitest';
import { TransactionBuilder } from '../../src/transaction/TransactionBuilder.js';
import { WalletSigner } from '../../src/transaction/Signer.js';
import { ValidationError } from '../../src/errors/index.js';
import { TEST_PRIVATE_KEY, TEST_ADDRESS } from '../setup.js';

describe('TransactionBuilder', () => {
  let signer: WalletSigner;

  beforeEach(() => {
    signer = new WalletSigner(TEST_PRIVATE_KEY);
  });

  describe('constructor', () => {
    it('should create builder with valid address', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      expect(builder).toBeDefined();
    });

    it('should throw ValidationError for invalid address', () => {
      expect(() => new TransactionBuilder('invalid')).toThrow(ValidationError);
      expect(() => new TransactionBuilder('0x123')).toThrow(ValidationError);
    });
  });

  describe('set', () => {
    it('should add SET operation with string value', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.set('key1', 'value1');
      expect(result).toBe(builder); // chainable
    });

    it('should add SET operation with Uint8Array value', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const bytes = new Uint8Array([1, 2, 3]);
      const result = builder.set('key1', bytes);
      expect(result).toBe(builder);
    });

    it('should throw for empty key', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      expect(() => builder.set('', 'value')).toThrow(ValidationError);
    });

    it('should allow chaining multiple set operations', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.set('key1', 'value1').set('key2', 'value2').set('key3', 'value3');
      expect(result).toBe(builder);
    });
  });

  describe('delete', () => {
    it('should add DELETE operation', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.delete('key1');
      expect(result).toBe(builder);
    });

    it('should throw for empty key', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      expect(() => builder.delete('')).toThrow(ValidationError);
    });
  });

  describe('addOperation', () => {
    it('should add raw operation', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.addOperation({ type: 'SET', key: 'key1', value: 'dmFsdWU=' });
      expect(result).toBe(builder);
    });
  });

  describe('withNonce', () => {
    it('should set custom nonce', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.withNonce(12345);
      expect(result).toBe(builder);
    });
  });

  describe('withTimestamp', () => {
    it('should set custom timestamp', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const result = builder.withTimestamp(1700000000);
      expect(result).toBe(builder);
    });
  });

  describe('build', () => {
    it('should build unsigned transaction', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const tx = builder.set('key1', 'value1').withNonce(12345).withTimestamp(1700000000).build();

      expect(tx.from.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
      expect(tx.nonce).toBe(12345);
      expect(tx.timestamp).toBe(1700000000);
      expect(tx.data.operations).toHaveLength(1);
      expect(tx.data.operations[0].type).toBe('SET');
      expect(tx.data.operations[0].key).toBe('key1');
    });

    it('should throw for empty operations', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      expect(() => builder.build()).toThrow(ValidationError);
    });

    it('should use default nonce and timestamp', () => {
      const builder = new TransactionBuilder(TEST_ADDRESS);
      const before = Date.now();
      const tx = builder.set('key1', 'value1').build();
      const after = Date.now();

      expect(tx.nonce).toBeGreaterThanOrEqual(before);
      expect(tx.nonce).toBeLessThanOrEqual(after);
      expect(tx.timestamp).toBeGreaterThan(0);
    });
  });

  describe('buildAndSign', () => {
    it('should build and sign transaction', async () => {
      const builder = new TransactionBuilder(signer.address);
      const tx = await builder
        .set('key1', 'value1')
        .withNonce(12345)
        .withTimestamp(1700000000)
        .buildAndSign(signer);

      expect(tx.from.toLowerCase()).toBe(signer.address.toLowerCase());
      expect(tx.nonce).toBe(12345);
      expect(tx.timestamp).toBe(1700000000);
      expect(tx.data.operations).toHaveLength(1);
      expect(tx.id).toBeDefined();
      expect(tx.id.length).toBe(32); // SHA256 hash
      expect(tx.signature).toBeDefined();
      expect(tx.signature.length).toBe(65); // r + s + v
    });

    it('should throw if signer address does not match', async () => {
      const otherSigner = WalletSigner.createRandom();
      const builder = new TransactionBuilder(TEST_ADDRESS);

      await expect(builder.set('key1', 'value1').buildAndSign(otherSigner)).rejects.toThrow(
        ValidationError
      );
    });

    it('should produce different signatures for different transactions', async () => {
      const builder1 = new TransactionBuilder(signer.address);
      const builder2 = new TransactionBuilder(signer.address);

      const tx1 = await builder1.set('key1', 'value1').withNonce(1).buildAndSign(signer);
      const tx2 = await builder2.set('key2', 'value2').withNonce(2).buildAndSign(signer);

      expect(tx1.signature).not.toEqual(tx2.signature);
      expect(tx1.id).not.toEqual(tx2.id);
    });
  });
});
