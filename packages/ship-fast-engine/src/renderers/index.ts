import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { resolveThemeStyles, THEME_CATALOG } from '@ship-fast/blocks'
import type { SiteSpecProject } from '../spec/index.ts'

const HOME_OPENUI_FILE = 'home.openui'

// --- Per-site visual identity --------------------------------------------------
// Registry modules use Tailwind token classes. During SSR we derive a
// prompt-specific palette + font pairing from generated content and remap
// Tailwind's neutral/accent scales in the document head.

function hashSeed(text: string): number {
  let h = 2166136261
  const s = String(text || '')
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

// The shadcn-style design-token CSS variables the registry sections consume
// (bg-primary, text-foreground, border-border, …).
const THEME_VAR_KEYS = [
  'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
  'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground', 'border', 'input', 'ring',
  'chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5',
  'sidebar', 'sidebar-foreground', 'sidebar-primary', 'sidebar-primary-foreground',
  'sidebar-accent', 'sidebar-accent-foreground', 'sidebar-border', 'sidebar-ring',
] as const

const THEME_STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'your', 'our', 'that', 'this', 'from', 'into', 'feel', 'vibe',
  'mood', 'default', 'best', 'fits', 'when', 'brand', 'brands', 'product', 'products', 'site',
  'app', 'homepage', 'page', 'build', 'create', 'website', 'palette', 'accent', 'primary',
])

function themeWords(text: string): string[] {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !THEME_STOP_WORDS.has(word))
}

function readSiteThemeName(workspace: string): string | null {
  try {
    const spec = JSON.parse(readFileSync(join(workspace, 'site-spec.json'), 'utf8'))
    const theme = spec?.theme
    if (typeof theme === 'string') return theme
    if (theme && typeof theme === 'object' && typeof theme.name === 'string') return theme.name
    return null
  } catch {
    return null
  }
}

// Pick a named theme (caffeine, elegant-luxury, cyberpunk, …) by matching the
// generated content against each theme's vibe description — the same designed
// presets the original engine uses. Honors an explicit theme name from the site
// spec; otherwise vibe-matches, falling back to a seeded pick for variety.
function pickThemeName(seedText: string, requested?: string | null): string {
  if (requested && THEME_CATALOG.some((t) => t.name === requested)) return requested
  const want = new Set(themeWords(seedText))
  const seed = hashSeed(seedText)
  let best = THEME_CATALOG[seed % THEME_CATALOG.length]?.name ?? 'modern-minimal'
  let bestScore = 0
  for (const entry of THEME_CATALOG) {
    let score = 0
    for (const word of themeWords(`${entry.label} ${entry.description}`)) {
      if (want.has(word)) score += 3
    }
    if (score > bestScore) {
      bestScore = score
      best = entry.name
    }
  }
  return best
}

function googleFontLink(styles: any): string {
  const families = new Set<string>()
  for (const key of ['font-sans', 'font-serif']) {
    const raw = styles?.light?.[key]
    if (typeof raw !== 'string') continue
    const first = raw.split(',')[0]?.trim().replace(/^["']|["']$/g, '')
    if (first && !/^(ui-|system|-apple|blinkmac|segoe|sans-serif|serif|monospace|georgia|arial|helvetica|times|menlo|consolas|courier)/i.test(first)) {
      families.add(first)
    }
  }
  if (!families.size) return ''
  const params = [...families]
    .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&')
  return `  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${params}&display=swap" rel="stylesheet">`
}

// Build the SSR <head> for a chosen theme: map shadcn color names + radius +
// fonts to the theme's CSS variables (so `bg-primary`/`text-foreground` resolve
// under the Tailwind CDN), then set those variables on :root. The rich registry
// sections then theme themselves with a designed, vibe-matched palette.
function buildThemeHead(seedText: string, requested?: string | null): string {
  const themeName = pickThemeName(seedText, requested)
  const styles = resolveThemeStyles(themeName)
  const light: Record<string, string> = (styles?.light as Record<string, string>) || {}
  const rootVars = THEME_VAR_KEYS
    .filter((key) => light[key] != null)
    .map((key) => `--${key}: ${light[key]};`)
    .join(' ')
  const radius = light['radius'] ? `--radius: ${light['radius']};` : '--radius: 0.5rem;'
  const fontSans = light['font-sans'] || 'ui-sans-serif, system-ui, sans-serif'
  const fontSerif = light['font-serif'] || 'Georgia, serif'
  const tailwindColors = JSON.stringify(
    Object.fromEntries(THEME_VAR_KEYS.map((key) => [key, `var(--${key})`])),
  )
  return `${googleFontLink(styles)}
  <script>
    window.tailwind = window.tailwind || {}
    tailwind.config = { theme: { extend: {
      colors: ${tailwindColors},
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
      fontFamily: { sans: [${JSON.stringify(fontSans)}], serif: [${JSON.stringify(fontSerif)}] }
    } } }
  </script>
  <style>
    :root { ${rootVars} ${radius} }
    body { font-family: ${fontSans}; background-color: var(--background); color: var(--foreground); }
  </style>`
}

/**
 * Server-side render the generated OpenUI program (home.openui) to a complete,
 * styled HTML document using the same Renderer + contract library the client
 * preview uses, with a per-site palette + typography injected so each site has a
 * distinct visual identity. Returns null on failure; callers must surface that
 * failure instead of writing a substitute homepage.
 */
function renderOpenUIHomeHtml(workspace: string, brand: string): string | null {
  const openuiPath = join(workspace, HOME_OPENUI_FILE)
  if (!existsSync(openuiPath)) return null
  let source = ''
  try {
    source = readFileSync(openuiPath, 'utf8')
  } catch {
    return null
  }
  if (!source.trim()) return null
  // Client-rendered preview (faithful to the original engine): emit a host shell
  // carrying the per-site theme variables; the OpenUI island (OpenUIPreviewClient
  // -> OpenUIViewer) fetches the generated program (authorized via the anon-owner
  // secret in localStorage) and renders the rich KimiPage blocks in the BROWSER,
  // where their hooks/effects work and PageSwitch enables multi-page navigation.
  const themeHead = buildThemeHead(`${brand}\n${source}`, readSiteThemeName(workspace))
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(brand)} - Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
${themeHead}
</head>
<body class="min-h-screen bg-background text-foreground">
  <div id="openui-root">${openUIPreviewBootHtml(brand)}</div>
  <script type="module" async src="/scripts/openui-island.js"></script>
</body>
</html>`
}

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function openUIPreviewBootHtml(brand: string): string {
  const title = escapeHtml(brand || 'Preview')
  return `<div class="sf-openui-boot" role="status" aria-live="polite">
    <style>
      .sf-openui-boot {
        min-height: 100dvh;
        display: grid;
        place-items: center;
        padding: 32px;
        background: var(--background, #050507);
        color: var(--foreground, #f8fafc);
        font: 500 14px/1.4 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }
      .sf-openui-boot__mark {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        opacity: 0.78;
      }
      .sf-openui-boot__dot {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: currentColor;
        animation: sf-openui-boot-pulse 900ms ease-in-out infinite alternate;
      }
      @keyframes sf-openui-boot-pulse {
        from { opacity: 0.35; transform: scale(0.8); }
        to { opacity: 0.9; transform: scale(1); }
      }
    </style>
    <span class="sf-openui-boot__mark"><span class="sf-openui-boot__dot" aria-hidden="true"></span>${title}</span>
  </div>`
}

function renderActions(actions: any[] = []): string {
  if (!Array.isArray(actions) || actions.length === 0) return ''
  return `<div class="mt-8 flex flex-wrap gap-3">${actions
    .map((action) => {
      const label = escapeHtml(action?.label || 'Learn more')
      const href = escapeHtml(action?.href || '#')
      const secondary = action?.style === 'secondary'
      const klass = secondary
        ? 'border border-white/15 bg-white/5 text-white hover:bg-white/10'
        : 'bg-emerald-400 text-zinc-950 hover:bg-emerald-300'
      return `<a class="rounded-full px-5 py-3 text-sm font-semibold transition ${klass}" href="${href}">${label}</a>`
    })
    .join('')}</div>`
}

function renderItems(items: any[] = []): string {
  if (!Array.isArray(items) || items.length === 0) return ''
  return `<div class="mt-8 grid gap-4 md:grid-cols-3">${items
    .slice(0, 9)
    .map((item) => {
      const title = escapeHtml(item?.title || item?.label || item?.value || 'Feature')
      const body = escapeHtml(item?.body || item?.quote || item?.price || item?.label || '')
      const value = item?.value ? `<p class="mb-2 text-3xl font-black text-emerald-300">${escapeHtml(item.value)}</p>` : ''
      const features = Array.isArray(item?.features)
        ? `<ul class="mt-4 space-y-2 text-sm text-zinc-300">${item.features
            .map((feature: unknown) => `<li>+ ${escapeHtml(feature)}</li>`)
            .join('')}</ul>`
        : ''
      return `<article class="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/20">${value}<h3 class="text-xl font-bold text-white">${title}</h3>${body ? `<p class="mt-3 text-sm leading-6 text-zinc-300">${body}</p>` : ''}${features}</article>`
    })
    .join('')}</div>`
}

function renderStaticHomepage(spec: any, brand: string, tagline: string): string {
  const home = Array.isArray(spec.pages) ? spec.pages[0] : null
  const sections = Array.isArray(home?.sections) ? home.sections : []
  const nav = sections.find((section: any) => section?.type === 'navbar')
  const links = Array.isArray(nav?.links) ? nav.links : []
  const bodySections = sections.filter((section: any) => section?.type !== 'navbar' && section?.type !== 'footer')

  return `
    <header class="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
      <a href="/" class="text-sm font-black uppercase tracking-[0.32em] text-white">${escapeHtml(brand)}</a>
      <nav class="hidden items-center gap-5 text-sm text-zinc-300 md:flex">
        ${links
          .slice(0, 6)
          .map((link: any) => `<a class="hover:text-white" href="${escapeHtml(link?.href || '#')}">${escapeHtml(link?.label || 'Link')}</a>`)
          .join('')}
      </nav>
    </header>
    <main>
      <section class="mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.1fr_0.9fr] md:py-24">
        <div>
          <p class="mb-5 inline-flex rounded-full border border-emerald-300/30 bg-emerald-300/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.24em] text-emerald-200">Generated preview</p>
          <h1 class="text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl">${escapeHtml(brand)}</h1>
          <p class="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">${escapeHtml(tagline)}</p>
          ${renderActions(sections.find((section: any) => section?.type === 'hero')?.actions || nav?.actions || [])}
        </div>
        <div class="rounded-[2rem] border border-white/10 bg-gradient-to-br from-violet-500/20 via-zinc-900 to-emerald-400/20 p-6 shadow-2xl shadow-emerald-950/30">
          <div class="rounded-3xl bg-zinc-950/80 p-5">
            <div class="mb-4 h-3 w-24 rounded-full bg-emerald-300"></div>
            <div class="space-y-3">
              <div class="h-12 rounded-2xl bg-white/10"></div>
              <div class="h-12 rounded-2xl bg-white/10"></div>
              <div class="h-12 rounded-2xl bg-white/10"></div>
            </div>
          </div>
        </div>
      </section>
      ${bodySections
        .filter((section: any) => section?.type !== 'hero')
        .map((section: any) => {
          const headline = escapeHtml(section?.headline || section?.title || section?.type || '')
          const body = escapeHtml(section?.body || section?.subheadline || '')
          return `<section id="${escapeHtml(section?.id || '')}" class="mx-auto w-full max-w-6xl px-6 py-12">
            ${headline ? `<h2 class="text-3xl font-black tracking-tight text-white md:text-5xl">${headline}</h2>` : ''}
            ${body ? `<p class="mt-4 max-w-3xl text-zinc-300">${body}</p>` : ''}
            ${renderItems(section?.items || [])}
            ${renderActions(section?.actions || [])}
          </section>`
        })
        .join('')}
    </main>`
}

export function renderProject(siteSpec: SiteSpecProject, target: string, session?: any) {
  const files: Record<string, string> = {}
  const spec: any = siteSpec
  const brand = spec.brand || spec.projectName || 'Generated Site'
  const tagline =
    spec.tagline ||
    spec.pages?.[0]?.description ||
    spec.userPrompt ||
    'Generated with Ship Fast.'
  const theme =
    typeof spec.theme === 'string'
      ? spec.theme
      : spec.theme?.mood || spec.siteType || 'default'
  const modules =
    spec.modules && typeof spec.modules === 'object'
      ? spec.modules
      : Object.fromEntries(
          (Array.isArray(spec.pages) ? spec.pages : []).map((page: any, index: number) => [
            page.id || page.route || `page-${index + 1}`,
            page.title || page.name || page.route || `Page ${index + 1}`,
          ]),
        )
  const moduleNames = Object.keys(modules)

  files['site-spec.json'] = JSON.stringify(siteSpec, null, 2)
  files['README.md'] = `# ${brand}\n\n${tagline}\n\nThis project was generated with the **${theme}** theme.\n\n## Structure\n- Brand: ${brand}\n- Tagline: ${tagline}\n- Theme: ${theme}\n- Pages: ${moduleNames.join(', ')}\n`

  if (target === 'html') {
    files['index.html'] = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${brand} - Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="min-h-screen bg-[radial-gradient(circle_at_top_left,#312e81,transparent_35%),linear-gradient(135deg,#050506,#111827_55%,#052e2b)] text-zinc-50">
  ${renderStaticHomepage(spec, brand, tagline)}
</body>
</html>`
  } else if (target === 'react') {
    files['package.json'] = `{
  "name": "${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "@openuidev/react-lang": "^0.8.2",
    "@openuidev/react-ui": "^0.11.8"
  }
}`
    files['src/App.tsx'] = `import React from 'react';

export default function App() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>${brand}</h1>
      <p>${tagline}</p>
      <div style={{ marginTop: 20 }}>
        <h2>Theme</h2>
        <p>${theme}</p>
        <h2>Modules</h2>
        <ul>
          ${moduleNames.map(id => `<li key={id}>${id}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  );
}`
  } else if (target === 'nextjs') {
    files['package.json'] = `{
  "name": "${brand.toLowerCase().replace(/[^a-z0-9]/g, '-')}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "next": "^16.2.6"
  }
}`
    files['src/app/page.tsx'] = `import React from 'react';

export default function Page() {
  return (
    <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
      <h1>${brand}</h1>
      <p>${tagline}</p>
      <div style={{ marginTop: 20 }}>
        <h2>Theme</h2>
        <p>${theme}</p>
        <h2>Modules</h2>
        <ul>
          ${moduleNames.map(id => `<li key={id}>${id}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>
  );
}`
  } else {
    throw new Error(`Unsupported export target: ${target}`)
  }

  return { files }
}

export function writeRenderedFiles(baseDir: string, files: Record<string, string>) {
  for (const [relativePath, content] of Object.entries(files)) {
    const fullPath = join(baseDir, relativePath)
    mkdirSync(dirname(fullPath), { recursive: true })
    writeFileSync(fullPath, content)
  }
}

export function renderPreviewToWorkspace(siteSpec: SiteSpecProject, workspace: string, session?: any, options?: any) {
  const rendered = renderProject(siteSpec, 'html', session)
  const spec: any = siteSpec
  const brand = spec?.brand || spec?.projectName || 'Generated Site'
  const openuiHtml = renderOpenUIHomeHtml(workspace, brand)
  if (!openuiHtml) {
    throw new Error('OpenUI SSR failed; refusing to write a placeholder homepage.')
  }
  rendered.files['index.html'] = openuiHtml
  writeRenderedFiles(workspace, rendered.files)
  return rendered
}

/**
 * Write ONLY the client host shell (index.html) early — before home.openui exists —
 * so the preview iframe can mount and subscribe to the live stream while generation
 * is still running. We deliberately do NOT write home.openui here: if the artifact
 * were on disk, the island's mount-time GET would succeed and settle, and the WS
 * stream would then be ignored. The island streams the assembling program over the
 * socket; home.openui is persisted only at the end (for reload). The theme comes
 * from the site spec (written alongside), so the shell is correctly themed without
 * needing any program content as a seed.
 */
export function writeStreamingShellToWorkspace(
  workspace: string,
  brand: string,
  themeName: string | null,
) {
  const themeHead = buildThemeHead(String(brand || ''), themeName ?? readSiteThemeName(workspace))
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(brand)} - Preview</title>
  <script src="https://cdn.tailwindcss.com"></script>
${themeHead}
</head>
<body class="min-h-screen bg-background text-foreground">
  <div id="openui-root">${openUIPreviewBootHtml(brand)}</div>
  <script type="module" async src="/scripts/openui-island.js"></script>
</body>
</html>`
  writeRenderedFiles(workspace, { 'index.html': html })
}

export function writeNextAppToWorkspace(siteSpec: SiteSpecProject, workspace: string, session?: any, options?: any) {
  return renderPreviewToWorkspace(siteSpec, workspace, session, options)
}
