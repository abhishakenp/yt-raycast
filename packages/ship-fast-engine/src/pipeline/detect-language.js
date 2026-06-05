import { GROQ_API_KEY, GROQ_HOST } from '../config.js'
import {
  KNOWN_LANGUAGES,
  INDIAN_LANGUAGE_CODES,
  INDIAN_DESIGN_TOKENS,
  getDefaultFontForScript,
  RTL_SCRIPTS,
  lookupKnownLanguage,
  preferMixedEnglishBcp47FromSnippet,
  preferRomanizedBcp47FromSnippet,
  isRomanizedIndicCode,
} from '../config/languages.js'

const DETECT_MODEL = 'llama-3.3-70b-versatile'

const ENGLISH_MODE = {
  detected: true,
  code: 'en',
  name: 'English',
  nativeName: 'English',
  script: 'Latin',
  fontFamily: 'Inter, system-ui, sans-serif',
  isRTL: false,
  needsTranslation: false,
  skipFullTranslation: true,
  designHints: null,
  isIndian: false,
  language: null,
}

function buildLanguageMode(code, name, nativeName, script, knownEntry) {
  const isIndian = INDIAN_LANGUAGE_CODES.has(code)
  const fontFamily = knownEntry?.fontFamily || getDefaultFontForScript(script)
  const isRTL = RTL_SCRIPTS.has(script)
  const skipFullTranslation = knownEntry?.skipFullTranslation || false

  const mode = {
    detected: true,
    code,
    name,
    nativeName,
    script,
    fontFamily,
    isRTL,
    needsTranslation: code !== 'en' && !skipFullTranslation,
    skipFullTranslation,
    designHints: isIndian ? INDIAN_DESIGN_TOKENS : null,
    isIndian,
    // Backward compat: mirrors old indiaMode.language shape
    language: isIndian
      ? { code, name, nativeName, fontFamily, skipFullTranslation, keywords: knownEntry?.keywords || [] }
      : null,
  }
  return mode
}

/**
 * Detects the target language for website generation.
 * Uses explicit preferredLanguage if set, otherwise asks an LLM.
 *
 * Returns a LanguageMode object that is backward-compatible with the old
 * indiaMode shape (isIndian, language properties preserved).
 */
export function resolveLanguageModeFromPreference(preferredLanguage) {
  const requested = String(preferredLanguage || '').trim().toLowerCase()
  if (requested && requested !== 'en') {
    if (isRomanizedIndicCode(requested)) {
      const romanized = lookupKnownLanguage(requested)
      if (romanized) {
        return buildLanguageMode(romanized.code, romanized.name, romanized.nativeName, 'Latin', romanized)
      }
    }
    const known = KNOWN_LANGUAGES.find((l) => l.code === requested)
    if (known) {
      return buildLanguageMode(known.code, known.name, known.nativeName, guessScript(known.fontFamily), known)
    }
    return buildLanguageMode(requested, requested, requested, 'Latin', null)
  }
  return ENGLISH_MODE
}

export async function detectLanguage(prompt, preferredLanguage) {
  const fromPref = resolveLanguageModeFromPreference(preferredLanguage)
  if (fromPref.code !== 'en') return fromPref
  if (!prompt) return ENGLISH_MODE

  const romanHint = preferRomanizedBcp47FromSnippet(prompt)
  if (romanHint) {
    const r = lookupKnownLanguage(romanHint)
    if (r) {
      return buildLanguageMode(r.code, r.name, r.nativeName, 'Latin', r)
    }
  }

  const mixHint = preferMixedEnglishBcp47FromSnippet(prompt)
  if (mixHint) {
    const m = lookupKnownLanguage(mixHint)
    if (m) {
      return buildLanguageMode(m.code, m.name, m.nativeName, guessScript(m.fontFamily), m)
    }
  }

  if (!GROQ_API_KEY) return ENGLISH_MODE

  try {
    const res = await fetch(`${GROQ_HOST}/openai/v1/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DETECT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a language detector for a website generation tool. Given a user's prompt, determine what language the generated website content should be in.

Consider:
1. Explicit language requests (e.g., "make a Hindi website", "create a site in French")
2. The language the prompt itself is written in (e.g., a prompt in Chinese means the site should be in Chinese)
3. Cultural or regional context clues

Default to English if the intent is unclear or the prompt is in English without any other language signal.

For a romanized request ('roman hindi', 'romanized nepali', 'hindi in english letters'), append '-latn': hi-latn, ne-latn, mr-latn.

Respond with ONLY a JSON object, no other text:
{"code":"<BCP-47 language code>","name":"<English name>","nativeName":"<name in native script>","script":"<Unicode script name>"}

Examples:
- "Build me a Hindi website for my restaurant" → {"code":"hi","name":"Hindi","nativeName":"हिंदी","script":"Devanagari"}
- "Build me a roman hindi government site" → {"code":"hi-latn","name":"Hindi (Roman)","nativeName":"हिंदी (Roman)","script":"Latin"}
- "मेरी वेबसाइट बनाओ" → {"code":"hi","name":"Hindi","nativeName":"हिंदी","script":"Devanagari"}
- "为我的餐厅创建一个网站" → {"code":"zh","name":"Chinese","nativeName":"中文","script":"Han"}
- "Create a website for my bakery" → {"code":"en","name":"English","nativeName":"English","script":"Latin"}
- "Créer un site web pour ma boulangerie" → {"code":"fr","name":"French","nativeName":"Français","script":"Latin"}`,
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0,
        max_tokens: 100,
        stream: false,
      }),
    })

    const data = await res.json()
    if (data.error) return ENGLISH_MODE

    const raw = data.choices?.[0]?.message?.content ?? ''
    const jsonMatch = raw.match(/\{[^}]+\}/)
    if (!jsonMatch) return ENGLISH_MODE

    const parsed = JSON.parse(jsonMatch[0])
    const code = String(parsed.code || 'en').trim().toLowerCase()
    if (code === 'en') return ENGLISH_MODE

    if (isRomanizedIndicCode(code)) {
      const romanized = lookupKnownLanguage(code)
      if (romanized) {
        return buildLanguageMode(romanized.code, romanized.name, romanized.nativeName, 'Latin', romanized)
      }
    }

    const name = String(parsed.name || code)
    const nativeName = String(parsed.nativeName || name)
    const script = String(parsed.script || 'Latin')

    const known = KNOWN_LANGUAGES.find((l) => l.code === code)
    return buildLanguageMode(code, name, nativeName, script, known)
  } catch {
    return ENGLISH_MODE
  }
}

/**
 * Guess the Unicode script name from a font family string.
 * Used when we have a known language entry but need the script name.
 */
function guessScript(fontFamily) {
  if (!fontFamily) return 'Latin'
  const f = fontFamily.toLowerCase()
  if (f.includes('devanagari')) return 'Devanagari'
  if (f.includes('tamil')) return 'Tamil'
  if (f.includes('telugu')) return 'Telugu'
  if (f.includes('kannada')) return 'Kannada'
  if (f.includes('malayalam')) return 'Malayalam'
  if (f.includes('bengali')) return 'Bengali'
  if (f.includes('gujarati')) return 'Gujarati'
  if (f.includes('gurmukhi')) return 'Gurmukhi'
  if (f.includes('oriya')) return 'Oriya'
  if (f.includes('nastaliq') || f.includes('arabic')) return 'Arabic'
  if (f.includes('meetei')) return 'Meetei Mayek'
  if (f.includes('ol chiki')) return 'Ol Chiki'
  return 'Latin'
}
