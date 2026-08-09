# sol.js — The ethers.js of the Solana protocol

A lightweight, developer-friendly TypeScript library inspired by ethers.js for building on Solana.

Goals
- High-level TypeScript library with ergonomic Provider/Signer/Transaction primitives.
- First-class, built-in Jito bundle support (not bolted on).
- Clear separation of core primitives and Jito-specific bundle/client APIs.
- Modern ESM-first builds with dual CJS output for compatibility via tsup.

Locked architecture tree

src/
├─ index.ts             # Public exports
├─ types.ts             # Shared primitives (Address, Lamports, Commitment)
├─ provider.ts          # Provider + ProviderConfig + Cluster
├─ signer.ts            # Signer interface, KeypairSigner, Wallet
├─ transaction.ts       # Transaction class (chainable)
├─ utils/
│  └─ index.ts          # assert, sleep
└─ jito/
   ├─ index.ts          # jito public exports
   ├─ bundle.ts         # Bundle class (.add, .tip)
   └─ client.ts         # JitoClient (Block Engine)

Design principles
- Minimal and well-typed public surface inspired by ethers.js ergonomics.
- Small surface area to iterate quickly; implementation to follow the scaffold.
- Avoid naming collisions with official @solana/* and jito-labs packages by using simple, unique names.
- Clear TODOs in code; placeholder methods throw `not implemented yet` to make intentions explicit.

Status
- [x] Scaffolding done (files + types + placeholders)
- [ ] Implement Provider internals
- [ ] Implement Signer/Wallet
- [ ] Implement Transaction serialization and send logic
- [ ] Implement Jito bundle integration and client

Quick start (example)

```ts
import { Provider } from 'sol.js'
import { Bundle } from 'sol.js/jito'

const provider = new Provider({ cluster: 'devnet' })
const bundle = new Bundle()

bundle.add({ /* instruction or transaction */ })
bundle.tip(1000)

// Placeholder methods will throw until implemented
await provider.getBalance('YourAddress')
await provider.sendBundle(bundle)
```

What's next
- Implement the Provider using @solana/web3.js Connection.
- Wire Signer/KeypairSigner to Keypair from @solana/web3.js.
- Implement Transaction and Bundle serialization with Jito-specific RPC.

