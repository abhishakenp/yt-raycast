import { describe, expect, it, vi } from 'vitest'

vi.mock('@ship-fast/blocks/generated', () => {
  throw new Error('generated example metadata loaded eagerly')
})

describe('examples category route loading', () => {
  it('does not load generated example metadata when route modules are imported', async () => {
    await expect(import('./examples.$category')).resolves.toHaveProperty(
      'Route',
    )
  })
})
