import { SUPPORTED_INDIAN_LANGUAGES } from '../config.js'

/**
 * Detects whether the user prompt is requesting an Indian-language website.
 * The prompt is always in English — detection works by scanning for explicit
 * language references like "hindi website", "in tamil", "kannada landing page", etc.
 *
 * @param {string} prompt
 * @returns {{ isIndian: boolean, language: object | null }}
 */
export function detectIndiaMode(prompt, preferredLanguage) {
  if (!prompt) return { isIndian: false, language: null }

  const requested = String(preferredLanguage || '')
    .trim()
    .toLowerCase()
  if (requested && requested !== 'en') {
    const language = SUPPORTED_INDIAN_LANGUAGES.find((entry) => entry.code === requested)
    if (language) return { isIndian: true, language }
    return { isIndian: false, language: null }
  }

  const lower = prompt.toLowerCase()

  const sortedLangs = [...SUPPORTED_INDIAN_LANGUAGES].sort((a, b) => {
    const longest = (lang) => Math.max(0, ...lang.keywords.map((k) => String(k).length))
    return longest(b) - longest(a)
  })

  for (const lang of sortedLangs) {
    for (const keyword of lang.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return { isIndian: true, language: lang }
      }
    }
  }

  return { isIndian: false, language: null }
}
