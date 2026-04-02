if (typeof history !== 'undefined' && 'scrollRestoration' in history) {
  history.scrollRestoration = 'manual'
}

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

let auth = null
let currentUser = null
let authResolved = false
let hasSessionResizeListener = false
const GITHUB_TOKEN_STORAGE_KEY = 'sf_github_access_token'

function persistGithubAccessToken(result) {
  const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken
  if (accessToken) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, accessToken)
}

function clearGithubAccessToken() {
  sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY)
}

async function initFirebase() {
  const cfg = await fetch('/api/config').then((response) => response.json())
  const app = initializeApp(cfg)
  auth = getAuth(app)

  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user
      authResolved = true
      if (user) showApp()
      else showAnonymousApp()
      resolve()
    })
  })
}

async function getToken() {
  if (!currentUser) return null
  return currentUser.getIdToken(true)
}

async function authFetch(url, options = {}) {
  const token = await getToken()
  const headers = { ...(options.headers || {}) }
  if (token) headers.Authorization = `Bearer ${token}`
  return fetch(url, { ...options, headers })
}

function showAnonymousApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  document.getElementById('signout-btn').style.display = 'none'
  const signinBtn = document.getElementById('signin-btn')
  if (signinBtn) signinBtn.style.display = 'flex'
  sessionStorage.removeItem('sf_return_home')
  clearGithubAccessToken()
  updateGenerationCounter()
  syncSubmitButtonState()
  loadRecentPublicSessions()
}

async function showApp() {
  document.getElementById('auth-overlay').classList.add('hidden')
  const signinBtn = document.getElementById('signin-btn')
  if (signinBtn) signinBtn.style.display = 'none'
  document.getElementById('signout-btn').style.display = 'flex'
  updateGenerationCounter()
  syncSubmitButtonState()
  await claimAnonymousSessions()
  loadSessions()
}

async function claimAnonymousSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
    if (stored.length === 0) return
    let claimed = 0
    const sessionIds = stored.map((s) => s.id)
    const response = await authFetch('/api/sessions/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionIds }),
    })
    if (response.ok) {
      const result = await response.json()
      claimed = result?.claimed?.length ?? 0
      if (result.claimed?.length > 0) {
        console.log(
          `[claim] Migrated ${result.claimed.length} anonymous session(s) to your account`,
        )
      }
    }
    if (claimed > 0) clearAnonSessions()
  } catch {
    // Claim failure is non-critical — sessions remain anonymous but user can still generate new ones.
  }
}

function setAuthError(message) {
  document.getElementById('auth-error').textContent = message
}

document.getElementById('google-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  try {
    await signInWithPopup(auth, new GoogleAuthProvider())
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('github-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  try {
    const provider = new GithubAuthProvider()
    provider.addScope('repo')
    const result = await signInWithPopup(auth, provider)
    persistGithubAccessToken(result)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('email-signin-btn').addEventListener('click', async () => {
  setAuthError('')
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) return setAuthError('Email and password required')
  try {
    await signInWithEmailAndPassword(auth, email, password)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('email-signup-btn').addEventListener('click', async () => {
  setAuthError('')
  const email = document.getElementById('auth-email').value.trim()
  const password = document.getElementById('auth-password').value
  if (!email || !password) return setAuthError('Email and password required')
  try {
    await createUserWithEmailAndPassword(auth, email, password)
  } catch (error) {
    setAuthError(error.message)
  }
})

document.getElementById('signout-btn').addEventListener('click', () => {
  clearGithubAccessToken()
  signOut(auth)
})

document.getElementById('signin-btn')?.addEventListener('click', () => {
  document.getElementById('auth-overlay').classList.remove('hidden')
})

document.getElementById('auth-overlay').addEventListener('click', (event) => {
  if (event.target === event.currentTarget && !currentUser) {
    event.currentTarget.classList.add('hidden')
    const signinBtn = document.getElementById('signin-btn')
    if (signinBtn) signinBtn.style.display = 'flex'
  }
})

const form = document.getElementById('prompt-form')
const input = document.getElementById('prompt-input')
const languageSelect = document.getElementById('prompt-language')
const promptLanguageRow = document.getElementById('prompt-language-row')
const submitButton = document.getElementById('submit-btn')
const submitButtonLabel = submitButton?.querySelector('.btn-label')
const SUBMIT_BTN_DEFAULT_LABEL = 'Generate'
const generationCounter = document.getElementById('gen-counter')
const promptPlaceholder = document.getElementById('prompt-placeholder')
const promptPlaceholderText = document.getElementById('prompt-placeholder-text')
const privateGenRow = document.getElementById('private-gen-row')
const privateGenCheckbox = document.getElementById('private-gen-checkbox')
const privateGenModal = document.getElementById('private-gen-modal')
const GENERATION_LIMIT = 2
const MIN_PROMPT_LENGTH = 70
const PROMPT_LANG_DETECT_MIN_CHARS = 65
const PROMPT_LANG_DETECT_DEBOUNCE_MS = 400
const PROMPT_LANG_DETECT_SNIPPET_MAX = 800
const PREFERRED_LANGUAGE_KEY = 'sf_preferred_language'

const FRANC_ISO639_3_TO_BCP47 = {
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

const PROMPT_DETECT_INDIAN_FRANC = new Set([
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

const GENERATE_CTA_BY_LANG = {
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

function promptLatinEnglishLean(text) {
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

function resolveFrancCode3ForPrompt(snippet, code3) {
  if (!code3 || code3 === 'und') return code3
  if (code3 === 'eng' || PROMPT_DETECT_INDIAN_FRANC.has(code3)) return code3
  const { lean, en, hi, n } = promptLatinEnglishLean(snippet)
  if (n < 4) return code3
  if (lean >= 0.36 && en > hi && en >= 4) return 'eng'
  return code3
}

function resolveFrancCode3HinglishPreference(snippet, code3) {
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

let francLoadPromise = null
let promptLangDetectTimer = null
let promptLangDetectToken = 0
let promptLanguageRowUnlocked = false
const isLocalDevHost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1')
const SAMPLE_PROMPTS = [
  'A cinematic travel landing page for curated weekend escapes with reviews and fast booking.',
  'A polished SaaS homepage for an AI sales copilot with pipeline analytics and clear pricing.',
  'A premium architecture studio site with immersive case studies, awards, and inquiry scheduling.',
  'A bold ecommerce homepage for handcrafted coffee gear with bundles and subscriptions.',
  'A sleek fintech landing page for founders tracking runway, burn, and investor updates.',
  'A modern fitness club website with class schedules, trainer profiles, and membership plans.',
]

function normalizeLanguageCode(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .split(/[-_]/)[0]
}

function getBrowserLanguageCandidates() {
  const navigatorLanguages = Array.isArray(navigator.languages) ? navigator.languages : []
  const candidates =
    navigatorLanguages.length > 0 ? navigatorLanguages : [navigator.language].filter(Boolean)
  const normalized = candidates
    .map((entry) => normalizeLanguageCode(entry))
    .filter(Boolean)
    .filter((value, index, self) => self.indexOf(value) === index)

  return normalized
}

function getLanguageDisplayName(code) {
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

function getSavedPreferredLanguage() {
  if (!languageSelect) return null
  const preferred = localStorage.getItem(PREFERRED_LANGUAGE_KEY)
  const normalized = normalizeLanguageCode(preferred)
  if (!normalized) return null
  return Array.from(languageSelect.options).some((option) => option.value === normalized)
    ? normalized
    : null
}

function savePreferredLanguage(language) {
  const normalized = normalizeLanguageCode(language)
  if (!normalized) return
  if (!languageSelect) return
  if (!Array.from(languageSelect.options).some((option) => option.value === normalized)) return
  localStorage.setItem(PREFERRED_LANGUAGE_KEY, normalized)
}

function detectBrowserLanguage() {
  if (!languageSelect) return 'en'
  const available = new Set(Array.from(languageSelect.options).map((option) => option.value))
  const storedLanguage = getSavedPreferredLanguage()
  if (storedLanguage && storedLanguage !== 'en') return storedLanguage
  const normalizedCandidates = getBrowserLanguageCandidates()

  const supportedNonEnglishMatch = normalizedCandidates.find(
    (language) => language !== 'en' && available.has(language),
  )
  if (supportedNonEnglishMatch) return supportedNonEnglishMatch

  const browserNonEnglish = normalizedCandidates.find((language) => language !== 'en')
  if (browserNonEnglish) return browserNonEnglish

  if (available.has('en')) return 'en'
  if (Array.from(available).length > 0) return Array.from(available)[0]
  return available.values().next().value || 'en'
}

function focusLanguageOptions(preferredLanguage) {
  if (!languageSelect) return
  const options = Array.from(languageSelect.options)
  const englishOption = options.find((option) => option.value === 'en')
  const preferredOption = options.find((option) => option.value === preferredLanguage)
  if (!englishOption) return

  const normalizedPreferred = normalizeLanguageCode(preferredLanguage)
  const preferredToShow =
    normalizedPreferred && preferredOption && normalizedPreferred !== 'en' ? preferredOption : null
  const customPreferredToShow =
    normalizedPreferred && normalizedPreferred !== 'en' && !preferredOption
      ? new Option(getLanguageDisplayName(normalizedPreferred), normalizedPreferred)
      : null

  languageSelect.innerHTML = ''
  languageSelect.appendChild(englishOption.cloneNode(true))
  if (preferredToShow) languageSelect.appendChild(preferredToShow.cloneNode(true))
  if (customPreferredToShow) languageSelect.appendChild(customPreferredToShow)

  languageSelect.value = normalizedPreferred || 'en'
}

function mergeLanguageOptionsSelect(selectedCode) {
  if (!languageSelect) return
  const normalized = normalizeLanguageCode(selectedCode) || 'en'
  const existing = Array.from(languageSelect.options)
  const englishOpt = existing.find((option) => option.value === 'en')
  if (!englishOpt) return

  const extras = []
  const seen = new Set()
  for (const option of existing) {
    if (option.value === 'en') continue
    if (seen.has(option.value)) continue
    seen.add(option.value)
    extras.push(option)
  }
  if (normalized !== 'en' && !seen.has(normalized)) {
    seen.add(normalized)
    extras.push(new Option(getLanguageDisplayName(normalized), normalized))
  }

  languageSelect.innerHTML = ''
  languageSelect.appendChild(englishOpt.cloneNode(true))
  for (const option of extras) {
    languageSelect.appendChild(option.cloneNode(true))
  }
  languageSelect.value = normalized
}

function applyBrowserPreferredLanguage() {
  const nextLanguage = detectBrowserLanguage()
  focusLanguageOptions(nextLanguage)
  languageSelect.value = nextLanguage
}

function resetSubmitCtaLabel() {
  if (!submitButtonLabel) return
  submitButtonLabel.textContent = SUBMIT_BTN_DEFAULT_LABEL
  submitButton?.classList.remove('submit-btn--cta-shake')
}

function getGenerateCtaLabel(bcp47) {
  const key = normalizeLanguageCode(bcp47)
  if (!key) return SUBMIT_BTN_DEFAULT_LABEL
  return GENERATE_CTA_BY_LANG[key] || SUBMIT_BTN_DEFAULT_LABEL
}

function playSubmitCtaShake() {
  if (!submitButton) return
  submitButton.classList.remove('submit-btn--cta-shake')
  void submitButton.offsetWidth
  submitButton.classList.add('submit-btn--cta-shake')
}

function syncPromptLanguageRowVisibility() {
  if (!promptLanguageRow || !languageSelect) return
  const show = input.value.trim().length >= PROMPT_LANG_DETECT_MIN_CHARS
  promptLanguageRow.classList.toggle('is-hidden', !show)
  if (!show) {
    resetSubmitCtaLabel()
    if (promptLanguageRowUnlocked) {
      focusLanguageOptions('en')
      languageSelect.value = 'en'
      savePreferredLanguage('en')
    }
    promptLanguageRowUnlocked = false
    return
  }
  if (!promptLanguageRowUnlocked) {
    applyBrowserPreferredLanguage()
    promptLanguageRowUnlocked = true
  }
}

function loadFranc() {
  francLoadPromise =
    francLoadPromise ||
    import('https://esm.sh/franc-min@6.2.0').then((mod) => mod.franc ?? mod.default)
  return francLoadPromise
}

async function detectSnippetLanguageBcp47(snippet) {
  let franc
  try {
    franc = await loadFranc()
  } catch {
    return null
  }
  if (typeof franc !== 'function') return null
  let code3 = franc(snippet, { minLength: 10 }) || 'und'
  if (code3 !== 'und') {
    code3 = resolveFrancCode3ForPrompt(snippet, code3)
    if (code3 === 'und') code3 = 'eng'
  } else {
    code3 = 'eng'
  }
  code3 = resolveFrancCode3HinglishPreference(snippet, code3)
  if (!code3 || code3 === 'und') return null
  const toBcp47 = (resolved) =>
    resolved === 'hinglish' ? 'hinglish' : FRANC_ISO639_3_TO_BCP47[resolved]
  return toBcp47(code3) || null
}

function schedulePromptLanguageDetect() {
  if (!languageSelect) return
  const text = input.value.trim()
  if (text.length < PROMPT_LANG_DETECT_MIN_CHARS) {
    if (promptLangDetectTimer !== null) {
      clearTimeout(promptLangDetectTimer)
      promptLangDetectTimer = null
    }
    promptLangDetectToken += 1
    return
  }
  if (promptLangDetectTimer !== null) {
    clearTimeout(promptLangDetectTimer)
    promptLangDetectTimer = null
  }
  const runToken = ++promptLangDetectToken
  promptLangDetectTimer = setTimeout(() => {
    promptLangDetectTimer = null
    void (async () => {
      if (runToken !== promptLangDetectToken) return
      const currentText = input.value.trim()
      if (currentText.length < PROMPT_LANG_DETECT_MIN_CHARS) return
      const snippet = currentText.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX)
      if (runToken !== promptLangDetectToken) return
      if (input.value.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return
      const bcp47 = await detectSnippetLanguageBcp47(snippet)
      if (!bcp47) return
      if (runToken !== promptLangDetectToken) return
      if (input.value.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return
      const hasOption = Array.from(languageSelect.options).some((option) => option.value === bcp47)
      if (languageSelect.value === bcp47 && hasOption) return
      mergeLanguageOptionsSelect(bcp47)
      savePreferredLanguage(bcp47)
    })()
  }, PROMPT_LANG_DETECT_DEBOUNCE_MS)
}

let samplePromptIndex = 0
let samplePromptLength = 0
let samplePromptMode = 'typing'
let samplePromptTimer = null

function randomDelay(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function renderSamplePrompt() {
  promptPlaceholderText.textContent = SAMPLE_PROMPTS[samplePromptIndex].slice(0, samplePromptLength)
}

function stopSamplePromptAnimation() {
  if (samplePromptTimer !== null) {
    window.clearTimeout(samplePromptTimer)
    samplePromptTimer = null
  }
}

function scheduleSamplePromptStep(delay) {
  stopSamplePromptAnimation()
  samplePromptTimer = window.setTimeout(stepSamplePromptAnimation, delay)
}

function syncSamplePromptVisibility() {
  const hasValue = input.value.length > 0
  promptPlaceholder.classList.toggle('is-hidden', hasValue)

  if (hasValue) {
    stopSamplePromptAnimation()
    return
  }

  if (samplePromptTimer === null) {
    scheduleSamplePromptStep(samplePromptLength === 0 ? 320 : 80)
  }
}

function stepSamplePromptAnimation() {
  samplePromptTimer = null

  if (input.value.length > 0) {
    syncSamplePromptVisibility()
    return
  }

  const currentPrompt = SAMPLE_PROMPTS[samplePromptIndex]

  if (samplePromptMode === 'typing') {
    samplePromptLength += 1
    renderSamplePrompt()

    if (samplePromptLength < currentPrompt.length) {
      scheduleSamplePromptStep(randomDelay(16, 30))
      return
    }

    samplePromptMode = 'holding'
    scheduleSamplePromptStep(1800)
    return
  }

  if (samplePromptMode === 'holding') {
    samplePromptMode = 'deleting'
    scheduleSamplePromptStep(640)
    return
  }

  samplePromptLength = Math.max(0, samplePromptLength - 1)
  renderSamplePrompt()

  if (samplePromptLength > 0) {
    scheduleSamplePromptStep(randomDelay(10, 18))
    return
  }

  samplePromptIndex = (samplePromptIndex + 1) % SAMPLE_PROMPTS.length
  samplePromptMode = 'typing'
  scheduleSamplePromptStep(260)
}

function validatePrompt(showError = false) {
  const promptLength = input.value.trim().length

  if (showError && promptLength < MIN_PROMPT_LENGTH) {
    input.setAttribute('aria-invalid', 'true')
    return false
  }

  input.removeAttribute('aria-invalid')
  return promptLength >= MIN_PROMPT_LENGTH
}

function isGenerationLimitReached() {
  if (isLocalDevHost) return false
  if (authResolved && currentUser) return false
  if (!authResolved) return false
  return getGenerationCount() >= GENERATION_LIMIT
}

function syncSubmitButtonState() {
  submitButton.disabled =
    submitButton.classList.contains('loading') ||
    isGenerationLimitReached() ||
    input.value.trim().length < MIN_PROMPT_LENGTH
}

function getGenerationCount() {
  return parseInt(localStorage.getItem('sf_generation_count') || '0', 10)
}

function updateGenerationCounter() {
  if (isLocalDevHost) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }
  if (!authResolved) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }
  if (currentUser) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }

  const count = getGenerationCount()
  if (count === 0) {
    generationCounter.style.display = 'none'
    privateGenRow.style.display = 'none'
    syncSubmitButtonState()
    return
  }

  generationCounter.style.display = 'block'
  privateGenRow.style.display = 'none'

  if (isGenerationLimitReached()) {
    generationCounter.innerHTML = `${GENERATION_LIMIT}/${GENERATION_LIMIT} free previews used — <a href="#" id="gen-signup-link" style="color:inherit;text-decoration:underline;">sign up instead</a>`
    generationCounter.classList.add('limit-reached')
    document.getElementById('gen-signup-link')?.addEventListener('click', (e) => {
      e.preventDefault()
      document.getElementById('auth-overlay').classList.remove('hidden')
    })
  } else {
    generationCounter.textContent = `${count} / ${GENERATION_LIMIT} free previews used`
    generationCounter.classList.remove('limit-reached')
  }

  syncSubmitButtonState()
}

function openPrivateGenModal() {
  privateGenCheckbox.checked = false
  privateGenModal.classList.add('is-open')
  privateGenModal.setAttribute('aria-hidden', 'false')
}

function closePrivateGenModal() {
  privateGenModal.classList.remove('is-open')
  privateGenModal.setAttribute('aria-hidden', 'true')
}

privateGenCheckbox.addEventListener('change', () => {
  if (privateGenCheckbox.checked) openPrivateGenModal()
})

document.getElementById('private-gen-modal-close').addEventListener('click', closePrivateGenModal)
document
  .getElementById('private-gen-modal-backdrop')
  .addEventListener('click', closePrivateGenModal)

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && privateGenModal.classList.contains('is-open')) closePrivateGenModal()
})

syncPromptLanguageRowVisibility()
updateGenerationCounter()
renderSamplePrompt()
syncSamplePromptVisibility()
syncSubmitButtonState()

input.addEventListener('input', () => {
  validatePrompt(false)
  syncSamplePromptVisibility()
  syncSubmitButtonState()
  syncPromptLanguageRowVisibility()
  schedulePromptLanguageDetect()
})

input.addEventListener('paste', (event) => {
  const pasted = (event.clipboardData?.getData('text/plain') ?? '').trim()
  if (pasted.length < PROMPT_LANG_DETECT_MIN_CHARS) return
  void (async () => {
    await new Promise((resolve) => requestAnimationFrame(resolve))
    const currentText = input.value.trim()
    if (currentText.length < PROMPT_LANG_DETECT_MIN_CHARS) return
    const snippet = currentText.slice(0, PROMPT_LANG_DETECT_SNIPPET_MAX)
    const bcp47 = await detectSnippetLanguageBcp47(snippet)
    if (!bcp47) return
    if (input.value.trim().length < PROMPT_LANG_DETECT_MIN_CHARS) return
    if (languageSelect) {
      mergeLanguageOptionsSelect(bcp47)
      savePreferredLanguage(bcp47)
    }
    if (!submitButtonLabel) return
    submitButtonLabel.textContent = getGenerateCtaLabel(bcp47)
    playSubmitCtaShake()
  })()
})

submitButton?.addEventListener('animationend', (event) => {
  if (event.animationName !== 'submit-cta-wiggle') return
  submitButton.classList.remove('submit-btn--cta-shake')
})

languageSelect?.addEventListener('change', () => {
  if (languageSelect) savePreferredLanguage(languageSelect.value)
})

input.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    form.requestSubmit()
  }
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()
  if (!validatePrompt(true)) {
    syncSubmitButtonState()
    return
  }
  const prompt = input.value.trim()
  const preferredLanguage = languageSelect?.value || 'en'
  savePreferredLanguage(preferredLanguage)

  if (isGenerationLimitReached()) {
    document.getElementById('auth-overlay').classList.remove('hidden')
    return
  }

  submitButton.classList.add('loading')
  syncSubmitButtonState()

  try {
    const response = await authFetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, preferredLanguage }),
    })
    const data = await response.json()

    if (data.id) {
      if (!currentUser) saveAnonSession(data.id, prompt)
      localStorage.setItem('sf_generation_count', String(getGenerationCount() + 1))
      sessionStorage.setItem('sf_return_home', '1')
      window.location.href = `/session/${data.id}`
      return
    }

    if (!currentUser && response.status === 429) {
      // Server-side anon limit hit — prompt sign-in
      updateGenerationCounter()
      document.getElementById('auth-overlay').classList.remove('hidden')
    } else {
      alert(data.error || 'Failed to create session')
    }
  } catch (error) {
    alert(`Connection error: ${error.message}`)
  }

  submitButton.classList.remove('loading')
  syncSubmitButtonState()
})

const ANON_SESSIONS_KEY = 'sf_anon_sessions'

function saveAnonSession(id, prompt) {
  const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
  stored.unshift({ id, prompt })
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.slice(0, 20)))
}

function removeAnonSession(id) {
  const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
  localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(stored.filter((s) => s.id !== id)))
}

function clearAnonSessions() {
  localStorage.removeItem(ANON_SESSIONS_KEY)
}

function renderSessions(sessions) {
  const section = document.getElementById('sessions-section')
  const list = document.getElementById('session-list')

  if (sessions.length === 0) {
    list.innerHTML = ''
    section.style.display = 'none'
    document.body.classList.remove('has-sessions')
    list.classList.remove('single-col', 'two-col')
    return
  }

  document.body.classList.add('has-sessions')

  list.classList.remove('single-col', 'two-col')
  if (sessions.length === 1) list.classList.add('single-col')
  else if (sessions.length === 2) list.classList.add('two-col')

  const placeholderSvg =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>'

  const eagerThumbnailCount = 6

  list.innerHTML = sessions
    .map(
      (session, index) => `
        <li class="session-item" data-id="${session.id}" onclick="sessionStorage.setItem('sf_return_home', '1'); location.href='/session/${session.id}'">
          <div class="session-thumbnail">
            ${
              session.homepageReady
                ? index < eagerThumbnailCount
                  ? `<iframe src="/preview/${session.id}/" loading="eager" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                  : `<iframe data-src="/preview/${session.id}/" loading="lazy" sandbox="allow-same-origin allow-scripts" tabindex="-1"></iframe>`
                : `<div class="session-placeholder">${placeholderSvg}</div>`
            }
            <div class="session-badges">
              ${
                session.elapsed
                  ? `<span class="session-badge badge-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>${session.elapsed}s</span>`
                  : ''
              }
              ${
                session.cost != null
                  ? `<span class="session-badge badge-cost session-cost" style="display:none">$${session.cost.toFixed(4)}</span>`
                  : ''
              }
            </div>
          </div>
          <div class="session-info">
            <span class="session-prompt">${session.prompt.replace(/</g, '&lt;')}</span>
          </div>
        </li>
      `,
    )
    .join('')

  section.style.display = 'block'

  const scaleIframes = () => {
    list.querySelectorAll('.session-thumbnail iframe').forEach((iframe) => {
      const containerWidth = iframe.parentElement.offsetWidth
      if (!containerWidth) return
      const scale = containerWidth / 1280
      iframe.style.transform = `scale(${scale})`
    })
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scaleIframes()
    })
  })
  if (!hasSessionResizeListener) {
    window.addEventListener('resize', scaleIframes)
    hasSessionResizeListener = true
  }

  const iframes = list.querySelectorAll('iframe[data-src]')
  if (iframes.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const iframe = entry.target
            iframe.src = iframe.dataset.src
            iframe.addEventListener('load', scaleIframes, { once: true })
            observer.unobserve(iframe)
            requestAnimationFrame(scaleIframes)
          }
        })
      },
      { rootMargin: '200px' },
    )
    iframes.forEach((iframe) => observer.observe(iframe))
  } else {
    iframes.forEach((iframe) => {
      iframe.src = iframe.dataset.src
      iframe.addEventListener('load', scaleIframes, { once: true })
    })
    requestAnimationFrame(scaleIframes)
  }

  list.querySelectorAll('.session-thumbnail iframe[src]:not([data-src])').forEach((iframe) => {
    iframe.addEventListener('load', scaleIframes, { once: true })
  })

  if (localStorage.getItem('sf_show_cost') === '1') {
    list.querySelectorAll('.session-cost').forEach((element) => {
      element.style.display = 'flex'
    })
  }
}

async function loadRecentPublicSessions() {
  try {
    const r = await fetch('/api/sessions/recent')
    if (!r.ok) {
      renderSessions([])
      return
    }
    const sessions = await r.json()
    if (!Array.isArray(sessions) || sessions.length === 0) {
      renderSessions([])
      return
    }
    renderSessions(sessions)
  } catch {
    renderSessions([])
  }
}

async function loadSessions() {
  try {
    const response = await authFetch('/api/sessions')
    if (!response.ok) throw new Error('Failed to load sessions')
    const raw = await response.json()
    const sessions = Array.isArray(raw) ? raw : []
    if (sessions.length > 0) {
      renderSessions(sessions)
      return
    }
  } catch {
    // Ignore fetch failures on the public page and keep the marketing content available.
  }
  await loadRecentPublicSessions()
}

async function loadAnonymousSessions() {
  try {
    const stored = JSON.parse(localStorage.getItem(ANON_SESSIONS_KEY) || '[]')
    if (stored.length === 0) return

    const results = await Promise.all(
      stored.map(async ({ id, prompt }) => {
        try {
          const r = await fetch(`/api/sessions/${id}`)
          if (!r.ok) return null
          const data = await r.json()
          return {
            id: data.id,
            prompt: data.prompt || prompt,
            homepageReady: data.homepageReady,
            elapsed: data.elapsed,
            cost: data.cost,
          }
        } catch {
          return { id, prompt, homepageReady: false, elapsed: null, cost: null }
        }
      }),
    )

    const valid = results.filter(Boolean)
    const validIds = new Set(valid.map((s) => s.id))
    const pruned = stored.filter((s) => validIds.has(s.id))
    if (pruned.length !== stored.length) {
      localStorage.setItem(ANON_SESSIONS_KEY, JSON.stringify(pruned))
    }

    renderSessions(valid)
  } catch {
    // Ignore failures silently.
  }
}

let hoveredSessionId = null
document.addEventListener('mouseover', (event) => {
  const card = event.target.closest('.session-item')
  hoveredSessionId = card ? card.dataset.id : null
})

function activeElementIsTextEntry() {
  const tagName = document.activeElement?.tagName
  return tagName === 'TEXTAREA' || tagName === 'INPUT'
}

document.addEventListener('keydown', async (event) => {
  if (event.key !== 'd' || !hoveredSessionId || activeElementIsTextEntry()) return

  const id = hoveredSessionId
  const card = document.querySelector(`.session-item[data-id="${id}"]`)
  if (card) card.style.opacity = '0.3'

  if (currentUser) {
    await authFetch(`/api/sessions/${id}`, { method: 'DELETE' })
  } else {
    removeAnonSession(id)
  }
  if (card) card.remove()

  const remaining = document.querySelectorAll('.session-item')
  if (remaining.length === 0) {
    document.getElementById('sessions-section').style.display = 'none'
    document.body.classList.remove('has-sessions')
    return
  }

  const list = document.getElementById('session-list')
  list.classList.remove('single-col', 'two-col')
  if (remaining.length === 1) list.classList.add('single-col')
  else if (remaining.length === 2) list.classList.add('two-col')
})

document.addEventListener('keydown', (event) => {
  if (event.key !== 'p' || activeElementIsTextEntry()) return
  const visible = localStorage.getItem('sf_show_cost') === '1'
  localStorage.setItem('sf_show_cost', visible ? '0' : '1')
  document.querySelectorAll('.session-cost').forEach((element) => {
    element.style.display = visible ? 'none' : 'flex'
  })
})

let deletePresses = []
document.addEventListener('keydown', async (event) => {
  if (event.key !== 'd' || activeElementIsTextEntry()) return
  const now = Date.now()
  deletePresses.push(now)
  deletePresses = deletePresses.filter((timestamp) => now - timestamp < 1500)

  if (deletePresses.length < 5) return

  deletePresses = []
  document.querySelectorAll('.session-item').forEach((card) => {
    card.style.opacity = '0.3'
  })

  if (currentUser) {
    await authFetch('/api/sessions', { method: 'DELETE' })
  } else {
    clearAnonSessions()
  }
  document.getElementById('session-list').innerHTML = ''
  document.getElementById('sessions-section').style.display = 'none'
  document.body.classList.remove('has-sessions')
})

try {
  fetch('chrome-extension://gppongmhjkpfnbhagpmjfkannfbllamg/js/js.js')
    .then(() => {
      document.getElementById('wappalyzer-banner').style.display = 'block'
    })
    .catch(() => {})
} catch {
  // Ignore extension probing failures outside Chromium.
}

window.addEventListener('pageshow', (event) => {
  const nav = performance.getEntriesByType('navigation')[0]
  const back = event.persisted || (nav && nav.type === 'back_forward')
  if (back) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo(0, 0))
    })
  }
  if (event.persisted) {
    if (currentUser) loadSessions()
    else loadAnonymousSessions()
  }
})

initFirebase()
