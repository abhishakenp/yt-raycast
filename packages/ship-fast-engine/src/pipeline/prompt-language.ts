import { detectLanguage } from './detect-language'
import { getWorkspacePreferredLanguage } from '../session-prefs'
export function withLanguageEnforcementBlock(
  prompt: string,
  _languageMode: { name?: string; code?: string },
) {
  const raw = String(prompt ?? '').trim()

  const tail =
    'All generated user-visible copy must be English only, regardless of any conflicting language request in the project description above.'
  const quality =
    'Use polished, native-speaker quality English for every visible label, heading, CTA, testimonial, and navigation item.'
  const conceptTranslation =
    'If the user brief is written in any other language/script, understand it as source context and translate concepts to their closest natural English equivalents before authoring copy. Do not output native-script or romanized target-language visible copy.'
  const placeholders =
    'Do not use placeholder filenames or asset labels as visible copy, including logo1.png, image1.jpg, placeholder.png, avatar.png, or similar; use real organization, partner, person, or section names instead.'

  return `${raw}

---
${tail}
${quality}
${conceptTranslation}
${placeholders}`
}

export async function resolvePipelineLanguage({
  prompt,
  preferredLanguage,
  workspace,
}: {
  prompt?: string
  preferredLanguage?: string
  workspace?: string
} = {}) {
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
