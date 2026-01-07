import { createHash } from 'crypto';

/**
 * Compute SHA256 hash of data
 */
export function sha256(data: string | Uint8Array): Uint8Array {
  const hash = createHash('sha256');
  if (typeof data === 'string') {
    hash.update(data, 'utf-8');
  } else {
    hash.update(data);
  }
  return new Uint8Array(hash.digest());
}

/**
 * Compute SHA256 hash and return as hex string
 */
export function sha256Hex(data: string | Uint8Array): string {
  const hash = sha256(data);
  return Array.from(hash)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}
