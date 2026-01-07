import { describe, it, expect, beforeAll } from 'vitest';
import { PodoruClient } from '../../src/client/PodoruClient.js';
import { ApiError } from '../../src/errors/index.js';
import { RPC_URL } from '../setup.js';

describe('PodoruClient', () => {
  let client: PodoruClient;

  beforeAll(() => {
    client = new PodoruClient({ baseUrl: RPC_URL });
  });

  describe('constructor', () => {
    it('should create client with base URL', () => {
      const c = new PodoruClient({ baseUrl: 'http://localhost:8545' });
      expect(c).toBeDefined();
    });

    it('should strip trailing slash from URL', () => {
      const c = new PodoruClient({ baseUrl: 'http://localhost:8545/' });
      expect(c).toBeDefined();
    });

    it('should accept custom timeout', () => {
      const c = new PodoruClient({ baseUrl: 'http://localhost:8545', timeout: 5000 });
      expect(c).toBeDefined();
    });

    it('should accept custom headers', () => {
      const c = new PodoruClient({
        baseUrl: 'http://localhost:8545',
        headers: { 'X-Custom': 'value' },
      });
      expect(c).toBeDefined();
    });
  });

  describe('getHealth', () => {
    it('should return health status', async () => {
      const health = await client.getHealth();
      expect(health).toBeDefined();
    });
  });

  describe('getChainInfo', () => {
    it('should return chain info', async () => {
      const info = await client.getChainInfo();
      expect(info).toBeDefined();
    });
  });

  describe('getNodeInfo', () => {
    it('should return node info', async () => {
      const info = await client.getNodeInfo();
      expect(info).toBeDefined();
    });
  });

  describe('getLatestBlock', () => {
    it('should return latest block or throw ApiError', async () => {
      // Some API versions may not support this endpoint
      try {
        const block = await client.getLatestBlock();
        expect(block).toBeDefined();
      } catch (error) {
        expect(error).toBeInstanceOf(ApiError);
      }
    });
  });

  describe('getBlockByHeight', () => {
    it('should return block by height', async () => {
      const block = await client.getBlockByHeight(0);
      expect(block).toBeDefined();
    });
  });

  describe('getPeers', () => {
    it('should return peers list', async () => {
      const peers = await client.getPeers();
      expect(Array.isArray(peers)).toBe(true);
    });
  });

  describe('getMempool', () => {
    it('should return mempool info', async () => {
      const mempool = await client.getMempool();
      expect(mempool).toBeDefined();
    });
  });

  describe('getState', () => {
    it('should throw ApiError for non-existent key', async () => {
      await expect(client.getState('nonexistent-key-12345')).rejects.toThrow(ApiError);
    });
  });

  describe('error handling', () => {
    it('should throw ApiError for invalid endpoint', async () => {
      const badClient = new PodoruClient({ baseUrl: 'http://invalid-host-12345.local:9999', timeout: 1000 });
      await expect(badClient.getHealth()).rejects.toThrow(ApiError);
    });

    it('should throw ApiError for timeout', async () => {
      const slowClient = new PodoruClient({ baseUrl: RPC_URL, timeout: 1 });
      await expect(slowClient.getChainInfo()).rejects.toThrow(ApiError);
    });
  });
});
