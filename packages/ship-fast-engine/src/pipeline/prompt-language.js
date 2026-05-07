import { isMixedEnglishIndicCode, lookupKnownLanguage } from '../config/languages.js'

const DEFAULT_LANG = 'en'

export const withLanguageEnforcementBlock = (prompt, codeOrLang) => {
  const raw = String(prompt ?? '').trim()
  const rawCode = String(
    typeof codeOrLang === 'object' ? codeOrLang?.code : codeOrLang || DEFAULT_LANG,
  )
    .trim()
    .toLowerCase()
  const code = isMixedEnglishIndicCode(rawCode)
    ? rawCode
    : rawCode.split(/[-_]/)[0] || DEFAULT_LANG

  let tail
  if (code === 'en') {
    tail = `All user-visible copy must follow server language code \`${code}\` (English only). Overrides any conflicting language in the project description above.`
  } else if (code === 'hinglish') {
    tail = `All user-visible copy must follow server language code \`${code}\`: natural Hindi–English mix for Indian audiences, not purely one language unless a short fragment requires it. Overrides any conflicting language in the project description above.`
  } else if (isMixedEnglishIndicCode(code)) {
    const known = lookupKnownLanguage(code)
    const label = known?.nativeName || known?.name || code
    tail = `All user-visible copy must follow server language code \`${code}\`: natural mix of the local language and English for Indian audiences (${label}), not purely one language unless a short fragment requires it. Overrides any conflicting language in the project description above.`
  } else {
    tail = `All user-visible copy must follow server language code \`${code}\` as the single primary language; do not switch. Overrides any conflicting language in the project description above.`
  }

  return `${raw}

---
${tail}`
}
