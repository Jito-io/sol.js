/**
 * JitoClient — Block Engine client
 */

import type { Bundle } from "./bundle.js";
import type { Signer } from "../signer.js";

export interface JitoClientConfig {
  blockEngineUrl?: string;
  auth?: string;
}

export class JitoClient {
  readonly url: string;
  readonly auth?: string;

  constructor(config: JitoClientConfig = {}) {
    this.url =
      config.blockEngineUrl ?? "https://mainnet.block-engine.jito.wtf/api/v1";
    this.auth = config.auth;
  }

  private async request(method: string, params: unknown[] = []): Promise<unknown> {
    const body = {
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.auth) {
      headers["x-jito-auth"] = this.auth;
    }

    const endpoint =
      method === "sendBundle" ? `${this.url}/bundles` : this.url;

    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Jito RPC error ${res.status}: ${text}`);
    }

    const json = await res.json();
    if (json.error) {
      throw new Error(`Jito error: ${JSON.stringify(json.error)}`);
    }
    return json.result;
  }

  async getTipAccounts(): Promise<string[]> {
    const result = await this.request("getTipAccounts");
    return result as string[];
  }

  async sendBundle(serializedTxs: string[]): Promise<string> {
    const result = await this.request("sendBundle", [serializedTxs]);
    return result as string;
  }

  async send(
    bundle: Bundle,
    feePayer: Signer,
    recentBlockhash: string
  ): Promise<string> {
    const serialized = await bundle.build(this, feePayer, recentBlockhash);
    return this.sendBundle(serialized);
  }

  async getBundleStatuses(bundleIds: string[]): Promise<unknown> {
    return this.request("getBundleStatuses", [bundleIds]);
  }

  async getInflightBundleStatuses(bundleIds: string[]): Promise<unknown> {
    return this.request("getInflightBundleStatuses", [bundleIds]);
  }
}
