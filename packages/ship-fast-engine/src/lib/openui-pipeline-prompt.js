/**
 * System prompt for production OpenUI generation (Bun/Express pipeline + `home.openui`).
 * Neutral core prompt: syntax + factual session context only.
 */
import { OPENUI_SYSTEM_PROMPT } from './openui-system-prompt.ts'

/**
 * Factual session context for streaming OpenUI.
 * @param {string} [siteType]
 * @param {string} [title]
 * @returns {string}
 */
export function getStreamSessionSiteHint(siteType, title) {
  const st = String(siteType || '')
    .toLowerCase()
    .trim()
  const rawTitle = String(title || '').trim()
  if (!st && !rawTitle) return ''
  const lines = []
  if (rawTitle) lines.push(`Project title: "${rawTitle}".`)
  if (st) lines.push(`Site type: "${st}".`)
  return `

── SESSION ──
${lines.join('\n')}`
}

/**
 * @param {object | null | undefined} siteSpec
 * @param {{ officialName?: string } | null} [brandProfile]
 * @param {string} [variationBlock] from buildOpenUIVariationBlock — personalization without templates
 */
export function buildOpenUIGenerationSystemPrompt(siteSpec, brandProfile, variationBlock = '') {
  const site = siteSpec && typeof siteSpec === 'object' ? siteSpec : {}
  const title = String(site?.metadata?.title || site?.metadata?.name || '').trim()
  const siteType = String(site?.siteType || site?.metadata?.archetype || '').trim()
  const sessionFacts =
    title || siteType
      ? `\n── SESSION FACTS ──\n${[
          title ? `Project title: "${title}".` : '',
          siteType ? `Site type: "${siteType}".` : '',
        ]
          .filter(Boolean)
          .join('\n')}`
      : ''
  const brandLine =
    brandProfile?.officialName && String(brandProfile.officialName).trim()
      ? `\n── BRAND (optional) ──\nPreferred product name: ${String(brandProfile.officialName).trim()}`
      : ''
  const vary = variationBlock && String(variationBlock).trim() ? `\n${String(variationBlock).trim()}\n` : ''
  return `${OPENUI_SYSTEM_PROMPT}
${sessionFacts}
${brandLine}
${vary}
`
}
