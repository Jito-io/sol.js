import {
  Connection,
  PublicKey,
  clusterApiUrl,
  type Commitment,
  type Transaction as SolanaTransaction,
  type VersionedTransaction,
  type SendOptions,
} from '@solana/web3.js'
import type { Signer } from './signer'

export type Cluster = 'mainnet-beta' | 'devnet' | 'testnet' | 'localnet' | string

export interface ProviderConfig {
  endpoint?: string
  commitment?: Commitment
  jito?:
    | boolean
    | {
        blockEngineUrl?: string
        auth?: string
      }
  signer?: Signer
}

export class Provider {
  readonly connection: Connection
  readonly cluster: Cluster
  readonly commitment: Commitment
  readonly jitoEnabled: boolean
  readonly jitoConfig: { blockEngineUrl?: string; auth?: string } | null
  #defaultSigner: Signer | null = null

  constructor(clusterOrEndpoint: Cluster = 'devnet', config: ProviderConfig = {}) {
    this.cluster = clusterOrEndpoint
    this.commitment = config.commitment ?? ('confirmed' as Commitment)

    const endpoint =
      config.endpoint ??
      (clusterOrEndpoint === 'localnet'
        ? 'http://127.0.0.1:8899'
        : clusterApiUrl(clusterOrEndpoint as 'mainnet-beta' | 'devnet' | 'testnet'))

    this.connection = new Connection(endpoint, {
      commitment: this.commitment,
    })

    this.jitoEnabled = Boolean(config.jito)
    this.jitoConfig =
      typeof config.jito === 'object'
        ? config.jito
        : config.jito
        ? { blockEngineUrl: 'https://mainnet.block-engine.jito.wtf/api/v1' }
        : null

    if (config.signer) this.#defaultSigner = config.signer
  }

  setSigner(signer: Signer): this {
    this.#defaultSigner = signer
    return this
  }

  get signer(): Signer | null {
    return this.#defaultSigner
  }

  async getBalance(address: string | PublicKey): Promise<bigint> {
    const pubkey = typeof address === 'string' ? new PublicKey(address) : address
    const lamports = await this.connection.getBalance(pubkey, this.commitment)
    return BigInt(lamports)
  }

  async getLatestBlockhash() {
    return this.connection.getLatestBlockhash(this.commitment)
  }

  async sendTransaction(
    tx: SolanaTransaction | VersionedTransaction,
    options?: SendOptions
  ): Promise<string> {
    const raw =
      tx instanceof VersionedTransaction
        ? tx.serialize()
        : tx.serialize({ requireAllSignatures: false, verifySignatures: false })

    const signature = await this.connection.sendRawTransaction(raw, {
      skipPreflight: false,
      preflightCommitment: this.commitment,
      ...options,
    })

    return signature
  }

  async sendAndConfirm(
    tx: SolanaTransaction | VersionedTransaction,
    signers: Signer[] = [],
    options?: SendOptions
  ): Promise<string> {
    const allSigners = this.#defaultSigner ? [this.#defaultSigner, ...signers] : signers

    // Allow signers to sign (KeypairSigner will modify tx)
    for (const signer of allSigners) {
      await signer.signTransaction(tx)
    }

    const signature = await this.sendTransaction(tx, options)

    const latest = await this.getLatestBlockhash()
    await this.connection.confirmTransaction(
      {
        signature,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
      },
      this.commitment
    )

    return signature
  }

  async sendBundle(bundle: import('./jito/bundle').Bundle): Promise<string> {
    if (!this.jitoEnabled || !this.jitoConfig) {
      throw new Error('Jito is not enabled on this Provider')
    }

    if (!this.signer) {
      throw new Error('No default signer set on Provider — call provider.setSigner()')
    }

    const { JitoClient } = await import('./jito/client')
    const client = new JitoClient({
      blockEngineUrl: this.jitoConfig.blockEngineUrl,
      auth: this.jitoConfig.auth,
    })

    return client.send(bundle, this.signer)
  }
}
