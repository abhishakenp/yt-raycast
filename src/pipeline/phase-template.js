import { groqTemplate } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'

export async function generateTemplate(siteType, workspace, log) {
  if (!siteType) {
    log('  ⚠️  no site type provided, skipping template generation')
    return { content: '', inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  log(`  template (${siteType}): generating with kimi-k2…`)

  const result = await groqTemplate(siteType)

  if (result.error) {
    log(`  ❌ template generation failed: ${result.error}`)
    return { content: '', error: result.error, inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  const content = stripFences(result.content ?? '')
  if (content) writeFile(workspace, `template-${siteType}.html`, content)

  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  template-${siteType}.html: ${content.length} chars${tpsStr}`)

  return {
    content,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
