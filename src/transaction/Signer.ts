import { Wallet, HDNodeWallet } from 'ethers';
import { SigningError } from '../errors/index.js';
import { hexToBytes } from '../utils/encoding.js';

/**
 * Signature result with r, s, v components
 */
export interface SignatureResult {
  r: string;      // Hex string (32 bytes)
  s: string;      // Hex string (32 bytes)
  v: number;      // Recovery ID (27 or 28)
}

/**
 * Interface for transaction signers
 */
export interface Signer {
  readonly address: string;
  sign(hash: Uint8Array): Promise<SignatureResult>;
}

/**
 * Wallet-based signer using ethers.js
 */
export class WalletSigner implements Signer {
  private wallet: Wallet | HDNodeWallet;

  constructor(privateKey: string) {
    try {
      this.wallet = new Wallet(privateKey);
    } catch (error) {
      throw new SigningError(`Invalid private key: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Create a signer from a mnemonic phrase
   */
  static fromMnemonic(mnemonic: string, path?: string): WalletSigner {
    try {
      const wallet = HDNodeWallet.fromPhrase(mnemonic, undefined, path);
      const signer = new WalletSigner(wallet.privateKey);
      return signer;
    } catch (error) {
      throw new SigningError(`Invalid mnemonic: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }

  /**
   * Create a random signer (for testing)
   */
  static createRandom(): WalletSigner {
    const wallet = Wallet.createRandom();
    return new WalletSigner(wallet.privateKey);
  }

  /**
   * Get the signer's address
   */
  get address(): string {
    return this.wallet.address;
  }

  /**
   * Get the private key (use with caution)
   */
  get privateKey(): string {
    return this.wallet.privateKey;
  }

  /**
   * Sign a hash and return the signature components
   */
  async sign(hash: Uint8Array): Promise<SignatureResult> {
    try {
      const hashHex = '0x' + Array.from(hash).map(b => b.toString(16).padStart(2, '0')).join('');
      const signature = this.wallet.signingKey.sign(hashHex);

      return {
        r: signature.r,
        s: signature.s,
        v: signature.v,
      };
    } catch (error) {
      throw new SigningError(`Failed to sign: ${error instanceof Error ? error.message : 'unknown error'}`);
    }
  }
}

/**
 * Serialize signature to 65-byte array (r + s + v)
 * v is normalized to 0 or 1 (not 27/28)
 */
export function serializeSignature(sig: SignatureResult): number[] {
  const r = hexToBytes(sig.r);        // 32 bytes
  const s = hexToBytes(sig.s);        // 32 bytes
  const v = sig.v - 27;               // Normalize to 0 or 1

  return [...Array.from(r), ...Array.from(s), v];
}
