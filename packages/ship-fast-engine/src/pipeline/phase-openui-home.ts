import { join } from 'node:path'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { runHomepageOrchestrator } from '../genui/run.ts'
import { renderPreviewToWorkspace, writeStreamingShellToWorkspace } from '../renderers/index.ts'
import { saveSiteSpec } from '../spec/index.ts'

const HOME_OPENUI_FILE = 'home.openui'
const OPENUI_PAGES_DIR = 'pages'
const OPENUI_MANIFEST_FILE = 'openui-manifest.json'

function upsertManifest(workspace: string, route: string, title: string, file: string) {
  const manifestPath = join(workspace, OPENUI_MANIFEST_FILE)
  let manifest: any = { version: 1, generatedAt: new Date().toISOString(), home: HOME_OPENUI_FILE, pages: [] }
  if (existsSync(manifestPath)) {
    try {
      manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'))
    } catch {
      // Ignore
    }
  }
  if (!manifest.pages) manifest.pages = []
  manifest.pages = manifest.pages.filter((p: any) => p.route !== route)
  manifest.pages.push({
    route,
    title,
    file,
    ready: true
  })
  manifest.generatedAt = new Date().toISOString()
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
}

function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

async function simulateStream(
  sessionCtx: any,
  route: string,
  fullText: string
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
      source: accumulated
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
}) {
  const log = p.log || console.log
  log('Starting GenUI orchestrator...')
  const startedAt = Date.now()

  const route = '/'
  const ctx = p.sessionCtx
  const tagline = p.siteSpec?.tagline || p.siteSpec?.metadata?.description || ''
  const specThemeName = typeof p.siteSpec?.theme === 'string' ? p.siteSpec.theme : null

  // Live stream: stand up the themed host shell the moment the first statement
  // (the skeleton) lands — so the preview iframe mounts and subscribes — then push
  // the FULL accumulated program on every page, so each page pops into the preview
  // as it finishes generating instead of after the whole run completes.
  let themeName: string | null = null
  let shellWritten = false
  const brandSoFar = projectTitle(p.siteSpec, p.prompt)

  const writeShell = () => {
    const theme = themeName || specThemeName || 'modern-minimal'
    // Persist the theme, then write ONLY the host shell — NOT home.openui. Writing
    // the artifact now would make the island's mount-time GET succeed and settle,
    // and the WS stream would then be ignored (settledRef short-circuits it). The
    // island streams the assembling program over the socket; home.openui is
    // persisted at the end, for reload.
    saveSiteSpec(p.workspace, { brand: brandSoFar, tagline, theme, skeleton: '', modules: {} })
    writeStreamingShellToWorkspace(p.workspace, brandSoFar, theme)
  }

  const onEvent = (event: any) => {
    if (event.type === 'theme') {
      themeName = event.name
      log(`  genui: theme → ${event.name}`)
    } else if (event.type === 'status') log(`  genui: ${event.message}`)
    else if (event.type === 'plan') log(`  genui: pages → ${event.ids.join(', ')}`)
    else if (event.type === 'module') log(`  genui: page ${event.id} ready`)
  }

  // Fires with the full accumulated program every time a statement lands.
  const onSource = (accumulated: string) => {
    if (!accumulated.trim()) return
    if (!shellWritten) {
      // First statement: write the themed shell + tell the dashboard to mount the
      // preview, then open the stream so the client island takes over rendering.
      writeShell()
      shellWritten = true
      ctx?.broadcast?.({ type: 'openui_stream_start', route })
      ctx?.signalHomepageReady?.()
    }
    ctx?.broadcast?.({ type: 'openui_stream_chunk', route, source: accumulated })
  }

  const result = await runHomepageOrchestrator({
    prompt: p.prompt,
    signal: new AbortController().signal,
    onEvent,
    onSource,
  })

  const source = result.source
  const brand = result.brand || brandSoFar
  // The AI-picked theme name drives the preview palette (renderers/index.ts reads
  // it back from the site spec and applies the matching designed preset).
  const theme = result.theme || themeName || specThemeName || 'modern-minimal'
  const ms = Date.now() - startedAt
  const project = { brand, tagline, theme, skeleton: '', modules: { home: source } }

  // Finalize: persist the complete program + shell (for reload), then close the
  // stream so the client locks in the final, fully-merged source.
  writeFileSync(join(p.workspace, HOME_OPENUI_FILE), source)
  upsertManifest(p.workspace, route, 'Home', HOME_OPENUI_FILE)
  saveSiteSpec(p.workspace, project)
  renderPreviewToWorkspace(project, p.workspace)

  ctx?.broadcast?.({ type: 'openui_stream_done', route, source })
  ctx?.broadcast?.({ type: 'preview_reload', at: Date.now() })
  p.sessionCtx?.signalOpenuiReady?.()
  log(`  genui: ${source.length} chars, theme=${theme} in ${(ms / 1000).toFixed(1)}s`)

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
  
  const pagesDir = join(p.workspace, OPENUI_PAGES_DIR)
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
      cost: 0
    }
  }
  
  throw new Error(`OpenUI page source is missing for route "${route}" at ${file}`)
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
