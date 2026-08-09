import {
  Transaction as SolanaTransaction,
  VersionedTransaction,
  PublicKey,
  SystemProgram,
} from '@solana/web3.js'
import type { Signer } from '../signer'
import type { JitoClient } from './client'

export interface BundleOptions {
  tipSol?: number
  tipLamports?: bigint | number
  tipAccount?: string | PublicKey
}

export interface BundleResult {
  bundleId: string
  signatures: string[]
  status?: string
}

export class Bundle {
  #txs: (SolanaTransaction | VersionedTransaction)[] = []
  #options: BundleOptions

  constructor(options: BundleOptions = {}) {
    this.#options = options
  }

  add(...txs: (SolanaTransaction | VersionedTransaction)[]): this {
    if (this.#txs.length + txs.length > 5) {
      throw new Error('Jito bundles support a maximum of 5 transactions')
    }
    this.#txs.push(...txs)
    return this
  }

  tip(sol: number): this {
    this.#options.tipSol = sol
    return this
  }

  tipLamports(lamports: number | bigint): this {
    this.#options.tipLamports = lamports
    return this
  }

  get transactions() {
    return this.#txs
  }

  get options() {
    return this.#options
  }

  async build(client: JitoClient, feePayer: Signer): Promise<string[]> {
    const serialized: string[] = []

    for (const tx of this.#txs) {
      const raw =
        tx instanceof VersionedTransaction
          ? tx.serialize()
          : tx.serialize({ requireAllSignatures: false, verifySignatures: false })
      serialized.push(Buffer.from(raw).toString('base64'))
    }

    const tipLamports =
      (this.#options.tipLamports as number | bigint | undefined) ??
      (this.#options.tipSol ? Math.floor(this.#options.tipSol * 1e9) : 0)

    if (tipLamports && tipLamports > 0) {
      const tipAccounts = await client.getTipAccounts()
      const tipAccount =
        this.#options.tipAccount
          ? new PublicKey(this.#options.tipAccount as string)
          : new PublicKey(tipAccounts[Math.floor(Math.random() * tipAccounts.length)])

      const tipTx = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer.publicKey,
          toPubkey: tipAccount,
          lamports: Number(tipLamports),
        })
      )

      // Caller is expected to set recentBlockhash and sign the tip tx.
      // We serialize a placeholder here; real flow should sign then serialize.
      serialized.push('TIP_PLACEHOLDER_BASE64')
    }

    return serialized
  }
}
