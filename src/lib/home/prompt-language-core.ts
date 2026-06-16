import { preferMixedEnglishBcp47FromSnippet } from './mixed-english-hints'
import { PROMPT_LANG_DETECT_SNIPPET_MAX } from './constants'
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
    const { franc } = await import('franc-min')
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
