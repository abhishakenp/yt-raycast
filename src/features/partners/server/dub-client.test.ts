import { describe, expect, it, vi } from 'vitest'

const dubCtor = vi.fn()

vi.mock('dub', () => ({
  Dub: class {
    constructor(opts: unknown) {
      dubCtor(opts)
    }
  },
}))

// imported after the mock is registered
import { createDubServerClient } from './dub-client'

describe('createDubServerClient', () => {
  it('passes serverURL when provided (self-hosted Dub)', () => {
    dubCtor.mockClear()
    createDubServerClient('dub_key', 'https://api.ship-fast.ai')
    expect(dubCtor).toHaveBeenCalledWith({
      token: 'dub_key',
      serverURL: 'https://api.ship-fast.ai',
    })
  })

  it('omits serverURL when not provided (Dub SaaS default)', () => {
    dubCtor.mockClear()
    createDubServerClient('dub_key')
    expect(dubCtor).toHaveBeenCalledWith({ token: 'dub_key' })
  })
})
