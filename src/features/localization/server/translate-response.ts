import { isTranslatableLocale, lookupKnownLanguage } from '@/config/languages.js'

type TranslateModel = (
  system: string,
  user: string,
  signal: AbortSignal,
) => Promise<string>

const MAX_TRANSLATION_TEXT_LENGTH = 1200

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

const stripModelWrapping = (value: string): string =>
  value
    .trim()
    .replace(/^```(?:text)?/i, '')
    .replace(/```$/i, '')
    .trim()
    .replace(/^["“”]+|["“”]+$/g, '')
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

const buildTranslationPrompt = (text: string, locale: string) => {
  const baseName = languageName(locale)
  const style = localeStyle(locale)
  const system =
    style === 'romanized'
      ? `You are a professional ${baseName} website copy translator. Translate the user's UI text into ${baseName}, but write it only with Latin/English letters. Do not use native-script characters. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only the translated text, no labels or explanation.`
      : style === 'codemix'
        ? `You are a bilingual ${baseName}+English website copywriter. Rewrite the user's UI text as natural ${baseName}-English code-mixed website copy, written only with Latin/English letters. Keep common tech/business words in English when that sounds natural. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only the translated text, no labels or explanation.`
        : `You are a native ${baseName} website copy translator. Translate the user's UI text into natural, polished ${baseName} for a real website, using the language's normal native script. Preserve brand names, URLs, numbers, prices, placeholders, and product names exactly. Output only the translated text, no labels or explanation.`

  return {
    system,
    user: `Translate this exact UI text:\n${text}`,
  }
}

const defaultTranslateModel: TranslateModel = async (system, user, signal) => {
  const [{ generateText }, { DEFAULT_MODEL }] = await Promise.all([
    import('@ship-fast/engine'),
    import('@ship-fast/engine/model-list.js'),
  ])

  return await generateText(DEFAULT_MODEL, system, user, signal, 2)
}

export const createTranslateResponse = async (
  request: Request,
  translateModel: TranslateModel = defaultTranslateModel,
): Promise<Response> => {
  let body: { text?: unknown; locale?: unknown } = {}

  try {
    body = (await request.json()) as { text?: unknown; locale?: unknown }
  } catch {
    return json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const text =
    typeof body.text === 'string'
      ? body.text.trim().slice(0, MAX_TRANSLATION_TEXT_LENGTH)
      : ''
  const locale = normalizeLocale(body.locale)

  if (!text) {
    return json({ error: 'Text is required.' }, { status: 422 })
  }

  if (!isTranslatableLocale(locale)) {
    return json({
      translation: text,
      locale: locale || 'en',
      translated: false,
      skipped: locale === 'en' || locale === '' ? 'english' : 'unsupported-locale',
    })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12_000)

  try {
    const prompt = buildTranslationPrompt(text, locale)
    const result = stripModelWrapping(
      await translateModel(prompt.system, prompt.user, controller.signal),
    )

    return json({
      translation: result || text,
      locale,
      translated: Boolean(result && result !== text),
    })
  } catch (error) {
    return json(
      {
        error: error instanceof Error ? error.message : 'Translation failed.',
        translation: text,
        locale,
        translated: false,
      },
      { status: 502 },
    )
  } finally {
    clearTimeout(timeout)
  }
}
