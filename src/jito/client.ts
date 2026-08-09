import type { Bundle } from './bundle'

export interface JitoClientConfig {
  endpoint?: string
}

export class JitoClient {
  endpoint?: string

  constructor(config: JitoClientConfig = {}) {
    this.endpoint = config.endpoint
  }

  async sendBundle(bundle: Bundle): Promise<string> {
    // TODO: POST to Block Engine / Jito RPC
    throw new Error('JitoClient.sendBundle: not implemented yet')
  }
}
