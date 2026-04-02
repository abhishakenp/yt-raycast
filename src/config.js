export const DASHBOARD_PORT = 7420
export const SITE_NAME = 'Ship Fast'
export const SITE_URL = (process.env.SITE_URL ?? 'https://ship-fast.devliv.io').replace(/\/+$/, '')
export const BASE_DOMAIN = process.env.BASE_DOMAIN ?? 'ship-fast.io'
export const PLAUSIBLE_DOMAIN = process.env.PLAUSIBLE_DOMAIN ?? new URL(SITE_URL).hostname

export const GROQ_API_KEY = process.env.GROQ_API_KEY
export const GROQ_HOST = process.env.GROQ_HOST ?? 'https://api.groq.com'
export const GROQ_MODEL = process.env.GROQ_MODEL ?? 'openai/gpt-oss-120b'
export const HOMEPAGE_MODEL = 'moonshotai/kimi-k2-instruct-0905'

// ─── RunPod / hex-1 Configuration ───────────────────────
export const RUNPOD_API_URL = process.env.RUNPOD_API_URL ?? ''
export const RUNPOD_API_KEY = process.env.RUNPOD_API_KEY ?? ''
export const RUNPOD_MODEL = process.env.RUNPOD_MODEL ?? 'budecosystem/hex-1'
export const PEXELS_API_KEY = process.env.PEXELS_API_KEY ?? ''

// ─── India Mode ──────────────────────────────────────────
// All 22 constitutionally scheduled Indian languages
export const SUPPORTED_INDIAN_LANGUAGES = [
  // Original 5
  { code: 'hi',  name: 'Hindi',     nativeName: 'हिंदी',         fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['hindi', 'हिंदी', 'in hindi', 'hindi website', 'hindi language'] },
  { code: 'ta',  name: 'Tamil',     nativeName: 'தமிழ்',         fontFamily: 'Noto Sans Tamil, sans-serif',       keywords: ['tamil', 'தமிழ்', 'in tamil', 'tamil website', 'tamil language'] },
  { code: 'te',  name: 'Telugu',    nativeName: 'తెలుగు',        fontFamily: 'Noto Sans Telugu, sans-serif',      keywords: ['telugu', 'తెలుగు', 'in telugu', 'telugu website', 'telugu language'] },
  { code: 'kn',  name: 'Kannada',   nativeName: 'ಕನ್ನಡ',         fontFamily: 'Noto Sans Kannada, sans-serif',     keywords: ['kannada', 'ಕನ್ನಡ', 'in kannada', 'kannada website', 'kannada language'] },
  { code: 'ml',  name: 'Malayalam', nativeName: 'മലയാളം',        fontFamily: 'Noto Sans Malayalam, sans-serif',   keywords: ['malayalam', 'മലയാളം', 'in malayalam', 'malayalam website', 'malayalam language'] },
  // Additional 17
  { code: 'bn',  name: 'Bengali',   nativeName: 'বাংলা',         fontFamily: 'Noto Sans Bengali, sans-serif',     keywords: ['bengali', 'bangla', 'বাংলা', 'in bengali', 'bengali website', 'bengali language'] },
  { code: 'mr',  name: 'Marathi',   nativeName: 'मराठी',         fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['marathi', 'मराठी', 'in marathi', 'marathi website', 'marathi language'] },
  { code: 'gu',  name: 'Gujarati',  nativeName: 'ગુજરાતી',       fontFamily: 'Noto Sans Gujarati, sans-serif',    keywords: ['gujarati', 'ગુજરાતી', 'in gujarati', 'gujarati website', 'gujarati language'] },
  { code: 'pa',  name: 'Punjabi',   nativeName: 'ਪੰਜਾਬੀ',        fontFamily: 'Noto Sans Gurmukhi, sans-serif',    keywords: ['punjabi', 'ਪੰਜਾਬੀ', 'in punjabi', 'punjabi website', 'punjabi language'] },
  { code: 'or',  name: 'Odia',      nativeName: 'ଓଡ଼ିଆ',         fontFamily: 'Noto Sans Oriya, sans-serif',       keywords: ['odia', 'oriya', 'ଓଡ଼ିଆ', 'in odia', 'odia website', 'odia language'] },
  { code: 'as',  name: 'Assamese',  nativeName: 'অসমীয়া',       fontFamily: 'Noto Sans Bengali, sans-serif',     keywords: ['assamese', 'অসমীয়া', 'in assamese', 'assamese website', 'assamese language'] },
  { code: 'ur',  name: 'Urdu',      nativeName: 'اردو',           fontFamily: 'Noto Nastaliq Urdu, sans-serif',    keywords: ['urdu', 'اردو', 'in urdu', 'urdu website', 'urdu language'] },
  { code: 'mai', name: 'Maithili',  nativeName: 'मैथिली',        fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['maithili', 'मैथिली', 'in maithili', 'maithili website', 'maithili language'] },
  { code: 'kok', name: 'Konkani',   nativeName: 'कोंकणी',        fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['konkani', 'कोंकणी', 'in konkani', 'konkani website', 'konkani language'] },
  { code: 'mni', name: 'Manipuri',  nativeName: 'ꯃꯤꯇꯩ ꯂꯣꯟ',     fontFamily: 'Noto Sans Meetei Mayek, sans-serif', keywords: ['manipuri', 'meitei', 'ꯃꯤꯇꯩ', 'in manipuri', 'manipuri website', 'manipuri language'] },
  { code: 'sat', name: 'Santali',   nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',      fontFamily: 'Noto Sans Ol Chiki, sans-serif',    keywords: ['santali', 'ᱥᱟᱱᱛᱟᱲᱤ', 'in santali', 'santali website', 'santali language'] },
  { code: 'ks',  name: 'Kashmiri',  nativeName: 'कॉशुर',         fontFamily: 'Noto Nastaliq Urdu, sans-serif',    keywords: ['kashmiri', 'कॉशुर', 'in kashmiri', 'kashmiri website', 'kashmiri language'] },
  { code: 'doi', name: 'Dogri',     nativeName: 'डोगरी',         fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['dogri', 'डोगरी', 'in dogri', 'dogri website', 'dogri language'] },
  { code: 'brx', name: 'Bodo',      nativeName: 'बड़ो',           fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['bodo', 'बड़ो', 'in bodo', 'bodo website', 'bodo language'] },
  { code: 'sd',  name: 'Sindhi',    nativeName: 'سنڌي',           fontFamily: 'Noto Nastaliq Urdu, sans-serif',    keywords: ['sindhi', 'سنڌي', 'in sindhi', 'sindhi website', 'sindhi language'] },
  { code: 'sa',  name: 'Sanskrit',  nativeName: 'संस्कृतम्',     fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['sanskrit', 'संस्कृतम्', 'in sanskrit', 'sanskrit website', 'sanskrit language'] },
  { code: 'ne',  name: 'Nepali',    nativeName: 'नेपाली',        fontFamily: 'Noto Sans Devanagari, sans-serif',  keywords: ['nepali', 'नेपाली', 'in nepali', 'nepali website', 'nepali language'] },
]

export const INDIAN_DESIGN_TOKENS = {
  colors: {
    primary:    ['#FF6B35', '#FF9933', '#FFD700'],
    accent:     ['#138808', '#0B6623', '#006400'],
    decorative: ['#9B2335', '#C41E3A', '#800020'],
    secondary:  ['#00356B', '#1B4F8A', '#003580'],
  },
  patterns: [
    'geometric mandala border accents',
    'paisley motif section dividers',
    'lotus decorative elements',
    'rangoli-inspired section breaks',
  ],
}

// ─── LLM Configuration ──────────────────────────────────
export const LLM_CONFIG = {
  default: {
    temperature: 0.3,
    maxTokens: 8000,
  },
  homepage: {
    temperature: 0.4,
    maxTokens: 12000,
  },
  parallel: {
    temperature: 0.3,
    maxTokens: 8000,
  },
  game: {
    temperature: 0.5,
    maxTokens: 24000,
  },
}

export const VALID_SITE_TYPES = [
  'saas',
  'landing',
  'portfolio',
  'ecommerce',
  'blog',
  'docs',
  'dashboard',
  'marketplace',
  'community',
  'game',
]

export const HOME_LABELS = ['home', 'homepage', 'index', 'landing']

export const SITE_TYPE_INSTRUCTIONS = {
  saas:
    'SaaS product. Typography-first, no hero images. ' +
    'Hero: pill badge + massive headline + subtitle + 1 gradient CTA (rounded-full). ' +
    'Then: features (section label + headline + 2x2 card grid) \u2192 pricing (2-col, featured has Popular badge) \u2192 highlight card (gradient bg with icon) \u2192 logo cloud (company names as text) \u2192 final CTA (headline + 2 buttons) \u2192 footer.',
  dashboard:
    'Dashboard/analytics tool. Typography-first. ' +
    'Hero: pill badge + headline about data insights + subtitle + CTA. ' +
    'Then: metrics cards (2x2 grid with KPI numbers) \u2192 features (2x2 cards) \u2192 integrations (logo cloud as text) \u2192 pricing (2-col) \u2192 CTA \u2192 footer.',
  ecommerce:
    'E-commerce storefront. Product images allowed here. ' +
    'Hero: headline + subtitle + CTA + featured product image (picsum). ' +
    'Then: category cards (2x2, picsum images) \u2192 featured products \u2192 deals banner \u2192 newsletter \u2192 footer.',
  marketplace:
    'Marketplace platform. ' +
    'Hero: search bar centered + category pills + headline. ' +
    'Then: featured listings (2-col cards with picsum images) \u2192 how it works (3-step icons) \u2192 trust stats \u2192 CTA \u2192 footer.',
  blog:
    'Blog/publication. ' +
    'Hero: featured article card with picsum image + title + excerpt. ' +
    'Then: article grid (2-col, picsum images) \u2192 categories \u2192 newsletter signup \u2192 footer.',
  docs:
    'Documentation site. Typography-first. ' +
    'Hero: search bar + quick start code block (dark surface bg, rounded-xl). ' +
    'Then: topic cards (2x2 grid) \u2192 API reference links \u2192 footer.',
  community:
    'Community platform. Typography-first. ' +
    'Hero: headline + member count stats + Join CTA. ' +
    'Then: trending topics cards \u2192 member highlights \u2192 activity preview \u2192 CTA \u2192 footer.',
  portfolio:
    'Portfolio. Images allowed for projects. ' +
    'Hero: bold name + role title + subtle tagline. ' +
    'Then: selected works (2-col, picsum images) \u2192 about \u2192 skills/tech \u2192 contact form \u2192 footer.',
  landing:
    'Landing page. Typography-first, no hero images. ' +
    'Hero: pill badge + oversized headline + subtitle + 1 gradient CTA (rounded-full). ' +
    'Then: features (2x2 cards) \u2192 social proof (stats + logo cloud as text) \u2192 pricing (2-col) \u2192 FAQ \u2192 final CTA \u2192 footer.',
  game:
    'Fully playable 3D or 2D game using THREE.js. Not a landing page or demo. ' +
    'Fullscreen experience with realistic physics, smooth controls (WASD + mouse), professional HUD, and win/lose conditions. ' +
    'Game loop: MENU state with "Press to Start", then PLAYING state with smooth 60fps gameplay. ' +
    'Graphics: dynamic 3D scene with lighting, particles, camera follow. ' +
    'Audio: sound effect logic (placeholder Web Audio). ' +
    'ONE file only, no external assets except THREE.js CDN. ' +
    'Must be functional and playable without errors.',
}
