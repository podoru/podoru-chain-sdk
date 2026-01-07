/**
 * Encode a string or Buffer to Base64
 */
export function base64Encode(data: string | Uint8Array): string {
  if (typeof data === 'string') {
    return Buffer.from(data, 'utf-8').toString('base64');
  }
  return Buffer.from(data).toString('base64');
}

/**
 * Decode a Base64 string to UTF-8 string
 */
export function base64Decode(data: string): string {
  return Buffer.from(data, 'base64').toString('utf-8');
}

/**
 * Decode a Base64 string to Uint8Array
 */
export function base64DecodeBytes(data: string): Uint8Array {
  return new Uint8Array(Buffer.from(data, 'base64'));
}

/**
 * Convert a hex string to Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.slice(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Convert Uint8Array to hex string
 */
export function bytesToHex(bytes: Uint8Array, prefix = true): string {
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return prefix ? `0x${hex}` : hex;
}
