const DEFAULT_LANG = 'en'

export const withLanguageEnforcementBlock = (prompt, preferredLanguage) => {
  const raw = String(prompt ?? '').trim()
  const code =
    String(preferredLanguage || DEFAULT_LANG)
      .trim()
      .toLowerCase()
      .split(/[-_]/)[0] || DEFAULT_LANG
  const tail =
    code === 'en'
      ? `All user-visible copy must follow server language code \`${code}\` (English only). Overrides any conflicting language in the project description above.`
      : code === 'hinglish'
        ? `All user-visible copy must follow server language code \`${code}\`: natural Hindi–English mix for Indian audiences, not purely one language unless a short fragment requires it. Overrides any conflicting language in the project description above.`
        : `All user-visible copy must follow server language code \`${code}\` as the single primary language; do not switch. Overrides any conflicting language in the project description above.`

  return `${raw}

---
${tail}`
}
