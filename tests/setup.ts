/**
 * Test setup configuration
 */

// RPC endpoint for integration tests
export const RPC_URL = process.env.PODORU_RPC_URL || 'http://46.250.251.130:8545';

// WebSocket endpoint (derived from RPC URL)
export const WS_URL = RPC_URL.replace('http://', 'ws://').replace('https://', 'wss://') + '/api/v1/ws';

// Test timeout for network requests
export const NETWORK_TIMEOUT = 30000;

// Known test wallet (DO NOT use in production)
export const TEST_PRIVATE_KEY = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
export const TEST_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

// Test mnemonic for HD wallet tests
export const TEST_MNEMONIC = 'test test test test test test test test test test test junk';
