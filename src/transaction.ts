import {
  Transaction as SolanaTransaction,
  TransactionInstruction,
  PublicKey,
  SystemProgram,
  type TransactionInstruction as SolanaIx,
} from '@solana/web3.js'
import type { Signer } from './signer'
import type { Provider } from './provider'

export interface TransactionConfig {
  feePayer?: PublicKey | string
  recentBlockhash?: string
}

export class Transaction {
  #ixs: SolanaIx[] = []
  #feePayer: PublicKey | null = null
  #recentBlockhash: string | null = null

  constructor(config: TransactionConfig = {}) {
    if (config.feePayer) {
      this.#feePayer = typeof config.feePayer === 'string' ? new PublicKey(config.feePayer) : config.feePayer
    }
    if (config.recentBlockhash) this.#recentBlockhash = config.recentBlockhash
  }

  add(...ixs: (SolanaIx | TransactionInstruction)[]): this {
    this.#ixs.push(...ixs)
    return this
  }

  transfer(from: PublicKey | string, to: PublicKey | string, lamports: number | bigint): this {
    const fromPubkey = typeof from === 'string' ? new PublicKey(from) : from
    const toPubkey = typeof to === 'string' ? new PublicKey(to) : to

    this.add(
      SystemProgram.transfer({
        fromPubkey,
        toPubkey,
        lamports: typeof lamports === 'bigint' ? Number(lamports) : lamports,
      })
    )
    return this
  }

  setFeePayer(feePayer: PublicKey | string): this {
    this.#feePayer = typeof feePayer === 'string' ? new PublicKey(feePayer) : feePayer
    return this
  }

  setRecentBlockhash(blockhash: string): this {
    this.#recentBlockhash = blockhash
    return this
  }

  async build(provider?: Provider): Promise<SolanaTransaction> {
    const tx = new SolanaTransaction()

    if (this.#ixs.length === 0) {
      throw new Error('Transaction has no instructions')
    }

    tx.add(...this.#ixs)

    if (this.#feePayer) tx.feePayer = this.#feePayer

    if (this.#recentBlockhash) tx.recentBlockhash = this.#recentBlockhash
    else if (provider) {
      const latest = await provider.getLatestBlockhash()
      tx.recentBlockhash = latest.blockhash
    }

    return tx
  }

  async send(provider: Provider, signers: Signer[] = []): Promise<string> {
    const tx = await this.build(provider)

    if (!tx.feePayer && provider.signer) {
      tx.feePayer = provider.signer.publicKey
    }

    return provider.sendAndConfirm(tx, signers)
  }
}
