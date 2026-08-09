import type { Commitment, Address, Lamports, InstructionLike } from './types'

export type Cluster = 'mainnet' | 'testnet' | 'devnet' | 'localnet'

export interface ProviderConfig {
  cluster?: Cluster
  endpoint?: string
  commitment?: Commitment
}

export class Provider {
  public cluster: Cluster
  public endpoint?: string
  public commitment?: Commitment

  constructor(config: ProviderConfig = {}) {
    this.cluster = config.cluster ?? 'devnet'
    this.endpoint = config.endpoint
    this.commitment = config.commitment
  }

  connect(): Promise<void> {
    // TODO: wire to @solana/web3.js Connection
    throw new Error('Provider.connect: not implemented yet')
  }

  async getBalance(address: Address): Promise<Lamports> {
    // TODO: call connection.getBalance
    throw new Error('Provider.getBalance: not implemented yet')
  }

  async sendTransaction(tx: unknown): Promise<string> {
    // TODO: sign/serialize/send transaction
    throw new Error('Provider.sendTransaction: not implemented yet')
  }

  async sendBundle(bundle: unknown): Promise<string> {
    // Optional convenience for Jito bundles
    throw new Error('Provider.sendBundle: not implemented yet')
  }
}
