/**
 * Language configuration — known Indian languages, script-to-font mapping,
 * RTL scripts, design tokens, and lookup helpers.
 */

// ---------------------------------------------------------------------------
// 1. KNOWN_LANGUAGES — 23 Indian languages (lookup table, NOT detection list)
// ---------------------------------------------------------------------------
export const KNOWN_LANGUAGES = [
  { code: 'hinglish', name: 'Hinglish', nativeName: 'Hinglish (Hindi–English)', fontFamily: 'Noto Sans Devanagari, Inter, system-ui, sans-serif', skipFullTranslation: true, keywords: ['hinglish', 'hinglish website', 'hindi english mix', 'hindi-english', 'roman hindi'] },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['hindi', 'हिंदी', 'in hindi', 'hindi website', 'hindi language'] },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', fontFamily: 'Noto Sans Tamil, sans-serif', keywords: ['tamil', 'தமிழ்', 'in tamil', 'tamil website', 'tamil language'] },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', fontFamily: 'Noto Sans Telugu, sans-serif', keywords: ['telugu', 'తెలుగు', 'in telugu', 'telugu website', 'telugu language'] },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', fontFamily: 'Noto Sans Kannada, sans-serif', keywords: ['kannada', 'ಕನ್ನಡ', 'in kannada', 'kannada website', 'kannada language'] },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', fontFamily: 'Noto Sans Malayalam, sans-serif', keywords: ['malayalam', 'മലയാളം', 'in malayalam', 'malayalam website', 'malayalam language'] },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', fontFamily: 'Noto Sans Bengali, sans-serif', keywords: ['bengali', 'bangla', 'বাংলা', 'in bengali', 'bengali website', 'bengali language'] },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['marathi', 'मराठी', 'in marathi', 'marathi website', 'marathi language'] },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', fontFamily: 'Noto Sans Gujarati, sans-serif', keywords: ['gujarati', 'ગુજરાતી', 'in gujarati', 'gujarati website', 'gujarati language'] },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', fontFamily: 'Noto Sans Gurmukhi, sans-serif', keywords: ['punjabi', 'ਪੰਜਾਬੀ', 'in punjabi', 'punjabi website', 'punjabi language'] },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', fontFamily: 'Noto Sans Oriya, sans-serif', keywords: ['odia', 'oriya', 'ଓଡ଼ିଆ', 'in odia', 'odia website', 'odia language'] },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', fontFamily: 'Noto Sans Bengali, sans-serif', keywords: ['assamese', 'অসমীয়া', 'in assamese', 'assamese website', 'assamese language'] },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', fontFamily: 'Noto Nastaliq Urdu, sans-serif', keywords: ['urdu', 'اردو', 'in urdu', 'urdu website', 'urdu language'] },
  { code: 'mai', name: 'Maithili', nativeName: 'मैथिली', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['maithili', 'मैथिली', 'in maithili', 'maithili website', 'maithili language'] },
  { code: 'kok', name: 'Konkani', nativeName: 'कोंकणी', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['konkani', 'कोंकणी', 'in konkani', 'konkani website', 'konkani language'] },
  { code: 'mni', name: 'Manipuri', nativeName: 'ꯃꯤꯇꯩ ꯂꯣꯟ', fontFamily: 'Noto Sans Meetei Mayek, sans-serif', keywords: ['manipuri', 'meitei', 'ꯃꯤꯇꯩ', 'in manipuri', 'manipuri website', 'manipuri language'] },
  { code: 'sat', name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', fontFamily: 'Noto Sans Ol Chiki, sans-serif', keywords: ['santali', 'ᱥᱟᱱᱛᱟᱲᱤ', 'in santali', 'santali website', 'santali language'] },
  { code: 'ks', name: 'Kashmiri', nativeName: 'कॉशुर', fontFamily: 'Noto Nastaliq Urdu, sans-serif', keywords: ['kashmiri', 'कॉशुर', 'in kashmiri', 'kashmiri website', 'kashmiri language'] },
  { code: 'doi', name: 'Dogri', nativeName: 'डोगरी', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['dogri', 'डोगरी', 'in dogri', 'dogri website', 'dogri language'] },
  { code: 'brx', name: 'Bodo', nativeName: 'बड़ो', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['bodo', 'बड़ो', 'in bodo', 'bodo website', 'bodo language'] },
  { code: 'sd', name: 'Sindhi', nativeName: 'سنڌي', fontFamily: 'Noto Nastaliq Urdu, sans-serif', keywords: ['sindhi', 'سنڌي', 'in sindhi', 'sindhi website', 'sindhi language'] },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['sanskrit', 'संस्कृतम्', 'in sanskrit', 'sanskrit website', 'sanskrit language'] },
  { code: 'ne', name: 'Nepali', nativeName: 'नेपाली', fontFamily: 'Noto Sans Devanagari, sans-serif', keywords: ['nepali', 'नेपाली', 'in nepali', 'nepali website', 'nepali language'] },
]

// ---------------------------------------------------------------------------
// 2. SCRIPT_FONT_MAP — Unicode script name → Noto font family
// ---------------------------------------------------------------------------
export const SCRIPT_FONT_MAP = {
  Devanagari: 'Noto Sans Devanagari, sans-serif',
  Tamil: 'Noto Sans Tamil, sans-serif',
  Telugu: 'Noto Sans Telugu, sans-serif',
  Kannada: 'Noto Sans Kannada, sans-serif',
  Malayalam: 'Noto Sans Malayalam, sans-serif',
  Bengali: 'Noto Sans Bengali, sans-serif',
  Gujarati: 'Noto Sans Gujarati, sans-serif',
  Gurmukhi: 'Noto Sans Gurmukhi, sans-serif',
  Oriya: 'Noto Sans Oriya, sans-serif',
  Arabic: 'Noto Naskh Arabic, sans-serif',
  Hebrew: 'Noto Sans Hebrew, sans-serif',
  Thai: 'Noto Sans Thai, sans-serif',
  Han: 'Noto Sans SC, sans-serif',
  Hangul: 'Noto Sans KR, sans-serif',
  Hiragana: 'Noto Sans JP, sans-serif',
  Katakana: 'Noto Sans JP, sans-serif',
  Cyrillic: 'Noto Sans, sans-serif',
  Georgian: 'Noto Sans Georgian, sans-serif',
  Armenian: 'Noto Sans Armenian, sans-serif',
  Ethiopic: 'Noto Sans Ethiopic, sans-serif',
  Khmer: 'Noto Sans Khmer, sans-serif',
  Lao: 'Noto Sans Lao, sans-serif',
  Myanmar: 'Noto Sans Myanmar, sans-serif',
  Sinhala: 'Noto Sans Sinhala, sans-serif',
  Tibetan: 'Noto Sans Tibetan, sans-serif',
  'Meetei Mayek': 'Noto Sans Meetei Mayek, sans-serif',
  'Ol Chiki': 'Noto Sans Ol Chiki, sans-serif',
  Latin: 'Inter, system-ui, sans-serif',
}

// ---------------------------------------------------------------------------
// 3. RTL_SCRIPTS — right-to-left script names
// ---------------------------------------------------------------------------
export const RTL_SCRIPTS = new Set(['Arabic', 'Hebrew', 'Thaana', 'Syriac'])

// ---------------------------------------------------------------------------
// 4. INDIAN_LANGUAGE_CODES — BCP-47 codes for all supported Indian languages
// ---------------------------------------------------------------------------
export const INDIAN_LANGUAGE_CODES = new Set([
  'hinglish', 'hi', 'ta', 'te', 'kn', 'ml', 'bn', 'mr', 'gu', 'pa',
  'or', 'as', 'ur', 'mai', 'kok', 'mni', 'sat', 'ks', 'doi', 'brx',
  'sd', 'sa', 'ne',
])

// ---------------------------------------------------------------------------
// 5. INDIAN_DESIGN_TOKENS — colour palettes and decorative patterns
// ---------------------------------------------------------------------------
export const INDIAN_DESIGN_TOKENS = {
  colors: {
    primary: ['#FF6B35', '#FF9933', '#FFD700'],
    accent: ['#138808', '#0B6623', '#006400'],
    decorative: ['#9B2335', '#C41E3A', '#800020'],
    secondary: ['#00356B', '#1B4F8A', '#003580'],
  },
  patterns: [
    'geometric mandala border accents',
    'paisley motif section dividers',
    'lotus decorative elements',
    'rangoli-inspired section breaks',
  ],
}

// ---------------------------------------------------------------------------
// 6. getDefaultFontForScript — look up font family by Unicode script name
// ---------------------------------------------------------------------------
export function getDefaultFontForScript(script) {
  return SCRIPT_FONT_MAP[script] || 'Inter, system-ui, sans-serif'
}

// ---------------------------------------------------------------------------
// 7. lookupKnownLanguage — find a language entry by BCP-47 code
// ---------------------------------------------------------------------------
export function lookupKnownLanguage(code) {
  return KNOWN_LANGUAGES.find((l) => l.code === code) || null
}
