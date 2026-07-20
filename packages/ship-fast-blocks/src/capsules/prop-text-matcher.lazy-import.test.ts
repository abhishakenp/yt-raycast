import { describe, expect, it, vi } from 'vitest'

vi.mock('../library', () => {
  throw new Error('full block library loaded eagerly')
})

describe('prop text matcher loading', () => {
  it('does not import the full block library', async () => {
    await expect(import('./prop-text-matcher')).resolves.toHaveProperty(
      'matchElementToProp',
    )
  })
})
