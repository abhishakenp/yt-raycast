import { groq } from '@ship-fast/engine/llm/groq.js'
import { formatTps } from '@ship-fast/engine/llm/utils.js'
import { VALID_SITE_TYPES } from '../config.js'
import { inferSiteTypeHint } from '../lib/infer-site-type.js'
import { siteTypePrompt } from '@ship-fast/engine/prompts/site-type.js'

export async function detectSiteType(prompt, log) {
  const hinted = inferSiteTypeHint(prompt)
  if (hinted && VALID_SITE_TYPES.includes(hinted)) {
    log(`  site type: ${hinted} (heuristic)`)
    return {
      siteType: hinted,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
    }
  }

  const { system, user, temperature, maxTokens } = siteTypePrompt(prompt)
  const result = await groq(user, { system, temperature, maxTokens })

  let groqResponse = (result.content ?? '').trim()

  groqResponse = groqResponse
    .replace(/^["']/, '')
    .replace(/["']$/, '')
    .replace(/[\n\r]/g, '')
    .trim()

  const raw = groqResponse.toLowerCase().replace(/[^a-z]/g, '')

  let siteType = 'landing'
  if (raw && VALID_SITE_TYPES.includes(raw)) {
    siteType = raw
  } else if (raw) {
    for (const validType of VALID_SITE_TYPES) {
      if (raw.includes(validType) || validType.includes(raw)) {
        siteType = validType
        break
      }
    }
  }

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''

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
