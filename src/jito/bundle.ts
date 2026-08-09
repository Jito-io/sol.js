import type { InstructionLike } from '../types'
import type { Lamports } from '../types'

export class Bundle {
  private items: Array<InstructionLike | Uint8Array | unknown> = []
  private tipAmount: Lamports = 0

  constructor() {}

  add(item: InstructionLike | Uint8Array | unknown): this {
    this.items.push(item)
    return this
  }

  tip(lamports: Lamports): this {
    if (lamports <= 0) throw new Error('tip must be > 0')
    this.tipAmount = lamports
    return this
  }

  size(): number {
    return this.items.length
  }

  toJSON(): object {
    // TODO: serialize to Jito bundle shape
    throw new Error('Bundle.toJSON: not implemented yet')
  }
}
