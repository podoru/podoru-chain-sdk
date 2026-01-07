import { describe, it, expect } from 'vitest';
import { sha256, sha256Hex } from '../../src/utils/hash.js';

describe('hash utilities', () => {
  describe('sha256', () => {
    it('should hash string and return Uint8Array', () => {
      const result = sha256('hello');
      expect(result).toBeInstanceOf(Uint8Array);
      expect(result.length).toBe(32); // SHA256 is 256 bits = 32 bytes
    });

    it('should return correct hash for known input', () => {
      // SHA256("hello") = 2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824
      const result = sha256('hello');
      const hex = Array.from(result)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      expect(hex).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('should hash empty string', () => {
      // SHA256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
      const result = sha256('');
      const hex = Array.from(result)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      expect(hex).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
    });

    it('should hash Uint8Array', () => {
      const bytes = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      const result = sha256(bytes);
      const hex = Array.from(result)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      expect(hex).toBe('2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824');
    });

    it('should produce different hashes for different inputs', () => {
      const hash1 = sha256('hello');
      const hash2 = sha256('world');
      expect(Array.from(hash1)).not.toEqual(Array.from(hash2));
    });
  });

  describe('sha256Hex', () => {
    it('should return hex string', () => {
      const result = sha256Hex('hello');
      expect(typeof result).toBe('string');
      expect(result.length).toBe(64); // 32 bytes = 64 hex chars
    });

    it('should return correct hex for known input', () => {
      expect(sha256Hex('hello')).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
    });

    it('should hash empty string to hex', () => {
      expect(sha256Hex('')).toBe(
        'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      );
    });

    it('should hash Uint8Array to hex', () => {
      const bytes = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      expect(sha256Hex(bytes)).toBe(
        '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824'
      );
    });

    it('should handle unicode strings', () => {
      const result = sha256Hex('hello world');
      expect(result.length).toBe(64);
      expect(/^[0-9a-f]+$/.test(result)).toBe(true);
    });
  });
});
