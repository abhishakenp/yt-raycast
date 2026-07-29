import { beforeEach, describe, expect, it, vi } from 'vitest'

interface GroqCall {
  prompt: string
  opts: Record<string, unknown>
}

const groqCalls: GroqCall[] = []
let qualityScoreCalls = 0

const MOCK_TRANSLATIONS: Record<string, string> = {
  Hello: 'Bonjour',
  'Start now': 'Commencer maintenant',
  'Grow faster with clear marketing': 'Bonjour',
  'Book a strategy call': 'Commencer maintenant',
}

vi.mock('./groq.js', () => ({
  groq: vi.fn(async (prompt: string, opts: Record<string, unknown>) => {
    groqCalls.push({ prompt, opts })
    const payload = JSON.parse(prompt) as Record<string, unknown>
    if (Array.isArray(payload.sourceTexts)) {
      return {
        content: JSON.stringify({
          translations: Object.fromEntries(
            (payload.sourceTexts as Array<{ id: string; text: string }>).map(
              (item) => [item.id, MOCK_TRANSLATIONS[item.text] || item.text],
            ),
          ),
        }),
      }
    }
    if (Array.isArray(payload.items)) {
      if (String(opts.system).includes('ruthless translation quality judge')) {
        qualityScoreCalls += 1
        if (
          (payload.targetLanguage as { code?: string } | undefined)?.code !==
          'ml'
        ) {
          return {
            content: JSON.stringify({
              score: 11,
              reason: 'Strong localized copy.',
              weakIds: [],
            }),
          }
        }
        // Malayalam: first scoring pass flags weak copy and returns
        // corrections; the verification re-score (second call) confirms the
        // corrected copy reaches the bar.
        return {
          content: JSON.stringify({
            score: qualityScoreCalls === 1 ? 8 : 11,
            reason:
              qualityScoreCalls === 1
                ? 'CTA is literal and not premium enough.'
                : 'The corrected copy reaches the premium local copy bar.',
            weakIds:
              qualityScoreCalls === 1
                ? (payload.items as Array<{ id: string }>).map(
                    (item) => item.id,
                  )
                : [],
            translations:
              qualityScoreCalls === 1
                ? Object.fromEntries(
                    (payload.items as Array<{ id: string; draft: string }>).map(
                      (item) => [item.id, `${item.draft} judge polished`],
                    ),
                  )
                : undefined,
          }),
        }
      }
      return {
        content: JSON.stringify({
          translations: Object.fromEntries(
            (payload.items as Array<{ id: string; draft: string }>).map(
              (item) => [item.id, item.draft],
            ),
          ),
        }),
      }
    }
    return {
      content: JSON.stringify({
        Hello: 'Bonjour',
        'Start now': 'Commencer maintenant',
      }),
    }
  }),
}))

// @ts-expect-error — vitest cache-busting query string; module resolves at runtime
const translatorModule = await import('./translator.js?translator-test')
const {
  translateHtml,
  getTranslationQualityMetrics,
  resetTranslationQualityMetrics,
} = translatorModule as typeof import('./translator.js')

describe('translateHtml', () => {
  beforeEach(() => {
    groqCalls.length = 0
    qualityScoreCalls = 0
    resetTranslationQualityMetrics()
  })

  it('translates visible HTML text with llama 3.3 and preserves markup', async () => {
    const result = await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a><script>Hello</script></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
    )

    expect(groqCalls[0].opts.model).toBe('llama-3.3-70b-versatile')
    expect(result.content).toContain('<h1>Bonjour</h1>')
    expect(result.content).toContain(
      '<a href="/start">Commencer maintenant</a>',
    )
    expect(result.content).toContain('<script>Hello</script>')
    expect(result.translatedCount).toBe(2)
  })

  it('does not retranslate HTML that is already in the target script', async () => {
    const result = await translateHtml(
      '<main><h1>വ്യക്തമായ മാർക്കറ്റിംഗ് വഴി വളരുക</h1><a href="/contact">കോൾ ബുക്ക് ചെയ്യൂ</a></main>',
      {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        script: 'Malayalam',
      },
    )

    expect(groqCalls).toHaveLength(0)
    expect(result.content).toContain('വ്യക്തമായ മാർക്കറ്റിംഗ്')
    expect(result.skipped).toBe('already-localized')
  })

  it('does localize mixed target-language and English HTML instead of skipping the whole page', async () => {
    await translateHtml(
      '<main><h1>മാർക്കറ്റിംഗ് പരിഹാരങ്ങൾ for small business growth</h1><a href="/start">Get started</a></main>',
      {
        code: 'ml',
        name: 'Malayalam',
        nativeName: 'മലയാളം',
        script: 'Malayalam',
      },
    )

    expect(groqCalls.length).toBeGreaterThan(0)
    expect(JSON.parse(groqCalls[0].prompt).sourceTexts[0].text).toContain(
      'small business growth',
    )
    expect(groqCalls[0].opts.system).toContain(
      'English, target-language, or mixed',
    )
  })

  it('asks for persuasive in-market website localization with page context', async () => {
    await translateHtml(
      '<main><h1>Grow faster with clear marketing</h1><p>Services, success stories, and practical insights for small business owners.</p><a href="/contact">Book a strategy call</a></main>',
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    )

    const call = groqCalls[0]
    const payload = JSON.parse(call.prompt)

    expect(call.opts.temperature).toBeGreaterThan(0.1)
    expect(call.opts.system).toContain('transcreate')
    expect(call.opts.system).toContain('in-market website copywriter')
    expect(call.opts.system).toContain('conversion')
    expect(call.opts.system).toContain('not word-for-word')
    expect(call.opts.system).toContain('calques')
    expect(call.opts.system).toContain('loanwords')
    expect(call.opts.system).toContain('strategy, marketing, call, booking')
    expect(call.opts.system).toContain('Book a call means schedule a call')
    expect(call.opts.system).toContain('silently self-review')
    expect(payload.targetLanguage.code).toBe('ml')
    expect(payload.sourceTexts).toEqual([
      { id: 't0', text: 'Grow faster with clear marketing' },
      {
        id: 't1',
        text: 'Services, success stories, and practical insights for small business owners.',
      },
      { id: 't2', text: 'Book a strategy call' },
    ])
    expect(payload.pageContext).toContain('Grow faster with clear marketing')
  })

  it('includes the project brief so localization can match audience and tone', async () => {
    await translateHtml('<main><h1>Grow faster</h1></main>', {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
      prompt:
        'Build a marketing company website for small business owners with a sleek professional tone.',
    })

    expect(JSON.parse(groqCalls[0].prompt).projectBrief).toContain(
      'small business owners',
    )
    expect(JSON.parse(groqCalls[1].prompt).projectBrief).toContain(
      'small business owners',
    )
  })

  it('produces high-quality translation in a single pass with 11/10 quality emphasis', async () => {
    await translateHtml(
      '<main><h1>Grow faster with clear marketing</h1><a href="/contact">Book a strategy call</a></main>',
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    )

    expect(groqCalls.length).toBeGreaterThanOrEqual(1)
    expect(groqCalls[0].opts.system).toContain('elite in-market website copywriter')
    expect(groqCalls[0].opts.system).toContain('11/10 quality')
    expect(groqCalls[0].opts.system).toContain('ready to ship without further revision')
  })

  it('applies scorer corrections and verifies them with a re-score', async () => {
    const result = await translateHtml(
      '<main><h1>Grow faster with clear marketing</h1><a href="/contact">Book a strategy call</a></main>',
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    )

    // Exactly 3 calls when corrections are applied: translation + scoring
    // with corrections + verification re-score of the corrected copy.
    expect(groqCalls).toHaveLength(3)
    expect(groqCalls[1].opts.system).toContain(
      'ruthless translation quality judge',
    )
    expect(groqCalls[1].opts.system).toContain('11/10')
    expect(groqCalls[1].opts.system).toContain(
      'practical insights means actionable guidance',
    )
    expect(groqCalls[1].opts.system).toContain(
      'strategy call means consultation',
    )
    expect(groqCalls[1].opts.system).toContain('Do not award 11')
    expect(groqCalls[1].opts.system).toContain('Do not nitpick')
    expect(groqCalls[1].opts.system).toContain('award 11')
    expect(groqCalls[1].opts.system).toContain('ship-ready')
    expect(groqCalls[1].opts.system).toContain('Mostly natural and clear')
    expect(groqCalls[1].opts.system).toContain('must be scored 11')
    expect(groqCalls[1].opts.system).toContain('8 or 9 only')
    expect(groqCalls[1].opts.system).toContain('If score is below 11')
    expect(groqCalls[1].opts.system).toContain('"translations"')
    // Verification pass re-scores the corrected copy with the same judge prompt.
    expect(groqCalls[2].opts.system).toContain(
      'ruthless translation quality judge',
    )
    expect(result.initialQualityScore).toBe(8)
    expect(result.qualityScore).toBe(11)
    expect(result.correctionsApplied).toBe(2)
    expect(result.correctionsVerified).toBe(true)
    expect(result.content).toContain('Bonjour judge polished')
    expect(result.content).toContain(
      'Commencer maintenant judge polished',
    )
  })

  it('skips the verification pass when the scorer returns no corrections', async () => {
    const result = await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
    )

    // Exactly 2 calls on the happy path: translation + scoring (score 11).
    expect(groqCalls).toHaveLength(2)
    expect(result.initialQualityScore).toBe(11)
    expect(result.qualityScore).toBe(11)
    expect(result.correctionsApplied).toBe(0)
    expect(result.correctionsVerified).toBe(false)
  })

  // Regression: image alt text is the stock-photo search query (Pexels/Unsplash
  // search in English). The server-side translator must NEVER extract or
  // translate alt attributes (or any attribute values) — only visible text
  // between tags. extractTextNodes uses />([^<]+)</g which structurally
  // excludes attributes; this test locks that in.
  it('does not extract or translate img alt attributes', async () => {
    const html =
      '<main><h1>Hello</h1><img src="/api/pexels?query=onam%20shopping" alt="Onam shopping festival" /><p>Book a strategy call</p></main>'
    const result = await translateHtml(html, {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
    })

    // The alt text must NOT be sent to the translator — only "Hello" and
    // "Book a strategy call" are visible text nodes.
    const sourceTexts = (
      JSON.parse(groqCalls[0].prompt).sourceTexts as Array<{
        id: string
        text: string
      }>
    ).map((item) => item.text)
    expect(sourceTexts).not.toContain('Onam shopping festival')
    expect(sourceTexts).toEqual(['Hello', 'Book a strategy call'])

    // The alt attribute must be unchanged in the output HTML.
    expect(result.content).toContain('alt="Onam shopping festival"')
    expect(result.content).not.toContain('alt="ഓണം')
  })

  it('does not extract or translate aria-label or title attributes', async () => {
    const html =
      '<main><button aria-label="Close dialog" title="Close">Hello</button></main>'
    const result = await translateHtml(html, {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    })

    const sourceTexts = (
      JSON.parse(groqCalls[0].prompt).sourceTexts as Array<{
        id: string
        text: string
      }>
    ).map((item) => item.text)
    expect(sourceTexts).toEqual(['Hello'])
    expect(sourceTexts).not.toContain('Close dialog')
    expect(sourceTexts).not.toContain('Close')

    expect(result.content).toContain('aria-label="Close dialog"')
    expect(result.content).toContain('title="Close"')
  })

  // ── Cache integration ───────────────────────────────────────────────────
  //
  // translateHtml must check the shared translation cache before calling the
  // LLM. A full cache hit skips the LLM entirely (saves ~7.5s). After an LLM
  // translation, results are saved to the cache so all export targets can
  // reuse the same translations.

  it('skips the LLM entirely when all texts are cached', async () => {
    const cacheClient = {
      getBatch: vi.fn(async () => ['Bonjour', 'Commencer maintenant']),
      setBatch: vi.fn(async () => undefined),
    }

    const result = await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { cacheClient, sessionId: 'session-123' },
    )

    expect(groqCalls).toHaveLength(0)
    expect(cacheClient.getBatch).toHaveBeenCalledWith({
      locale: 'fr',
      texts: ['Hello', 'Start now'],
      sessionId: 'session-123',
    })
    expect(cacheClient.setBatch).not.toHaveBeenCalled()
    expect(result.content).toContain('<h1>Bonjour</h1>')
    expect(result.content).toContain(
      '<a href="/start">Commencer maintenant</a>',
    )
    expect(result.skipped).toBe('cache-hit')
  })

  it('calls the LLM and saves results to cache on a cache miss', async () => {
    const cacheClient = {
      getBatch: vi.fn(async () => [null, null]),
      setBatch: vi.fn(async () => undefined),
    }

    const result = await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { cacheClient },
    )

    expect(groqCalls.length).toBeGreaterThan(0)
    expect(cacheClient.setBatch).toHaveBeenCalledTimes(1)
    const setBatchArg = cacheClient.setBatch.mock.calls[0][0]
    expect(setBatchArg.locale).toBe('fr')
    const entries = setBatchArg.entries as Array<{
      text: string
      translation: string
    }>
    expect(entries).toContainEqual({
      text: 'Hello',
      translation: 'Bonjour',
    })
    expect(entries).toContainEqual({
      text: 'Start now',
      translation: 'Commencer maintenant',
    })
    expect(result.content).toContain('<h1>Bonjour</h1>')
  })

  it('falls back to the LLM when the cache returns partial results', async () => {
    const cacheClient = {
      getBatch: vi.fn(async () => ['Bonjour', null]),
      setBatch: vi.fn(async () => undefined),
    }

    await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { cacheClient },
    )

    // Partial cache → still calls LLM (full pipeline runs for quality)
    expect(groqCalls.length).toBeGreaterThan(0)
    // Saves all results to cache
    expect(cacheClient.setBatch).toHaveBeenCalledTimes(1)
  })

  it('does not call the cache when no cacheClient is provided', async () => {
    const result = await translateHtml('<main><h1>Hello</h1></main>', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    })

    expect(groqCalls.length).toBeGreaterThan(0)
    expect(result.content).toContain('Bonjour')
    expect(result.skipped).not.toBe('cache-hit')
  })

  it('handles cache client errors gracefully by falling back to the LLM', async () => {
    const cacheClient = {
      getBatch: vi.fn(async () => {
        throw new Error('Cache unavailable')
      }),
      setBatch: vi.fn(async () => undefined),
    }

    const result = await translateHtml(
      '<main><h1>Hello</h1></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { cacheClient },
    )

    expect(groqCalls.length).toBeGreaterThan(0)
    expect(result.content).toContain('Bonjour')
  })

  // ── Quality monitoring ──────────────────────────────────────────────────
  //
  // Every scored pipeline run feeds an in-memory aggregate (correction rate,
  // average scores before/after corrections, verification pass rate) and
  // emits a per-run report through the onQualityReport option so callers can
  // persist the signal (e.g. to Convex).

  it('aggregates correction rate and scores across pipeline runs', async () => {
    // Run 1 (ml): scorer flags weak copy (8) -> corrections -> verified 11.
    await translateHtml(
      '<main><h1>Grow faster with clear marketing</h1><a href="/contact">Book a strategy call</a></main>',
      { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം' },
    )
    // Run 2 (ml): scorer passes copy at 11 with no corrections.
    await translateHtml('<main><h1>Hello</h1></main>', {
      code: 'ml',
      name: 'Malayalam',
      nativeName: 'മലയാളം',
    })

    const metrics = getTranslationQualityMetrics()
    expect(metrics.pipelinesScored).toBe(2)
    expect(metrics.pipelinesWithCorrections).toBe(1)
    expect(metrics.correctionsApplied).toBe(2)
    expect(metrics.correctionRate).toBe(0.5)
    expect(metrics.averageInitialScore).toBe(9.5) // (8 + 11) / 2
    expect(metrics.averageFinalScore).toBe(11)
    expect(metrics.correctionsVerified).toBe(1)
    expect(metrics.verificationPassRate).toBe(1)
  })

  it('emits a per-run quality report through onQualityReport', async () => {
    const onQualityReport = vi.fn()
    await translateHtml(
      '<main><h1>Hello</h1><a href="/start">Start now</a></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      { onQualityReport },
    )

    expect(onQualityReport).toHaveBeenCalledTimes(1)
    expect(onQualityReport).toHaveBeenCalledWith({
      locale: 'fr',
      translatedCount: 2,
      initialScore: 11,
      finalScore: 11,
      correctionsApplied: 0,
      correctionsVerified: false,
    })
  })

  it('never lets a throwing onQualityReport sink break translation', async () => {
    const result = await translateHtml('<main><h1>Hello</h1></main>', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    })
    expect(result.content).toContain('Bonjour')

    const throwing = await translateHtml(
      '<main><h1>Hello</h1></main>',
      { code: 'fr', name: 'French', nativeName: 'Français' },
      {
        onQualityReport: () => {
          throw new Error('metrics sink down')
        },
      },
    )
    expect(throwing.content).toContain('Bonjour')
    expect(throwing.qualityScore).toBe(11)
  })

  it('does not record metrics for cache hits, and reset clears the aggregate', async () => {
    const cacheClient = {
      getBatch: vi.fn(async () => ['Bonjour']),
      setBatch: vi.fn(async () => undefined),
    }
    await translateHtml('<main><h1>Hello</h1></main>', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    }, { cacheClient })

    // Cache hit skipped the LLM entirely -> nothing scored, nothing recorded.
    expect(getTranslationQualityMetrics().pipelinesScored).toBe(0)

    await translateHtml('<main><h1>Hello</h1></main>', {
      code: 'fr',
      name: 'French',
      nativeName: 'Français',
    })
    expect(getTranslationQualityMetrics().pipelinesScored).toBe(1)

    resetTranslationQualityMetrics()
    expect(getTranslationQualityMetrics()).toEqual({
      pipelinesScored: 0,
      pipelinesWithCorrections: 0,
      correctionsApplied: 0,
      correctionRate: 0,
      averageInitialScore: 0,
      averageFinalScore: 0,
      correctionsVerified: 0,
      verificationPassRate: 0,
    })
  })
})
