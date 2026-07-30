/**
 * Integration tests for the translation pipeline against the real Groq API.
 *
 * These tests are SKIPPED by default. They only run when explicitly opted in
 * with staging credentials:
 *
 *   RUN_LLM_INTEGRATION=1 doppler run --config stg -- \
 *     bunx vitest run packages/ship-fast-engine/src/llm/translator.integration.test.ts
 *
 * They verify the real end-to-end contract that mocks cannot:
 *   - the pipeline stays within its LLM call budget (2 passes on the happy
 *     path, at most 3 when the scorer provides corrections),
 *   - real model output parses into applied translations,
 *   - quality monitoring records real scores after corrections.
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from 'vitest'
import {
  getTranslationQualityMetrics,
  resetTranslationQualityMetrics,
  translateHtml,
  type TranslationQualityReport,
} from './translator'

const RUN_LLM_INTEGRATION =
  process.env.RUN_LLM_INTEGRATION === '1' && Boolean(process.env.GROQ_API_KEY)

describe.skipIf(!RUN_LLM_INTEGRATION)(
  'translator integration (real Groq API, staging)',
  () => {
    let fetchSpy: MockInstance<typeof globalThis.fetch>

    beforeEach(() => {
      resetTranslationQualityMetrics()
      // Spy (not mock) on fetch so real requests go through while we count
      // the actual LLM calls the pipeline makes.
      fetchSpy = vi.spyOn(globalThis, 'fetch')
    })

    afterEach(() => {
      fetchSpy.mockRestore()
    })

    it('translates a real Hindi page within the 3-call budget and records quality metrics', async () => {
      const html =
        '<!DOCTYPE html><html><body><h1>Grow your business faster</h1><p>Practical insights for small business owners.</p><a href="/contact">Book a strategy call</a></body></html>'

      const reports: TranslationQualityReport[] = []
      const result = await translateHtml(
        html,
        {
          language: {
            code: 'hi',
            name: 'Hindi',
            nativeName: 'हिन्दी',
            script: 'Devanagari',
          },
          prompt:
            'A marketing company website for small business owners with a professional tone.',
        },
        { onQualityReport: (report) => reports.push(report) },
      )

      // Real translation happened: English copy replaced by Devanagari.
      expect(result.error).toBeUndefined()
      expect(result.translatedCount).toBeGreaterThan(0)
      expect(result.content).not.toContain('Grow your business faster')
      expect(result.content).toMatch(/\p{Script=Devanagari}/u)
      // Structure untouched.
      expect(result.content).toContain('<!DOCTYPE html>')
      expect(result.content).toContain('href="/contact"')

      // Call budget: 2 passes (translate + score) plus at most 1 conditional
      // verification re-score when the scorer returned corrections.
      const llmCalls = fetchSpy.mock.calls.filter(([url]) =>
        String(url).includes('/chat/completions'),
      )
      expect(llmCalls.length).toBeGreaterThanOrEqual(2)
      expect(llmCalls.length).toBeLessThanOrEqual(3)

      const correctionsApplied = result.correctionsApplied ?? 0
      // Verification pass runs exactly when corrections were applied.
      expect(llmCalls.length).toBe(correctionsApplied > 0 ? 3 : 2)

      // Quality monitoring: real scores recorded, per-run report emitted.
      expect(typeof result.initialQualityScore).toBe('number')
      expect(typeof result.qualityScore).toBe('number')
      const finalScore = result.qualityScore ?? -1
      expect(finalScore).toBeGreaterThanOrEqual(0)
      expect(finalScore).toBeLessThanOrEqual(11)
      if (correctionsApplied > 0) {
        // After corrections, the verified score must be measured, not assumed.
        expect(finalScore).not.toBe(result.initialQualityScore)
      }

      expect(reports).toHaveLength(1)
      expect(reports[0].locale).toBe('hi')
      expect(reports[0].finalScore).toBe(finalScore)

      const metrics = getTranslationQualityMetrics()
      expect(metrics.pipelinesScored).toBe(1)
      expect(metrics.averageFinalScore).toBe(finalScore)
      expect(metrics.pipelinesWithCorrections).toBe(
        correctionsApplied > 0 ? 1 : 0,
      )
    }, 120_000)

    it('serves a repeated translation from cache without LLM calls', async () => {
      const html = '<body><h1>Welcome to our store</h1></body>'
      const language = {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        script: 'Devanagari',
      }
      const store = new Map<string, string>()
      const cacheClient = {
        getBatch: async ({ texts }: { texts: string[] }) =>
          texts.map((text) => store.get(text) ?? null),
        setBatch: async ({
          entries,
        }: {
          entries: Array<{ text: string; translation: string }>
        }) => {
          for (const entry of entries) store.set(entry.text, entry.translation)
        },
      }

      const first = await translateHtml(html, { language }, { cacheClient })
      expect(first.translatedCount).toBeGreaterThan(0)
      expect(first.skipped).not.toBe('cache-hit')
      const callsAfterFirst = fetchSpy.mock.calls.length
      expect(callsAfterFirst).toBeGreaterThan(0)

      const second = await translateHtml(html, { language }, { cacheClient })
      expect(second.skipped).toBe('cache-hit')
      expect(second.content).toBe(first.content)
      // Cache hit made zero additional LLM calls.
      expect(fetchSpy.mock.calls.length).toBe(callsAfterFirst)
      // Cache hits are not scored, so only one pipeline run was recorded.
      expect(getTranslationQualityMetrics().pipelinesScored).toBe(1)
    }, 120_000)
  },
)
