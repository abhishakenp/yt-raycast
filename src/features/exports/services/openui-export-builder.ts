import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createParser, jsonToOpenUI, type ElementNode } from '@openuidev/lang-core'
import { library } from '@ship-fast/blocks'
import { renderOpenUIToHTMLWithTheme } from '@ship-fast/engine/openui-ssr.js'
import { zipSync, strToU8 } from 'fflate'

import { preprocessOpenUIResponse } from '@ship-fast/engine'
import { resolveThemeStyles } from '@/genui/theme-apply'
import type { ThemeStyles } from '@/genui/theme-presets'
import { buildHtmlExport } from './html-export-builder'

export type ExportTarget = 'html' | 'react' | 'next'

export type OpenUIExportInput = {
  source: string
  siteSpecJson?: string
  previewHtml?: string
  sessionId: string
  target: ExportTarget
  themeName?: string
  isDark?: boolean
}

export type BuiltExport = {
  body: string | Uint8Array
  contentType: string
  filename: string
  fileCount: number
}

type ParsedOpenUIProgram = {
  root: ElementNode
  routes: string[]
  pages: ElementNode[]
  projectName: string
}

const textDecoder = new TextDecoder()
const cssPath = join(process.cwd(), 'public', 'styles', 'openui-preview-tailwind.css')

const readPreviewCss = (): string => {
  try {
    return readFileSync(cssPath, 'utf8')
  } catch {
    return ''
  }
}

const toProjectSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'ship-fast-export'

const parseSiteSpec = (siteSpecJson: string | undefined): Record<string, unknown> => {
  if (!siteSpecJson) return {}
  try {
    const parsed = JSON.parse(siteSpecJson) as unknown
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {}
  } catch {
    return {}
  }
}

const readProjectName = (siteSpec: Record<string, unknown>, fallback: string): string => {
  const candidates = [
    siteSpec.projectName,
    siteSpec.brand,
    (siteSpec.seo as { siteName?: unknown } | undefined)?.siteName,
  ]
  const match = candidates.find((value): value is string => typeof value === 'string' && value.trim().length > 0)
  return match?.trim() || fallback
}

const readThemeName = (siteSpec: Record<string, unknown>, requestedThemeName?: string): string | undefined => {
  if (requestedThemeName) return requestedThemeName
  const theme = siteSpec.themeName ?? siteSpec.genuiTheme ?? siteSpec.theme
  return typeof theme === 'string' ? theme : undefined
}

const themeVarKeys = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'font-sans',
  'font-serif',
  'font-mono',
  'radius',
  'shadow-color',
  'shadow-opacity',
  'shadow-blur',
  'shadow-spread',
  'shadow-offset-x',
  'shadow-offset-y',
  'letter-spacing',
  'spacing',
] as const

const buildThemeStyle = (styles: ThemeStyles | null, isDark: boolean): string => {
  if (!styles) return ''
  const merged = { ...styles.light, ...(isDark ? styles.dark : {}) }
  return themeVarKeys
    .flatMap((key) => {
      const value = merged[key]
      return value == null ? [] : [`--${key}: ${String(value)};`]
    })
    .join(' ')
}

const buildThemeFontLinks = (styles: ThemeStyles | null): string => {
  if (!styles) return ''
  const systemFontRe =
    /^(ui-|system|-apple|blinkmac|segoe|roboto$|helvetica|arial|sans-serif|serif|monospace|menlo|consolas|courier|georgia|cambria|times)/i
  const families = new Set<string>()
  for (const variant of [styles.light, styles.dark]) {
    for (const key of ['font-sans', 'font-serif', 'font-mono'] as const) {
      const raw = variant[key]
      if (typeof raw !== 'string') continue
      const first = raw.split(',')[0]?.trim().replace(/^["']|["']$/g, '')
      if (first && !systemFontRe.test(first)) families.add(first)
    }
  }
  if (families.size === 0) return ''
  const params = [...families]
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`)
    .join('&')
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${params}&display=swap" />`
}

const stringifyJs = (value: unknown): string =>
  JSON.stringify(value).replaceAll('<', '\\u003c').replaceAll('\u2028', '\\u2028').replaceAll('\u2029', '\\u2029')

const assertNoOpenUIInternals = (files: Record<string, string>): void => {
  const forbidden = ['@openuidev', 'defineComponent', 'Renderer', '.openui']
  for (const [name, content] of Object.entries(files)) {
    for (const token of forbidden) {
      if (name.includes(token) || content.includes(token)) {
        throw new Error(`Export contains private OpenUI internals: ${token}`)
      }
    }
  }
}

export function parseOpenUIForExport(source: string, siteSpecJson?: string): ParsedOpenUIProgram {
  const cleaned = preprocessOpenUIResponse(source, { resolveRefs: false })
  const parser = createParser(library.toJSONSchema(), 'root')
  const result = parser.parse(cleaned)

  if (result.root === null) {
    throw new Error('OpenUI source did not produce a root element')
  }
  if (result.meta.incomplete) {
    throw new Error('OpenUI source is incomplete')
  }
  if (result.meta.unresolved.length > 0) {
    throw new Error(`OpenUI source has unresolved references: ${result.meta.unresolved.join(', ')}`)
  }
  const unknown = result.meta.errors.filter((error) => error.code === 'unknown-component')
  if (unknown.length > 0) {
    throw new Error(`OpenUI source uses unknown components: ${unknown.map((error) => error.component).join(', ')}`)
  }

  const rawRoutes = result.root.typeName === 'PageSwitch' ? result.root.props.routes : undefined
  const rawPages = result.root.typeName === 'PageSwitch' ? result.root.props.pages : undefined
  const routes = Array.isArray(rawRoutes)
    ? rawRoutes.filter((route): route is string => typeof route === 'string' && route.trim().length > 0)
    : ['Home']
  const pages = Array.isArray(rawPages)
    ? rawPages.filter((page): page is ElementNode => Boolean(page) && typeof page === 'object' && (page as ElementNode).type === 'element')
    : [result.root]
  const siteSpec = parseSiteSpec(siteSpecJson)

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: pages.length > 0 ? pages : [result.root],
    projectName: readProjectName(siteSpec, routes[0] ?? 'Generated Site'),
  }
}

const renderPageHtml = (page: ElementNode): string => {
  const pageSource = jsonToOpenUI(page, library)
  const { html } = renderOpenUIToHTMLWithTheme(pageSource, undefined, 'en', undefined) as {
    html: string
    cssVars: string
  }
  return html
}

const buildRouteScript = (routes: string[]): string => `
(function () {
  var routes = ${stringifyJs(routes)};
  var current = 0;
  function normalize(value) { return String(value || '').trim().toLowerCase(); }
  function findRoute(label) {
    var t = normalize(label);
    if (!t) return -1;
    var exact = routes.findIndex(function (route) { return normalize(route) === t; });
    if (exact >= 0) return exact;
    var pairs = [
      [/shop|store|product|buy|cart|order|browse|collection/, /shop|store|product|collection|menu|work|gallery/],
      [/price|plan|pricing|subscribe|upgrade|tier/, /pric|plan/],
      [/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register/, /contact|book|reserve|demo|start|join/],
      [/about|story|team|who we are|mission/, /about|team|story/],
      [/blog|news|post|article|read|stories|journal/, /blog|news|post|article|stories/],
      [/feature|service|how it works|learn|explore|tour/, /feature|service|how/]
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (!pairs[i][0].test(t)) continue;
      var idx = routes.findIndex(function (route) { return pairs[i][1].test(normalize(route)); });
      if (idx >= 0) return idx;
    }
    return 0;
  }
  function show(index) {
    if (index < 0 || index >= routes.length) return;
    current = index;
    document.querySelectorAll('[data-sf-export-page]').forEach(function (page, pageIndex) {
      page.hidden = pageIndex !== current;
    });
  }
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('button,a') : null;
    if (!target) return;
    var idx = findRoute(target.textContent);
    if (idx < 0) return;
    event.preventDefault();
    show(idx);
  });
  document.addEventListener('submit', function (event) { event.preventDefault(); });
  show(0);
})();`

const buildPagesMarkup = (parsed: ParsedOpenUIProgram): string =>
  parsed.pages
    .map((page, index) => {
      const label = parsed.routes[index] ?? `Page ${index + 1}`
      return `<section data-sf-export-page="${escapeHtml(label)}"${index === 0 ? '' : ' hidden'}>${renderPageHtml(page)}</section>`
    })
    .join('\n')

const buildStandaloneHtmlDocument = (input: OpenUIExportInput, parsed: ParsedOpenUIProgram): string => {
  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const themeName = readThemeName(siteSpec, input.themeName)
  const isDark = input.isDark ?? true
  const themeStyles = resolveThemeStyles(themeName)
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const themeFontLinks = buildThemeFontLinks(themeStyles)
  const { cssVars } = renderOpenUIToHTMLWithTheme(input.source, undefined, 'en', undefined) as {
    html: string
    cssVars: string
  }
  const css = readPreviewCss()
  const pagesMarkup = buildPagesMarkup(parsed)

  return buildHtmlExport(`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(parsed.projectName)}</title>
  ${themeFontLinks}
  <style>
${css}
    :root { ${themeStyle} }
    #openui-root { ${cssVars || ''} ${themeStyle} }
    html, body { min-height: 100%; margin: 0; background: var(--background); color: var(--foreground); }
  </style>
</head>
<body class="min-h-screen bg-background text-foreground">
  <div id="openui-root" class="genui-preview size-full bg-background${isDark ? ' dark' : ''}" style="${escapeAttribute(`${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}`)}">${pagesMarkup || input.previewHtml || ''}</div>
  <script>
    window.__SHIP_FAST_EXPORT__ = ${stringifyJs({ routes: parsed.routes, projectName: parsed.projectName, themeName, mode: isDark ? 'dark' : 'light' })};
    ${buildRouteScript(parsed.routes)}
  </script>
</body>
</html>`, { includeBadge: true })
}

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const escapeAttribute = escapeHtml

const renderReactPackageJson = (projectName: string): string =>
  JSON.stringify(
    {
      name: toProjectSlug(projectName),
      private: true,
      version: '0.0.0',
      type: 'module',
      packageManager: 'bun@1.2.5',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview',
      },
      dependencies: {
        '@vitejs/plugin-react': '^6.0.1',
        vite: '^8.0.0',
        typescript: '^6.0.2',
        react: '^19.2.0',
        'react-dom': '^19.2.0',
      },
      devDependencies: {},
    },
    null,
    2,
  )

const renderNextPackageJson = (projectName: string): string =>
  JSON.stringify(
    {
      name: toProjectSlug(projectName),
      private: true,
      version: '0.0.0',
      packageManager: 'bun@1.2.5',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        next: '^14.2.15',
        react: '^19.2.0',
        'react-dom': '^19.2.0',
      },
      devDependencies: {},
    },
    null,
    2,
  )

const renderHydratedApp = (documentHtml: string, projectName: string): string => {
  const bodyMatch = documentHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const rawBody = bodyMatch?.[1] ?? documentHtml
  const body = rawBody.replace(/<script\b[\s\S]*?<\/script>/gi, '')
  return `import { useEffect } from 'react'

const exportedHtml = ${JSON.stringify(body)}

export default function App() {
  useEffect(() => {
    const routes = Array.from(document.querySelectorAll('[data-sf-export-page]')).map((page) => page.getAttribute('data-sf-export-page') || '')
    const normalize = (value) => String(value || '').trim().toLowerCase()
    const findRoute = (label) => {
      const t = normalize(label)
      const exact = routes.findIndex((route) => normalize(route) === t)
      if (exact >= 0) return exact
      const pairs = [
        [/shop|store|product|buy|cart|order|browse|collection/, /shop|store|product|collection|menu|work|gallery/],
        [/price|plan|pricing|subscribe|upgrade|tier/, /pric|plan/],
        [/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register/, /contact|book|reserve|demo|start|join/],
        [/about|story|team|who we are|mission/, /about|team|story/],
        [/blog|news|post|article|read|stories|journal/, /blog|news|post|article|stories/],
        [/feature|service|how it works|learn|explore|tour/, /feature|service|how/],
      ]
      for (const [source, routeMatch] of pairs) {
        if (!source.test(t)) continue
        const idx = routes.findIndex((route) => routeMatch.test(normalize(route)))
        if (idx >= 0) return idx
      }
      return -1
    }
    const show = (index) => {
      document.querySelectorAll('[data-sf-export-page]').forEach((page, pageIndex) => {
        page.hidden = pageIndex !== index
      })
    }
    const onClick = (event) => {
      const target = event.target instanceof Element ? event.target.closest('button,a') : null
      if (!target) return
      const idx = findRoute(target.textContent)
      if (idx < 0) return
      event.preventDefault()
      show(idx)
    }
    const onSubmit = (event) => event.preventDefault()
    document.addEventListener('click', onClick)
    document.addEventListener('submit', onSubmit)
    show(0)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('submit', onSubmit)
    }
  }, [])

  return (
    <main
      aria-label=${JSON.stringify(projectName)}
      dangerouslySetInnerHTML={{ __html: exportedHtml }}
    />
  )
}
`
}

const renderReadme = (projectName: string, target: 'react' | 'next'): string => {
  const commands =
    target === 'react'
      ? ['bun install', 'bun dev', 'bun run build', 'bun run preview']
      : ['bun install', 'bun dev', 'bun run build', 'bun run start']

  return `# ${projectName}

This export was generated by Ship Fast from a private server-side source format.

## Run locally

\`\`\`bash
${commands.join('\n')}
\`\`\`

The downloaded project does not include Ship Fast's internal OpenUI source or renderer.
`
}

const zipFiles = (files: Record<string, string>): Uint8Array => {
  assertNoOpenUIInternals(files)
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)])),
    { level: 9 },
  )
}

const buildReactExport = (documentHtml: string, parsed: ParsedOpenUIProgram): BuiltExport => {
  const css = readPreviewCss()
  const files = {
    'package.json': renderReactPackageJson(parsed.projectName),
    'index.html': '<!doctype html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Ship Fast Export</title></head><body><div id="root"></div><script type="module" src="/src/main.jsx"></script></body></html>\n',
    'src/main.jsx': "import React from 'react'\nimport { createRoot } from 'react-dom/client'\nimport App from './App.jsx'\nimport './styles.css'\n\ncreateRoot(document.getElementById('root')).render(<App />)\n",
    'src/App.jsx': renderHydratedApp(documentHtml, parsed.projectName),
    'src/styles.css': css,
    'README.md': renderReadme(parsed.projectName, 'react'),
  }

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-react.zip`,
    fileCount: Object.keys(files).length,
  }
}

const buildNextExport = (documentHtml: string, parsed: ParsedOpenUIProgram): BuiltExport => {
  const bodyMatch = documentHtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const body = bodyMatch?.[1] ?? documentHtml
  const files = {
    'package.json': renderNextPackageJson(parsed.projectName),
    'next.config.mjs': '/** @type {import("next").NextConfig} */\nconst nextConfig = {}\n\nexport default nextConfig\n',
    'app/layout.jsx': `import './globals.css'\n\nexport const metadata = { title: ${JSON.stringify(parsed.projectName)} }\n\nexport default function RootLayout({ children }) {\n  return <html lang="en"><body>{children}</body></html>\n}\n`,
    'app/page.jsx': `const exportedHtml = ${JSON.stringify(body)}\n\nexport default function Page() {\n  return <main aria-label=${JSON.stringify(parsed.projectName)} dangerouslySetInnerHTML={{ __html: exportedHtml }} />\n}\n`,
    'app/globals.css': readPreviewCss(),
    'README.md': renderReadme(parsed.projectName, 'next'),
  }

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-next.zip`,
    fileCount: Object.keys(files).length,
  }
}

export function buildOpenUIExport(input: OpenUIExportInput): BuiltExport {
  const parsed = parseOpenUIForExport(input.source, input.siteSpecJson)
  const documentHtml = buildStandaloneHtmlDocument(input, parsed)

  if (input.target === 'html') {
    return {
      body: documentHtml,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  return input.target === 'react'
    ? buildReactExport(documentHtml, parsed)
    : buildNextExport(documentHtml, parsed)
}

export const decodeExportBody = (body: string | Uint8Array): string =>
  typeof body === 'string' ? body : textDecoder.decode(body)
