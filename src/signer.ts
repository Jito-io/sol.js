import {
  Keypair,
  PublicKey,
  Transaction as SolanaTransaction,
  VersionedTransaction,
} from '@solana/web3.js'
import bs58 from 'bs58'
import { readFile } from 'node:fs/promises'

export type SolanaTx = SolanaTransaction | VersionedTransaction

export interface Signer {
  readonly publicKey: PublicKey
  signTransaction(tx: SolanaTx): Promise<SolanaTx>
  signAllTransactions(txs: SolanaTx[]): Promise<SolanaTx[]>
}

/**
 * Keypair-backed signer
 */
export class KeypairSigner implements Signer {
  readonly keypair: Keypair
  readonly publicKey: PublicKey

  constructor(keypair: Keypair) {
    this.keypair = keypair
    this.publicKey = keypair.publicKey
  }

  async signTransaction(tx: SolanaTx): Promise<SolanaTx> {
    if ((VersionedTransaction as any) && tx instanceof VersionedTransaction) {
      ;(tx as VersionedTransaction).sign([this.keypair])
    } else {
      ;(tx as SolanaTransaction).partialSign(this.keypair)
    }
    return tx
  }

  async signAllTransactions(txs: SolanaTx[]): Promise<SolanaTx[]> {
    return Promise.all(txs.map((t) => this.signTransaction(t)))
  }

  /** Convenience: base58 address */
  get address(): string {
    return this.publicKey.toBase58()
  }
}

/**
 * High-level Wallet (ethers-style convenience)
 */
export class Wallet extends KeypairSigner {
  /**
   * Create from a raw secret key (Uint8Array or number[])
   */
  static fromSecretKey(secretKey: Uint8Array | number[]): Wallet {
    const keypair = Keypair.fromSecretKey(
      secretKey instanceof Uint8Array ? secretKey : Uint8Array.from(secretKey)
    )
    return new Wallet(keypair)
  }

  /**
   * Create from a base58-encoded secret key
   */
  static fromBase58(secretKeyBase58: string): Wallet {
    const secretKey = bs58.decode(secretKeyBase58)
    return Wallet.fromSecretKey(secretKey)
  }

  /**
   * Load from a Solana CLI-style JSON keypair file (array of numbers)
   */
  static async fromFile(path: string): Promise<Wallet> {
    const content = await readFile(path, 'utf8')
    const secretKey = JSON.parse(content) as number[]
    return Wallet.fromSecretKey(secretKey)
  }

  /**
   * Generate a new random wallet
   */
  static generate(): Wallet {
    return new Wallet(Keypair.generate())
  }
}
