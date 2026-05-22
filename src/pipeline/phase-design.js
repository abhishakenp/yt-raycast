import { groq } from '@ship-fast/engine/llm/groq.js'
import { stripFences, formatTps } from '@ship-fast/engine/llm/utils.js'
import { writeFile } from './workspace.js'
import { designBriefPrompt } from '@ship-fast/engine/prompts/design-brief.js'
import { readDesignReferenceUrlsFromWorkspace } from './ecommerce-design-references.js'
import {
  inferMobbinAnchor,
  isMobbinEnabled,
  readMobbinAnchorFromWorkspace,
  writeMobbinAnchorToWorkspace,
} from '@ship-fast/engine/lib/mobbin/index.js'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

function readProjectContext(workspace) {
  try {
    const p = join(workspace, 'project-context.json')
    if (!existsSync(p)) return {}
    return JSON.parse(readFileSync(p, 'utf8')) || {}
  } catch {
    return {}
  }
}

export async function generateDesignBrief(prompt, workspace, log, indiaMode = null) {
  log('  design brief: generating with Groq gpt-oss-120b\u2026')

  // Prefer the anchor the runner already wrote up-front (idempotent). When
  // generateDesignBrief is called standalone (no upstream runner), fall back to
  // inferring here. Fail-soft: a null anchor lets downstream skip Mobbin.
  let mobbinAnchor = readMobbinAnchorFromWorkspace(workspace)
  if (!mobbinAnchor?.app && isMobbinEnabled()) {
    const projectContext = readProjectContext(workspace)
    try {
      mobbinAnchor = await inferMobbinAnchor({ brief: prompt, projectContext })
    } catch {
      mobbinAnchor = null
    }
    if (mobbinAnchor?.app) {
      writeMobbinAnchorToWorkspace(workspace, mobbinAnchor)
      log(`  mobbin anchor: ${mobbinAnchor.app} (${mobbinAnchor.category}) \u2014 ${mobbinAnchor.reason}`)
    } else {
      log('  mobbin anchor: none (brief did not match any DNA entry)')
    }
  }

  const hasUserDesignReferences = readDesignReferenceUrlsFromWorkspace(workspace).length > 0
  const { system, user, model, temperature, maxTokens } = designBriefPrompt(
    prompt,
    indiaMode,
    null,
    hasUserDesignReferences,
    mobbinAnchor,
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
    mobbinAnchor,
  }
}
