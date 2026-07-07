import { groq } from '../llm/groq'
import { formatTps } from '../llm/utils'
import { VALID_SITE_TYPES } from '../config'
import { inferSiteTypeHint } from '../lib/infer-site-type'
import { siteTypePrompt } from '../prompts/site-type'

export async function detectSiteType(
  prompt: string,
  log: (msg: string) => void,
) {
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

  log(`  site type: ${siteType}${tpsStr}`)
  return {
    siteType,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
