export type LocaleTextDirection = 'ltr' | 'rtl'

const rightToLeftScripts = new Set([
  'Adlm',
  'Arab',
  'Aran',
  'Hebr',
  'Mand',
  'Nkoo',
  'Rohg',
  'Samr',
  'Syrc',
  'Thaa',
])

const rightToLeftLanguages = new Set([
  'ar',
  'ckb',
  'dv',
  'fa',
  'he',
  'ks',
  'ps',
  'sd',
  'ug',
  'ur',
  'yi',
])

export const localeTextDirection = (locale: string): LocaleTextDirection => {
  const normalizedLocale = locale.trim().replaceAll('_', '-') || 'en'

  try {
    const script = new Intl.Locale(normalizedLocale).maximize().script
    return script && rightToLeftScripts.has(script) ? 'rtl' : 'ltr'
  } catch {
    const language = normalizedLocale.toLowerCase().split('-')[0] ?? ''
    return rightToLeftLanguages.has(language) ? 'rtl' : 'ltr'
  }
}
