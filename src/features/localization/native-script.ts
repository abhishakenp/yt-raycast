const SCRIPT_BY_LOCALE: Array<{
  locales: string[]
  pattern: RegExp
}> = [
  { locales: ['hi', 'mr', 'ne', 'sa'], pattern: /[\u0900-\u097f]/gu },
  { locales: ['bn', 'as'], pattern: /[\u0980-\u09ff]/gu },
  { locales: ['pa'], pattern: /[\u0a00-\u0a7f]/gu },
  { locales: ['gu'], pattern: /[\u0a80-\u0aff]/gu },
  { locales: ['or'], pattern: /[\u0b00-\u0b7f]/gu },
  { locales: ['ta'], pattern: /[\u0b80-\u0bff]/gu },
  { locales: ['te'], pattern: /[\u0c00-\u0c7f]/gu },
  { locales: ['kn'], pattern: /[\u0c80-\u0cff]/gu },
  { locales: ['ml'], pattern: /[\u0d00-\u0d7f]/gu },
  { locales: ['si'], pattern: /[\u0d80-\u0dff]/gu },
  { locales: ['th'], pattern: /[\u0e00-\u0e7f]/gu },
  { locales: ['lo'], pattern: /[\u0e80-\u0eff]/gu },
  { locales: ['my'], pattern: /[\u1000-\u109f]/gu },
  { locales: ['ka'], pattern: /[\u10a0-\u10ff]/gu },
  { locales: ['am'], pattern: /[\u1200-\u137f]/gu },
  { locales: ['km'], pattern: /[\u1780-\u17ff]/gu },
  { locales: ['ja'], pattern: /[\u3040-\u30ff\u3400-\u9fff]/gu },
  { locales: ['zh'], pattern: /[\u3400-\u9fff]/gu },
  { locales: ['ko'], pattern: /[\uac00-\ud7af\u1100-\u11ff]/gu },
  { locales: ['ar', 'fa', 'ur'], pattern: /[\u0600-\u06ff]/gu },
  { locales: ['he'], pattern: /[\u0590-\u05ff]/gu },
  { locales: ['ru', 'uk', 'bg', 'sr'], pattern: /[\u0400-\u04ff]/gu },
  { locales: ['el'], pattern: /[\u0370-\u03ff]/gu },
]

const localeBase = (locale: string): string =>
  locale
    .trim()
    .toLowerCase()
    .replace(/-(latn|en)$/i, '')
    .split(/[-_]/)[0] || locale.trim().toLowerCase()

export const shouldPreserveNativeLocaleText = (
  text: string,
  locale: string,
): boolean => {
  const normalizedLocale = locale.trim().toLowerCase()
  if (
    !text.trim() ||
    normalizedLocale === 'hinglish' ||
    /-(latn|en)$/i.test(normalizedLocale)
  ) {
    return false
  }

  const base = localeBase(normalizedLocale)
  const script = SCRIPT_BY_LOCALE.find((entry) => entry.locales.includes(base))
  if (!script) return false

  const matches = text.match(script.pattern)
  return Boolean(matches && matches.length > 0)
}
