import { groq } from '../llm/groq.js'
import { formatTps } from '../llm/utils.js'
import { VALID_SITE_TYPES } from '../config.js'
import { siteTypePrompt } from '../prompts/site-type.js'

export async function detectSiteType(prompt, log) {
  const { system, user, temperature, maxTokens } = siteTypePrompt(prompt)
  const result = await groq(user, { system, temperature, maxTokens })

  // Get raw response and clean it aggressively
  let groqResponse = (result.content ?? '').trim()

  // Remove quotes, JSON artifacts, and extra whitespace
  groqResponse = groqResponse
    .replace(/^["']/, '') // Remove leading quote
    .replace(/["']$/, '') // Remove trailing quote
    .replace(/[\n\r]/g, '') // Remove newlines
    .trim()

  // Clean to only letters
  const raw = groqResponse.toLowerCase().replace(/[^a-z]/g, '')

  // Find best match
  let siteType = 'saas'
  if (VALID_SITE_TYPES.includes(raw)) {
    siteType = raw
  } else {
    // Try to find partial matches
    for (const validType of VALID_SITE_TYPES) {
      if (raw.includes(validType) || validType.includes(raw)) {
        siteType = validType
        break
      }
    }
  }

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''

  // Log detection details
  if (groqResponse.toLowerCase() !== siteType) {
    console.log(`[SITE TYPE] Raw: "${groqResponse}" → cleaned: "${raw}" → matched: "${siteType}"`)
  }

  log(`  site type: ${siteType}${tpsStr}`)
  return {
    siteType,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
