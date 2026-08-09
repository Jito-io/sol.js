// Core shared types

export type Commitment = 'processed' | 'confirmed' | 'finalized'

export type Address = string

export type Lamports = number

export type InstructionLike = {
  programId: string
  data: Uint8Array
  keys?: Array<{ pubkey: Address; isSigner?: boolean; isWritable?: boolean }>
}
