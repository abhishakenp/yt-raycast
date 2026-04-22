import { groq } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'
import { designBriefPrompt } from '../prompts/design-brief.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'

export async function generateDesignBrief(
  prompt,
  workspace,
  log,
  indiaMode = null,
  businessProfile = null,
  designRef = null,
) {
  log('  design brief: generating\u2026')

  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  if (designRef) log(`  design ref: ${designRef.name}`)
  const { system, user, model, temperature, maxTokens } = designBriefPrompt(
    prompt,
    indiaMode,
    null,
    hasUserDesignReferences,
    designRef,
    businessProfile,
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
