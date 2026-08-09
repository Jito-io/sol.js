/**
 * Bundle — first-class Jito bundle abstraction
 */

import {
  Transaction as SolanaTransaction,
  VersionedTransaction,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import bs58 from "bs58";
import type { Signer } from "../signer.js";
import type { JitoClient } from "./client.js";

export interface BundleOptions {
  /** Tip in SOL */
  tipSol?: number;
  /** Tip in lamports (takes precedence over tipSol) */
  tipLamports?: bigint | number;
  /** Optional specific tip account */
  tipAccount?: string | PublicKey;
}

export interface BundleResult {
  bundleId: string;
  signatures: string[];
  status?: string;
}

/**
 * High-level Bundle builder
 */
export class Bundle {
  #txs: (SolanaTransaction | VersionedTransaction)[] = [];
  #options: BundleOptions;

  constructor(options: BundleOptions = {}) {
    this.#options = options;
  }

  /** Add one or more transactions (max 5 total) */
  add(...txs: (SolanaTransaction | VersionedTransaction)[]): this {
    if (this.#txs.length + txs.length > 5) {
      throw new Error("Jito bundles support a maximum of 5 transactions");
    }
    this.#txs.push(...txs);
    return this;
  }

  /** Set tip in SOL */
  tip(sol: number): this {
    this.#options.tipSol = sol;
    return this;
  }

  /** Set tip in lamports */
  tipLamports(lamports: number | bigint): this {
    this.#options.tipLamports = lamports;
    return this;
  }

  get transactions() {
    return this.#txs;
  }

  get options() {
    return this.#options;
  }

  /**
   * Build the final list of base58-encoded transactions.
   * Creates, signs, and serializes the tip transaction when configured.
   */
  async build(
    client: JitoClient,
    feePayer: Signer,
    recentBlockhash: string
  ): Promise<string[]> {
    const serialized: string[] = [];

    // Serialize existing transactions
    for (const tx of this.#txs) {
      const raw =
        tx instanceof VersionedTransaction
          ? tx.serialize()
          : tx.serialize({
              requireAllSignatures: false,
              verifySignatures: false,
            });
      serialized.push(bs58.encode(raw));
    }

    // Calculate tip
    const tipLamports =
      this.#options.tipLamports !== undefined
        ? Number(this.#options.tipLamports)
        : this.#options.tipSol
          ? Math.floor(this.#options.tipSol * 1e9)
          : 0;

    if (tipLamports > 0) {
      if (serialized.length >= 5) {
        throw new Error(
          "Cannot add tip transaction: bundle already has 5 transactions"
        );
      }

      const tipAccounts = await client.getTipAccounts();
      if (!tipAccounts.length) {
        throw new Error("No Jito tip accounts available");
      }

      const tipAccount = this.#options.tipAccount
        ? new PublicKey(this.#options.tipAccount)
        : new PublicKey(
            tipAccounts[Math.floor(Math.random() * tipAccounts.length)]
          );

      const tipTx = new SolanaTransaction().add(
        SystemProgram.transfer({
          fromPubkey: feePayer.publicKey,
          toPubkey: tipAccount,
          lamports: tipLamports,
        })
      );

      tipTx.feePayer = feePayer.publicKey;
      tipTx.recentBlockhash = recentBlockhash;

      // Sign the tip transaction
      await feePayer.signTransaction(tipTx);

      const tipRaw = tipTx.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });
      serialized.push(bs58.encode(tipRaw));
    }

    if (serialized.length === 0) {
      throw new Error("Bundle has no transactions");
    }

    return serialized;
  }
}
