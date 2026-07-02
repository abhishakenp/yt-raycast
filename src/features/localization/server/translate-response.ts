import { isTranslatableLocale, lookupKnownLanguage } from '@/config/languages'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { api } from '../../../../convex/_generated/api'

type TranslateModel = (
  system: string,
  user: string,
  signal: AbortSignal,
) => Promise<string>

const MAX_TRANSLATION_TEXT_LENGTH = 1200
const MAX_TRANSLATION_BATCH_SIZE = 120

type TranslationCacheClient = {
  getBatch: (input: {
    locale: string
    texts: string[]
  }) => Promise<Array<string | null>>
  setBatch: (input: {
    locale: string
    entries: Array<{ text: string; translation: string }>
  }) => Promise<unknown>
}

type TranslationCacheEntry = {
  text: string
  translation: string
}

const json = (body: unknown, init?: ResponseInit) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

const normalizeLocale = (value: unknown): string =>
  String(typeof value === 'string' ? value : '')
    .trim()
    .toLowerCase()
    .slice(0, 24)

const stripCodeFence = (value: string): string =>
  value
    .trim()
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .trim()

const localeBase = (locale: string): string =>
  locale === 'hinglish'
    ? 'hi'
    : locale.replace(/-(latn|en)$/i, '').split(/[-_]/)[0] || locale

const localeStyle = (locale: string): 'native' | 'romanized' | 'codemix' => {
  if (locale === 'hinglish' || /-en$/i.test(locale)) return 'codemix'
  if (/-latn$/i.test(locale)) return 'romanized'
  return 'native'
}

const languageName = (locale: string): string => {
  const base = localeBase(locale)
  const known = lookupKnownLanguage(base)
  if (known?.name) return known.name.replace(/\s*\(Roman\)$/i, '')
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(base) ?? base
  } catch {
    return base
  }
}

const buildTranslationPrompt = (texts: string[], locale: string) => {
  const baseName = languageName(locale)
  const style = localeStyle(locale)
  const system =
    style === 'romanized'
      ? `You are a professional ${baseName} website copy translator. Translate each UI string into ${baseName}, but write it only with Latin/English letters. Do not use native-script characters. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only a JSON array of translated strings, same length and order as input.`
      : style === 'codemix'
        ? `You are a bilingual ${baseName}+English website copywriter. Rewrite each UI string as natural ${baseName}-English code-mixed website copy, written only with Latin/English letters. Keep common tech/business words in English when that sounds natural. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only a JSON array of translated strings, same length and order as input.`
        : `You are a native ${baseName} website copy translator. Translate each UI string into natural, polished ${baseName} for a real website, using the language's normal native script. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only a JSON array of translated strings, same length and order as input.`

  return {
    system,
    user: `Translate this JSON array of UI strings:\n${JSON.stringify(texts)}`,
  }
}

const parseTranslationArray = (
  raw: string,
  fallbackTexts: string[],
): string[] => {
  const cleaned = stripCodeFence(raw)
  try {
    const parsed = JSON.parse(cleaned) as unknown
    if (Array.isArray(parsed)) {
      return fallbackTexts.map((fallback, index) => {
        const value = parsed[index]
        return typeof value === 'string' && value.trim()
          ? value.trim()
          : fallback
      })
    }
  } catch {
    return fallbackTexts
  }
  return fallbackTexts
}

const defaultTranslateModel: TranslateModel = async (system, user, signal) => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return await generateText(DEFAULT_MODEL, system, user, signal, 2)
}

const createDefaultTranslationCacheClient =
  (): TranslationCacheClient | null => {
    try {
      const client = createRuntimeConvexHttpClient()
      return {
        getBatch: (input) => client.query(api.translationCache.getBatch, input),
        setBatch: (input) =>
          client.mutation(api.translationCache.setBatch, input),
      }
    } catch {
      return null
    }
  }

const normalizeTexts = (body: { texts?: unknown }): string[] => {
  if (Array.isArray(body.texts)) {
    return body.texts
      .slice(0, MAX_TRANSLATION_BATCH_SIZE)
      .map((value) =>
        typeof value === 'string'
          ? value.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
          : '',
      )
  }

  return []
}

const normalizeEntries = (body: {
  entries?: unknown
}): TranslationCacheEntry[] => {
  if (!Array.isArray(body.entries)) return []
  return body.entries
    .slice(0, MAX_TRANSLATION_BATCH_SIZE)
    .map((entry): TranslationCacheEntry | null => {
      if (entry === null || typeof entry !== 'object') return null
      const record = entry as Record<string, unknown>
      const text =
        typeof record.text === 'string'
          ? record.text.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
          : ''
      const translation =
        typeof record.translation === 'string'
          ? record.translation.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
          : ''
      return text && translation ? { text, translation } : null
    })
    .filter((entry): entry is TranslationCacheEntry => entry !== null)
}

const translateBatch = async ({
  texts,
  locale,
  translateModel,
  cacheClient,
  signal,
}: {
  texts: string[]
  locale: string
  translateModel: TranslateModel
  cacheClient: TranslationCacheClient | null
  signal: AbortSignal
}) => {
  const translations = [...texts]
  const cached = await cacheClient
    ?.getBatch({ locale, texts })
    .catch(() => null)
  const missing: Array<{ index: number; text: string }> = []

  texts.forEach((text, index) => {
    if (!text) return
    const cachedTranslation = cached?.[index]
    if (typeof cachedTranslation === 'string') {
      translations[index] = cachedTranslation
    } else {
      missing.push({ index, text })
    }
  })

  if (missing.length === 0) {
    return { translations, modelCalled: false }
  }

  const prompt = buildTranslationPrompt(
    missing.map((item) => item.text),
    locale,
  )
  const raw = await translateModel(prompt.system, prompt.user, signal)
  const translatedMissing = parseTranslationArray(
    raw,
    missing.map((item) => item.text),
  )

  const cacheEntries: Array<{ text: string; translation: string }> = []
  missing.forEach((item, offset) => {
    const translation = translatedMissing[offset] || item.text
    translations[item.index] = translation
    if (translation && translation !== item.text) {
      cacheEntries.push({ text: item.text, translation })
    }
  })

  if (cacheEntries.length > 0) {
    await cacheClient
      ?.setBatch({ locale, entries: cacheEntries })
      .catch(() => null)
  }

  return { translations, modelCalled: true }
}

export const createTranslateResponse = async (
  request: Request,
  translateModel: TranslateModel = defaultTranslateModel,
  cacheClient: TranslationCacheClient | null = createDefaultTranslationCacheClient(),
): Promise<Response> => {
  let body: { texts?: unknown; locale?: unknown; entries?: unknown } = {}

  try {
    body = (await request.json()) as {
      texts?: unknown
      locale?: unknown
    }
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const texts = normalizeTexts(body)
  const locale = normalizeLocale(body.locale)
  const entries = normalizeEntries(body)

  if (entries.length > 0) {
    if (!isTranslatableLocale(locale)) {
      return json({
        locale: locale || 'en',
        stored: 0,
        translated: false,
        skipped:
          locale === 'en' || locale === '' ? 'english' : 'unsupported-locale',
      })
    }
    await cacheClient?.setBatch({ locale, entries }).catch(() => null)
    return json({
      locale,
      stored: entries.length,
      translated: entries.some((entry) => entry.translation !== entry.text),
      cached: true,
    })
  }

  if (!texts.some(Boolean)) {
    return json({ error: 'Text is required.' }, { status: 422 })
  }

  if (!isTranslatableLocale(locale)) {
    const skipped =
      locale === 'en' || locale === '' ? 'english' : 'unsupported-locale'
    const response = {
      translations: texts,
      locale: locale || 'en',
      translated: false,
      skipped,
    }
    return json(response)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const result = await translateBatch({
      texts,
      locale,
      translateModel,
      cacheClient,
      signal: controller.signal,
    })
    const translated = result.translations.some(
      (translation, index) => translation !== texts[index],
    )

    const response = {
      translations: result.translations,
      locale,
      translated,
      cached: !result.modelCalled,
    }
    return json(response)
  } catch {
    const response = {
      error: 'Translation failed.',
      translations: texts,
      locale,
      translated: false,
    }
    return json(response, { status: 502 })
  } finally {
    clearTimeout(timeout)
  }
}
