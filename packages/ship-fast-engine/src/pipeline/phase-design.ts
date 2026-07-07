import { groq } from '../llm/groq'
import { stripFences, formatTps } from '../llm/utils'
import { writeFile } from './workspace'
import { designBriefPrompt } from '../prompts/design-brief'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references'

export async function generateDesignBrief(
  prompt: string,
  workspace: string,
  log: (msg: string) => void,
  indiaMode: string | null = null,
) {
  log('  design brief: generating with Groq gpt-oss-120b\u2026')

  const hasUserDesignReferences =
    readDesignReferenceUrlsFromWorkspace(workspace).length > 0
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
