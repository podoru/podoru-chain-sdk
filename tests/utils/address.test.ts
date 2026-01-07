import { describe, it, expect } from 'vitest';
import {
  isValidAddress,
  normalizeAddress,
  addressEquals,
} from '../../src/utils/address.js';

describe('address utilities', () => {
  const validAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
  const validAddressLower = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';

  describe('isValidAddress', () => {
    it('should return true for valid addresses', () => {
      expect(isValidAddress(validAddress)).toBe(true);
      expect(isValidAddress(validAddressLower)).toBe(true);
      expect(isValidAddress('0x0000000000000000000000000000000000000000')).toBe(true);
      expect(isValidAddress('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')).toBe(true);
    });

    it('should return false for missing 0x prefix', () => {
      expect(isValidAddress('f39Fd6e51aad88F6F4ce6aB8827279cffFb92266')).toBe(false);
    });

    it('should return false for wrong length', () => {
      expect(isValidAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb9226')).toBe(false); // 41 chars
      expect(isValidAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb922666')).toBe(false); // 43 chars
    });

    it('should return false for invalid hex characters', () => {
      expect(isValidAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb9226g')).toBe(false);
      expect(isValidAddress('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb9226!')).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(isValidAddress('')).toBe(false);
    });

    it('should return false for just 0x', () => {
      expect(isValidAddress('0x')).toBe(false);
    });
  });

  describe('normalizeAddress', () => {
    it('should lowercase the address', () => {
      expect(normalizeAddress(validAddress)).toBe(validAddressLower);
    });

    it('should keep already lowercase address unchanged', () => {
      expect(normalizeAddress(validAddressLower)).toBe(validAddressLower);
    });

    it('should throw for invalid address', () => {
      expect(() => normalizeAddress('invalid')).toThrow('Invalid address');
      expect(() => normalizeAddress('0x123')).toThrow('Invalid address');
    });
  });

  describe('addressEquals', () => {
    it('should return true for same addresses', () => {
      expect(addressEquals(validAddress, validAddress)).toBe(true);
    });

    it('should return true for case-insensitive comparison', () => {
      expect(addressEquals(validAddress, validAddressLower)).toBe(true);
      expect(addressEquals(validAddressLower, validAddress)).toBe(true);
    });

    it('should return true for mixed case', () => {
      const mixedCase1 = '0xF39fd6e51aad88f6f4ce6ab8827279cfffb92266';
      const mixedCase2 = '0xf39FD6E51AAD88F6F4CE6AB8827279CFFFB92266';
      expect(addressEquals(mixedCase1, mixedCase2)).toBe(true);
    });

    it('should return false for different addresses', () => {
      const other = '0x0000000000000000000000000000000000000000';
      expect(addressEquals(validAddress, other)).toBe(false);
    });

    it('should throw for invalid addresses', () => {
      expect(() => addressEquals(validAddress, 'invalid')).toThrow('Invalid address');
      expect(() => addressEquals('invalid', validAddress)).toThrow('Invalid address');
    });
  });
});
