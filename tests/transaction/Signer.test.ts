import { describe, it, expect } from 'vitest';
import { WalletSigner, serializeSignature } from '../../src/transaction/Signer.js';
import { SigningError } from '../../src/errors/index.js';
import { TEST_PRIVATE_KEY, TEST_ADDRESS, TEST_MNEMONIC } from '../setup.js';

describe('WalletSigner', () => {
  describe('constructor', () => {
    it('should create signer from private key', () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      expect(signer.address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
    });

    it('should throw SigningError for invalid private key', () => {
      expect(() => new WalletSigner('invalid')).toThrow(SigningError);
      expect(() => new WalletSigner('0x123')).toThrow(SigningError);
    });
  });

  describe('fromMnemonic', () => {
    it('should create signer from mnemonic', () => {
      const signer = WalletSigner.fromMnemonic(TEST_MNEMONIC);
      expect(signer.address).toBeDefined();
      expect(signer.address.startsWith('0x')).toBe(true);
      expect(signer.address.length).toBe(42);
    });

    it('should create same signer from same mnemonic', () => {
      const signer1 = WalletSigner.fromMnemonic(TEST_MNEMONIC);
      const signer2 = WalletSigner.fromMnemonic(TEST_MNEMONIC);
      expect(signer1.address).toBe(signer2.address);
    });

    it('should support custom derivation path', () => {
      const signer1 = WalletSigner.fromMnemonic(TEST_MNEMONIC, "m/44'/60'/0'/0/0");
      const signer2 = WalletSigner.fromMnemonic(TEST_MNEMONIC, "m/44'/60'/0'/0/1");
      expect(signer1.address).not.toBe(signer2.address);
    });

    it('should throw SigningError for invalid mnemonic', () => {
      expect(() => WalletSigner.fromMnemonic('invalid mnemonic words')).toThrow(SigningError);
    });
  });

  describe('createRandom', () => {
    it('should create random signer', () => {
      const signer = WalletSigner.createRandom();
      expect(signer.address).toBeDefined();
      expect(signer.address.startsWith('0x')).toBe(true);
      expect(signer.address.length).toBe(42);
    });

    it('should create different signers each time', () => {
      const signer1 = WalletSigner.createRandom();
      const signer2 = WalletSigner.createRandom();
      expect(signer1.address).not.toBe(signer2.address);
    });
  });

  describe('address', () => {
    it('should return correct address', () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      expect(signer.address.toLowerCase()).toBe(TEST_ADDRESS.toLowerCase());
    });
  });

  describe('privateKey', () => {
    it('should return private key', () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      expect(signer.privateKey).toBe(TEST_PRIVATE_KEY);
    });
  });

  describe('sign', () => {
    it('should sign hash and return signature components', async () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      const hash = new Uint8Array(32).fill(1);

      const result = await signer.sign(hash);

      expect(result.r).toBeDefined();
      expect(result.s).toBeDefined();
      expect(result.v).toBeDefined();
      expect(result.r.startsWith('0x')).toBe(true);
      expect(result.s.startsWith('0x')).toBe(true);
      expect(result.r.length).toBe(66); // 0x + 64 hex chars
      expect(result.s.length).toBe(66);
      expect([27, 28]).toContain(result.v);
    });

    it('should produce deterministic signatures', async () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      const hash = new Uint8Array(32).fill(42);

      const sig1 = await signer.sign(hash);
      const sig2 = await signer.sign(hash);

      expect(sig1.r).toBe(sig2.r);
      expect(sig1.s).toBe(sig2.s);
      expect(sig1.v).toBe(sig2.v);
    });

    it('should produce different signatures for different hashes', async () => {
      const signer = new WalletSigner(TEST_PRIVATE_KEY);
      const hash1 = new Uint8Array(32).fill(1);
      const hash2 = new Uint8Array(32).fill(2);

      const sig1 = await signer.sign(hash1);
      const sig2 = await signer.sign(hash2);

      expect(sig1.r).not.toBe(sig2.r);
    });
  });
});

describe('serializeSignature', () => {
  it('should serialize signature to 65 bytes', () => {
    const sig = {
      r: '0x' + 'aa'.repeat(32),
      s: '0x' + 'bb'.repeat(32),
      v: 27,
    };

    const result = serializeSignature(sig);

    expect(result.length).toBe(65);
    expect(result.slice(0, 32)).toEqual(Array(32).fill(0xaa));
    expect(result.slice(32, 64)).toEqual(Array(32).fill(0xbb));
    expect(result[64]).toBe(0); // v normalized from 27 to 0
  });

  it('should normalize v=28 to 1', () => {
    const sig = {
      r: '0x' + 'aa'.repeat(32),
      s: '0x' + 'bb'.repeat(32),
      v: 28,
    };

    const result = serializeSignature(sig);
    expect(result[64]).toBe(1);
  });
});
