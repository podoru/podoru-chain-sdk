# Podoru SDK

TypeScript SDK for interacting with Podoru Chain.

## Installation

```bash
npm install @podoru/sdk
```

## Quick Start

```typescript
import { PodoruClient, TransactionBuilder, WalletSigner } from '@podoru/sdk';

// Initialize client
const client = new PodoruClient({
  baseUrl: 'http://localhost:8545'
});

// Read chain info
const chainInfo = await client.getChainInfo();
console.log('Height:', chainInfo.height);

// Read state
const value = await client.getState('chain:name');
console.log('Chain name:', value);
```

## Submitting Transactions

```typescript
import { PodoruClient, TransactionBuilder, WalletSigner } from '@podoru/sdk';

const client = new PodoruClient({
  baseUrl: 'http://localhost:8545'
});

// Create a signer from private key
const signer = new WalletSigner('0x...');

// Or create a random signer (for testing)
// const signer = WalletSigner.createRandom();

// Build and sign a transaction
const tx = await new TransactionBuilder(signer.address)
  .set('user:alice:name', 'Alice')
  .set('user:alice:email', 'alice@example.com')
  .buildAndSign(signer);

// Submit the transaction
const result = await client.submitTransaction(tx);
console.log('Transaction hash:', result.transaction_hash);
```

## Real-time Events

```typescript
import { WebSocketClient } from '@podoru/sdk';

const ws = new WebSocketClient({
  url: 'ws://localhost:8545/api/v1/ws'
});

await ws.connect();
ws.subscribe(['new_block', 'new_transaction']);

ws.onBlock((event) => {
  console.log('New block:', event.height, event.hash);
});

ws.onTransaction((event) => {
  console.log('New transaction:', event.hash);
});
```

## API Reference

### PodoruClient

REST API client for Podoru Chain.

#### Chain Methods
- `getChainInfo()` - Get blockchain metadata
- `getBlockByHash(hash)` - Get block by hash
- `getBlockByHeight(height)` - Get block by height
- `getLatestBlock()` - Get latest block

#### Transaction Methods
- `getTransaction(hash)` - Get transaction by hash
- `submitTransaction(tx)` - Submit a signed transaction

#### State Methods
- `getState(key)` - Get a single state value
- `batchGetState(keys)` - Get multiple state values
- `queryByPrefix(prefix, limit?)` - Query state by prefix

#### Node Methods
- `getNodeInfo()` - Get node information
- `getPeers()` - Get connected peers
- `getHealth()` - Health check

#### Mempool Methods
- `getMempool()` - Get pending transactions

### TransactionBuilder

Builder for creating transactions.

```typescript
const tx = await new TransactionBuilder(address)
  .set('key1', 'value1')    // Add SET operation
  .delete('key2')           // Add DELETE operation
  .withNonce(12345)         // Custom nonce (optional)
  .withTimestamp(timestamp) // Custom timestamp (optional)
  .buildAndSign(signer);    // Sign and build
```

### WalletSigner

ECDSA signer using secp256k1 (Ethereum-compatible).

```typescript
// From private key
const signer = new WalletSigner('0x...');

// From mnemonic
const signer = WalletSigner.fromMnemonic('word1 word2 ...');

// Random (for testing)
const signer = WalletSigner.createRandom();
```

### WebSocketClient

Real-time event subscription client.

```typescript
const ws = new WebSocketClient({ url: 'ws://localhost:8545/api/v1/ws' });

await ws.connect();
ws.subscribe(['new_block', 'new_transaction']);

ws.onBlock(callback);
ws.onTransaction(callback);
ws.onChainUpdate(callback);
ws.onMempoolUpdate(callback);
ws.onConnect(callback);
ws.onDisconnect(callback);
ws.onError(callback);
```

## License

MIT
