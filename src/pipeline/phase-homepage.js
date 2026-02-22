import { groqHomepage } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'
import { signalHomepageReady } from '../server/state.js'
import { homepagePrompt } from '../prompts/homepage.js'

export async function generateHomepage(prompt, ctx, designBrief, workspace, log) {
  log('  homepage: generating')

  const userPrompt = homepagePrompt(prompt, ctx, designBrief)
  const result = await groqHomepage(userPrompt)

  const html = stripFences(result.content)
  writeFile(workspace, 'index.html', html)
  const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
  log(`  index.html: ${html.length} chars${tpsStr}`)

  signalHomepageReady()
  return {
    html,
    inputTokens: result.inputTokens ?? 0,
    outputTokens: result.outputTokens ?? 0,
    cost: result.cost ?? 0,
  }
}
