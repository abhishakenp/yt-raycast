import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { groqParallel } from '../llm/groq.js'
import { stripFences, formatTps } from '../llm/utils.js'
import { ensureLucideIconRuntime } from './lucide-icons.js'
import { writeFile } from './workspace.js'
import { sumTokens } from './phase-tasks.js'
import { navfixPrompt } from '../prompts/navfix.js'

export async function fixHomepageNav(navList, workspace, log) {
  // Skip nav fixing for now unless explicitly enabled.
  const NAV_FIX_ENABLED = false
  if (!NAV_FIX_ENABLED) {
    return { count: 0, inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  const fileContent = readFileSync(join(workspace, 'index.html'), 'utf-8')
  log('\n  \u2500\u2500 Fixing homepage nav links \u2500\u2500')

  const { system, prompt, temperature, maxTokens } = navfixPrompt(navList, fileContent)
  const [result] = await groqParallel([{ system, prompt, temperature, maxTokens }])

  if (result?.content && !result.error) {
    const cleaned = ensureLucideIconRuntime(stripFences(result.content), log)
    // Only write if it looks like HTML (starts with < or contains <!DOCTYPE)
    if (cleaned.startsWith('<') || cleaned.includes('<!DOCTYPE')) {
      writeFile(workspace, 'index.html', cleaned)
      const tpsStr = formatTps(result) ? ` | ${formatTps(result)}` : ''
      log(`  fixed: index.html${tpsStr}`)
    } else {
      log(`  skipped: nav fix response wasn't valid HTML`)
    }
  }

  return { count: 1, ...sumTokens([result]) }
}
