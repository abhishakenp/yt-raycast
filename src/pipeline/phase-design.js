import { groq } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'
import { designBriefPrompt } from '../prompts/design-brief.js'

export async function generateDesignBrief(prompt, workspace, log, indiaMode = null) {
  log('  design brief: generating with kimi-k2\u2026')

  const { system, user, model, temperature, maxTokens } = designBriefPrompt(prompt, indiaMode)
  const result = await groq(user, { system, model, temperature, maxTokens })

  const brief = stripFences(result.content ?? '')
  if (brief) writeFile(workspace, 'design.md', brief)

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  design.md: ${brief.length} chars${tpsStr}`)
  return {
    brief,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
