import type { QueryCtx } from '../_generated/server'

export type CachedSourceTranslation = {
  sourceText: string
  translation: string
}

const readQuotedString = (raw: string): string | null => {
  try {
    const parsed = JSON.parse(raw) as unknown
    return typeof parsed === 'string' ? parsed.trim() : null
  } catch {
    return null
  }
}

export const extractOpenUISourceStrings = (source: string): string[] => {
  const strings = new Set<string>()
  const quoted = /"((?:\\.|[^"\\])*)"/g
  let match: RegExpExecArray | null

  while ((match = quoted.exec(source)) !== null) {
    const value = readQuotedString(match[0])
    if (!value || value.length > 1200) continue
    if (/^https?:\/\//i.test(value) || value.startsWith('/')) continue
    strings.add(value)
  }

  return [...strings]
}

export const loadCachedTranslationsForSource = async (
  ctx: Pick<QueryCtx, 'db'>,
  locale: string | undefined,
  source: string,
): Promise<CachedSourceTranslation[]> => {
  const normalizedLocale = (locale ?? 'en').trim().toLowerCase()
  if (!source.trim() || normalizedLocale === '' || normalizedLocale === 'en') {
    return []
  }

  const texts = extractOpenUISourceStrings(source)
  if (texts.length === 0) return []

  const wantedTexts = new Set(texts)
  const rows = await ctx.db
    .query('translationCache')
    .withIndex('by_locale', (index) => index.eq('locale', normalizedLocale))
    .take(1000)
    .catch(() => [])
  const translationsBySource = new Map<string, string>()
  for (const row of rows) {
    const sourceText =
      typeof row.sourceText === 'string' ? row.sourceText.trim() : ''
    const translation =
      row && typeof row.translation === 'string' ? row.translation.trim() : ''
    if (
      sourceText &&
      translation &&
      translation !== sourceText &&
      wantedTexts.has(sourceText)
    ) {
      translationsBySource.set(sourceText, translation)
    }
  }

  return texts
    .map((sourceText) => ({
      sourceText,
      translation: translationsBySource.get(sourceText) ?? '',
    }))
    .filter(({ translation }) => translation)
}

export const applyCachedTranslationsToSource = (
  source: string,
  translations: CachedSourceTranslation[] | null | undefined,
): string => {
  if (!translations || translations.length === 0) return source

  const bySourceText = new Map(
    translations.map(({ sourceText, translation }) => [
      sourceText,
      translation,
    ]),
  )
  return source.replace(/"((?:\\.|[^"\\])*)"/g, (raw) => {
    const value = readQuotedString(raw)
    if (!value) return raw
    const translation = bySourceText.get(value)
    return translation ? JSON.stringify(translation) : raw
  })
}
