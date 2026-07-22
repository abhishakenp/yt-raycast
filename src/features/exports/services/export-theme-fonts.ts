import type { ThemeStyles } from '@/genui/theme-presets'

type FontKey = 'font-sans' | 'font-serif' | 'font-mono'

const fontKeys: readonly FontKey[] = ['font-sans', 'font-serif', 'font-mono']

const systemFontRe =
  /^(ui-|system|-apple|blinkmac|segoe|roboto$|helvetica|arial|sans-serif|serif|monospace|menlo|consolas|courier|georgia|cambria|times)/i

const normalizeFontFamily = (raw: string): string | null => {
  const first = raw
    .split(',')[0]
    ?.trim()
    .replace(/^["']|["']$/g, '')
  if (!first || systemFontRe.test(first)) return null
  return first
}

export const collectThemeFontFamilies = (
  styles: ThemeStyles | null,
): string[] => {
  if (!styles) return []
  const families = new Set<string>()

  for (const variant of [styles.light, styles.dark]) {
    for (const key of fontKeys) {
      const raw = variant[key]
      if (typeof raw !== 'string') continue
      const family = normalizeFontFamily(raw)
      if (family) families.add(family)
    }
  }

  return [...families]
}

export const collectCssFontFamilies = (css: string): string[] => {
  const families = new Set<string>()
  for (const match of css.matchAll(/--font-[\w-]+:\s*([^;]+);/g)) {
    const raw = match[1]
    if (raw === undefined) continue
    const family = normalizeFontFamily(raw)
    if (family) families.add(family)
  }
  return [...families]
}

export const buildGoogleFontStylesheetHref = (
  families: readonly string[],
): string | null => {
  const uniqueFamilies = [...new Set(families)]
  if (uniqueFamilies.length === 0) return null

  const params = uniqueFamilies
    .map(
      (family) =>
        `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700;800`,
    )
    .join('&')

  return `https://fonts.googleapis.com/css2?${params}&display=swap`
}

export const buildExportFontStylesheetHrefs = (
  styles: ThemeStyles | null,
  css: string = '',
): string[] => {
  const href = buildGoogleFontStylesheetHref([
    ...collectCssFontFamilies(css),
    ...collectThemeFontFamilies(styles),
  ])
  return href === null ? [] : [href]
}

export const buildExportFontLinkTags = (
  styles: ThemeStyles | null,
  css: string = '',
): string =>
  buildExportFontStylesheetHrefs(styles, css)
    .map((href) => `<link rel="stylesheet" href="${href}" />`)
    .join('\n')
