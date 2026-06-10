import { describe, expect, it } from 'vitest'

import { createMockSessionId } from '@/features/generation/services/mock-session-id'

describe('mock session ids', () => {
  it('creates stable readable session ids from prompts', () => {
    expect(createMockSessionId('  Build a hotel site!  ')).toBe('mock-build-a-hotel-site')
  })

  it('falls back for symbol-only prompts', () => {
    expect(createMockSessionId(' !!! ')).toBe('mock-session')
  })
})
