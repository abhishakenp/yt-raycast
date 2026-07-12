import type { QueryCtx } from '../_generated/server'

export type CachedSourceTranslation = {
  sourceText: string
  translation: string
}

function readQuotedString(raw: string): string | null {
  try {
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'string' ? parsed.trim() : null
  } catch {
    return null
  }
}

function isStructuralString(
  source: string,
  end: number,
  value: string,
): boolean {
  const nextToken = source.slice(end).match(/^\s*(.)/)?.[1]
  const isSchemaKey = nextToken === ':' && /^[a-z_$][A-Za-z0-9_$]*$/.test(value)
  const isRouteOrAsset =
    /^(?:https?:\/\/|\/|#|\.\/|\.\.\/|mailto:|tel:|data:)/i.test(value) ||
    value.includes('#')
  const isIdentifier = /^[A-Za-z][A-Za-z0-9]*_[A-Za-z0-9_]+$/.test(value)
  const isNumericValue =
    /^[+-]?(?:[$€£¥₹]\s*)?\d[\d,.]*(?:\s*(?:[$€£¥₹]|%|[A-Z]{3}))?$/u.test(value)
  const isUtilityClass = value
    .split(/\s+/)
    .every((token) =>
      /^(?:[a-z][a-z0-9-]*:)*!?-?[a-z][a-z0-9]*(?:-[a-z0-9]+)*-\d+(?:\.\d+)?$/i.test(
        token,
      ),
    )

  return (
    isSchemaKey ||
    isRouteOrAsset ||
    isIdentifier ||
    isNumericValue ||
    isUtilityClass
  )
}

export function extractOpenUISourceStrings(source: string): string[] {
  const strings = new Set<string>()
  const quoted = /"((?:\\.|[^"\\])*)"/g
  let match: RegExpExecArray | null

  while ((match = quoted.exec(source)) !== null) {
    const value = readQuotedString(match[0])
    if (!value || value.length > 1200) continue
    if (isStructuralString(source, match.index + match[0].length, value)) {
      continue
    }
    strings.add(value)
  }

  return [...strings]
}

export async function loadCachedTranslationsForSource(
  ctx: Pick<QueryCtx, 'db'>,
  locale: string | undefined,
  source: string,
): Promise<CachedSourceTranslation[]> {
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

export function applyCachedTranslationsToSource(
  source: string,
  translations: CachedSourceTranslation[] | null | undefined,
): string {
  if (!translations || translations.length === 0) return source

  const translatedValues = new Set(
    translations.map(({ translation }) => translation.trim()).filter(Boolean),
  )
  const bySourceText = new Map<string, string>()
  for (const { sourceText, translation } of translations) {
    const normalizedSource = sourceText.trim()
    const normalizedTranslation = translation.trim()
    if (
      !normalizedSource ||
      !normalizedTranslation ||
      normalizedSource === normalizedTranslation ||
      translatedValues.has(normalizedSource)
    ) {
      continue
    }
    bySourceText.set(normalizedSource, normalizedTranslation)
  }

  return source.replace(/"((?:\\.|[^"\\])*)"/g, (raw, _encoded, offset) => {
    const value = readQuotedString(raw)
    if (!value || isStructuralString(source, offset + raw.length, value)) {
      return raw
    }
    const translation = bySourceText.get(value)
    return translation ? JSON.stringify(translation) : raw
  })
}
