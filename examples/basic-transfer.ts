#!/usr/bin/env -S ts-node
/**
 * examples/basic-transfer.ts
 *
 * Minimal end-to-end example showing Provider + Wallet + Transaction on devnet.
 * NOTE: This example will perform network calls and send transactions if you
 * provide a funded keypair. Use at your own risk. Replace the recipient
 * address below before sending real funds.
 */

import { Provider, Wallet, Transaction } from '../src/index'

async function main() {
  // Choose devnet for safe testing
  const provider = new Provider('devnet', { jito: false })

  // Load a wallet: either from a file (SOLANA_KEYPATH env) or generate
  const keypath = process.env.SOLANA_KEYPATH
  let wallet
  if (keypath) {
    wallet = await Wallet.fromFile(keypath)
  } else {
    console.log('No SOLANA_KEYPATH set; generating a random wallet (not funded)')
    wallet = Wallet.generate()
  }

  provider.setSigner(wallet)

  const balance = await provider.getBalance(wallet.publicKey)
  console.log('Wallet address:', wallet.publicKey.toBase58())
  console.log('Balance (lamports):', balance.toString())

  // Replace with a real devnet recipient if you want to send
  const RECIPIENT = process.env.RECIPIENT_PUBKEY ?? 'ReplaceWithRecipientPubkey111111111111111111111'
  const LAMPORTS = Number(process.env.LAMPORTS ?? 1000)

  const tx = new Transaction().transfer(wallet.publicKey, RECIPIENT, LAMPORTS)

  try {
    const sig = await tx.send(provider)
    console.log('Transaction sent, signature:', sig)
  } catch (err) {
    console.error('Failed to send transaction (expected in scaffold):', (err as Error).message)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
