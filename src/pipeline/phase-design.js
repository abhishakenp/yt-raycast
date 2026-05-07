import { groq } from '@ship-fast/engine/llm/groq.js'
import { stripFences, formatTps } from '@ship-fast/engine/llm/utils.js'
import { writeFile } from './workspace.js'
import { designBriefPrompt } from '@ship-fast/engine/prompts/design-brief.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'

export async function generateDesignBrief(prompt, workspace, log, indiaMode = null) {
  log('  design brief: generating with Groq gpt-oss-120b\u2026')

  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const { system, user, model, temperature, maxTokens } = designBriefPrompt(
    prompt,
    indiaMode,
    null,
    hasUserDesignReferences,
  )
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
