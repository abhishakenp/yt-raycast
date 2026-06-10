import { describe, expect, it } from 'vitest'

import {
  parseCreateGenerationInput,
  sessionSummarySchema,
} from '@/features/generation/schemas/generation-contracts'

describe('generation contracts', () => {
  it('normalizes a prompt request with defaults', () => {
    expect(parseCreateGenerationInput({ prompt: '  build a hotel site  ' })).toEqual({
      prompt: 'build a hotel site',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
    })
  })

  it('rejects empty prompts', () => {
    expect(() => parseCreateGenerationInput({ prompt: '   ' })).toThrow()
  })

  it('accepts a durable session summary', () => {
    const result = sessionSummarySchema.parse({
      id: 'session_1',
      prompt: 'build a hotel site',
      status: 'created',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      previewVersion: 0,
      createdAt: 1,
      updatedAt: 1,
    })

    expect(result.status).toBe('created')
  })
})
