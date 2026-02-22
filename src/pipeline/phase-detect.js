import { groq } from '../llm/groq.js'
import { formatTps } from '../llm/utils.js'
import { VALID_SITE_TYPES } from '../config.js'
import { siteTypePrompt } from '../prompts/site-type.js'

export async function detectSiteType(prompt, log) {
  const { system, user, temperature, maxTokens } = siteTypePrompt(prompt)
  const result = await groq(user, { system, temperature, maxTokens })

  // Debug: log raw Groq response
  const groqResponse = (result.content ?? '').trim()

  const raw = groqResponse
    .toLowerCase()
    .replace(/[^a-z]/g, '')
  const siteType = VALID_SITE_TYPES.includes(raw) ? raw : 'saas'

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''

  // Log detection details
  if (groqResponse !== siteType) {
    console.log(`[SITE TYPE] Groq returned: "${groqResponse}" → cleaned: "${raw}" → final: "${siteType}"`)
  }

  log(`  site type: ${siteType}${tpsStr}`)
  return {
    siteType,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
