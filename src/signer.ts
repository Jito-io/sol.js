import type { Address } from './types'

export interface Signer {
  address(): Promise<Address>
  signMessage(message: Uint8Array): Promise<Uint8Array>
  signTransaction(tx: unknown): Promise<unknown>
}

export class KeypairSigner implements Signer {
  // Intentionally minimal — wire to @solana/web3.js Keypair in implementation
  privateKey: Uint8Array

  constructor(privateKey: Uint8Array) {
    this.privateKey = privateKey
  }

  async address(): Promise<Address> {
    throw new Error('KeypairSigner.address: not implemented yet')
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    throw new Error('KeypairSigner.signMessage: not implemented yet')
  }

  async signTransaction(tx: unknown): Promise<unknown> {
    throw new Error('KeypairSigner.signTransaction: not implemented yet')
  }
}

export class Wallet extends KeypairSigner {
  // Convenience wrapper; will add provider bindings later
}
