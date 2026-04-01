import { SUPPORTED_INDIAN_LANGUAGES } from '../config.js'

/**
 * Detects whether the user prompt is requesting an Indian-language website.
 * The prompt is always in English — detection works by scanning for explicit
 * language references like "hindi website", "in tamil", "kannada landing page", etc.
 *
 * @param {string} prompt
 * @returns {{ isIndian: boolean, language: object | null }}
 */
export function detectIndiaMode(prompt) {
  const lower = prompt.toLowerCase()

  for (const lang of SUPPORTED_INDIAN_LANGUAGES) {
    for (const keyword of lang.keywords) {
      if (lower.includes(keyword.toLowerCase())) {
        return { isIndian: true, language: lang }
      }
    }
  }

  return { isIndian: false, language: null }
}
