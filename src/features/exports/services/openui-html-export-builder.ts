import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  createParser,
  jsonToOpenUI,
  type ElementNode,
} from '@openuidev/lang-core'
import { loadOpenUIRuntimeLibrary } from '@ship-fast/blocks/runtime'
import { renderOpenUIToHTMLWithTheme as _renderOpenUIToHTMLWithTheme } from '@ship-fast/engine/openui-ssr.js'

type RenderResult = { html: string; cssVars: string }
type BrandLogoAwareRenderer = (
  source: string,
  theme?: object | null,
  locale?: string,
  integrations?: object | null,
  imageContext?: object | null,
  brandLogo?: BrandLogoSelection | null,
) => Promise<RenderResult>
const renderOpenUIToHTMLWithTheme =
  _renderOpenUIToHTMLWithTheme as unknown as BrandLogoAwareRenderer

import { preprocessOpenUIResponse } from '@ship-fast/engine'
import { resolveThemeStyles } from '@/genui/theme-apply'
import type { ThemeStyles } from '@/genui/theme-presets'
import { buildHtmlExport } from './html-export-builder'
import {
  buildExportSeoBundle,
  extractDescriptionFromMarkup,
} from './export-seo'
import { enrichSiteSpecJson } from './openui-export-builder'
import type {
  BuiltExport,
  OpenUIExportInput,
  BrandLogoSelection,
} from './openui-export-types'
import { rewritePreviewImageUrls } from './preview-image-url-resolution'

type ParsedOpenUIProgram = {
  root: ElementNode
  routes: string[]
  pages: ElementNode[]
  targetMap: Record<string, string>
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

const buildRouteScript = (
  routes: string[],
  targetMap: Record<string, string>,
): string => `
(function () {
  var routes = ${stringifyJs(routes)};
  var targetMap = ${stringifyJs(targetMap)};
  var current = 0;
  function normalize(value) { return String(value || '').trim().toLowerCase(); }
  function parseTarget(value) {
    var text = String(value || '').trim();
    if (!text) return null;
    var hash = text.indexOf('#');
    if (hash < 0) return { page: text, sectionId: '' };
    return { page: text.slice(0, hash).trim(), sectionId: text.slice(hash + 1).trim() };
  }
  function findRoute(label) {
    var t = normalize(label);
    if (!t) return -1;
    var exact = routes.findIndex(function (route) { return normalize(route) === t; });
    if (exact >= 0) return exact;
    var pairs = [
      [/program|course|curriculum/, /program|course|curriculum/],
      [/lookbook|collection/, /lookbook|collection|shop|product/],
      [/speaker|agenda|venue|ticket|schedule/, /speaker|agenda|venue|ticket|schedule/],
      [/amenit/, /amenit/],
      [/room/, /room|booking|reserve/],
      [/\\b(?:book|booking|reserve)\\b/, /\\b(?:book|booking|reserve)\\b|room|contact/],
      [/shop|store|product|buy|cart|order|browse|collection/, /shop|store|product|collection|lookbook|menu|work|gallery/],
      [/price|plan|pricing|subscribe|upgrade|tier|membership/, /pric|plan|member/],
      [/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register/, /contact|book|booking|reserve|demo|start|join|ticket|apply/],
      [/about|story|team|who we are|mission/, /about|team|story/],
      [/blog|news|post|article|read|stories|journal|tips/, /blog|news|post|article|stories|tips/],
      [/feature|service|how it works|learn|explore|tour|class|trainer|program|course|curriculum|speaker|agenda|venue|amenit|room|lookbook/, /feature|service|how|class|schedule|program|course|curriculum|speaker|agenda|venue|amenit|room|lookbook/]
    ];
    for (var i = 0; i < pairs.length; i++) {
      if (!pairs[i][0].test(t)) continue;
      var idx = routes.findIndex(function (route) { return pairs[i][1].test(normalize(route)); });
      if (idx >= 0) return idx;
    }
    return -1;
  }
  function show(index) {
    if (index < 0 || index >= routes.length) return;
    current = index;
    document.querySelectorAll('[data-sf-export-page]').forEach(function (page, pageIndex) {
      page.hidden = pageIndex !== current;
    });
  }
  function fixedHeaderOffset() {
    var headers = Array.prototype.slice.call(document.querySelectorAll('header'));
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      var style = window.getComputedStyle(header);
      if (style.position !== 'fixed' && style.position !== 'sticky') continue;
      var rect = header.getBoundingClientRect();
      if (rect.height <= 0 || rect.bottom <= 0) continue;
      if (style.position === 'fixed' || rect.top <= 1) return Math.ceil(rect.height);
    }
    return 0;
  }
  function scrollToSection(id) {
    requestAnimationFrame(function () {
      var node = document.getElementById(id);
      if (!node) return;
      var offset = fixedHeaderOffset();
      if (!offset) {
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      var top = Math.max(0, node.getBoundingClientRect().top + window.scrollY - offset);
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  }
  function navigate(label) {
    var text = String(label || '').trim();
    if (!text) return false;
    var mapped = targetMap[text] || targetMap[normalize(text)] || text;
    var parsed = parseTarget(mapped);
    if (!parsed) return false;
    var idx = findRoute(parsed.page || text);
    if (idx < 0) return false;
    show(idx);
    if (parsed.sectionId) {
      window.location.hash = parsed.sectionId;
      scrollToSection(parsed.sectionId);
    } else {
      history.replaceState(null, '', location.pathname + location.search);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    return true;
  }
  function collectDrawerLinks(trigger) {
    var header = trigger.closest('header') || document;
    var controls = Array.prototype.slice.call(header.querySelectorAll('a,button'));
    var links = [];
    controls.forEach(function (control) {
      if (control === trigger || control.contains(trigger)) return;
      if (control.closest('[role="dialog"]')) return;
      var text = String(control.textContent || '').replace(/\\s+/g, ' ').trim();
      if (!text) return;
      var label = String(control.getAttribute('aria-label') || '').trim().toLowerCase();
      if (/search|account|profile|cart|bag|menu/.test(label)) return;
      if (links.some(function (entry) { return normalize(entry.label) === normalize(text); })) return;
      links.push({ label: text });
    });
    return links.slice(0, 8);
  }
  function makeButton(label, className) {
    var button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.className = className;
    return button;
  }
  function createStaticDrawer(trigger) {
    var existingId = trigger.getAttribute('data-sf-static-drawer');
    if (existingId) {
      return document.getElementById(existingId);
    }
    var links = collectDrawerLinks(trigger);
    if (!links.length) return null;
    var drawerId = 'sf-static-drawer-' + Math.random().toString(36).slice(2);
    trigger.setAttribute('data-sf-static-drawer', drawerId);

    var overlay = document.createElement('div');
    overlay.id = drawerId;
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('role', 'presentation');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.48);opacity:0;pointer-events:none;transition:opacity .18s ease;';

    var panel = document.createElement('aside');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', trigger.getAttribute('aria-label') || 'Navigation menu');
    panel.style.cssText = 'position:absolute;top:0;right:0;height:100%;width:min(22rem,100%);box-sizing:border-box;background:var(--background,#fff);color:var(--foreground,#111);border-left:1px solid var(--border,rgba(0,0,0,.12));box-shadow:-24px 0 80px rgba(0,0,0,.22);transform:translateX(100%);transition:transform .18s ease;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--border,rgba(0,0,0,.12));padding:1rem 1.25rem;';
    var title = document.createElement('div');
    title.textContent = trigger.closest('header')?.querySelector('[data-openui-component]')?.getAttribute('data-openui-component') || window.__SHIP_FAST_EXPORT__?.projectName || 'Navigation';
    title.style.cssText = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;';
    var close = makeButton('×', '');
    close.setAttribute('aria-label', 'Close menu');
    close.style.cssText = 'display:inline-flex;width:2rem;height:2rem;align-items:center;justify-content:center;border:0;border-radius:.5rem;background:transparent;color:inherit;font-size:1.5rem;line-height:1;cursor:pointer;';
    header.appendChild(title);
    header.appendChild(close);

    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Mobile navigation');
    nav.style.cssText = 'display:flex;flex-direction:column;gap:.25rem;padding:.75rem;';
    links.forEach(function (entry) {
      var item = makeButton(entry.label, '');
      item.style.cssText = 'width:100%;min-height:2.75rem;border:0;border-radius:.75rem;background:transparent;color:inherit;cursor:pointer;padding:.75rem 1rem;text-align:left;font:inherit;font-weight:600;';
      item.addEventListener('click', function () {
        if (navigate(entry.label)) closeStaticDrawer(overlay, trigger);
      });
      nav.appendChild(item);
    });

    panel.appendChild(header);
    panel.appendChild(nav);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeStaticDrawer(overlay, trigger);
    });
    close.addEventListener('click', function () {
      closeStaticDrawer(overlay, trigger);
    });
    return overlay;
  }
  function openStaticDrawer(overlay, trigger) {
    if (!overlay) return false;
    var panel = overlay.querySelector('[role="dialog"]');
    overlay.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      if (panel) panel.style.transform = 'translateX(0)';
    });
    return true;
  }
  function closeStaticDrawer(overlay, trigger) {
    var panel = overlay.querySelector('[role="dialog"]');
    trigger.setAttribute('aria-expanded', 'false');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    if (panel) panel.style.transform = 'translateX(100%)';
    window.setTimeout(function () {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
    }, 190);
  }
  function handleStaticDrawerTrigger(target) {
    var trigger = target.closest('[data-slot="sheet-trigger"],[aria-label="Open menu"],[aria-label="Toggle menu"]');
    if (!trigger) return false;
    var overlay = createStaticDrawer(trigger);
    if (!overlay) return false;
    overlay.setAttribute('aria-hidden', 'false');
    return openStaticDrawer(overlay, trigger);
  }
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('button,a') : null;
    if (!target) return;
    if (handleStaticDrawerTrigger(target)) {
      event.preventDefault();
      return;
    }
    if (!navigate(target.textContent)) return;
    event.preventDefault();
  });
  document.addEventListener('submit', function (event) { event.preventDefault(); });
  show(0);
})();`

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
  // `undefined` is a valid JavaScript literal (like `null`, `true`, `false`),
  // not an unresolved variable reference. Positional arguments in component
  // calls use literal `undefined` to skip optional slots, so filter it out.
  const unresolved = result.meta.unresolved.filter(
    (name) => name !== 'undefined',
  )
  if (unresolved.length > 0) {
    throw new Error(
      `OpenUI source has unresolved references: ${unresolved.join(', ')}`,
    )
  }
  // AI capsule components (AICustom_ prefix) are generated by section edits
  // and stored in the Convex sessionAiCapsules table at runtime. Skip the
  // unknown-component validation for AICustom_ prefixed names so export
  // parsing doesn't crash. See openui-export-builder.ts for full rationale.
  const unknown = result.meta.errors.filter(
    (error) =>
      error.code === 'unknown-component' &&
      !error.component.startsWith('AICustom_'),
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
  const rawTargetMap =
    result.root.typeName === 'PageSwitch'
      ? result.root.props.targetMap
      : undefined
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
  const targetMap =
    rawTargetMap &&
    typeof rawTargetMap === 'object' &&
    !Array.isArray(rawTargetMap)
      ? Object.fromEntries(
          Object.entries(rawTargetMap).filter(
            (entry): entry is [string, string] =>
              typeof entry[0] === 'string' && typeof entry[1] === 'string',
          ),
        )
      : {}

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: pages.length > 0 ? pages : [result.root],
    targetMap,
    projectName: readProjectName(siteSpec, routes[0] ?? 'Generated Site'),
    library,
  }
}

const renderPageHtml = async (
  page: ElementNode,
  library: ParsedOpenUIProgram['library'],
  locale: string,
  brandLogo?: BrandLogoSelection | null,
): Promise<string> => {
  const pageSource = jsonToOpenUI(page, library)
  const { html } = (await renderOpenUIToHTMLWithTheme(
    pageSource,
    undefined,
    locale,
    undefined,
    undefined,
    brandLogo,
  )) as RenderResult
  return html
}

const buildPagesMarkup = async (
  parsed: ParsedOpenUIProgram,
  locale: string,
  brandLogo?: BrandLogoSelection | null,
): Promise<string> =>
  (
    await Promise.all(
      parsed.pages.map(async (page, index) => {
        const label = parsed.routes[index] ?? `Page ${index + 1}`
        return `<section data-sf-export-page="${escapeHtml(label)}"${index === 0 ? '' : ' hidden'}>${await renderPageHtml(page, parsed.library, locale, brandLogo)}</section>`
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
  const locale = input.locale ?? 'en'
  const themeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const themeFontLinks = buildThemeFontLinks(themeStyles)
  const { cssVars } = (await renderOpenUIToHTMLWithTheme(
    input.source,
    undefined,
    locale,
    undefined,
    undefined,
    input.selectedBrandLogo,
  )) as RenderResult
  const css = readPreviewCss()
  const pagesMarkup = await rewritePreviewImageUrls(
    await buildPagesMarkup(parsed, locale, input.selectedBrandLogo),
  )
  const bodyMarkup = isUsablePreviewHtml(input.previewHtml)
    ? await rewritePreviewImageUrls(extractBodyMarkup(input.previewHtml))
    : pagesMarkup
  const genui = readGenUIExportMetadata(siteSpec)
  const seoBundle = buildExportSeoBundle(
    enrichSiteSpecJson(input.siteSpecJson, parsed.projectName),
    parsed.routes.map((label, index) => {
      const path =
        index === 0 ? '/' : `/${label.toLowerCase().replace(/\s+/g, '-')}`
      return { path, label }
    }),
    { fallbackDescriptions: { '/': extractDescriptionFromMarkup(bodyMarkup) } },
  )
  // The document shell below already emits charset/viewport/title.
  const seoHeadTags = (seoBundle?.homeSeo?.headTags ?? []).filter(
    (tag) =>
      !tag.startsWith('<meta charset') &&
      !tag.startsWith('<meta name="viewport"') &&
      !tag.startsWith('<title>'),
  )
  const seoHeadMarkup = seoHeadTags.length > 0 ? seoHeadTags.join('\n  ') : ''
  const htmlLang =
    input.locale?.trim() || seoBundle?.homeSeo?.seo.htmlLang || locale

  return buildHtmlExport(
    `<!doctype html>
<html lang="${escapeAttribute(htmlLang)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(seoBundle?.homeSeo?.seo.title ?? parsed.projectName)}</title>
  ${seoHeadMarkup}
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
    ${buildRouteScript(parsed.routes, parsed.targetMap)}
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
