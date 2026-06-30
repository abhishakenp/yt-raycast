// On-device translation via the Chrome / Edge Translator API (stable in Chrome 138+).
//
// This is the FIRST tier of the hybrid translation engine: when the browser ships
// an on-device model for the requested language pair, we translate locally — free,
// instant, no network, no Groq quota. Every code path here degrades to `null` (the
// caller then falls back to the Groq LLM endpoint) whenever the API is missing, the
// language pair is unsupported, or the model isn't downloaded yet.
//
// Only native locales route here: plain language tags (`hi`, `fr`) and regional
// BCP-47 tags (`es-MX`). Romanized (`xx-latn`) and code-mixed (`hinglish`,
// `xx-en`) variants always go to the LLM — the browser engine only produces
// proper native-script translation and cannot romanize or code-mix.

type TranslatorAvailability =
  | 'unavailable'
  | 'downloadable'
  | 'downloading'
  | 'available'

interface ChromeTranslator {
  translate(input: string): Promise<string>
}

interface ChromeTranslatorFactory {
  availability(opts: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<TranslatorAvailability>
  create(opts: {
    sourceLanguage: string
    targetLanguage: string
  }): Promise<ChromeTranslator>
}

const SOURCE = 'en'

// Resolve the Translator factory across the API's naming history: the stable global
// `Translator` (Chrome 138+), and the older `self.translation` / `self.ai.translator`
// surfaces shipped behind flags in earlier builds.
function getFactory(): ChromeTranslatorFactory | null {
  if (typeof globalThis === 'undefined') return null
  const g = globalThis as unknown as {
    Translator?: ChromeTranslatorFactory
    translation?: ChromeTranslatorFactory
    ai?: { translator?: ChromeTranslatorFactory }
  }
  const f = g.Translator ?? g.translation ?? g.ai?.translator
  return f &&
    typeof f.availability === 'function' &&
    typeof f.create === 'function'
    ? f
    : null
}

const availabilityCache = new Map<string, Promise<TranslatorAvailability>>()
const translatorCache = new Map<string, Promise<ChromeTranslator | null>>()

const normalizeNativeLocaleForBrowser = (locale: string): string => {
  const c = String(locale || '').trim()
  if (!c) return ''
  try {
    return Intl.getCanonicalLocales(c)[0] ?? c
  } catch {
    return c.toLowerCase()
  }
}

// Native locale tags only. `hinglish`, `xx-en`, `xx-latn` are excluded — they
// need the LLM. Mirrors the spirit of `isTranslatableLocale` but narrower: the
// on-device engine does native-script translation, nothing else.
export function canUseChromeTranslator(locale: string): boolean {
  if (!getFactory()) return false
  const c = normalizeNativeLocaleForBrowser(locale)
  const lower = c.toLowerCase()
  return (
    /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(c) &&
    lower !== 'en' &&
    !lower.endsWith('-en') &&
    !lower.endsWith('-latn') &&
    lower !== 'hinglish'
  )
}

export async function getChromeTranslatorAvailability(
  locale: string,
): Promise<TranslatorAvailability | null> {
  if (!canUseChromeTranslator(locale)) return null
  const target = normalizeNativeLocaleForBrowser(locale)
  const factory = getFactory()
  if (!factory) return null
  const key = `${SOURCE}>${target}`
  let avail = availabilityCache.get(key)
  if (!avail) {
    avail = factory.availability({
      sourceLanguage: SOURCE,
      targetLanguage: target,
    })
    availabilityCache.set(key, avail)
  }
  try {
    return await avail
  } catch {
    return null
  }
}

export async function isChromeTranslatorLocaleAvailable(
  locale: string,
): Promise<boolean> {
  const status = await getChromeTranslatorAvailability(locale)
  return Boolean(status && status !== 'unavailable')
}

async function getTranslator(target: string): Promise<ChromeTranslator | null> {
  const factory = getFactory()
  if (!factory) return null
  const key = `${SOURCE}>${target}`
  const existing = translatorCache.get(key)
  if (existing) return existing

  const created = (async () => {
    try {
      const status = await getChromeTranslatorAvailability(target)
      if (!status || status === 'unavailable') return null
      // 'available' | 'downloadable' | 'downloading' → attempt create. A
      // 'downloadable' model may require a user gesture; if create() rejects we
      // cache the null and let the LLM take over for this session.
      return await factory.create({
        sourceLanguage: SOURCE,
        targetLanguage: target,
      })
    } catch {
      return null
    }
  })()

  translatorCache.set(key, created)
  return created
}

// Returns the on-device translation, or `null` to signal "fall back to the LLM".
export async function translateOnDevice(
  text: string,
  locale: string,
): Promise<string | null> {
  if (!canUseChromeTranslator(locale)) return null
  try {
    const translator = await getTranslator(
      normalizeNativeLocaleForBrowser(locale),
    )
    if (!translator) return null
    const out = (await translator.translate(text))?.trim()
    return out || null
  } catch {
    return null
  }
}
