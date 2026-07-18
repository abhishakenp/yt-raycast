import { join } from 'node:path'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { runHomepageOrchestrator } from '../genui/run.ts'
import type { GenUIEvent } from '../genui/events.ts'
import { renderPreviewToWorkspace } from '../renderers/index.ts'
import { saveSiteSpec } from '../spec/index.ts'
// @ts-ignore - JS module without type definitions
import {
  preferRomanizedBcp47FromSnippet,
  preferMixedEnglishBcp47FromSnippet,
} from '../config/languages'
// @ts-ignore - JS module without type definitions
import { translateHtml } from '../llm/translator'
import { renderOpenUIToHTMLWithTheme } from '../openui-ssr'
import { slug } from './workspace'

const HOME_OPENUI_FILE = 'home.openui'
const OPENUI_PAGES_DIR = 'pages'
const OPENUI_MANIFEST_FILE = 'openui-manifest.json'
type OpenUIRenderResult = { html: string; cssVars?: string }

function upsertManifest(
  workspace: string,
  route: string,
  title: string,
  file: string,
) {
  const manifestPath = join(workspace, OPENUI_MANIFEST_FILE)
  let manifest: any = {
    version: 1,
    generatedAt: new Date().toISOString(),
    home: HOME_OPENUI_FILE,
    pages: [],
  }
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch {
      // Ignore
    }
  }
  if (!manifest.pages) manifest.pages = []
  manifest.pages = manifest.pages.filter((p: unknown) => (p as Record<string, unknown>).route !== route)
  manifest.pages.push({
    route,
    title,
    file,
    ready: true,
  })
  manifest.generatedAt = new Date().toISOString()
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

async function simulateStream(
  sessionCtx: any,
  route: string,
  fullText: string,
) {
  if (!sessionCtx?.broadcast) return
  sessionCtx.broadcast({ type: 'openui_stream_start', route })

  const chunkSize = 512
  let index = 0
  while (index < fullText.length) {
    const chunk = fullText.slice(index, index + chunkSize)
    const accumulated = fullText.slice(0, index + chunkSize)
    sessionCtx.broadcast({
      type: 'openui_stream_chunk',
      route,
      token: chunk,
      source: accumulated,
    })
    index += chunkSize
    await new Promise((resolve) => setTimeout(resolve, 8))
  }

  sessionCtx.broadcast({ type: 'openui_stream_done', route, source: fullText })
}

function titleFromPrompt(prompt: string): string {
  const words = String(prompt || '')
    .replace(/[^A-Za-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 3)
  if (!words.length) return 'Generated Project'
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join(' ')
}

function projectTitle(siteSpec: any, prompt: string): string {
  return (
    siteSpec?.metadata?.title ||
    siteSpec?.metadata?.name ||
    siteSpec?.brand ||
    siteSpec?.projectName ||
    titleFromPrompt(prompt)
  )
}

export async function generateAndWriteOpenUIHome(p: {
  workspace: string
  siteSpec: any
  prompt: string
  log?: (msg: string) => void
  sessionCtx?: any
  variationSeed?: any
  languageMode?: {
    code?: string
    name?: string
    nativeName?: string
    needsTranslation?: boolean
  } | null
}) {
  const log = p.log || console.log
  log('Starting GenUI orchestrator...')
  const startedAt = Date.now()

  const route = '/'
  const ctx = p.sessionCtx
  const tagline = p.siteSpec?.tagline || p.siteSpec?.metadata?.description || ''
  const specThemeName =
    typeof p.siteSpec?.theme === 'string' ? p.siteSpec.theme : null
  const forcedLocale =
    typeof p.languageMode?.code === 'string' && p.languageMode.code.trim()
      ? p.languageMode.code.trim().toLowerCase()
      : null

  let localeName = forcedLocale || 'en'
  const brandSoFar = projectTitle(p.siteSpec, p.prompt)

  const onEvent = (event: GenUIEvent) => {
    if (event.type === 'theme') {
      log(`  genui: theme → ${event.name}`)
    } else if (event.type === 'locale') {
      if (!forcedLocale) localeName = event.code
      log(`  genui: locale → ${event.code}`)
    } else if (event.type === 'status') log(`  genui: ${event.message}`)
    else if (event.type === 'plan')
      log(`  genui: pages → ${event.ids.join(', ')}`)
    else if (event.type === 'module') log(`  genui: page ${event.id} ready`)
  }

  // The orchestrator can emit partial source while it is assembling the page.
  // Do not expose that partial source as the preview: it renders with interim
  // skeleton/theme state and can be captured by thumbnails before final colors
  // are applied. The completed source is persisted and broadcast below.
  const onSource = (accumulated: string) => {
    if (!accumulated.trim()) return
  }

  const result = await runHomepageOrchestrator({
    prompt: p.prompt,
    preferredLanguage: forcedLocale || undefined,
    signal: new AbortController().signal,
    onEvent,
    onSource,
  })

  const source = result.source
  const brand = result.brand || brandSoFar
  // The AI-picked theme name drives the preview palette (renderers/index.ts reads
  // it back from the site spec and applies the matching designed preset).
  const theme = result.theme || specThemeName || 'modern-minimal'
  // The LLM-decided descriptive site title (e.g. "Kaveri Silks — Premium Sarees")
  // takes priority over the heuristic titleFromPrompt. Falls back to brandSoFar.
  const title = result.title || brandSoFar
  // Deterministic override: an explicit language keyword in the prompt ("hinglish",
  // "roman hindi", "tamil english mix", …) is authoritative over the small planner
  // LLM's guess, which is unreliable at picking the variant codes.
  const promptLocale =
    preferRomanizedBcp47FromSnippet(p.prompt) ||
    preferMixedEnglishBcp47FromSnippet(p.prompt)
  const locale =
    promptLocale || forcedLocale || result.locale || localeName || 'en'
  const project = {
    brand,
    projectName: title,
    tagline,
    theme,
    locale,
    skeleton: '',
    modules: { home: source },
  }

  // Finalize: persist the complete program + shell (for reload), then close the
  // stream so the client locks in the final, fully-merged source.
  writeFileSync(join(p.workspace, HOME_OPENUI_FILE), source)
  upsertManifest(p.workspace, route, title, HOME_OPENUI_FILE)
  saveSiteSpec(p.workspace, project)
  await renderPreviewToWorkspace(project, p.workspace)

  // Capture elapsed AFTER persistence + preview render so this logged number
  // covers the same span the runner stores as `elapsed` (the gallery time) —
  // otherwise the terminal `genui: … in Xs` undercounts vs the gallery badge.
  const ms = Date.now() - startedAt

  // Server-side render final HTML
  const { html: renderedFinalHtml, cssVars: themeCssVars } =
    (await renderOpenUIToHTMLWithTheme(
      source,
      undefined,
      locale,
      undefined,
    )) as OpenUIRenderResult
  let finalHtml = renderedFinalHtml
  if (p.languageMode?.needsTranslation) {
    try {
      const previewPath = join(p.workspace, 'index.html')
      if (existsSync(previewPath)) {
        const translatedPreview = await translateHtml(
          readFileSync(previewPath, 'utf-8'),
          p.languageMode,
        )
        if (translatedPreview?.content && !translatedPreview.error) {
          writeFileSync(previewPath, translatedPreview.content)
        }
      }
      const translatedFinal = await translateHtml(
        renderedFinalHtml,
        p.languageMode,
      )
      if (translatedFinal?.content && !translatedFinal.error) {
        finalHtml = translatedFinal.content
        log(`  genui: translated preview to ${p.languageMode.code}`)
      } else {
        log(
          `  genui: translation skipped — ${translatedFinal?.error ?? 'empty response'}`,
        )
      }
    } catch (error: any) {
      log(`  genui: translation error — ${error?.message || String(error)}`)
    }
  }

  ctx?.broadcast?.({
    type: 'openui_stream_done',
    route,
    source,
    html: finalHtml,
    cssVars: themeCssVars,
    locale,
  })
  ctx?.broadcast?.({ type: 'preview_reload', at: Date.now() })
  p.sessionCtx?.signalOpenuiReady?.()
  log(
    `  genui: ${source.length} chars, theme=${theme}, locale=${locale}, title=${title} in ${(ms / 1000).toFixed(1)}s`,
  )

  return {
    source,
    chars: source.length,
    inputTokens: 0,
    outputTokens: 0,
    cost: 0,
    model: 'genui-orchestrator',
    theme,
    ms,
  }
}

export async function generateAndWriteOpenUIPage(p: {
  workspace: string
  siteSpec: any
  prompt: string
  page: any
  log?: (msg: string) => void
  sessionCtx?: any
  variationSeed?: any
}) {
  const route = p.page?.route || '/'
  if (route === '/') {
    return generateAndWriteOpenUIHome(p)
  }

  const pageId = p.page.id || slug(p.page.title || p.page.name || 'page')
  const file = join(OPENUI_PAGES_DIR, `${pageId}.openui`)
  const fullPath = join(p.workspace, file)

  if (existsSync(fullPath)) {
    const source = readFileSync(fullPath, 'utf-8')
    await simulateStream(p.sessionCtx, route, source)
    return {
      source,
      chars: source.length,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0,
    }
  }

  throw new Error(
    `OpenUI page source is missing for route "${route}" at ${file}`,
  )
}

export function readOpenUIHomeFile(workspace: string): string | null {
  const p = join(workspace, HOME_OPENUI_FILE)
  if (!existsSync(p)) return null
  try {
    return readFileSync(p, 'utf8')
  } catch {
    return null
  }
}
