// @vitest-environment jsdom
/**
 * Behavioral edge-case tests for the OpenUI runtime preprocessing pipeline,
 * the hybrid translation provider, and the Chrome on-device Translator tier.
 *
 * PHILOSOPHY: These tests assert EXPECTED / CORRECT behavior. If production
 * code is buggy, the test MUST fail — current behavior is never pinned. Only
 * OBSERVABLE behavior is asserted: function return values, DOM state, and
 * translated output.
 *
 * Preprocessing functions are exercised directly with real inputs. The
 * translation provider is rendered via @testing-library/react (using
 * React.createElement because the `.ts` extension disables JSX parsing). The
 * Chrome translator is loaded with a fresh module instance per test so its
 * module-level caches reset; only the browser Translator surface is stubbed
 * via globalThis (the unit's own logic runs for real).
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import React from 'react'

import {
  balancePartial,
  balanceSegment,
  balanceStatements,
  preprocessOpenUIRuntimeResponse,
  repairMalformedQuotedObjectKeys,
  repairObjectNullArgumentBoundaries,
  sanitizePartialImages,
  stripNullsFromArrays,
} from './openui-runtime-preprocess'

// React.createElement alias — keeps the `.ts` extension JSX-free.
const h = React.createElement

// ---------------------------------------------------------------------------
// The Chrome Translator surface is controlled via globalThis so the provider's
// Tier-1 fall-through logic is exercised end-to-end.
// ---------------------------------------------------------------------------
import {
  applyTranslationResult,
  fetchTranslationBatch,
  I18nProvider,
  T,
  useI18n,
} from './_providers/translation'

// ---------------------------------------------------------------------------
// 1-14: Runtime preprocessing — real functions, direct calls
// ---------------------------------------------------------------------------
describe('runtime preprocessing edge cases', () => {
  describe('stripNullsFromArrays', () => {
    it('1. removes interleaved nulls from a flat array', () => {
      // CORRECT: every null element is dropped, leaving only real values.
      expect(stripNullsFromArrays('[1, null, 2, null, 3]')).toBe('[1, 2, 3]')
    })

    it('2. removes nulls from nested arrays without corrupting structure', () => {
      // CORRECT: the inner null is removed and the array structure stays
      // valid: [1, [null, 2], null] → [1, [2]]. If the function produces
      // malformed output (e.g. "[1, [, 2]]") that is a BUG and must fail.
      expect(stripNullsFromArrays('[1, [null, 2], null]')).toBe('[1, [2]]')
    })
  })

  describe('sanitizePartialImages', () => {
    it('3. rewrites a truncated (no closing quote) Image URL to null', () => {
      // CORRECT: a truncated Image() call (URL cut mid-stream) is sanitized so
      // the broken URL is gone and null takes its place. The leading bracket
      // remains for the downstream balancer to close.
      const result = sanitizePartialImages(
        '[Image("https://example.com/partial',
      )
      expect(result).not.toContain('https://example.com/partial')
      expect(result).toContain('null')
    })

    it('4. preserves a complete, well-formed Image call', () => {
      // CORRECT: a fully-closed Image() with a complete URL is untouched.
      const complete = '[Image("https://example.com/full.jpg")]'
      expect(sanitizePartialImages(complete)).toBe(complete)
    })
  })

  describe('repairMalformedQuotedObjectKeys', () => {
    it('5. adds quotes around an unquoted object key', () => {
      // CORRECT: an unquoted object key should be quoted — {foo: 1} →
      // {"foo": 1}. If the function leaves the key unquoted (or strips quotes
      // instead of adding them), that is a BUG and must fail.
      expect(repairMalformedQuotedObjectKeys('{foo: 1}')).toBe('{"foo": 1}')
    })

    it('6. leaves already-valid quoted keys untouched', () => {
      // CORRECT: a properly quoted key is preserved as-is.
      const valid = '{"foo": 1}'
      expect(repairMalformedQuotedObjectKeys(valid)).toBe(valid)
    })
  })

  describe('repairObjectNullArgumentBoundaries', () => {
    it('7. removes extra trailing null arguments from a call', () => {
      // CORRECT: Foo(null, null) → Foo(null) — the redundant trailing null
      // argument is removed. If the function leaves both nulls, that is a BUG
      // and must fail.
      expect(repairObjectNullArgumentBoundaries('Foo(null, null)')).toBe(
        'Foo(null)',
      )
    })

    it('closes an open object literal before a trailing null argument', () => {
      // CORRECT: an unclosed object followed by a null sibling arg is repaired
      // so the object closes before the null — {a: 1, null) → {a: 1}, null).
      expect(repairObjectNullArgumentBoundaries('Foo({a: 1, null)')).toBe(
        'Foo({a: 1}, null)',
      )
    })
  })

  describe('balanceSegment', () => {
    it('8. appends the missing closer without stripping the identifier', () => {
      // CORRECT: "(unclosed" → "(unclosed)" — the identifier is preserved and
      // only the missing closing paren is appended. If the function strips the
      // identifier and returns "()", that is a BUG and must fail.
      expect(balanceSegment('(unclosed')).toBe('(unclosed)')
    })

    it('9. leaves an already-balanced segment unchanged', () => {
      // CORRECT: a segment with balanced delimiters is returned verbatim.
      expect(balanceSegment('balanced()')).toBe('balanced()')
    })
  })

  describe('balanceStatements', () => {
    it('10. balances every unclosed statement in a multi-statement block', () => {
      // CORRECT: each unclosed statement gets its missing closers.
      const result = balanceStatements('a = Foo("x"\nb = Bar("y"')
      expect(result).toBe('a = Foo("x")\nb = Bar("y")')
    })
  })

  describe('balancePartial', () => {
    it('11. balances a partial streaming response for rendering', () => {
      // CORRECT: every open delimiter (paren, bracket, string) is closed in
      // the proper order so the result is renderable:
      //   root = Page([Hero("t"  →  root = Page([Hero("t")])
      // If the function only closes parens and leaves brackets unclosed
      // (e.g. 'root = Page([Hero("t"))'), that is a BUG and must fail.
      expect(balancePartial('root = Page([Hero("t"')).toBe(
        'root = Page([Hero("t")])',
      )
    })
  })

  describe('full pipeline — preprocessOpenUIRuntimeResponse', () => {
    it('12. strips code fences', () => {
      // CORRECT: surrounding ``` fences are removed, inner code preserved.
      expect(preprocessOpenUIRuntimeResponse('```tsx\ncode\n```')).toBe('code')
    })

    it('13. strips Action() calls from output', () => {
      // CORRECT: Action(...) is removed (replaced with null) and never appears
      // in the rendered output; sibling elements are preserved.
      const result = preprocessOpenUIRuntimeResponse(
        'root = Page([Action("foo"), Hero("t")])',
      )
      expect(result).not.toContain('Action(')
      expect(result).toContain('Hero(')
    })

    it('14. applies all repairs in order on a complex streaming fragment', () => {
      const source = [
        '```openui',
        'hero = Hero("Ship", [Image("https://images.example.com/',
        'root = Page([hero, Action("click")',
      ].join('\n')

      const result = preprocessOpenUIRuntimeResponse(source)

      // fences removed
      expect(result).not.toContain('```')
      // Action stripped
      expect(result).not.toContain('Action(')
      // both statements present and balanced (renderable)
      expect(result).toContain('hero = Hero(')
      expect(result).toContain('root = Page(')
      // no trailing unclosed delimiter remains
      expect(result.endsWith(')')).toBe(true)
    })
  })
})

// ---------------------------------------------------------------------------
// 15-20: Translation provider — render real components
// ---------------------------------------------------------------------------
describe('translation provider', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    window.localStorage.clear()
    // No Chrome Translator surface during provider tests → Tier-1 returns null
    // and the provider falls through to the fetch (Tier-2) path.
    delete (globalThis as Record<string, unknown>).Translator
    delete (globalThis as Record<string, unknown>).translation
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translations: ['TRANSLATED'] }),
    }) as unknown as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('15. I18nProvider provides the locale via context', () => {
    function Consumer() {
      const { locale } = useI18n()
      return h('span', { 'data-testid': 'loc' }, locale)
    }

    const { getByTestId } = render(
      h(I18nProvider, { locale: 'hi', children: h(Consumer) }),
    )

    expect(getByTestId('loc').textContent).toBe('hi')
  })

  it('16. T detects text nodes via MutationObserver and applies translation', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translations: ['नमस्ते'] }),
    }) as unknown as typeof fetch

    const { container } = render(
      h(I18nProvider, {
        locale: 'hi',
        children: h(T, null, h('span', null, 'Hello')),
      }),
    )

    // Flush the initial collectTextNodes + queued batch request.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
      await new Promise((r) => setTimeout(r, 0))
    })

    const span = container.querySelector('span')
    expect(span).not.toBeNull()
    expect(span!.textContent).toBe('नमस्ते')
  })

  it('17. shows the shimmer animation while a translation is loading', async () => {
    globalThis.fetch = vi.fn(
      () => new Promise(() => {}),
    ) as unknown as typeof fetch

    const { container } = render(
      h(I18nProvider, {
        locale: 'hi',
        children: h(T, null, h('span', null, 'Loading')),
      }),
    )

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })

    const span = container.querySelector('span')
    expect(span).not.toBeNull()
    expect(span!.classList.contains('shimmer')).toBe(true)
    expect(span!.classList.contains('text-muted-foreground')).toBe(true)
  })

  describe('applyTranslationResult', () => {
    it('18. preserves author shimmer classes, updates text, and clears inline styles', () => {
      const parent = document.createElement('span')
      parent.classList.add('shimmer')
      parent.style.backgroundImage =
        'linear-gradient(90deg, #0000, currentColor)'
      parent.style.backgroundClip = 'text'
      parent.style.color = 'transparent'
      document.body.appendChild(parent)
      const node = document.createTextNode('Hello')
      parent.appendChild(node)

      applyTranslationResult(parent, node, 'Bonjour', 'Hello')

      // author-owned shimmer class is preserved
      expect(parent.classList.contains('shimmer')).toBe(true)
      // all shimmer inline styles cleared
      expect(parent.style.backgroundImage).toBe('')
      expect(parent.style.backgroundClip).toBe('')
      expect(parent.style.color).toBe('')
      // text updated to the translation
      expect(node.textContent).toBe('Bonjour')
    })

    it('clears shimmer inline styles even when the translation equals the original text', () => {
      const parent = document.createElement('span')
      parent.classList.add('shimmer')
      parent.style.backgroundImage =
        'linear-gradient(90deg, #0000, currentColor)'
      document.body.appendChild(parent)
      const node = document.createTextNode('Hello')
      parent.appendChild(node)

      applyTranslationResult(parent, node, 'Hello', 'Hello')

      expect(parent.classList.contains('shimmer')).toBe(true)
      expect(parent.style.backgroundImage).toBe('')
      expect(node.textContent).toBe('Hello')
    })

    it('does not throw when the parent element is missing', () => {
      const node = document.createTextNode('Hello')
      expect(() =>
        applyTranslationResult(null, node, 'Hello', 'Hello'),
      ).not.toThrow()
    })
  })

  it('19. debounces text-node collection: rapid changes collected after 50ms', async () => {
    const requestedBatches: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requestedBatches.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({ translations: (body.texts ?? []).map(() => 'X') }),
      } as Response
    }) as unknown as typeof fetch

    function Harness({ children }: { children: React.ReactNode }) {
      return h(I18nProvider, { locale: 'hi', children: h(T, null, children) })
    }

    const { rerender } = render(h(Harness, null, h('span', null, 'First')))

    // Let the initial synchronous collection + effect flush.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
      await new Promise((r) => setTimeout(r, 0))
    })
    // Initial collection processed the "First" text node.
    expect(requestedBatches).toEqual([['First']])

    // Rapidly add a second text node — this triggers MutationObserver, which
    // schedules a debounced collectTextNodes at 50ms.
    rerender(
      h(Harness, null, h('span', null, 'First'), h('span', null, 'Second')),
    )

    // Still debounced — "Second" has NOT been collected immediately.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(requestedBatches).toEqual([['First']])

    // At 50ms the debounce fires and the new text node is collected.
    await act(async () => {
      await new Promise((r) => setTimeout(r, 70))
      await new Promise((r) => setTimeout(r, 0))
    })
    expect(requestedBatches).toEqual([['First'], ['Second']])
  })

  it('20. WeakSet tracking: the same text node is not processed twice', async () => {
    vi.useFakeTimers()
    try {
      const requestedBatches: string[][] = []
      globalThis.fetch = vi.fn(async (_input, init) => {
        const body = JSON.parse(String(init?.body ?? '{}')) as {
          texts?: string[]
        }
        requestedBatches.push(body.texts ?? [])
        return {
          ok: true,
          json: async () => ({
            translations: (body.texts ?? []).map(() => 'X'),
          }),
        } as Response
      }) as unknown as typeof fetch

      function Harness({ children }: { children: React.ReactNode }) {
        return h(I18nProvider, { locale: 'hi', children: h(T, null, children) })
      }

      const { rerender } = render(h(Harness, null, h('span', null, 'Stable')))

      // Initial collection.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0)
      })
      expect(requestedBatches).toEqual([['Stable']])

      // Re-render with an extra NON-text element (<br />) to trigger
      // MutationObserver. The existing "Stable" text node must not be
      // re-collected (WeakSet tracking).
      rerender(h(Harness, null, h('span', null, 'Stable'), h('br')))

      // Advance past the 50ms debounce — the observer fires, collectTextNodes
      // walks the tree, but "Stable" is already in the WeakSet and <br> has no
      // text, so no NEW text node is collected.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(60)
      })
      // Only "Stable" was ever requested — no duplicate, no spurious new node.
      expect(requestedBatches).toEqual([['Stable']])
    } finally {
      vi.useRealTimers()
    }
  })

  it('uses one batched API request for multiple uncached text nodes', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({ translations: ['Un', 'Deux'] }),
      } as Response
    }) as unknown as typeof fetch

    const translations = await fetchTranslationBatch(['One', 'Two'], 'fr')

    expect(translations).toEqual(['Un', 'Deux'])
    expect(requests).toEqual([['One', 'Two']])
  })

  it('uses a complete browser translation batch before the API and persists entries', async () => {
    const batchSeparator = '\n\uE000SHIP_FAST_TRANSLATION_BOUNDARY\uE000\n'
    const translate = vi.fn().mockResolvedValueOnce(`Uno${batchSeparator}Dos`)
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async () => 'available'),
      create: vi.fn(async () => ({ translate })),
    }
    const requests: string[][] = []
    const persistedEntries: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
        entries?: unknown
      }
      if (body.texts) {
        requests.push(body.texts)
      } else {
        persistedEntries.push(body.entries)
      }
      return {
        ok: true,
        json: async () => ({ translations: ['Dos'] }),
      } as Response
    }) as unknown as typeof fetch

    const translations = await fetchTranslationBatch(['One', 'Two'], 'es')

    expect(translations).toEqual(['Uno', 'Dos'])
    expect(requests).toEqual([])
    expect(persistedEntries).toEqual([
      [
        { text: 'One', translation: 'Uno' },
        { text: 'Two', translation: 'Dos' },
      ],
    ])
  })

  it('uses regional browser locale tags in a complete browser batch before the API', async () => {
    const batchSeparator = '\n\uE000SHIP_FAST_TRANSLATION_BOUNDARY\uE000\n'
    const translate = vi
      .fn()
      .mockResolvedValueOnce(`Iniciar${batchSeparator}Reservar`)
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: vi.fn(async () => 'available'),
      create: vi.fn(async () => ({ translate })),
    }
    const requests: string[][] = []
    const persistedEntries: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
        entries?: unknown
      }
      if (body.texts) {
        requests.push(body.texts)
      } else {
        persistedEntries.push(body.entries)
      }
      return {
        ok: true,
        json: async () => ({ translations: ['Reservar'] }),
      } as Response
    }) as unknown as typeof fetch

    const translations = await fetchTranslationBatch(
      ['Start now', 'Book'],
      'es-MX',
    )

    expect(translations).toEqual(['Iniciar', 'Reservar'])
    expect(requests).toEqual([])
    expect(persistedEntries).toEqual([
      [
        { text: 'Start now', translation: 'Iniciar' },
        { text: 'Book', translation: 'Reservar' },
      ],
    ])
  })
})

// ---------------------------------------------------------------------------
// 21-25: Chrome on-device Translator — real module logic, mocked API surface
// ---------------------------------------------------------------------------
describe('chrome on-device translator', () => {
  // The chrome-translator module holds module-level caches (availabilityCache,
  // translatorCache). We reset modules and re-import for each test so the
  // caches start empty, and control the Chrome Translator API via globalThis.
  let mod: typeof import('./_providers/chrome-translator')

  beforeEach(async () => {
    vi.resetModules()
    mod = await import('./_providers/chrome-translator')
  })

  afterEach(() => {
    delete (globalThis as Record<string, unknown>).Translator
    delete (globalThis as Record<string, unknown>).translation
    delete (globalThis as Record<string, unknown>).ai
  })

  it('21. uses the Translator API when available (Chrome 138+)', async () => {
    const translate = vi.fn(async (t: string) => `[on-device]${t}`)
    const create = vi.fn(async () => ({ translate }))
    const availability = vi.fn(async () => 'available')
    ;(globalThis as Record<string, unknown>).Translator = {
      availability,
      create,
    }

    const out = await mod.translateOnDevice('hello', 'hi')
    expect(out).toBe('[on-device]hello')
    expect(availability).toHaveBeenCalledWith({
      sourceLanguage: 'en',
      targetLanguage: 'hi',
    })
    expect(create).toHaveBeenCalled()
    expect(translate).toHaveBeenCalledWith('hello')
  })

  it('22. falls back to null when the Translator API is unavailable', async () => {
    // No Translator surface on globalThis (older Chrome / non-Chromium).
    expect(mod.canUseChromeTranslator('hi')).toBe(false)
    expect(await mod.translateOnDevice('hello', 'hi')).toBeNull()
  })

  describe('native locale filtering', () => {
    beforeEach(() => {
      ;(globalThis as Record<string, unknown>).Translator = {
        availability: async () => 'available',
        create: async () => ({ translate: async (t: string) => t }),
      }
    })

    it('23. accepts native locale tags and rejects romanized/code-mixed variants', () => {
      // "hi" → used by on-device engine
      expect(mod.canUseChromeTranslator('hi')).toBe(true)
      // "es-MX" → regional native locale, should try browser translation first.
      expect(mod.canUseChromeTranslator('es-MX')).toBe(true)
      // "lt" → Lithuanian is a native browser translation target.
      expect(mod.canUseChromeTranslator('lt')).toBe(true)
      // "hi-latn" → romanized variant, must NOT use on-device (LLM fallback)
      expect(mod.canUseChromeTranslator('hi-latn')).toBe(false)
      // English is the source language, never a translation target
      expect(mod.canUseChromeTranslator('en')).toBe(false)
      // code-mixed / long-form tags are excluded
      expect(mod.canUseChromeTranslator('hinglish')).toBe(false)
    })
  })

  it('canonicalizes regional locale tags before creating a translator', async () => {
    const create = vi.fn(async () => ({
      translate: async (t: string) => `MX:${t}`,
    }))
    const availability = vi.fn(async () => 'available')
    ;(globalThis as Record<string, unknown>).Translator = {
      availability,
      create,
    }

    const out = await mod.translateOnDevice('Start now', 'es-mx')

    expect(out).toBe('MX:Start now')
    expect(availability).toHaveBeenCalledWith({
      sourceLanguage: 'en',
      targetLanguage: 'es-MX',
    })
    expect(create).toHaveBeenCalledWith({
      sourceLanguage: 'en',
      targetLanguage: 'es-MX',
    })
  })

  it('24. instance caching: the same locale reuses one translator instance', async () => {
    const create = vi.fn(async () => ({
      translate: async (t: string) => `T:${t}`,
    }))
    ;(globalThis as Record<string, unknown>).Translator = {
      availability: async () => 'available',
      create,
    }

    await mod.translateOnDevice('first', 'fr')
    await mod.translateOnDevice('second', 'fr')

    // create() must be called exactly once for the same locale — the second
    // call reuses the cached translator instance.
    expect(create).toHaveBeenCalledTimes(1)
  })

  describe('model download states', () => {
    it('25. "downloadable" returns null so preview rendering falls back instead of blocking on model setup', async () => {
      const create = vi.fn(async () => ({
        translate: async (t: string) => `D:${t}`,
      }))
      ;(globalThis as Record<string, unknown>).Translator = {
        availability: async () => 'downloadable',
        create,
      }

      const out = await mod.translateOnDevice('hello', 'ja')
      expect(create).not.toHaveBeenCalled()
      expect(out).toBeNull()
    })

    it('"unavailable" returns null so the caller falls back to the LLM', async () => {
      const create = vi.fn(async () => ({
        translate: async () => 'never',
      }))
      ;(globalThis as Record<string, unknown>).Translator = {
        availability: async () => 'unavailable',
        create,
      }

      const out = await mod.translateOnDevice('hello', 'zh')
      expect(out).toBeNull()
      expect(create).not.toHaveBeenCalled()
    })
  })
})
