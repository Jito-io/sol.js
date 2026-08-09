import type { InstructionLike } from './types'
import type { Signer } from './signer'

export class Transaction {
  private instructions: InstructionLike[] = []
  private recentBlockhash?: string
  private signers: Signer[] = []

  addInstruction(ix: InstructionLike): this {
    this.instructions.push(ix)
    return this
  }

  setRecentBlockhash(hash: string): this {
    this.recentBlockhash = hash
    return this
  }

  signWith(signer: Signer): this {
    this.signers.push(signer)
    return this
  }

  serialize(): Uint8Array {
    // TODO: convert to real Solana transaction bytes
    throw new Error('Transaction.serialize: not implemented yet')
  }

  async send(): Promise<string> {
    // Convenience; real sending is done via Provider
    throw new Error('Transaction.send: not implemented yet')
  }
}
