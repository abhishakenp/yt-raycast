import { describe, it, expect, vi, beforeEach } from 'vitest'

// Behavioral tests for the single composable orchestrator entry. The legacy
// per-vertical/brittle source-string tests were removed with their engines;
// these assert real, audit-backed behavior instead.
const mocks = ((
  globalThis as typeof globalThis & {
    __runMocks?: {
      generateText: ReturnType<typeof vi.fn>
      detectLanguage: ReturnType<typeof vi.fn>
    }
  }
).__runMocks ??= {
  generateText: vi.fn(),
  detectLanguage: vi.fn(async (_prompt, preferred?) => ({
    code: preferred || 'en',
  })),
})

vi.mock('../generate.ts', () => ({
  generateText: (...args: unknown[]) =>
    (
      (globalThis as typeof globalThis & { __runMocks: typeof mocks })
        .__runMocks.generateText as unknown as (...a: unknown[]) => unknown
    )(...args),
  isHardLlmFailure: () => false,
  formatLlmFailureMessage: (e: unknown) => String(e),
}))
vi.mock('../pipeline/detect-language.js', () => ({
  detectLanguage: (...args: unknown[]) =>
    (
      (globalThis as typeof globalThis & { __runMocks: typeof mocks })
        .__runMocks.detectLanguage as unknown as (...a: unknown[]) => unknown
    )(...args),
}))

import { auditOpenUIProgram } from './openui-program-audit.ts'
import { runHomepageOrchestrator } from './run.ts'

// Fill the first-pass superagent (vertical + section props) and the per-page calls.
function superagentReply(user: string): string {
  const family =
    (user.match(/Vertical "([A-Za-z0-9]+)"/) ?? [])[1] ?? 'Marketing'
  const keys = [...user.matchAll(/^\s+([a-z0-9]+):\s/gm)].map((m) => m[1])
  const sections = Object.fromEntries(
    [...new Set(keys)].map((k) => [
      k,
      {
        heading: `H ${k}`,
        subheading: 'S',
        items: [{ title: 'A' }, { title: 'B' }],
      },
    ]),
  )
  return JSON.stringify({ family, sections })
}
function richProps(user: string): string {
  return JSON.stringify(
    Object.fromEntries(
      [...user.matchAll(/"([a-z0-9_]+)":\s*[A-Z]/g)].map((m) => [
        m[1],
        { heading: `Heading ${m[1]}`, items: [{ title: 'A' }] },
      ]),
    ),
  )
}
function reply(user: string) {
  return /Candidate verticals/.test(user)
    ? superagentReply(user)
    : richProps(user)
}

describe('runHomepageOrchestrator (composable engine)', () => {
  beforeEach(() => {
    mocks.generateText.mockReset()
    mocks.detectLanguage.mockClear()
    mocks.detectLanguage.mockImplementation(async (_prompt, preferred?) => ({
      code: preferred || 'en',
    }))
  })

  it('composes a valid multi-page PageSwitch site with theme, brand and category', async () => {
    mocks.generateText.mockImplementation(async (..._a) => reply(String(_a[2])))
    const events: { type: string }[] = []
    const result = await runHomepageOrchestrator({
      prompt: 'a crm for small sales teams',
      sessionSeed: 'seed-1',
      onEvent: (e) => events.push(e),
    })
    await expect(
      auditOpenUIProgram(result.source, { expectedRoot: 'PageSwitch' }),
    ).resolves.toBeUndefined()
    expect(result.source).toMatch(/root = PageSwitch\(/)
    expect(result.source).toMatch(/\bhome = Stack\(\[/)
    expect(result.theme).toBeTruthy()
    expect(result.brand.length).toBeGreaterThan(0)
    expect(result.category).toBeTruthy()
    // GenUIEvents flow through to the frontend stream (mapped from V2 events).
    expect(events.some((e) => e.type === 'source')).toBe(true)
    expect(events.some((e) => e.type === 'done')).toBe(true)
  })

  it('still returns valid OpenUI when the model output is empty (no fallback, never broken)', async () => {
    mocks.generateText.mockResolvedValue('not json')
    const result = await runHomepageOrchestrator({
      prompt: 'a developer tool',
      sessionSeed: 'seed-2',
    })
    await expect(
      auditOpenUIProgram(result.source, { expectedRoot: 'PageSwitch' }),
    ).resolves.toBeUndefined()
  })

  it('carries the detected locale through to the result', async () => {
    mocks.generateText.mockImplementation(async (..._a) => reply(String(_a[2])))
    const result = await runHomepageOrchestrator({
      prompt: 'un cafe de quartier',
      preferredLanguage: 'fr',
      sessionSeed: 'seed-3',
    })
    expect(result.locale).toBe('fr')
  })

  it('skips language and content model calls on cached composition content', async () => {
    const result = await runHomepageOrchestrator({
      prompt: 'a cached crm',
      preferredLanguage: 'es',
      sessionSeed: 'seed-cache',
      cachedContent: {
        family: 'Crm',
        pageProps: {
          home: {
            hero: { heading: 'Cached hero', subheading: 'Cached sub' },
            pricing: { heading: 'Cached pricing' },
          },
          pricing: {
            pricing: { heading: 'Cached pricing page' },
            faq: { heading: 'Cached FAQ', items: [{ title: 'A' }] },
            cta: { heading: 'Cached CTA' },
          },
        },
      },
    })

    await expect(
      auditOpenUIProgram(result.source, { expectedRoot: 'PageSwitch' }),
    ).resolves.toBeUndefined()
    expect(result.locale).toBe('es')
    expect(mocks.detectLanguage).not.toHaveBeenCalled()
    expect(mocks.generateText).not.toHaveBeenCalled()
  })
})
