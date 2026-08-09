import { describe, it, expect, vi } from 'vitest'
import { Provider, Wallet } from '../src/index'

describe('smoke tests', () => {
  it('constructs Provider and Wallet and stubs getBalance', async () => {
    const provider = new Provider('devnet')
    const wallet = Wallet.generate()

    // Avoid a network call — stub getBalance
    const spy = vi.spyOn(provider, 'getBalance').mockResolvedValue(0n)

    const bal = await provider.getBalance(wallet.publicKey)
    expect(bal).toBe(0n)

    spy.mockRestore()
  })
})
