import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  createParser,
  jsonToOpenUI,
  type ElementNode,
} from '@openuidev/lang-core'
import { loadOpenUIRuntimeLibrary } from '@ship-fast/blocks/runtime'
import { renderOpenUIToHTMLWithTheme } from '@ship-fast/engine/openui-ssr.js'

import { preprocessOpenUIResponse } from '@ship-fast/engine'
import { resolveThemeStyles } from '@/genui/theme-apply'
import type { ThemeStyles } from '@/genui/theme-presets'
import { buildHtmlExport } from './html-export-builder'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'

type ParsedOpenUIProgram = {
  root: ElementNode
  routes: string[]
  pages: ElementNode[]
  projectName: string
  library: Awaited<ReturnType<typeof loadOpenUIRuntimeLibrary>>
}

const cssPath = join(
  process.cwd(),
  'public',
  'styles',
  'openui-preview-tailwind.css',
)

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

const readPreviewCss = (): string => {
  try {
    return readFileSync(cssPath, 'utf8')
  } catch {
    return ''
  }
}

const isUsablePreviewHtml = (html: string | undefined): html is string => {
  const trimmed = html?.trim()
  return Boolean(
    trimmed &&
      !/\bopenui-error\b/i.test(trimmed) &&
      !/failed to render/i.test(trimmed) &&
      !/\bship-fast-openui-source\b/i.test(trimmed) &&
      !/generated openui source is ready/i.test(trimmed),
  )
}

const isHtmlDocumentSource = (source: string): boolean => {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

const isHtmlLikeSource = (source: string): boolean => /<[^>]+>/.test(source)

const extractBodyMarkup = (html: string): string => {
  const trimmed = html.trim()
  const body = trimmed.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  const bodyMarkup = (body?.[1] ?? trimmed).trim()
  const root = bodyMarkup.match(
    /^<div\b(?=[^>]*\bid=(["'])openui-root\1)[^>]*>([\s\S]*)<\/div>$/i,
  )
  return (root?.[2] ?? bodyMarkup).trim()
}

const parseSiteSpec = (
  siteSpecJson: string | undefined,
): Record<string, unknown> => {
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

const readProjectName = (
  siteSpec: Record<string, unknown>,
  fallback: string,
): string => {
  const candidates = [
    siteSpec.projectName,
    siteSpec.brand,
    (siteSpec.seo as { siteName?: unknown } | undefined)?.siteName,
  ]
  const match = candidates.find(
    (value): value is string =>
      typeof value === 'string' && value.trim().length > 0,
  )
  return match?.trim() || fallback
}

const readThemeName = (
  siteSpec: Record<string, unknown>,
  requestedThemeName?: string,
): string | undefined => {
  if (requestedThemeName) return requestedThemeName
  const theme = siteSpec.themeName ?? siteSpec.genuiTheme ?? siteSpec.theme
  return typeof theme === 'string' ? theme : undefined
}

const readGenUIExportMetadata = (
  siteSpec: Record<string, unknown>,
): Record<string, unknown> | null => {
  const genui = siteSpec.genui
  return genui !== null && typeof genui === 'object' && !Array.isArray(genui)
    ? (genui as Record<string, unknown>)
    : null
}

const readGenUIAdminPolicy = (
  genui: Record<string, unknown> | null,
): Record<string, unknown> => {
  const policy = genui?.adminPolicy
  return policy !== null && typeof policy === 'object' && !Array.isArray(policy)
    ? (policy as Record<string, unknown>)
    : {}
}

const readGenUIAdminEmails = (
  genui: Record<string, unknown> | null,
): string[] => {
  const policy = readGenUIAdminPolicy(genui)
  const values = Array.isArray(policy.adminEmails)
    ? policy.adminEmails
    : typeof policy.ownerEmail === 'string'
      ? [policy.ownerEmail]
      : typeof genui?.ownerEmail === 'string'
        ? [genui.ownerEmail]
        : []
  return [
    ...new Set(
      values
        .filter((value): value is string => typeof value === 'string')
        .map((value) => value.trim().toLowerCase())
        .filter((value) => value.includes('@')),
    ),
  ]
}

const buildInlineAdminBootstrap = (
  genui: Record<string, unknown> | null,
  target: string,
): string => {
  if (genui === null) return ''
  const adminPolicy = readGenUIAdminPolicy(genui)
  return `
    window.__SHIP_FAST_ADMIN__ = ${stringifyJs({
      version: 1,
      target,
      authProvider:
        typeof adminPolicy.authProvider === 'string'
          ? adminPolicy.authProvider
          : 'shoo',
      adminEmails: readGenUIAdminEmails(genui),
      policy: adminPolicy,
    })};
    window.assertShipFastAdminAccess = function assertShipFastAdminAccess(email) {
      var normalized = String(email || '').trim().toLowerCase();
      var allowed = (window.__SHIP_FAST_ADMIN__.adminEmails || []);
      if (!normalized || allowed.indexOf(normalized) === -1) {
        throw new Error('Ship Fast admin access denied for this email.');
      }
      return { email: normalized, role: normalized === allowed[0] ? 'owner' : 'editor' };
    };`
}

const buildThemeStyle = (
  styles: ThemeStyles | null,
  isDark: boolean,
): string => {
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
      const first = raw
        .split(',')[0]
        ?.trim()
        .replace(/^["']|["']$/g, '')
      if (first && !systemFontRe.test(first)) families.add(first)
    }
  }
  if (families.size === 0) return ''
  const params = [...families]
    .map(
      (family) =>
        `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;600;700`,
    )
    .join('&')
  return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${params}&display=swap" />`
}

const stringifyJs = (value: unknown): string =>
  JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const escapeAttribute = escapeHtml

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

const absolutizeHtmlAssetUrls = (html: string): string =>
  html.replaceAll('="/api/pexels?', '="https://ship-fast.io/api/pexels?')

export async function parseOpenUIForHtmlExport(
  source: string,
  siteSpecJson?: string,
): Promise<ParsedOpenUIProgram> {
  const cleaned = preprocessOpenUIResponse(source, { resolveRefs: false })
  const library = await loadOpenUIRuntimeLibrary(cleaned)
  const parser = createParser(library.toJSONSchema(), 'root')
  const result = parser.parse(cleaned)

  if (result.root === null) {
    throw new Error('OpenUI source did not produce a root element')
  }
  if (result.meta.incomplete) {
    throw new Error('OpenUI source is incomplete')
  }
  if (result.meta.unresolved.length > 0) {
    throw new Error(
      `OpenUI source has unresolved references: ${result.meta.unresolved.join(', ')}`,
    )
  }
  const unknown = result.meta.errors.filter(
    (error) => error.code === 'unknown-component',
  )
  if (unknown.length > 0) {
    throw new Error(
      `OpenUI source uses unknown components: ${unknown.map((error) => error.component).join(', ')}`,
    )
  }

  const rawRoutes =
    result.root.typeName === 'PageSwitch' ? result.root.props.routes : undefined
  const rawPages =
    result.root.typeName === 'PageSwitch' ? result.root.props.pages : undefined
  const routes = Array.isArray(rawRoutes)
    ? rawRoutes.filter(
        (route): route is string =>
          typeof route === 'string' && route.trim().length > 0,
      )
    : ['Home']
  const pages = Array.isArray(rawPages)
    ? rawPages.filter(
        (page): page is ElementNode =>
          Boolean(page) &&
          typeof page === 'object' &&
          (page as ElementNode).type === 'element',
      )
    : [result.root]
  const siteSpec = parseSiteSpec(siteSpecJson)

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: pages.length > 0 ? pages : [result.root],
    projectName: readProjectName(siteSpec, routes[0] ?? 'Generated Site'),
    library,
  }
}

const renderPageHtml = async (
  page: ElementNode,
  library: ParsedOpenUIProgram['library'],
): Promise<string> => {
  const pageSource = jsonToOpenUI(page, library)
  const { html } = (await renderOpenUIToHTMLWithTheme(
    pageSource,
    undefined,
    'en',
    undefined,
  )) as {
    html: string
    cssVars: string
  }
  return html
}

const buildPagesMarkup = async (parsed: ParsedOpenUIProgram): Promise<string> =>
  (
    await Promise.all(
      parsed.pages.map(async (page, index) => {
        const label = parsed.routes[index] ?? `Page ${index + 1}`
        return `<section data-sf-export-page="${escapeHtml(label)}"${index === 0 ? '' : ' hidden'}>${await renderPageHtml(page, parsed.library)}</section>`
      }),
    )
  ).join('\n')

const buildStandaloneHtmlDocument = async (
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): Promise<string> => {
  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const themeName = readThemeName(siteSpec, input.themeName)
  const isDark = input.isDark ?? true
  const themeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const themeFontLinks = buildThemeFontLinks(themeStyles)
  const { cssVars } = (await renderOpenUIToHTMLWithTheme(
    input.source,
    undefined,
    'en',
    undefined,
  )) as {
    html: string
    cssVars: string
  }
  const css = readPreviewCss()
  const pagesMarkup = absolutizeHtmlAssetUrls(await buildPagesMarkup(parsed))
  const bodyMarkup = isUsablePreviewHtml(input.previewHtml)
    ? extractBodyMarkup(input.previewHtml)
    : pagesMarkup
  const genui = readGenUIExportMetadata(siteSpec)

  return buildHtmlExport(
    `<!doctype html>
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
  <div id="openui-root" class="genui-preview size-full bg-background${isDark ? ' dark' : ''}" style="${escapeAttribute(`${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}`)}">${bodyMarkup}</div>
  <script>
    window.__SHIP_FAST_EXPORT__ = ${stringifyJs({ routes: parsed.routes, projectName: parsed.projectName, themeName, mode: isDark ? 'dark' : 'light', genui })};
    ${buildInlineAdminBootstrap(genui, input.target)}
    ${buildRouteScript(parsed.routes)}
  </script>
</body>
</html>`,
    { includeBadge: input.includeBadge ?? true },
  )
}

export async function buildOpenUIHtmlExport(
  input: OpenUIExportInput,
): Promise<BuiltExport> {
  if (isHtmlDocumentSource(input.source)) {
    return {
      body: input.source.trim(),
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }
  if (isHtmlLikeSource(input.source)) {
    const html = isUsablePreviewHtml(input.previewHtml)
      ? input.previewHtml.trim()
      : input.source.trim()
    return {
      body: buildHtmlExport(html, {
        includeBadge: input.includeBadge ?? true,
      }),
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  const parsed = await parseOpenUIForHtmlExport(
    input.source,
    input.siteSpecJson,
  )
  return {
    body: await buildStandaloneHtmlDocument(input, parsed),
    contentType: 'text/html; charset=utf-8',
    filename: 'index.html',
    fileCount: 1,
  }
}
