import { SUBMIT_BTN_DEFAULT_LABEL } from './constants'

export const GENERATE_CTA_BY_LANG: Record<string, string> = {
  en: 'Generate',
  hinglish: 'बनाओ',
  hi: 'बनाएं',
  ta: 'உருவாக்கு',
  te: 'సృష్టించు',
  kn: 'ರಚಿಸಿ',
  ml: 'സൃഷ്ടിക്കുക',
  bn: 'তৈরি করুন',
  mr: 'तयार करा',
  gu: 'બનાવો',
  pa: 'ਬਣਾਓ',
  or: 'ତିଆରି କରନ୍ତୁ',
  as: 'সৃষ্টি কৰক',
  ur: 'پیدا کریں',
  mai: 'बनाब',
  kok: 'तयार करात',
  mni: 'Generate',
  sat: 'ᱛᱮᱭᱟᱨ ᱢᱮ',
  ks: 'تیار کٔرِو',
  doi: 'बनाओ',
  brx: 'सोलोंथाइ',
  sd: 'تيار ڪريو',
  sa: 'जनयतु',
  ne: 'सिर्जना गर्नुहोस्',
  fr: 'Générer',
  it: 'Genera',
  es: 'Generar',
  de: 'Generieren',
  nl: 'Genereren',
  pt: 'Gerar',
  ru: 'Создать',
  pl: 'Generuj',
  tr: 'Oluştur',
  hu: 'Generálás',
  cs: 'Vygenerovat',
  sk: 'Vygenerovať',
  ro: 'Generează',
  el: 'Δημιούργησε',
  sv: 'Generera',
  da: 'Generer',
  fi: 'Luo',
  no: 'Generer',
  nb: 'Generer',
  nn: 'Generer',
  id: 'Hasilkan',
  ja: '生成',
  ko: '생성',
  zh: '生成',
  ar: 'توليد',
  fa: 'تولید',
}

export const SHIPFAST_TAGLINE_BY_LANG: Record<string, string> = {
  hinglish: 'तेज़ शिप',
  hi: 'तेज़ भेजें',
  ta: 'விரைவாக அனுப்பு',
  te: 'వేగంగా పంపు',
  kn: 'ವೇಗವಾಗಿ ರವಾನಿಸಿ',
  ml: 'വേഗത്തിൽ അയയ്ക്കുക',
  bn: 'দ্রুত পাঠান',
  mr: 'पटकन पाठवा',
  gu: 'ઝડપથી મોકલો',
  pa: 'ਤੇਜ਼ੀ ਨਾਲ ਭੇਜੋ',
  or: 'ଶୀଘ୍ର ପଠାନ୍ତୁ',
  as: 'দ্ৰুততেৰে পঠাওক',
  ur: 'تیز بھیجیں',
  mai: 'तेजी सँ पठाब',
  kok: 'वेगान पाठयात',
  mni: 'Ship Fast',
  sat: 'ᱞᱚᱜᱚᱱ ᱯᱚᱛᱟᱹᱣ',
  ks: 'ژٕ تٲزیٖ پٲٹٲیو',
  doi: 'तेजी साँ पेजॊ',
  brx: 'थांखो थांफाय',
  sd: 'تڪي سان موڪليو',
  sa: 'शीघ्रं प्रेषय',
  ne: 'छिटो पठाउनुहोस्',
  fr: 'Livraison rapide',
  it: 'Spedizione veloz',
  es: 'Envío veloz',
  de: 'Schnell liefern',
  nl: 'Snel verzenden',
  pt: 'Envio rápido',
  ru: 'Быстрая отправка',
  pl: 'Szybka wysyłka',
  tr: 'Hızlı gönder',
  hu: 'Gyors szállítás',
  cs: 'Rychlé odeslání',
  sk: 'Rýchle odoslanie',
  ro: 'Livrare rapidă',
  el: 'Γρήγορη αποστολή',
  sv: 'Snabb leverans',
  da: 'Hurtig forsendelse',
  fi: 'Nopea toimitus',
  no: 'Rask forsendelse',
  nb: 'Rask forsendelse',
  nn: 'Rask forsendelse',
  id: 'Kirim cepat',
  ja: '迅速発送',
  ko: '빠른 배송',
  zh: '极速发货',
  ar: 'شحن سريع',
  fa: 'ارسال سریع',
}

export const normalizeLanguageCode = (value: string) => {
  const v = String(value || '')
    .trim()
    .toLowerCase()
  if (!v) return ''
  if (v === 'hinglish') return 'hinglish'
  if (/^[a-z]{2,8}-en$/.test(v)) return v
  if (/^[a-z]{2,8}-latn$/.test(v)) return v
  return v.split(/[-_]/)[0] ?? ''
}

export const getLanguageDisplayName = (code: string) => {
  const normalized = normalizeLanguageCode(code)
  if (!normalized) return 'Language'
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') {
    return normalized
  }
  try {
    const display = new Intl.DisplayNames(undefined, { type: 'language' })
    return display.of(normalized) || normalized
  } catch {
    return normalized
  }
}

export const getGenerateCtaLabel = (bcp47: string) => {
  const key = normalizeLanguageCode(bcp47)
  if (!key) return SUBMIT_BTN_DEFAULT_LABEL
  const direct = GENERATE_CTA_BY_LANG[key]
  if (direct) return direct
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1]
  return (base && GENERATE_CTA_BY_LANG[base]) || SUBMIT_BTN_DEFAULT_LABEL
}

export const getLogoTaglineText = (bcp47: string) => {
  const key = normalizeLanguageCode(bcp47)
  if (!key || key === 'en') return ''
  const direct = SHIPFAST_TAGLINE_BY_LANG[key]
  if (direct) return direct
  const base = /^([a-z]{2,8})-en$/.exec(key)?.[1]
  return (base && SHIPFAST_TAGLINE_BY_LANG[base]) || ''
}

export const getBrowserLanguageCandidates = () => {
  const navigatorLanguages = Array.isArray(navigator.languages)
    ? navigator.languages
    : []
  const candidates =
    navigatorLanguages.length > 0
      ? navigator.languages
      : [navigator.language].filter(Boolean)
  return candidates
    .map((entry) => normalizeLanguageCode(entry))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
}

export const detectBrowserLanguage = (availableCodes: Set<string>) => {
  const normalizedCandidates = getBrowserLanguageCandidates()
  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== 'en' && availableCodes.has(language),
  )
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch
  const browserNonEnglish = normalizedCandidates.find(
    (language) => language !== 'en',
  )
  if (browserNonEnglish) return browserNonEnglish
  if (availableCodes.has('en')) return 'en'
  const first = availableCodes.values().next().value
  return (typeof first === 'string' ? first : null) || 'en'
}
