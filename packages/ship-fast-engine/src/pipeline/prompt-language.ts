import { detectLanguage } from './detect-language.js'
import { getWorkspacePreferredLanguage } from '../session-prefs.js'
import {
  isMixedEnglishIndicCode,
  isRomanizedIndicCode,
} from '../config/languages.js'

const DEFAULT_LANG = 'en'

const normalizePreferredLanguage = (value: string | undefined) => {
  const requested = String(value || '')
    .trim()
    .toLowerCase()
  return requested || DEFAULT_LANG
}

const baseDisplayName = (languageMode: { name?: string; code?: string }) =>
  String(languageMode?.name || languageMode?.code || 'Language')
    .replace(/\s*\(Roman\)\s*$/i, '')
    .replace(/\s*\+\s*English\s*$/i, '')
    .trim()

export const withLanguageEnforcementBlock = (
  prompt: string,
  languageMode: { name?: string; code?: string },
) => {
  const raw = String(prompt ?? '').trim()
  const code = normalizePreferredLanguage(languageMode?.code)
  const name = baseDisplayName(languageMode)

  const tail =
    code === DEFAULT_LANG
      ? `All user-visible copy must follow server language code \`${code}\` (English only). Overrides any conflicting language in the project description above.`
      : code === 'hinglish'
        ? `All user-visible copy must follow server language code \`${code}\`: natural Hindi-English mix for Indian audiences, not purely one language unless a short fragment requires it. Overrides any conflicting language in the project description above.`
        : isRomanizedIndicCode(code)
          ? `All user-visible copy must follow server language code \`${code}\`: Romanized ${name} in Latin script / English letters, not native-script ${name}. Do not switch to another language. Overrides any conflicting language in the project description above.`
          : isMixedEnglishIndicCode(code)
            ? `All user-visible copy must follow server language code \`${code}\`: natural ${name} + English mix for Indian audiences, not purely one language unless a short fragment requires it. Overrides any conflicting language in the project description above.`
            : `All user-visible copy must follow server language code \`${code}\` as the single primary language; do not switch. Overrides any conflicting language in the project description above.`
  const quality =
    code === DEFAULT_LANG
      ? 'Use polished, native-speaker quality English for every visible label, heading, CTA, testimonial, and navigation item.'
      : `Use polished, native-speaker quality ${name} for every visible label, heading, CTA, testimonial, and navigation item. Avoid literal word-by-word translation artifacts; write natural local phrasing.`
  const placeholders =
    'Do not use placeholder filenames or asset labels as visible copy, including logo1.png, image1.jpg, placeholder.png, avatar.png, or similar; use real organization, partner, person, or section names instead.'

  return `${raw}

---
${tail}
${quality}
${placeholders}`
}

export const resolvePipelineLanguage = async ({
  prompt,
  preferredLanguage,
  workspace,
}: {
  prompt?: string
  preferredLanguage?: string
  workspace?: string
} = {}) => {
  const normalizedPrompt = prompt || ''
  const workspacePreferred =
    preferredLanguage || getWorkspacePreferredLanguage(workspace)
  const languageMode = await detectLanguage(
    normalizedPrompt,
    workspacePreferred,
  )
  return {
    ...languageMode,
    prompt: withLanguageEnforcementBlock(normalizedPrompt, languageMode),
  }
}
