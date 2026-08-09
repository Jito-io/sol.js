# sol.js

**The ethers.js of the Solana protocol.**

A high-level, developer-friendly TypeScript library for Solana with **first-class Jito bundle support**.

## Goals

- Ethers.js-style developer experience for Solana
- Native, first-class Jito bundles (not bolted on)
- Clean core primitives: `Provider`, `Signer`/`Wallet`, `Transaction`, `Bundle`
- Modern ESM + dual CJS builds

## Architecture

```
src/
├── index.ts                 # Public API
├── types.ts
├── provider.ts              # High-level Provider
├── signer.ts                # KeypairSigner + Wallet
├── transaction.ts           # Chainable Transaction builder
├── jito/
│   ├── index.ts
│   ├── client.ts            # Block Engine client
│   └── bundle.ts            # First-class Bundle + tip support
└── utils/
```

## Status

- [x] Project structure + TypeScript setup
- [x] Provider (Connection, getBalance, sendTransaction, sendAndConfirm)
- [x] Wallet / KeypairSigner
- [x] Transaction builder
- [x] Jito Bundle + tip serialization
- [x] JitoClient
- [x] Examples + smoke test
- [ ] More tests + CI
- [ ] Pump.fun helpers (future)

## Install

```bash
npm install sol.js @solana/web3.js bs58
```

## Quick Start

```typescript
import { Provider, Wallet, Transaction, Bundle } from "sol.js";

const provider = new Provider("devnet", { jito: true });
const wallet = await Wallet.fromFile("~/.config/solana/id.json");
provider.setSigner(wallet);

// Normal transfer
const tx = new Transaction()
  .transfer(wallet.publicKey, recipient, 1_000_000);

const sig = await tx.send(provider);

// Jito bundle with tip
const bundle = new Bundle()
  .add(await tx.build(provider))
  .tip(0.0001); // 0.0001 SOL tip

const bundleId = await provider.sendBundle(bundle);
console.log("Bundle ID:", bundleId);
```

## License

MIT © Dr. Q and Company
