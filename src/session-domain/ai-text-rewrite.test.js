import { describe, expect, it } from 'vitest'
import {
  buildRewritePrompts,
  normalizeRewrittenText,
  rewriteSelectedText,
} from './ai-text-rewrite.js'

describe('buildRewritePrompts', () => {
  it('includes the selected text and instruction', () => {
    const prompts = buildRewritePrompts({
      text: 'Original sentence',
      instruction: 'Make it warmer',
    })

    expect(prompts.system).toContain('Output only')
    expect(prompts.user).toContain('Original sentence')
    expect(prompts.user).toContain('Make it warmer')
  })
})

describe('normalizeRewrittenText', () => {
  it('removes wrappers while preserving copy', () => {
    expect(normalizeRewrittenText('"A warmer sentence."')).toBe('A warmer sentence.')
    expect(normalizeRewrittenText('```text\nA warmer sentence.\n```')).toBe('A warmer sentence.')
  })
})

describe('rewriteSelectedText', () => {
  it('uses the injected generator and returns normalized text', async () => {
    const result = await rewriteSelectedText({
      text: 'Original sentence',
      instruction: 'Make it warmer',
      generate: async (_model, system, user) => {
        expect(_model).toBe('llama-3.1-8b-instant')
        expect(system).toContain('website copywriter')
        expect(user).toContain('Original sentence')
        return '"A warmer sentence."'
      },
    })

    expect(result).toEqual({ rewritten: 'A warmer sentence.' })
  })

  it('requires text and instruction', async () => {
    await expect(
      rewriteSelectedText({ text: '', instruction: 'Make it warmer', generate: async () => 'x' }),
    ).rejects.toThrow('Text is required')
    await expect(
      rewriteSelectedText({ text: 'Original', instruction: '', generate: async () => 'x' }),
    ).rejects.toThrow('Instruction is required')
  })

  it('aborts slow generators', async () => {
    await expect(
      rewriteSelectedText({
        text: 'Original',
        instruction: 'Make it warmer',
        timeoutMs: 5,
        generate: async (_model, _system, _user, signal) => {
          await new Promise((resolve, reject) => {
            const timer = setTimeout(resolve, 100)
            signal.addEventListener(
              'abort',
              () => {
                clearTimeout(timer)
                reject(new DOMException('aborted', 'AbortError'))
              },
              { once: true },
            )
          })
          return 'Too late'
        },
      }),
    ).rejects.toThrow(/aborted|AbortError/i)
  })
})
