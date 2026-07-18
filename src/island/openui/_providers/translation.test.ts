// @vitest-environment jsdom
import { cleanup, render, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const translationMocks = vi.hoisted(() => ({
  canUseChromeTranslator: vi.fn().mockReturnValue(false),
  translateOnDevice: vi.fn().mockResolvedValue(null),
  translateOnDeviceBatch: vi.fn().mockResolvedValue(null),
}))

// Stub the heavy runtime + on-device translator so importing the provider
// module stays lightweight; only the pure shimmer-removal helper is exercised.
vi.mock('@ship-fast/blocks/runtime', () => ({
  useQuery: vi.fn(),
  QueryClient: class {},
  QueryClientProvider: ({ children }: { children?: ReactNode }) => children,
}))
vi.mock('./chrome-translator', () => ({
  translateOnDevice: translationMocks.translateOnDevice,
  translateOnDeviceBatch: translationMocks.translateOnDeviceBatch,
  canUseChromeTranslator: translationMocks.canUseChromeTranslator,
}))

import { I18nProvider, T, applyTranslationResult } from './translation'

describe('translation shimmer removal', () => {
  let originalFetch: typeof globalThis.fetch

  beforeEach(() => {
    originalFetch = globalThis.fetch
    translationMocks.translateOnDevice.mockReset()
    translationMocks.translateOnDevice.mockResolvedValue(null)
    translationMocks.translateOnDeviceBatch.mockReset()
    translationMocks.translateOnDeviceBatch.mockResolvedValue(null)
    translationMocks.canUseChromeTranslator.mockReset()
    translationMocks.canUseChromeTranslator.mockReturnValue(false)
    window.localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    document.body.innerHTML = ''
    globalThis.fetch = originalFetch
  })

  it('clears shimmer inline styles without removing an author-owned shimmer class', () => {
    const parent = document.createElement('span')
    parent.classList.add('shimmer')
    parent.style.backgroundImage = 'linear-gradient(90deg, #0000, currentColor)'
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Hello', 'Hello')

    expect(parent.classList.contains('shimmer')).toBe(true)
    expect(parent.classList.contains('text-muted-foreground')).toBe(false)
    expect(parent.style.backgroundImage).toBe('')
    // textContent must stay unchanged when the translation equals the original
    expect(node.textContent).toBe('Hello')
  })

  it('updates text content only when the translation differs from the original and preserves author classes', () => {
    const parent = document.createElement('span')
    parent.classList.add('shimmer')
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Bonjour', 'Hello')

    expect(parent.classList.contains('shimmer')).toBe(true)
    expect(parent.classList.contains('text-muted-foreground')).toBe(false)
    expect(node.textContent).toBe('Bonjour')
  })

  it('clears all shimmer-related inline styles, not just the class', () => {
    const parent = document.createElement('span')
    parent.classList.add('shimmer')
    parent.style.backgroundImage = 'linear-gradient(90deg, #0000, currentColor)'
    parent.style.backgroundClip = 'text'
    parent.style.color = 'transparent'
    document.body.appendChild(parent)
    const node = document.createTextNode('Hello')
    parent.appendChild(node)

    applyTranslationResult(parent, node, 'Bonjour', 'Hello')

    expect(parent.style.backgroundImage).toBe('')
    expect(parent.style.color).toBe('')
  })

  it('does not throw when the parent element is missing', () => {
    const node = document.createTextNode('Hello')
    expect(() =>
      applyTranslationResult(null, node, 'Hello', 'Hello'),
    ).not.toThrow()
  })

  it('translates collected text nodes with one positional array request', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['Commencer', 'Reserver'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(
          T,
          null,
          createElement('span', null, 'Start now'),
          createElement('span', null, 'Book'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Commencer')).toBeTruthy()
      expect(getByText('Reserver')).toBeTruthy()
    })
    expect(requests).toEqual([['Start now', 'Book']])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('reuses cached translations for the same locale and text without another API call', async () => {
    globalThis.fetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({
          translations: ['Bonjour'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const first = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(T, null, createElement('span', null, 'Hello')),
      ),
    )

    await waitFor(() => expect(first.getByText('Bonjour')).toBeTruthy())
    first.unmount()

    const second = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(T, null, createElement('span', null, 'Hello')),
      ),
    )

    await waitFor(() => expect(second.getByText('Bonjour')).toBeTruthy())
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('retranslates existing preview text from the original copy when locale changes at runtime', async () => {
    const requests: Array<{ locale: string; texts: string[] }> = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        locale?: string
        texts?: string[]
      }
      requests.push({
        locale: body.locale ?? '',
        texts: body.texts ?? [],
      })
      return {
        ok: true,
        json: async () => ({
          translations:
            body.locale === 'fr'
              ? ['Apercu pret']
              : body.locale === 'es'
                ? ['Vista lista']
                : body.texts,
        }),
      } as Response
    }) as unknown as typeof fetch

    const renderPreview = (locale: string) =>
      createElement(
        I18nProvider,
        { locale },
        createElement(T, null, createElement('span', null, 'Runtime preview')),
      )

    const view = render(renderPreview('fr'))

    await waitFor(() => expect(view.getByText('Apercu pret')).toBeTruthy())

    view.rerender(renderPreview('es'))
    await waitFor(() => expect(view.getByText('Vista lista')).toBeTruthy())

    view.rerender(renderPreview('en'))
    await waitFor(() => expect(view.getByText('Runtime preview')).toBeTruthy())

    expect(requests).toEqual([
      { locale: 'fr', texts: ['Runtime preview'] },
      { locale: 'es', texts: ['Runtime preview'] },
    ])
    expect(view.queryByText('Apercu pret')).toBeNull()
  })

  // Regression: typing "English" into the custom-language box resolves to a
  // Convex customLanguages row {code: "english", name: "English"} — there is
  // no "English" entry in KNOWN_LANGUAGES, so it never matches the 'en'
  // sentinel. Without this fix, <T> ran its full DOM-walk + fetch pipeline
  // for locale="english", firing a network round-trip (and, server-side, a
  // multi-second LLM call) to "translate" already-English text into English.
  it('treats the "english" custom-language code as untranslatable, same as "en"', async () => {
    const fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy as unknown as typeof fetch

    const view = render(
      createElement(
        I18nProvider,
        { locale: 'english' },
        createElement(T, null, createElement('span', null, 'Runtime preview')),
      ),
    )

    await waitFor(() => expect(view.getByText('Runtime preview')).toBeTruthy())
    expect(fetchSpy).not.toHaveBeenCalled()
  })

  it('uses on-device browser translations without calling the model-backed API', async () => {
    translationMocks.translateOnDeviceBatch.mockResolvedValue([
      'Naršyti meniu',
      'Rezervuoti',
    ])
    const bodies: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      bodies.push(JSON.parse(String(init?.body ?? '{}')))
      return {
        ok: true,
        json: async () => ({ stored: 2 }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'lt' },
        createElement(
          T,
          null,
          createElement('span', null, 'Explore menu'),
          createElement('span', null, 'Reserve'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Naršyti meniu')).toBeTruthy()
      expect(getByText('Rezervuoti')).toBeTruthy()
    })
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledTimes(1)
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledWith(
      ['Explore menu', 'Reserve'],
      'lt',
    )
    expect(bodies).toEqual([
      {
        locale: 'lt',
        entries: [
          { text: 'Explore menu', translation: 'Naršyti meniu' },
          { text: 'Reserve', translation: 'Rezervuoti' },
        ],
      },
    ])
  })

  it('sends only on-device misses to the API and preserves positional output', async () => {
    const requests: string[][] = []
    const storedEntries: unknown[] = []
    translationMocks.translateOnDeviceBatch.mockResolvedValue([
      'Naršyklės vertimas',
      null,
    ])
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
        entries?: unknown
      }
      if (body.texts) {
        requests.push(body.texts)
      } else {
        storedEntries.push(body.entries)
      }
      return {
        ok: true,
        json: async () => ({
          translations: ['Modelio vertimas'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'lt' },
        createElement(
          T,
          null,
          createElement('span', null, 'Browser local'),
          createElement('span', null, 'Model miss'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('Naršyklės vertimas')).toBeTruthy()
      expect(getByText('Modelio vertimas')).toBeTruthy()
    })
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledTimes(1)
    expect(requests).toEqual([['Model miss']])
    expect(storedEntries).toEqual([
      [{ text: 'Browser local', translation: 'Naršyklės vertimas' }],
    ])
    expect(globalThis.fetch).toHaveBeenCalledTimes(2)
  })

  it('sends a single collected text node as a one-element positional array', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['Contacto'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'es-MX' },
        createElement(T, null, createElement('span', null, 'Contact')),
      ),
    )

    await waitFor(() => expect(getByText('Contacto')).toBeTruthy())
    expect(requests).toEqual([['Contact']])
    expect(globalThis.fetch).toHaveBeenCalledTimes(1)
  })

  it('does not retranslate native Hindi text that is already in a Hindi preview', async () => {
    const requests: string[][] = []
    translationMocks.translateOnDeviceBatch.mockResolvedValue([null])
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({
          translations: ['मानक कांच'],
        }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText, queryByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          createElement('span', null, 'पॉलिश किया हुआ'),
          createElement('span', null, 'Standard Glass'),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('पॉलिश किया हुआ')).toBeTruthy()
      expect(getByText('मानक कांच')).toBeTruthy()
    })
    expect(queryByText('WRONG_BROWSER_TRANSLATION')).toBeNull()
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledTimes(1)
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledWith(
      ['Standard Glass'],
      'hi',
    )
    expect(requests).toEqual([['Standard Glass']])
  })

  it('uses the browser translation batch for small native-locale previews', async () => {
    translationMocks.translateOnDeviceBatch.mockImplementation(async (texts) =>
      texts.map((text: string) => `स्थानीय ${text}`),
    )
    const bodies: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      bodies.push(body)
      if ('texts' in body) throw new Error('model-backed API should not run')
      return {
        ok: true,
        json: async () => ({ stored: true }),
      } as Response
    }) as unknown as typeof fetch

    const labels = ['Preview label 0', 'Preview label 1', 'Preview label 2']
    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          ...labels.map((label) =>
            createElement('span', { key: label }, label),
          ),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('स्थानीय Preview label 2')).toBeTruthy()
    })
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledTimes(1)
    expect(translationMocks.translateOnDeviceBatch).toHaveBeenCalledWith(
      labels,
      'hi',
    )
    expect(translationMocks.translateOnDevice).not.toHaveBeenCalled()
    expect(bodies).toEqual([
      {
        locale: 'hi',
        entries: labels.map((label) => ({
          text: label,
          translation: `स्थानीय ${label}`,
        })),
      },
    ])
  })

  it('uses one positional API batch for large runtime previews instead of locking the browser translator', async () => {
    const bodies: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      bodies.push(body)
      return {
        ok: true,
        json: async () => ({
          translations: (body.texts ?? []).map((text: string) => `मॉडल ${text}`),
        }),
      } as Response
    }) as unknown as typeof fetch

    const labels = Array.from(
      { length: 40 },
      (_, index) => `Large runtime label ${index}`,
    )
    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          ...labels.map((label) =>
            createElement('span', { key: label }, label),
          ),
        ),
      ),
    )

    await waitFor(() => {
      expect(getByText('मॉडल Large runtime label 39')).toBeTruthy()
    })
    expect(translationMocks.translateOnDeviceBatch).not.toHaveBeenCalled()
    expect(translationMocks.translateOnDevice).not.toHaveBeenCalled()
    expect(bodies).toEqual([
      {
        texts: labels,
        locale: 'hi',
      },
    ])
  })

  it('persists browser translations without a model-backed texts request', async () => {
    translationMocks.translateOnDeviceBatch.mockImplementation(async (texts) =>
      texts.map((text: string) => `स्थानीय ${text}`),
    )
    const bodies: unknown[] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}'))
      bodies.push(body)
      if ('texts' in body) throw new Error('model-backed API should not run')
      return {
        ok: true,
        json: async () => ({ stored: true }),
      } as Response
    }) as unknown as typeof fetch

    const labels = ['Cache me']
    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(T, null, createElement('span', null, labels[0])),
      ),
    )

    await waitFor(() => {
      expect(getByText('स्थानीय Cache me')).toBeTruthy()
    })
    expect(bodies).toEqual([
      {
        locale: 'hi',
        entries: [{ text: 'Cache me', translation: 'स्थानीय Cache me' }],
      },
    ])
  })

  it('does not overwrite text that becomes contenteditable while translation is in flight', async () => {
    let resolveFetch: ((value: Response) => void) | undefined
    const fetchStarted = new Promise<void>((resolveStarted) => {
      globalThis.fetch = vi.fn(async () => {
        resolveStarted()
        return await new Promise<Response>((resolve) => {
          resolveFetch = resolve
        })
      }) as unknown as typeof fetch
    })

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(T, null, createElement('span', null, 'Polished Glass')),
      ),
    )

    await fetchStarted

    const editable = getByText('Polished Glass')
    editable.setAttribute('contenteditable', 'true')
    const editableTextNode = editable.firstChild
    expect(editableTextNode?.nodeType).toBe(Node.TEXT_NODE)
    editableTextNode!.textContent = 'पॉलिश किया हुआ'

    resolveFetch?.({
      ok: true,
      json: async () => ({
        translations: ['Verre poli'],
      }),
    } as Response)

    await waitFor(() => {
      expect(editable.classList.contains('shimmer')).toBe(false)
    })
    expect(editable.textContent).toBe('पॉलिश किया हुआ')
  })

  it('clears shimmer and keeps source text when the translation batch fails', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('translation endpoint unavailable')
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(T, null, createElement('span', null, 'Dreamy Pastel')),
      ),
    )

    const node = getByText('Dreamy Pastel')
    expect(getComputedStyle(node).color).not.toBe('transparent')
    expect(node.classList.contains('shimmer')).toBe(true)
    expect(node.classList.contains('text-muted-foreground')).toBe(true)

    await waitFor(() => {
      expect(node.classList.contains('shimmer')).toBe(false)
    })
    expect(node.classList.contains('shimmer')).toBe(false)
    expect(node.classList.contains('text-muted-foreground')).toBe(false)
    expect(node.textContent).toBe('Dreamy Pastel')
  })

  it('keeps shimmer text readable even if an older render left transparent text styles behind', async () => {
    let resolveFetch: ((value: Response) => void) | undefined
    globalThis.fetch = vi.fn(async () => {
      return await new Promise<Response>((resolve) => {
        resolveFetch = resolve
      })
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          createElement(
            'span',
            {
              style: {
                backgroundClip: 'text',
                color: 'transparent',
                WebkitBackgroundClip: 'text',
              },
            },
            'Visible shimmer text',
          ),
        ),
      ),
    )

    const node = getByText('Visible shimmer text')
    await waitFor(() => {
      expect(node.classList.contains('shimmer')).toBe(true)
    })
    expect(node.classList.contains('shimmer')).toBe(true)
    expect(node.classList.contains('text-muted-foreground')).toBe(true)
    expect(node.style.color).not.toBe('transparent')
    expect(node.style.backgroundClip).not.toBe('text')
    expect(node.style.webkitBackgroundClip).not.toBe('text')
    expect(node.style.backgroundImage).toBe('')

    resolveFetch?.({
      ok: true,
      json: async () => ({ translations: ['दिखने वाला शिमर टेक्स्ट'] }),
    } as Response)
    await waitFor(() => {
      expect(node.classList.contains('shimmer')).toBe(false)
    })
    expect(node.classList.contains('shimmer')).toBe(false)
    expect(node.classList.contains('text-muted-foreground')).toBe(false)
  })

  it('uses the shadcn shimmer class contract while a translation is pending', async () => {
    globalThis.fetch = vi.fn(
      () => new Promise(() => {}),
    ) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          createElement('span', null, 'Generating response...'),
        ),
      ),
    )

    const node = getByText('Generating response...')
    await waitFor(() => {
      expect(node.classList.contains('shimmer')).toBe(true)
    })
    expect(node.classList.contains('text-muted-foreground')).toBe(true)
    expect(node.textContent).toBe('Generating response...')
  })

  it('caps simultaneous shimmer animations while still batching every text node', async () => {
    const requestedBatches: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requestedBatches.push(body.texts ?? [])
      return await new Promise<Response>(() => {})
    }) as unknown as typeof fetch

    const labels = Array.from(
      { length: 80 },
      (_, index) => `Preview scale text ${index}`,
    )
    const { container } = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          ...labels.map((label) =>
            createElement('span', { key: label }, label),
          ),
        ),
      ),
    )

    await waitFor(() => expect(requestedBatches[0]?.length).toBe(80))

    const spans = [...container.querySelectorAll('span')]
    const shimmered = spans.filter((span) => span.classList.contains('shimmer'))
    expect(shimmered.length).toBeGreaterThan(0)
    expect(shimmered.length).toBeLessThanOrEqual(24)
    expect(requestedBatches[0]).toEqual(labels)
  })

  it('preserves pre-existing text-muted-foreground after translation completes', async () => {
    globalThis.fetch = vi.fn(async () => {
      return {
        ok: true,
        json: async () => ({ translations: ['Bonjour'] }),
      } as Response
    }) as unknown as typeof fetch

    const { getByText } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(
          T,
          null,
          createElement(
            'span',
            { className: 'text-muted-foreground' },
            'Hello',
          ),
        ),
      ),
    )

    await waitFor(() => expect(getByText('Bonjour')).toBeTruthy())
    const node = getByText('Bonjour')
    expect(node.classList.contains('text-muted-foreground')).toBe(true)
    expect(node.classList.contains('shimmer')).toBe(false)
  })

  // Regression: image alt text is the stock-photo search query (Pexels/Unsplash
  // search in English). The T component must NEVER translate alt attributes,
  // regardless of the site locale — otherwise non-English locales produce
  // irrelevant images. The TreeWalker(SHOW_TEXT) only visits Text nodes, not
  // attribute values, so alt is structurally safe; this test locks that in.
  // Regression: a degraded/partial model response can return the ORIGINAL
  // English text as the "translation" for one item in an otherwise-successful
  // batch (e.g. parseTranslationArray's per-item fallback on the server). The
  // client must not treat that no-op result as a successful translation and
  // permanently cache it — otherwise the text is stuck in English forever for
  // that browser, since every future lookup finds "a cached value" and never
  // retries the network call.
  it('does not permanently cache a no-op translation that matches the original text', async () => {
    let call = 0
    globalThis.fetch = vi.fn(async (_input, init) => {
      call += 1
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      const texts = body.texts ?? []
      return {
        ok: true,
        json: async () => ({
          // First attempt: degraded response returns the original text
          // unchanged (simulating a parse-fallback / model no-op).
          // Second attempt: a real translation succeeds.
          translations: call === 1 ? texts : texts.map(() => 'अनुवादित पाठ'),
        }),
      } as Response
    }) as unknown as typeof fetch

    const first = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          createElement('span', null, 'Untranslated stuck text'),
        ),
      ),
    )
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(1))
    // First attempt was a no-op — text remains in English.
    await waitFor(() =>
      expect(first.getByText('Untranslated stuck text')).toBeTruthy(),
    )
    first.unmount()

    const second = render(
      createElement(
        I18nProvider,
        { locale: 'hi' },
        createElement(
          T,
          null,
          createElement('span', null, 'Untranslated stuck text'),
        ),
      ),
    )

    // A poisoned cache would short-circuit this and never call fetch again.
    await waitFor(() => expect(globalThis.fetch).toHaveBeenCalledTimes(2))
    await waitFor(() => expect(second.getByText('अनुवादित पाठ')).toBeTruthy())
  })

  it('does not translate img alt attributes regardless of locale', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({ translations: ['Bonjour unique-alt-1'] }),
      } as Response
    }) as unknown as typeof fetch

    const { container } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(
          T,
          null,
          createElement('img', {
            src: '/api/pexels?query=onam%20shopping&w=800&h=600',
            alt: 'Onam shopping festival',
          }),
          createElement('span', null, 'Visible caption unique-alt-1'),
        ),
      ),
    )

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))

    // The alt text must NOT appear in the translation batch — only visible
    // text-node content should be sent.
    expect(requests[0]).toEqual(['Visible caption unique-alt-1'])
    expect(requests[0]).not.toContain('Onam shopping festival')

    // The alt attribute on the rendered img must be unchanged.
    const img = container.querySelector('img')
    expect(img?.getAttribute('alt')).toBe('Onam shopping festival')
  })

  it('does not translate aria-label or title attributes regardless of locale', async () => {
    const requests: string[][] = []
    globalThis.fetch = vi.fn(async (_input, init) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        texts?: string[]
      }
      requests.push(body.texts ?? [])
      return {
        ok: true,
        json: async () => ({ translations: ['Bonjour unique-alt-2'] }),
      } as Response
    }) as unknown as typeof fetch

    const { container } = render(
      createElement(
        I18nProvider,
        { locale: 'fr' },
        createElement(
          T,
          null,
          createElement(
            'button',
            {
              'aria-label': 'Close dialog',
              title: 'Close',
            },
            'Visible button unique-alt-2',
          ),
        ),
      ),
    )

    await waitFor(() => expect(requests.length).toBeGreaterThan(0))

    expect(requests[0]).toEqual(['Visible button unique-alt-2'])
    expect(requests[0]).not.toContain('Close dialog')
    expect(requests[0]).not.toContain('Close')

    const button = container.querySelector('button')
    expect(button?.getAttribute('aria-label')).toBe('Close dialog')
    expect(button?.getAttribute('title')).toBe('Close')
  })
})
