/**
 * Check if a string is a valid Ethereum-style address
 */
export function isValidAddress(address: string): boolean {
  if (!address.startsWith('0x')) {
    return false;
  }
  if (address.length !== 42) {
    return false;
  }
  // Check if it's valid hex
  const hexPart = address.slice(2);
  return /^[0-9a-fA-F]+$/.test(hexPart);
}

/**
 * Normalize an address to checksum format
 * For now, just lowercases the hex part
 */
export function normalizeAddress(address: string): string {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid address: ${address}`);
  }
  return address.toLowerCase();
}

/**
 * Compare two addresses for equality (case-insensitive)
 */
export function addressEquals(a: string, b: string): boolean {
  return normalizeAddress(a) === normalizeAddress(b);
}
