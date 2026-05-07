import { groq, groqStream } from '../llm/groq.js'
import { stripFences } from '../llm/utils.js'
import { LLM_CONFIG, OPENUI_HOME_MODEL } from '../config.js'
import { buildOpenUIGenerationSystemPrompt } from '../lib/openui-pipeline-prompt.js'
import { preprocessOpenUIResponse } from '../lib/openui-preprocess.js'
import { buildOpenUIVariationBlock } from '../lib/openui-variation.js'
import { writeFile } from './workspace.js'
import { join } from 'node:path'
import { existsSync, readFileSync } from 'node:fs'
import { HOME_OPENUI_FILE } from './openui-constants.js'
import {
  routeToOpenUIFile,
  upsertOpenUIManifestEntry,
} from './openui-artifacts.js'
import { validateOpenUISource } from './openui-validate.js'

export const OPENUI_HOME_FALLBACK = `root = PageShell([intro], "Ship Fast", "Preview", "light")
intro = Section("Preview", "Ship Fast", [card])
card = FeatureCard("Preview", "OpenUI content will appear when generation finishes.", "Ship Fast")
`

/**
 * @param {object} p
 * @param {string} p.workspace
 * @param {object | null} p.siteSpec
 * @param {string} p.prompt
 * @param {string} [p.designBrief]
 * @param {(s: string) => void} p.log
 * @param {object} [p.indiaMode]
 * @param {object | null} [p.brandProfile]
 * @param {string | null} [p.variationSeed] session id or entropy source for non-clone layouts
 */
async function generateOpenUISource(p) {
  const {
    siteSpec,
    prompt,
    designBrief = '',
    log,
    indiaMode = null,
    brandProfile = null,
    page = null,
    navList = '',
    onToken = null,
    variationSeed = null,
  } = p
  const site = siteSpec && typeof siteSpec === 'object' ? siteSpec : null
  const languageNote =
    indiaMode &&
    indiaMode.code &&
    String(indiaMode.code) !== 'en' &&
    (indiaMode.name || indiaMode.nativeName)
      ? `\n── LANGUAGE ──\nAll visible user-facing text must be in ${indiaMode.name || ''}${indiaMode.nativeName ? ` (${indiaMode.nativeName})` : ''} per session language rules.\n`
      : ''
  const specJson = site
    ? JSON.stringify(
        {
          siteType: site.siteType,
          metadata: site.metadata,
          pages: (site.pages || []).map((pg) => ({
            route: pg.route,
            title: pg.title,
          })),
          currentPage: page
            ? {
                route: page.route,
                title: page.title || page.name,
                pageRole: page.pageRole,
                contentGoals: page.contentGoals,
                sections: (page.sections || []).map((section) => ({
                  id: section.id,
                  type: section.type,
                  headline: section.headline,
                  blocks: (section.contentBlocks || []).length,
                  items: (section.items || []).length,
                })),
              }
            : null,
        },
        null,
        0,
      )
    : '{}'

  const userMessage = `── USER BRIEF ──
${String(prompt || '').trim()}
${languageNote}
── DESIGN BRIEF (internal) ──
${String(designBrief || '').trim()}

${navList ? `── SITE NAVIGATION ──\n${navList}\n` : ''}

── STRUCTURED SITE SPEC (align sections, labels, and tone; do not print this JSON as visible user-facing text) ──
${specJson}
`

  let model = OPENUI_HOME_MODEL
  let inputTokens = 0
  let outputTokens = 0
  let cost = 0
  let raw = ''

  const variationBlock = buildOpenUIVariationBlock(variationSeed, String(prompt || ''))
  const systemPrompt = buildOpenUIGenerationSystemPrompt(site, brandProfile, variationBlock)

  try {
    const r = await groqStream(userMessage, {
      system: systemPrompt,
      model,
      temperature: 0.45,
      maxTokens: Math.min(16000, LLM_CONFIG.homepage?.maxTokens ?? 16000),
      onToken,
    })
    raw = String(r?.content || '')
    inputTokens = r?.inputTokens ?? 0
    outputTokens = r?.outputTokens ?? 0
    cost = r?.cost ?? 0
  } catch (e) {
    log(`  openui: LLM error — ${e?.message || e}`)
    return { usedFallback: true, didRetry: false, chars: OPENUI_HOME_FALLBACK.length, inputTokens: 0, outputTokens: 0, cost: 0 }
  }

  let text = stripFences(String(raw || '').trim())
  text = text.replace(/^```[a-z0-9-]*\n?/i, '').replace(/\n?```\s*$/i, '')
  text = preprocessOpenUIResponse(text)

  let validation = validateOpenUISource(text)
  let quality = validation.ok

  let didRetry = false
  const maxRounds = 3
  let round = 1
  while (round < maxRounds && (!validation.ok || !quality)) {
    log(
      `  openui: round ${round} failed (parse=${validation.ok}) — retry ${round + 1}/${maxRounds}…`,
    )
    didRetry = true
    try {
      const r2 = await groq(
        `${userMessage}

── RETRY ${round + 1} ──
Previous output was invalid. Output ONLY valid openui-lang (no markdown, no code fences).
`,
        {
          system: systemPrompt,
          model,
          temperature: 0.32,
          maxTokens: Math.min(16000, LLM_CONFIG.homepage?.maxTokens ?? 16000),
        },
      )
      const t2 = preprocessOpenUIResponse(
        stripFences(String(r2?.content || '').trim())
          .replace(/^```[a-z0-9-]*\n?/i, '')
          .replace(/\n?```\s*$/i, ''),
      )
      if (t2.length > 0) {
        text = t2
        inputTokens += r2?.inputTokens ?? 0
        outputTokens += r2?.outputTokens ?? 0
        cost = (cost || 0) + (r2?.cost ?? 0)
        validation = validateOpenUISource(text)
        quality = validation.ok
      }
    } catch (e) {
      log(`  openui: retry failed — ${e?.message || e}`)
    }
    round++
  }

  if (!validation.ok || !quality) {
    log(
      `  openui: using safe fallback (parse=${validation.ok}, density=${quality}) — ${(validation.errors || []).map((e) => e?.message || e?.code).join('; ')}`,
    )
    text = OPENUI_HOME_FALLBACK
  }

  if (validation.ok && quality) {
    log(
      `  openui source: ${text.length} chars | in ${inputTokens} / out ${outputTokens} tokens (quality ok)`,
    )
  }
  return {
    usedFallback: text === OPENUI_HOME_FALLBACK,
    didRetry,
    source: text,
    chars: text.length,
    inputTokens,
    outputTokens,
    cost,
  }
}

export async function generateAndWriteOpenUIHome(p) {
  p.sessionCtx?.broadcast?.({ type: 'openui_stream_start', route: '/' })
  const result = await generateOpenUISource({
    ...p,
    variationSeed: p.variationSeed ?? p.sessionId ?? null,
    onToken: (token, accumulated) => {
      p.sessionCtx?.broadcast?.({
        type: 'openui_stream_chunk',
        route: '/',
        token,
        source: accumulated,
      })
      p.onToken?.(token, accumulated)
    },
  })
  const source = result.source || OPENUI_HOME_FALLBACK
  writeFile(p.workspace, HOME_OPENUI_FILE, source)
  upsertOpenUIManifestEntry(p.workspace, p.siteSpec, {
    route: '/',
    title: p.siteSpec?.pages?.find((page) => page.route === '/')?.title || 'Home',
    file: HOME_OPENUI_FILE,
    ready: true,
  })
  p.log?.(
    `  home.openui: ${source.length} chars${result.inputTokens ? ` | in ${result.inputTokens} / out ${result.outputTokens} tokens` : ''}`,
  )
  p.sessionCtx?.broadcast?.({ type: 'openui_stream_done', route: '/', source })
  return { ...result, source }
}

export async function generateAndWriteOpenUIPage(p) {
  const route = p.page?.route || '/'
  if (route === '/') return generateAndWriteOpenUIHome(p)
  const file = routeToOpenUIFile(route)
  p.sessionCtx?.broadcast?.({ type: 'openui_stream_start', route })
  const result = await generateOpenUISource({
    ...p,
    variationSeed: p.variationSeed ?? p.sessionId ?? null,
    page: p.page,
    onToken: (token, accumulated) => {
      p.sessionCtx?.broadcast?.({
        type: 'openui_stream_chunk',
        route,
        token,
        source: accumulated,
      })
      p.onToken?.(token, accumulated)
    },
  })
  const source = result.source || OPENUI_HOME_FALLBACK
  writeFile(p.workspace, file, source)
  upsertOpenUIManifestEntry(p.workspace, p.siteSpec, {
    route,
    title: p.page?.title || p.page?.name || route,
    file,
    ready: true,
  })
  p.log?.(
    `  ${file}: ${source.length} chars${result.inputTokens ? ` | in ${result.inputTokens} / out ${result.outputTokens} tokens` : ''}`,
  )
  p.sessionCtx?.broadcast?.({ type: 'openui_stream_done', route, source })
  return { ...result, source, file, route }
}

/**
 * Synchronously read home.openui if present (for APIs).
 * @param {string} workspace
 * @returns {string | null}
 */
export function readOpenUIHomeFile(workspace) {
  const p = join(workspace, HOME_OPENUI_FILE)
  if (!existsSync(p)) return null
  try {
    return readFileSync(p, 'utf8')
  } catch {
    return null
  }
}
