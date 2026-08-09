/**
 * sol.js — public entrypoint
 *
 * Single import target for consumers.
 * Mirrors ethers.js ergonomics.
 */

// Core types
export type {
  Commitment,
  Address,
  Lamports,
  InstructionLike,
} from "./types.js";

// Provider
export { Provider } from "./provider.js";
export type { ProviderConfig, Cluster } from "./provider.js";

// Signer / Wallet
export { Wallet, KeypairSigner } from "./signer.js";
export type { Signer } from "./signer.js";

// Transaction
export { Transaction } from "./transaction.js";
export type { TransactionConfig } from "./transaction.js";

// Jito (first-class namespace)
export * as jito from "./jito/index.js";
export { Bundle, JitoClient } from "./jito/index.js";
export type {
  BundleOptions,
  BundleResult,
  JitoClientConfig,
} from "./jito/index.js";
