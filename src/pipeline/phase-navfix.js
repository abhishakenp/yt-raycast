import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { groqParallel } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { writeFile } from './workspace.js'
import { sumTokens } from './phase-tasks.js'
import { navfixPrompt } from '../prompts/navfix.js'

export async function fixHomepageNav(navList, workspace, log) {
  const fileContent = readFileSync(join(workspace, 'index.html'), 'utf-8')
  log('\n  \u2500\u2500 Fixing homepage nav links \u2500\u2500')

  const { system, prompt, temperature, maxTokens } = navfixPrompt(navList, fileContent)
  const [result] = await groqParallel([{ system, prompt, temperature, maxTokens }])

  if (result?.content && !result.error) {
    writeFile(workspace, 'index.html', stripFences(result.content))
    const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
    log(`  fixed: index.html${tpsStr}`)
  }

  return { count: 1, ...sumTokens([result]) }
}
