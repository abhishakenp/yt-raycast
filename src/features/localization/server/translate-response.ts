import { isTranslatableLocale, lookupKnownLanguage } from '@/config/languages'
import { createRuntimeConvexHttpClient } from '@/shared/convex/http-client'
import { api } from '../../../../convex/_generated/api'
import { shouldPreserveTranslationText } from '../native-script'

type TranslateModel = (
  system: string,
  user: string,
  signal: AbortSignal,
) => Promise<string>

const MAX_TRANSLATION_TEXT_LENGTH = 1200
const MAX_TRANSLATION_BATCH_SIZE = 120
// A single model call for a full-page-sized batch (~100+ unique strings)
// measured ~12s in production — right at (and sometimes over) the request's
// abort timeout, causing the WHOLE batch to silently fail and fall back to
// untranslated text with no error surfaced. Splitting cache misses into
// smaller chunks and translating them in parallel keeps each call's latency
// well under the timeout regardless of total page size.
const MAX_MODEL_BATCH_SIZE = 30
const CACHE_CLAIM_POLL_MS = 25
const CACHE_CLAIM_WAIT_MS = 12_000

type TranslationCacheClient = {
  getBatch: (input: {
    locale: string
    texts: string[]
  }) => Promise<Array<string | null>>
  setBatch: (input: {
    locale: string
    entries: Array<{ text: string; translation: string }>
  }) => Promise<unknown>
  claimBatch?: (input: {
    locale: string
    texts: string[]
    owner: string
  }) => Promise<TranslationClaimResult[]>
  completeBatch?: (input: {
    locale: string
    owner: string
    entries: Array<{ text: string; translation: string }>
  }) => Promise<Array<string | null>>
  releaseBatch?: (input: {
    locale: string
    texts: string[]
    owner: string
  }) => Promise<unknown>
}

type TranslationClaimResult =
  | { state: 'cached'; translation: string }
  | { state: 'claimed' }
  | { state: 'pending' }

type CoordinatedTranslationCacheClient = TranslationCacheClient & {
  claimBatch: NonNullable<TranslationCacheClient['claimBatch']>
  completeBatch: NonNullable<TranslationCacheClient['completeBatch']>
  releaseBatch: NonNullable<TranslationCacheClient['releaseBatch']>
}

type TranslationCacheEntry = {
  text: string
  translation: string
}

type TranslationRequestBody = {
  texts?: unknown
  locale?: unknown
  entries?: unknown
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function json(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })
}

function normalizeLocale(value: unknown): string {
  return String(typeof value === 'string' ? value : '')
    .trim()
    .toLowerCase()
    .slice(0, 24)
}

function stripCodeFence(value: string): string {
  return value
    .trim()
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .trim()
}

function localeBase(locale: string): string {
  return locale === 'hinglish'
    ? 'hi'
    : locale.replace(/-(latn|en)$/i, '').split(/[-_]/)[0] || locale
}

function localeStyle(locale: string): 'native' | 'romanized' | 'codemix' {
  if (locale === 'hinglish' || /-en$/i.test(locale)) return 'codemix'
  if (/-latn$/i.test(locale)) return 'romanized'
  return 'native'
}

function languageName(locale: string): string {
  const base = localeBase(locale)
  const known = lookupKnownLanguage(base)
  if (known?.name) return known.name.replace(/\s*\(Roman\)$/i, '')
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(base) ?? base
  } catch {
    return base
  }
}

function buildTranslationPrompt(texts: string[], locale: string) {
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

function parseTranslationArray(raw: string, fallbackTexts: string[]): string[] {
  const cleaned = stripCodeFence(raw)
  try {
    const parsed: unknown = JSON.parse(cleaned)
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

function createDefaultTranslationCacheClient(): TranslationCacheClient | null {
  try {
    const client = createRuntimeConvexHttpClient()
    return {
      getBatch: (input) => client.query(api.translationCache.getBatch, input),
      setBatch: (input) =>
        client.mutation(api.translationCache.setBatch, input),
      claimBatch: (input) =>
        client.mutation(api.translationCache.claimBatch, input),
      completeBatch: (input) =>
        client.mutation(api.translationCache.completeBatch, input),
      releaseBatch: (input) =>
        client.mutation(api.translationCache.releaseBatch, input),
    }
  } catch {
    return null
  }
}

function normalizeTexts(body: { texts?: unknown }): string[] {
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

function supportsClaimCoordination(
  cacheClient: TranslationCacheClient | null,
): cacheClient is CoordinatedTranslationCacheClient {
  return (
    typeof cacheClient?.claimBatch === 'function' &&
    typeof cacheClient.completeBatch === 'function' &&
    typeof cacheClient.releaseBatch === 'function'
  )
}

async function translateModelBatch({
  texts,
  locale,
  translateModel,
  signal,
}: {
  texts: string[]
  locale: string
  translateModel: TranslateModel
  signal: AbortSignal
}): Promise<string[]> {
  const chunks: string[][] = []
  for (let start = 0; start < texts.length; start += MAX_MODEL_BATCH_SIZE) {
    chunks.push(texts.slice(start, start + MAX_MODEL_BATCH_SIZE))
  }

  const chunkTranslations = await Promise.all(
    chunks.map(async (chunkTexts) => {
      const prompt = buildTranslationPrompt(chunkTexts, locale)
      const raw = await translateModel(prompt.system, prompt.user, signal)
      return parseTranslationArray(raw, chunkTexts)
    }),
  )
  return chunkTranslations.flat()
}

type UniqueTranslationEntry = {
  text: string
  indexes: number[]
}

async function translateWithClaimCoordination({
  entries,
  translations,
  locale,
  owner,
  initialClaims,
  translateModel,
  cacheClient,
  signal,
}: {
  entries: UniqueTranslationEntry[]
  translations: string[]
  locale: string
  owner: string
  initialClaims: TranslationClaimResult[]
  translateModel: TranslateModel
  cacheClient: CoordinatedTranslationCacheClient
  signal: AbortSignal
}): Promise<{ translations: string[]; modelCalled: boolean }> {
  const deadline = Date.now() + CACHE_CLAIM_WAIT_MS
  let unresolved = entries
  let claims = initialClaims
  let modelCalled = false

  while (unresolved.length > 0) {
    const claimed: UniqueTranslationEntry[] = []
    const pending: UniqueTranslationEntry[] = []

    unresolved.forEach((entry, index) => {
      const claim = claims[index]
      if (claim?.state === 'cached') {
        entry.indexes.forEach((translationIndex) => {
          translations[translationIndex] = claim.translation
        })
      } else if (claim?.state === 'claimed') {
        claimed.push(entry)
      } else {
        pending.push(entry)
      }
    })

    if (claimed.length > 0) {
      modelCalled = true
      const claimedTexts = claimed.map(({ text }) => text)
      try {
        const modelTranslations = await translateModelBatch({
          texts: claimedTexts,
          locale,
          translateModel,
          signal,
        })
        const completed = await cacheClient.completeBatch({
          locale,
          owner,
          entries: claimed.map(({ text }, index) => ({
            text,
            translation: modelTranslations[index] || text,
          })),
        })

        claimed.forEach((entry, index) => {
          const translation = completed[index]
          if (typeof translation !== 'string') {
            pending.push(entry)
            return
          }
          entry.indexes.forEach((translationIndex) => {
            translations[translationIndex] = translation
          })
        })
      } catch (error) {
        await cacheClient
          .releaseBatch({ locale, owner, texts: claimedTexts })
          .catch(() => null)
        throw error
      }
    }

    if (pending.length === 0) break
    if (signal.aborted || Date.now() >= deadline) {
      throw new Error('Timed out waiting for translation cache claim.')
    }

    await new Promise((resolve) => setTimeout(resolve, CACHE_CLAIM_POLL_MS))
    unresolved = pending
    claims = await cacheClient.claimBatch({
      locale,
      owner,
      texts: unresolved.map(({ text }) => text),
    })
  }

  return { translations, modelCalled }
}

function normalizeEntries(body: {
  entries?: unknown
}): TranslationCacheEntry[] {
  if (!Array.isArray(body.entries)) return []
  const entries: TranslationCacheEntry[] = []

  for (const entry of body.entries.slice(0, MAX_TRANSLATION_BATCH_SIZE)) {
    if (!isUnknownRecord(entry)) continue
    const text =
      typeof entry.text === 'string'
        ? entry.text.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
        : ''
    const translation =
      typeof entry.translation === 'string'
        ? entry.translation.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
        : ''
    if (text && translation) entries.push({ text, translation })
  }

  return entries
}

async function translateBatch({
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
}) {
  const translations = [...texts]
  const uniqueEntriesByText = new Map<string, UniqueTranslationEntry>()

  texts.forEach((text, index) => {
    if (!text) return
    if (shouldPreserveTranslationText(text, locale)) {
      translations[index] = text
      return
    }
    const existing = uniqueEntriesByText.get(text)
    if (existing) {
      existing.indexes.push(index)
    } else {
      uniqueEntriesByText.set(text, { text, indexes: [index] })
    }
  })

  const uniqueEntries = [...uniqueEntriesByText.values()]
  if (uniqueEntries.length === 0) {
    return { translations, modelCalled: false }
  }

  if (supportsClaimCoordination(cacheClient)) {
    const owner = crypto.randomUUID()
    const initialClaims = await cacheClient
      .claimBatch({
        locale,
        owner,
        texts: uniqueEntries.map(({ text }) => text),
      })
      .catch(() => null)
    if (initialClaims) {
      return await translateWithClaimCoordination({
        entries: uniqueEntries,
        translations,
        locale,
        owner,
        initialClaims,
        translateModel,
        cacheClient,
        signal,
      })
    }
  }

  const cached = await cacheClient
    ?.getBatch({ locale, texts })
    .catch(() => null)
  const missing: Array<{ index: number; text: string }> = []

  texts.forEach((text, index) => {
    if (!text) return
    if (shouldPreserveTranslationText(text, locale)) {
      translations[index] = text
      return
    }
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

  const translatedMissing = await translateModelBatch({
    texts: missing.map(({ text }) => text),
    locale,
    translateModel,
    signal,
  })

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

export async function createTranslateResponse(
  request: Request,
  translateModel: TranslateModel = defaultTranslateModel,
  cacheClient: TranslationCacheClient | null = createDefaultTranslationCacheClient(),
): Promise<Response> {
  let body: TranslationRequestBody = {}

  try {
    const parsedBody: unknown = await request.json()
    if (isUnknownRecord(parsedBody)) body = parsedBody
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const texts = normalizeTexts(body)
  const locale = normalizeLocale(body.locale)
  const entries = normalizeEntries(body)
  const cacheableEntries = entries.filter(
    (entry) => !shouldPreserveTranslationText(entry.text, locale),
  )

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
    if (cacheableEntries.length > 0) {
      await cacheClient
        ?.setBatch({ locale, entries: cacheableEntries })
        .catch(() => null)
    }
    return json({
      locale,
      stored: cacheableEntries.length,
      translated: cacheableEntries.some(
        (entry) => entry.translation !== entry.text,
      ),
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
