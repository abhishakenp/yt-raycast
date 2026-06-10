import { franc } from 'franc-min'
import { preferMixedEnglishBcp47FromSnippet } from './mixed-english-hints'
import { PROMPT_LANG_DETECT_SNIPPET_MAX, SUBMIT_BTN_DEFAULT_LABEL } from './constants'
import {
  KNOWN_LANGUAGES,
  preferIndicBcp47FromRomanizedPrompt,
  preferRomanizedBcp47FromSnippet,
} from '../../config/languages.js'

export const FRANC_ISO639_3_TO_BCP47: Record<string, string> = {
  eng: 'en',
  fra: 'fr',
  ita: 'it',
  spa: 'es',
  deu: 'de',
  nld: 'nl',
  por: 'pt',
  rus: 'ru',
  pol: 'pl',
  tur: 'tr',
  hun: 'hu',
  ces: 'cs',
  slk: 'sk',
  ron: 'ro',
  ell: 'el',
  swe: 'sv',
  dan: 'da',
  fin: 'fi',
  nor: 'no',
  nob: 'nb',
  nno: 'nn',
  ind: 'id',
  jpn: 'ja',
  kor: 'ko',
  zho: 'zh',
  arb: 'ar',
  ara: 'ar',
  pes: 'fa',
  hin: 'hi',
  tam: 'ta',
  tel: 'te',
  kan: 'kn',
  mal: 'ml',
  ben: 'bn',
  mar: 'mr',
  guj: 'gu',
  pan: 'pa',
  ori: 'or',
  asm: 'as',
  urd: 'ur',
  mai: 'mai',
  kok: 'kok',
  mni: 'mni',
  sat: 'sat',
  kas: 'ks',
  doi: 'doi',
  brx: 'brx',
  snd: 'sd',
  san: 'sa',
  nep: 'ne',
}

export const PROMPT_DETECT_INDIAN_FRANC = new Set([
  'hin',
  'tam',
  'tel',
  'kan',
  'mal',
  'ben',
  'mar',
  'guj',
  'pan',
  'ori',
  'asm',
  'urd',
  'mai',
  'kok',
  'mni',
  'sat',
  'kas',
  'doi',
  'brx',
  'snd',
  'san',
  'nep',
])

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

const PROMPT_HINGLISH_LATIN = new Set(
  `ke liye kaa ki ka ko se par pe aur ya phir bhi ho hai hain hoon hun main tum aap ham hum aapka aapki mere meri apna apni apne kuch sab koi kuchh kitna kab kahan kaise kyun kyo kyon bas fir tab jab banao banaye bana karo karein chahiye chahie milega milegi dekho dekhe suno samjho samajh wala wale wali accha achha achhi theek thik bahut zyada thoda kam sahi galat nahi nahin nhi haan haanji na mat jaldi jald jisse apne apni bas fir woh wo yeh ye koi kabhi kabhi sirf sirf bass reh reho rehi karenge karunga karungi hona honi hoga hogi`.split(
    /\s+/,
  ),
)

const PROMPT_ENGLISH_LEXICON = new Set(
  `the and for with from into about over under this that these those your our their its was were been being have has had do does did will would could should may might can must shall need want like make made makes making take took give gave go went come came see saw know think say said get got use used work worked call called try tried help helped show showed look looked find found keep kept let put set run ran move add added open opened close closed save saved load loaded click tapped type types typed enter enter submit cancel delete edit update create created build built design designed ship fast page home landing site web website internet online digital product products service services customer customers user users client clients team teams member members account accounts login sign signup signin register password email phone contact contacts pricing price plan plans paid free pro premium trial subscribe feature features faq help support docs doc api blog news story stories video image photo photos gallery map maps list lists search filter sort menu nav header footer sidebar modal popover popup button link links form forms field fields input inputs select checkbox radio toggle slider range progress loading spinner toast alert badge pill tag tags label labels chart charts graph graphs stats stat analytics dashboard panel admin profile settings billing payment pay invoice cart checkout order orders shipping delivery pickup return refund coupon discount offer sale deal gift promo subscription monthly yearly gym fitness fit trainer trainers train class classes schedule schedules booking book session sessions ladies women men kids family kid friendly safe safely security secure private public modern clean minimal bold premium luxury brand brands mission vision value values trust trusted review reviews rating ratings hero banner card cards grid layout layouts responsive mobile tablet desktop animation scroll slide gallery tour faq question answer answers step steps guide guides tutorial resource resources download upload share shared invite join community forum chat message messages notify notification notifications push sms otp verify account`.split(
    /\s+/,
  ),
)

const PROMPT_FRENCH_LEXICON = new Set(
  `un une des du de la le les et ou pour avec dans sur sous ce cette ces cet votre vos notre nos leur leurs mon ma mes ton ta tes son sa ses au aux par est sont etre être été avoir avez nous vous ils elles je tu il elle on qui que quoi dont quand comment pourquoi parce plus moins tres très site page accueil boutique restaurant agence marque produit produits service services client clients formulaire contact prix offre offres blog article articles galerie reservation réservation rendez-vous equipe équipe créer cree crée créez generer générer français francaise française rapide moderne élégant elegante responsive mobile application entreprise association école ecole hôtel hotel immobilier portfolio evenement événement`.split(
    /\s+/,
  ),
)

const promptLatinEnglishLean = (text: string) => {
  const words = String(text || '')
    .toLowerCase()
    .match(/\b[a-z]{2,}\b/g)
  if (!words || words.length === 0) return { lean: 0, en: 0, hi: 0, n: 0 }
  let en = 0
  let hi = 0
  for (const word of words) {
    if (PROMPT_HINGLISH_LATIN.has(word)) hi += 1
    else if (PROMPT_ENGLISH_LEXICON.has(word)) en += 1
  }
  const rest = words.length - en - hi
  const lean = (en + rest * 0.22) / words.length
  return { lean, en, hi, n: words.length }
}

const promptFrenchScore = (text: string) => {
  const lower = String(text || '').toLowerCase()
  const accented = /[àâçéèêëîïôûùüÿœæ]/i.test(lower)
  const words = lower.match(/\b[a-zàâçéèêëîïôûùüÿœæ]{2,}\b/g) || []
  let hits = accented ? 2 : 0
  for (const word of words) {
    if (PROMPT_FRENCH_LEXICON.has(word)) hits += 1
  }
  return { score: words.length ? hits / words.length : 0, hits, words: words.length, accented }
}

const preferFrenchCode3ForPrompt = (snippet: string, code3: string) => {
  const french = promptFrenchScore(snippet)
  if (french.hits >= 3 && french.score >= 0.18) return 'fra'
  if (french.accented && french.hits >= 2 && french.words >= 4) return 'fra'
  if (code3 === 'eng' && french.hits >= 2 && french.score >= 0.3) return 'fra'
  return code3
}

const resolveFrancCode3ForPrompt = (snippet: string, code3: string) => {
  code3 = preferFrenchCode3ForPrompt(snippet, code3)
  if (!code3 || code3 === 'und') return code3
  if (code3 === 'eng' || PROMPT_DETECT_INDIAN_FRANC.has(code3)) return code3
  const { lean, en, hi, n } = promptLatinEnglishLean(snippet)
  if (n < 4) return code3
  if (lean >= 0.36 && en > hi && en >= 4) return 'eng'
  return code3
}

const resolveFrancCode3HinglishPreference = (snippet: string, code3: string) => {
  if (!code3 || code3 === 'und') return code3
  if (code3 === 'urd') return code3
  if (PROMPT_DETECT_INDIAN_FRANC.has(code3) && code3 !== 'hin') return code3
  const lower = String(snippet || '').toLowerCase()
  const { hi, en, n } = promptLatinEnglishLean(snippet)
  const hasKeLiye = /\bke\s+liye\b/.test(lower)
  const hasBanao = /\bbanao\b/.test(lower)
  const hinglishStrong =
    hasKeLiye || hi >= 2 || (hi >= 1 && hasBanao) || (n >= 6 && hi >= 2 && hi >= en * 0.35)
  if (hinglishStrong) return 'hinglish'
  if (code3 === 'hin') return 'hin'
  return code3
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
  if (typeof Intl === 'undefined' || typeof Intl.DisplayNames === 'undefined') return normalized
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

const detectExplicitLanguageKeyword = (text: string) => {
  const lower = String(text || '').toLowerCase()
  const ordered = [...KNOWN_LANGUAGES].sort(
    (a, b) =>
      Math.max(...b.keywords.map((k: string) => k.length), b.name.length) -
      Math.max(...a.keywords.map((k: string) => k.length), a.name.length),
  )
  for (const language of ordered) {
    const keywords = [language.code, language.name, ...language.keywords]
    for (const keyword of keywords) {
      const value = keyword.toLowerCase()
      if (/^[a-z0-9-]+$/.test(value)) {
        const pattern = new RegExp(`(^|\\b)${value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|$)`)
        if (pattern.test(lower)) return language.code
      } else if (lower.includes(value)) {
        return language.code
      }
    }
  }
  return null
}

export const detectSnippetLanguageBcp47 = async (fullText: string) => {
  const snippet = String(fullText || '').slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX)
  const frenchFirst = preferFrenchCode3ForPrompt(snippet, 'und')
  if (frenchFirst === 'fra') return 'fr'
  const fromRomanizedHint = preferRomanizedBcp47FromSnippet(fullText)
  if (fromRomanizedHint) return fromRomanizedHint
  const fromMixedHint = preferMixedEnglishBcp47FromSnippet(fullText)
  if (fromMixedHint) return fromMixedHint
  const explicit = detectExplicitLanguageKeyword(fullText)
  if (explicit) return explicit
  const fromRomanizedPrompt = preferIndicBcp47FromRomanizedPrompt(fullText)
  if (fromRomanizedPrompt) return fromRomanizedPrompt
  let code3: string
  try {
    code3 = franc(snippet, { minLength: 10 }) || 'und'
  } catch {
    return null
  }
  if (code3 !== 'und') {
    code3 = resolveFrancCode3ForPrompt(snippet, code3)
    if (code3 === 'und') code3 = 'eng'
  } else {
    code3 = 'eng'
  }
  code3 = resolveFrancCode3HinglishPreference(snippet, code3)
  if (!code3 || code3 === 'und') return null
  const toBcp47 = (resolved: string) =>
    resolved === 'hinglish' ? 'hinglish' : FRANC_ISO639_3_TO_BCP47[resolved]
  return toBcp47(code3) || null
}

export const getBrowserLanguageCandidates = () => {
  const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : []
  const candidates =
    navigatorLanguages.length > 0 ? navigator.languages : [navigator.language].filter(Boolean)
  const normalized = candidates
    .map((entry) => normalizeLanguageCode(entry))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)
  return normalized
}

export const detectBrowserLanguage = (availableCodes: Set<string>) => {
  const normalizedCandidates = getBrowserLanguageCandidates()
  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== 'en' && availableCodes.has(language),
  )
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch
  const browserNonEnglish = normalizedCandidates.find((language) => language !== 'en')
  if (browserNonEnglish) return browserNonEnglish
  if (availableCodes.has('en')) return 'en'
  const first = availableCodes.values().next().value
  return (typeof first === 'string' ? first : null) || 'en'
}
