import { describe, it, expect } from 'vitest';
import {
  base64Encode,
  base64Decode,
  base64DecodeBytes,
  hexToBytes,
  bytesToHex,
} from '../../src/utils/encoding.js';

describe('encoding utilities', () => {
  describe('base64Encode', () => {
    it('should encode string to base64', () => {
      expect(base64Encode('hello')).toBe('aGVsbG8=');
      expect(base64Encode('Hello, World!')).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should encode empty string', () => {
      expect(base64Encode('')).toBe('');
    });

    it('should encode Uint8Array to base64', () => {
      const bytes = new Uint8Array([104, 101, 108, 108, 111]); // "hello"
      expect(base64Encode(bytes)).toBe('aGVsbG8=');
    });

    it('should encode binary data', () => {
      const bytes = new Uint8Array([0x00, 0xff, 0x10, 0x20]);
      expect(base64Encode(bytes)).toBe('AP8QIA==');
    });
  });

  describe('base64Decode', () => {
    it('should decode base64 to string', () => {
      expect(base64Decode('aGVsbG8=')).toBe('hello');
      expect(base64Decode('SGVsbG8sIFdvcmxkIQ==')).toBe('Hello, World!');
    });

    it('should decode empty string', () => {
      expect(base64Decode('')).toBe('');
    });
  });

  describe('base64DecodeBytes', () => {
    it('should decode base64 to Uint8Array', () => {
      const result = base64DecodeBytes('aGVsbG8=');
      expect(result).toBeInstanceOf(Uint8Array);
      expect(Array.from(result)).toEqual([104, 101, 108, 108, 111]);
    });

    it('should decode binary base64', () => {
      const result = base64DecodeBytes('AP8QIA==');
      expect(Array.from(result)).toEqual([0x00, 0xff, 0x10, 0x20]);
    });
  });

  describe('hexToBytes', () => {
    it('should convert hex string to bytes', () => {
      const result = hexToBytes('deadbeef');
      expect(Array.from(result)).toEqual([0xde, 0xad, 0xbe, 0xef]);
    });

    it('should handle 0x prefix', () => {
      const result = hexToBytes('0xdeadbeef');
      expect(Array.from(result)).toEqual([0xde, 0xad, 0xbe, 0xef]);
    });

    it('should convert empty hex', () => {
      const result = hexToBytes('');
      expect(result.length).toBe(0);
    });

    it('should convert single byte', () => {
      const result = hexToBytes('ff');
      expect(Array.from(result)).toEqual([0xff]);
    });
  });

  describe('bytesToHex', () => {
    it('should convert bytes to hex with prefix', () => {
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(bytesToHex(bytes)).toBe('0xdeadbeef');
    });

    it('should convert bytes without prefix', () => {
      const bytes = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      expect(bytesToHex(bytes, false)).toBe('deadbeef');
    });

    it('should convert empty bytes', () => {
      const bytes = new Uint8Array([]);
      expect(bytesToHex(bytes)).toBe('0x');
    });

    it('should pad single digit bytes', () => {
      const bytes = new Uint8Array([0x0a, 0x0b]);
      expect(bytesToHex(bytes)).toBe('0x0a0b');
    });
  });

  describe('roundtrip conversions', () => {
    it('should roundtrip base64 encode/decode string', () => {
      const original = 'Hello, World!';
      expect(base64Decode(base64Encode(original))).toBe(original);
    });

    it('should roundtrip base64 encode/decode bytes', () => {
      const original = new Uint8Array([0x00, 0x10, 0x20, 0xff]);
      const encoded = base64Encode(original);
      const decoded = base64DecodeBytes(encoded);
      expect(Array.from(decoded)).toEqual(Array.from(original));
    });

    it('should roundtrip hex/bytes conversion', () => {
      const original = new Uint8Array([0xde, 0xad, 0xbe, 0xef]);
      const hex = bytesToHex(original, false);
      const back = hexToBytes(hex);
      expect(Array.from(back)).toEqual(Array.from(original));
    });
  });
});
