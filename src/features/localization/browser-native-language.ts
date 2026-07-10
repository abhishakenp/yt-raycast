import { type LanguageEntry } from '../../config/languages'
import { isChromeTranslatorLocaleAvailable } from '../../island/openui/_providers/chrome-translator'

const BASE_LANGUAGE_CODES =
  `aa ab ae af ak am ar as av ay az ba be bg bh bi bm bn bo br bs ca ce ch co cr cs cu cv cy da de dv dz ee el eo es et eu fa ff fi fj fo fr fy ga gd gl gn gu gv ha he hi ho hr ht hu hy hz ia id ie ig ii ik io is it iu ja jv ka kg ki kj kk kl km kn ko kr ks ku kv kw ky la lb lg li ln lo lt lu lv mg mh mi mk ml mn mr ms mt my na nb nd ne ng nl nn no nr nv ny oc oj om or os pa pi pl ps pt qu rm rn ro ru rw sa sc sd se sg si sk sl sm sn so sq sr ss st su sv sw ta te tg th ti tk tl tn to tr ts tt tw ty ug uk ur uz ve vi vo wa wo xh yi yo za zh zu`
    .split(/\s+/)
    .filter(Boolean)

const normalizeLabel = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const canonicalLocale = (value: string): string | null => {
  const trimmed = value.trim()
  if (!/^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(trimmed)) return null
  try {
    return Intl.getCanonicalLocales(trimmed)[0] ?? trimmed
  } catch {
    return null
  }
}

const displayName = (
  code: string,
  locale: string,
  fallback: string,
): string => {
  try {
    return (
      new Intl.DisplayNames([locale], { type: 'language' }).of(code)?.trim() ||
      fallback
    )
  } catch {
    return fallback
  }
}

const SCRIPT_FONT_BY_CODE: Record<string, string> = {
  Arab: 'Noto Naskh Arabic, sans-serif',
  Armn: 'Noto Sans Armenian, sans-serif',
  Beng: 'Noto Sans Bengali, sans-serif',
  Cyrl: 'Noto Sans, sans-serif',
  Deva: 'Noto Sans Devanagari, sans-serif',
  Ethi: 'Noto Sans Ethiopic, sans-serif',
  Geor: 'Noto Sans Georgian, sans-serif',
  Grek: 'Noto Sans, sans-serif',
  Gujr: 'Noto Sans Gujarati, sans-serif',
  Guru: 'Noto Sans Gurmukhi, sans-serif',
  Hang: 'Noto Sans KR, sans-serif',
  Hans: 'Noto Sans SC, sans-serif',
  Hant: 'Noto Sans TC, sans-serif',
  Hebr: 'Noto Sans Hebrew, sans-serif',
  Jpan: 'Noto Sans JP, sans-serif',
  Khmr: 'Noto Sans Khmer, sans-serif',
  Knda: 'Noto Sans Kannada, sans-serif',
  Laoo: 'Noto Sans Lao, sans-serif',
  Latn: 'Inter, system-ui, sans-serif',
  Mlym: 'Noto Sans Malayalam, sans-serif',
  Mtei: 'Noto Sans Meetei Mayek, sans-serif',
  Mymr: 'Noto Sans Myanmar, sans-serif',
  Orya: 'Noto Sans Oriya, sans-serif',
  Sinh: 'Noto Sans Sinhala, sans-serif',
  Taml: 'Noto Sans Tamil, sans-serif',
  Telu: 'Noto Sans Telugu, sans-serif',
  Thai: 'Noto Sans Thai, sans-serif',
  Tibt: 'Noto Sans Tibetan, sans-serif',
}

const scriptFontForLocale = (code: string): string => {
  try {
    const script = new Intl.Locale(code).maximize().script
    if (!script) return 'Inter, system-ui, sans-serif'
    return SCRIPT_FONT_BY_CODE[script] || 'Inter, system-ui, sans-serif'
  } catch {
    return 'Inter, system-ui, sans-serif'
  }
}

const languageEntryForLocale = (code: string): LanguageEntry => {
  const name = displayName(code, 'en', code).replace(/\b\w/g, (char) =>
    char.toUpperCase(),
  )
  const nativeName = displayName(code, code, name)
  return {
    code,
    name,
    nativeName,
    fontFamily: scriptFontForLocale(code),
    keywords: [
      code.toLowerCase(),
      name.toLowerCase(),
      nativeName.toLowerCase(),
    ],
  }
}

const REGION_CODES = [
  'MX',
  'ES',
  'US',
  'GB',
  'BR',
  'PT',
  'CA',
  'AT',
  'CH',
  'BE',
  'AU',
  'DE',
  'FR',
  'IT',
  'NL',
  'RU',
  'IN',
  'ID',
  'AR',
  'CO',
  'CL',
  'PE',
  'VE',
  'EC',
  'GT',
  'CU',
  'DO',
  'HN',
  'NI',
  'PA',
  'PY',
  'UY',
  'BO',
  'CR',
  'SV',
  'GQ',
  'PH',
  'IE',
  'NZ',
  'ZA',
  'SG',
  'MY',
  'TH',
  'VN',
  'KR',
  'JP',
  'CN',
  'TW',
  'HK',
  'EG',
  'MA',
  'DZ',
  'TN',
  'NG',
  'KE',
  'ET',
  'GH',
  'TZ',
  'UG',
  'SA',
  'AE',
  'IQ',
  'JO',
  'LB',
  'OM',
  'KW',
  'QA',
  'BH',
  'TR',
  'GR',
  'SE',
  'NO',
  'DK',
  'FI',
  'PL',
  'CZ',
  'SK',
  'HU',
  'RO',
  'BG',
  'RS',
  'HR',
  'SI',
  'EE',
  'LV',
  'LT',
  'UA',
  'KZ',
  'UZ',
].filter((value, index, array) => array.indexOf(value) === index)

const buildLanguageNameIndex = (): Map<string, string[]> => {
  const index = new Map<string, string[]>()
  const add = (label: string, code: string) => {
    const key = normalizeLabel(label)
    if (!key) return
    const existing = index.get(key)
    if (existing) {
      if (!existing.includes(code)) existing.push(code)
      return
    }
    index.set(key, [code])
  }

  for (const rawCode of BASE_LANGUAGE_CODES) {
    const code = canonicalLocale(rawCode)
    if (!code || code === 'en') continue
    const english = displayName(code, 'en', code)
    const native = displayName(code, code, english)
    add(code, code)
    add(english, code)
    add(native, code)

    // Regional variants (e.g. es-MX, pt-BR, fr-CA). The browser translator
    // availability check is the real filter; here we only broaden the candidate
    // set so a user typing "Mexican" or "Brazilian Portuguese" can reach the
    // matching regional locale without an AI round-trip.
    for (const region of REGION_CODES) {
      const locale = canonicalLocale(`${code}-${region}`)
      if (!locale || locale === 'en') continue
      const regionalEnglish = displayName(locale, 'en', code)
      if (!regionalEnglish || regionalEnglish === english) continue
      add(regionalEnglish, locale)

      // Adjective form "<Adjective> <BaseLanguage>" (e.g. "Mexican Spanish"):
      // also index the bare adjective so a short query like "Mexican" resolves
      // to the regional locale. Only do this for genuine adjective forms where
      // the trailing token is the base language name, so we don't pollute the
      // index with stray words from "<Base> (<Country>)" labels.
      const match = regionalEnglish.match(/^(\S+)\s+(.+)$/)
      if (match && match[2].toLowerCase() === english.toLowerCase()) {
        add(match[1], locale)
      }
    }
  }

  return index
}

let languageNameIndex: Map<string, string[]> | null = null

export const findBrowserNativeLocaleCandidates = (input: string): string[] => {
  const direct = canonicalLocale(input)
  if (direct && direct !== 'en') return [direct]

  languageNameIndex ??= buildLanguageNameIndex()
  return languageNameIndex.get(normalizeLabel(input)) ?? []
}

export async function resolveBrowserNativeLanguage(
  input: string,
): Promise<LanguageEntry | null> {
  const candidates = findBrowserNativeLocaleCandidates(input)
  for (const code of candidates) {
    if (await isChromeTranslatorLocaleAvailable(code)) {
      return languageEntryForLocale(code)
    }
  }
  return null
}
