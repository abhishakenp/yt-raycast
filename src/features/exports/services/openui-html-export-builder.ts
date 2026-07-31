import {
  createParser,
  jsonToOpenUI,
  type ElementNode,
} from '@openuidev/lang-core'
import {
  loadOpenUIRuntimeLibrary,
  parseDesignLine,
  type DesignIntent,
  type ImageContext,
} from '@ship-fast/blocks/runtime'
import { renderOpenUIToHTMLWithTheme } from '@ship-fast/engine/openui-ssr.js'

import { preprocessOpenUIResponse } from '@ship-fast/engine'
import { localeTextDirection } from '@/features/localization/locale-direction'
import { resolveThemeStyles } from '@/genui/theme-apply'
import type { ThemeStyles } from '@/genui/theme-presets'
import { buildHtmlExport } from './html-export-builder'
import {
  buildExportSeoBundle,
  extractDescriptionFromMarkup,
} from './export-seo'
import {
  buildCompiledTailwindCssForMarkup,
  readAppLocalCssImports,
} from './export-tailwind-css'
import { buildExportFontLinkTags } from './export-theme-fonts'
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

const themeVarKeys: readonly string[] = [
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
]

const readPreviewCss = buildCompiledTailwindCssForMarkup

export function isUsablePreviewHtml(html: string | undefined): html is string {
  const trimmed = html?.trim()
  const withoutSourceMetadata = trimmed
    ?.replace(
      /<script\b[^>]*\bid=(["'])openui-client-source\1[^>]*>[\s\S]*?<\/script>/gi,
      '',
    )
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  const isSourceOnlyShell =
    /\bid=(["'])openui-client-source\1/i.test(trimmed ?? '') &&
    !withoutSourceMetadata
  return Boolean(
    trimmed &&
    !/\bopenui-error\b/i.test(trimmed) &&
    !/failed to render/i.test(trimmed) &&
    !/\bship-fast-openui-source\b/i.test(trimmed) &&
    !isSourceOnlyShell &&
    !/generated openui source is ready/i.test(trimmed),
  )
}

export function neutralizeGeneratedHtmlRuntimeMarkers(html: string): string {
  return html
    .replaceAll('openui-root', 'site-root')
    .replaceAll('data-sf-export-page', 'data-export-page')
}

function isHtmlDocumentSource(source: string): boolean {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

function isHtmlLikeSource(source: string): boolean {
  return /<[^>]+>/.test(source)
}

function extractBodyMarkup(html: string): string {
  const trimmed = html.trim()
  const body = trimmed.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)
  return (body?.[1] ?? trimmed).trim()
}

function stripPreviewSourceMetadata(html: string): string {
  return html.replace(/\sdata-tsd-source=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
}

function mergeRootAttribute(
  openingTag: string,
  attribute: 'class' | 'style',
  value: string,
): string {
  const pattern = new RegExp(`\\s${attribute}=(['"])(.*?)\\1`, 'i')
  const current = openingTag.match(pattern)?.[2]?.trim() ?? ''
  const separator =
    attribute === 'style' && current && !current.endsWith(';')
      ? '; '
      : current
        ? ' '
        : ''
  const merged = `${current}${separator}${value}`.trim()
  const nextAttribute = ` ${attribute}="${escapeAttribute(merged)}"`
  return pattern.test(openingTag)
    ? openingTag.replace(pattern, nextAttribute)
    : `${openingTag}${nextAttribute}`
}

function applyPreviewRootTheme(
  html: string,
  themeStyle: string,
  isDark: boolean,
): string {
  const existingRootPattern = /<[a-z][^>]*\bid=(['"])openui-root\1[^>]*>/i
  const existingRoot = html.match(existingRootPattern)?.[0]
  if (existingRoot) {
    if (/\bstyle=(['"])/i.test(existingRoot)) return html
    const withStyle = mergeRootAttribute(
      existingRoot.slice(0, -1),
      'style',
      `${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}`,
    )
    return html.replace(existingRoot, `${withStyle}>`)
  }

  const openingTag = mergeRootAttribute(
    `<main id="openui-root" class="genui-preview size-full bg-background${isDark ? ' dark' : ''}"`,
    'style',
    `${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}`,
  )
  return `${openingTag}>${html}</main>`
}

type StaticUiMessages = {
  cart: string
  close: string
  closeMenu: string
  menu: string
  mobileNavigation: string
  remove: string
  search: string
  signIn: string
}

function staticUiMessages(locale: string): StaticUiMessages {
  if (locale.toLowerCase().split('-')[0] === 'hi') {
    return {
      cart: 'कार्ट',
      close: 'बंद करें',
      closeMenu: 'मेनू बंद करें',
      menu: 'मेनू खोलें',
      mobileNavigation: 'मोबाइल नेविगेशन',
      remove: 'हटाएं',
      search: 'खोजें',
      signIn: 'साइन इन करें',
    }
  }
  return {
    cart: 'Cart',
    close: 'Close',
    closeMenu: 'Close menu',
    menu: 'Open menu',
    mobileNavigation: 'Mobile navigation',
    remove: 'Remove',
    search: 'Search',
    signIn: 'Sign in',
  }
}

function decorateAccountTrigger(html: string): string {
  return html.replace(
    /<button\b(?=[^>]*data-slot="account-dropdown-unauthenticated")[^>]*>[\s\S]*?<\/button>/gi,
    (button) => {
      const parts = button.match(
        /^(<button\b(?=[^>]*data-slot="account-dropdown-unauthenticated")[^>]*>)([\s\S]*?)<\/button>$/i,
      )
      if (!parts) return button
      const openingTag = parts[1] ?? ''
      const body = parts[2] ?? ''
      const type = /\stype=(['"])[^'"]*\1/i.test(openingTag)
        ? openingTag
        : openingTag.replace('<button', '<button type="button"')
      const trigger = type.replace(
        '<button',
        '<button data-static-overlay-kind="auth"',
      )
      const motionLayer = /aria-hidden=(["'])true\1/i.test(body)
        ? ''
        : '<span aria-hidden="true" class="hidden motion-reduce:transition-none"></span>'
      return `${trigger}${motionLayer}${body}</button>`
    },
  )
}

function includesNonAscii(value: string): boolean {
  return Array.from(value).some(
    (character) => (character.codePointAt(0) ?? 0) > 127,
  )
}

function prepareGeneratedMarkup(
  html: string,
  locale: string,
  options: { convertNavLinksToButtons?: boolean } = {},
): string {
  const { convertNavLinksToButtons = true } = options
  const messages = staticUiMessages(locale)
  return (convertNavLinksToButtons ? decorateAccountTrigger(html) : html)
    .replace(
      /(<nav\b[^>]*>)([\s\S]*?)(<\/nav>)/gi,
      (_match, open, body, close) => {
        if (!convertNavLinksToButtons) return `${open}${body}${close}`
        const upgraded = String(body).replace(
          /<a\b([^>]*)>([\s\S]*?)<\/a>/gi,
          (anchor, attributes, children) => {
            const text = String(children)
              .replace(/<[^>]+>/g, '')
              .trim()
            if (!text) return anchor
            return `<button type="button"${attributes}>${children}</button>`
          },
        )
        return `${open}${upgraded}${close}`
      },
    )
    .replaceAll(
      'data-slot="command-search-trigger"',
      'data-static-overlay-kind="search" data-slot="command-search-trigger"',
    )
    .replaceAll(
      'aria-label="Search"',
      `aria-label="${escapeAttribute(messages.search)}"`,
    )
    .replaceAll(
      'aria-label="Cart"',
      `data-static-overlay-kind="cart" aria-label="${escapeAttribute(messages.cart)}"`,
    )
    .replaceAll(
      'aria-label="Open menu"',
      `aria-label="${escapeAttribute(messages.menu)}"`,
    )
    .replaceAll('>Sign in<', `>${escapeHtml(messages.signIn)}<`)
    .replace(/aria-label="([^"]*) to cart"/gi, (match, label) =>
      includesNonAscii(label) ? `aria-label="${label}"` : match,
    )
    .replaceAll(
      'group-hover/shiny:translate-x-full',
      'group-hover/shiny:translate-x-full motion-reduce:transition-none',
    )
    .replace(
      /(<span\b(?=[^>]*aria-hidden=["']true["'])(?=[^>]*-translate-x-full)([^>]*\bclass=(["'])(?![^"']*\bmotion-reduce:transition-none\b)([^"']*)\3[^>]*)>)/i,
      (_match, _opening, attributes, quote, classValue) =>
        `<span${String(attributes).replace(
          `${quote}${classValue}${quote}`,
          `${quote}${classValue} motion-reduce:transition-none${quote}`,
        )}>`,
    )
}

function extractPreviewRoutes(html: string): string[] {
  const routes: string[] = []
  const pattern = /\sdata-(?:sf-)?export-page=(['"])(.*?)\1/gi
  for (const match of html.matchAll(pattern)) {
    const label = match[2]?.trim()
    if (label && !routes.includes(label)) routes.push(label)
  }
  return routes
}

function ensurePrimaryHeading(html: string, fallback: string): string {
  if (/<h1\b/i.test(html)) return html
  const heading = html.match(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/i)
  if (heading) {
    return html.replace(heading[0], `<h1${heading[1]}>${heading[2]}</h1>`)
  }
  return `<h1 class="sr-only">${escapeHtml(fallback)}</h1>${html}`
}

function isPlainObjectValue(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseSiteSpec(
  siteSpecJson: string | undefined,
): Record<string, unknown> {
  if (!siteSpecJson) return {}
  try {
    const parsed: unknown = JSON.parse(siteSpecJson)
    return isPlainObjectValue(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Parse the @design intent from the site-spec JSON.
 * Mirrors `GeneratedModulePreview.tsx`'s `parseSiteSpecDesignIntent` so the
 * SSR render path receives the same `DesignIntent` the dashboard's live
 * `DesignSystemProvider` receives. The composition runner stores it as a
 * serialized `@design radius:rounded-none ...` string.
 */
function parseSiteSpecDesignIntent(
  siteSpecJson: string | undefined,
): DesignIntent | null {
  if (!siteSpecJson) return null
  try {
    const parsed = JSON.parse(siteSpecJson) as Record<string, unknown>
    const design = parsed?.design
    if (typeof design !== 'string' || !design.trim()) return null
    return parseDesignLine(design)
  } catch {
    return null
  }
}

function stringFromSpecValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : undefined
}

function parseSiteSpecBrandContext(
  siteSpec: Record<string, unknown>,
): string | undefined {
  const parts = [
    siteSpec.brand,
    siteSpec.brandName,
    siteSpec.name,
    siteSpec.tagline,
  ]
    .map(stringFromSpecValue)
    .filter((value): value is string => value !== undefined)
  const descriptor = [...new Set(parts)].join(' ').trim()
  return descriptor || undefined
}

function buildExportImageContext(
  input: OpenUIExportInput,
): ImageContext | null {
  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const prompt = input.prompt?.trim() || undefined
  const brandContext = parseSiteSpecBrandContext(siteSpec)
  return prompt || brandContext ? { prompt, brandContext } : null
}

function enrichSiteSpecJson(
  siteSpecJson: string | undefined,
  projectName: string,
): string {
  const siteSpec = parseSiteSpec(siteSpecJson)
  return JSON.stringify({
    ...siteSpec,
    projectName: siteSpec.projectName ?? projectName,
  })
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function readProjectName(
  siteSpec: Record<string, unknown>,
  fallback: string,
): string {
  const seo = siteSpec.seo
  const seoSiteName = isPlainObjectValue(seo) ? seo.siteName : undefined
  const candidates = [siteSpec.projectName, siteSpec.brand, seoSiteName]
  const match = candidates.find(isNonEmptyString)
  return match?.trim() || fallback
}

function readThemeName(
  siteSpec: Record<string, unknown>,
  requestedThemeName?: string,
): string | undefined {
  if (requestedThemeName) return requestedThemeName
  const theme = siteSpec.themeName ?? siteSpec.genuiTheme ?? siteSpec.theme
  return typeof theme === 'string' ? theme : undefined
}

function isElementNode(value: unknown): value is ElementNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'element'
  )
}

function readSchemaDefinitions(schema: unknown): Record<string, unknown> {
  if (!isPlainObjectValue(schema)) return {}
  const definitions = schema.$defs ?? schema.properties
  return isPlainObjectValue(definitions) ? definitions : {}
}

function unwrapObjectProps(
  value: unknown,
  definitions: Record<string, unknown>,
): void {
  if (Array.isArray(value)) {
    value.forEach((item) => unwrapObjectProps(item, definitions))
    return
  }
  if (!isElementNode(value)) return

  const componentSchema = definitions[value.typeName]
  const componentProperties = isPlainObjectValue(componentSchema)
    ? componentSchema.properties
    : undefined
  if (isPlainObjectValue(componentProperties)) {
    const propKeys = Object.keys(value.props)
    const onlyKey = propKeys.length === 1 ? propKeys[0] : undefined
    const wrapped = onlyKey ? value.props[onlyKey] : undefined
    const onlyKeySchema = onlyKey ? componentProperties[onlyKey] : undefined
    const onlyKeyExpectsObject =
      isPlainObjectValue(onlyKeySchema) && onlyKeySchema.type === 'object'
    if (
      onlyKey &&
      !onlyKeyExpectsObject &&
      isPlainObjectValue(wrapped) &&
      Object.keys(wrapped).every((key) => key in componentProperties)
    ) {
      delete value.props[onlyKey]
      Object.assign(value.props, wrapped)
    }
  }

  Object.values(value.props).forEach((child) =>
    unwrapObjectProps(child, definitions),
  )
}

function isStringEntry(entry: unknown[]): entry is [string, string] {
  return typeof entry[0] === 'string' && typeof entry[1] === 'string'
}

function buildThemeStyle(styles: ThemeStyles | null, isDark: boolean): string {
  if (!styles) return ''
  const merged: Record<string, unknown> = {
    ...styles.light,
    ...(isDark ? styles.dark : {}),
  }
  return themeVarKeys
    .flatMap((key) => {
      const value = merged[key]
      return value == null ? [] : [`--${key}: ${String(value)};`]
    })
    .join(' ')
}

function buildThemeStylesheet(styles: ThemeStyles | null): string {
  if (!styles) return ''
  return `
    :root, [data-theme="light"] { ${buildThemeStyle(styles, false)} }
    .dark, [data-theme="dark"] { ${buildThemeStyle(styles, true)} }
    .-translate-x-full { --tw-translate-x: -100%; translate: -100% var(--tw-translate-y, 0); }
    .duration-700 { transition-duration: 700ms; }
    .transition-transform { transition-property: transform, translate, scale, rotate; }
    .ease-\\[cubic-bezier\\(0\\.22\\,1\\,0\\.36\\,1\\)\\] { transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1); }
    .group\\/shiny:hover .group-hover\\/shiny\\:translate-x-full { --tw-translate-x: 100%; translate: 100% var(--tw-translate-y, 0); }
  `
}

function themeValues(
  styles: ThemeStyles | null,
  isDark: boolean,
): Record<string, string> {
  if (!styles) return {}
  const merged: Record<string, unknown> = {
    ...styles.light,
    ...(isDark ? styles.dark : {}),
  }
  return Object.fromEntries(
    themeVarKeys.flatMap((key) => {
      const value = merged[key]
      return value == null ? [] : [[`--${key}`, String(value)]]
    }),
  )
}

/**
 * Client-side theme runtime for the FULL standalone export only: re-applies
 * the light/dark token set on `prefers-color-scheme` changes. Static
 * thumbnails do not include it — they bake one fixed theme inline (root
 * `style` attribute + `#openui-root` rule + static `dark` class), so shipping
 * this script would only add parse/execute time to the html→PNG capture path.
 */
function buildThemeRuntime(
  styles: ThemeStyles | null,
  initialDark: boolean,
  rootId: 'openui-root' | 'site-root',
): string {
  return `
(function () {
  var lightTheme = ${stringifyJs(themeValues(styles, false))};
  var darkTheme = ${stringifyJs(themeValues(styles, true))};
  var root = document.getElementById(${JSON.stringify(rootId)});
  function applyTheme(isDark) {
    var values = isDark ? darkTheme : lightTheme;
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    if (!root) return;
    root.classList.toggle('dark', isDark);
    root.dataset.theme = isDark ? 'dark' : 'light';
    root.style.colorScheme = isDark ? 'dark' : 'light';
    Object.keys(values).forEach(function (property) {
      root.style.setProperty(property, values[property]);
    });
  }
  applyTheme(${initialDark ? 'true' : 'false'});
  if (typeof window.matchMedia !== 'function') return;
  var colorScheme = window.matchMedia('(prefers-color-scheme: dark)');
  function onColorSchemeChange(event) { applyTheme(Boolean(event.matches)); }
  if (typeof colorScheme.addEventListener === 'function') {
    colorScheme.addEventListener('change', onColorSchemeChange);
  } else if (typeof colorScheme.addListener === 'function') {
    colorScheme.addListener(onColorSchemeChange);
  }
})();`
}

function buildInteractionRuntime(
  messages: StaticUiMessages,
  storageNamespace: string,
): string {
  return `
(function () {
  var messages = ${stringifyJs(messages)};
  var storagePrefix = ${stringifyJs(`static-site:${storageNamespace}`)};
  var cartStorageKey = storagePrefix + ':cart-v1';
  var authStorageKey = storagePrefix + ':auth-v1';
  var newsletterStorageKey = storagePrefix + ':newsletter-v1';
  var activeDialog = null;
  var dialogCounter = 0;
  function readCart() {
    try {
      var value = JSON.parse(window.localStorage.getItem(cartStorageKey) || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }
  var cart = readCart();
  function saveCart() {
    try { window.localStorage.setItem(cartStorageKey, JSON.stringify(cart)); } catch {}
  }
  function readStoredText(key) {
    try { return String(window.localStorage.getItem(key) || '').trim(); } catch { return ''; }
  }
  function isNewsletterForm(form) {
    var submit = form.querySelector('button[type="submit"],input[type="submit"]');
    var semantics = [
      form.id,
      form.getAttribute('data-contract'),
      form.getAttribute('aria-label'),
      submit ? submit.textContent || submit.getAttribute('value') : ''
    ].filter(Boolean).join(' ');
    return /newsletter|subscribe|mailing|updates/i.test(semantics);
  }
  function restorePersistedState() {
    if (readStoredText(authStorageKey) === 'signed-in') {
      document.querySelectorAll('[data-contract="sign-in"], [data-slot="account-dropdown-unauthenticated"]').forEach(function (trigger) {
        trigger.setAttribute('data-auth-state', 'signed-in');
        trigger.setAttribute('aria-pressed', 'true');
      });
    }
    var email = readStoredText(newsletterStorageKey);
    if (!email) return;
    document.querySelectorAll('form').forEach(function (form) {
      if (!isNewsletterForm(form)) return;
      var input = form.querySelector('input[name="email"]');
      if (input instanceof HTMLInputElement) input.value = email;
    });
  }
  function renderCart() {
    document.querySelectorAll('[data-cart-count], [data-static-overlay-kind="cart"] span, button[aria-label="Cart"] span').forEach(function (node) {
      node.textContent = String(cart.length);
    });
    document.querySelectorAll('[data-cart-items]').forEach(function (container) {
      container.replaceChildren();
      cart.forEach(function (item, index) {
        var row = document.createElement('div');
        var summary = document.createElement('span');
        var remove = document.createElement('button');
        var label = String(item.label || item.key || 'Item');
        row.setAttribute('data-cart-item', item.key || label);
        summary.textContent = [label, item.price].filter(Boolean).join(' — ');
        remove.type = 'button';
        remove.textContent = messages.remove;
        remove.setAttribute('data-cart-remove', String(index));
        remove.setAttribute('aria-label', messages.remove + ' ' + label);
        row.appendChild(summary);
        row.appendChild(remove);
        container.appendChild(row);
      });
    });
  }
  function productFrom(button) {
    var article = button.closest('[data-item-key], article');
    var ariaLabel = button.getAttribute('aria-label') || '';
    var heading = article ? article.querySelector('h1,h2,h3,h4') : null;
    var label = button.getAttribute('data-item-label') ||
      (heading ? String(heading.textContent || '').trim() : '') ||
      ariaLabel.replace(/^add to cart\\s*/i, '').trim() ||
      'Item';
    return {
      key: button.getAttribute('data-item-key') || (article ? article.getAttribute('data-item-key') : '') || label,
      label: label,
      price: button.getAttribute('data-item-price') || ''
    };
  }
  function isAddToCart(button) {
    var contract = button.getAttribute('data-contract') || '';
    var ariaLabel = button.getAttribute('aria-label') || '';
    return contract === 'add-cart' || contract === 'add-cart-shop' || button.hasAttribute('aria-busy') || /^add to cart\\b/i.test(ariaLabel);
  }
  function dialogFocusTarget(panel) {
    return panel.querySelector('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])') || panel;
  }
  function closeStaticDialog(record) {
    if (!record) return;
    if (activeDialog && activeDialog.overlay === record.overlay) activeDialog = null;
    record.trigger.setAttribute('aria-expanded', 'false');
    record.overlay.setAttribute('aria-hidden', 'true');
    window.setTimeout(function () {
      record.overlay.hidden = true;
      if (record.panel !== record.overlay) record.panel.removeAttribute('role');
      record.trigger.focus();
    }, 190);
  }
  function findExistingDialog(trigger) {
    var controls = trigger.getAttribute('aria-controls');
    var controlled = controls ? document.getElementById(controls) : null;
    if (controlled && controlled.getAttribute('role') === 'dialog') return controlled;
    var label = String(trigger.getAttribute('aria-label') || '').trim().toLowerCase();
    var contract = trigger.getAttribute('data-contract') || '';
    var dialogs = Array.prototype.slice.call(document.querySelectorAll('[role="dialog"]'));
    return dialogs.find(function (dialog) {
      if (contract === 'cart-open' && (dialog.id === 'cart-dialog' || dialog.querySelector('[data-cart-items]'))) return true;
      return label && String(dialog.getAttribute('aria-label') || '').trim().toLowerCase() === label;
    }) || null;
  }
  function openExistingDialog(trigger) {
    var dialog = findExistingDialog(trigger);
    if (!dialog) return false;
    activeDialog = { overlay: dialog, panel: dialog, trigger: trigger };
    dialog.hidden = false;
    dialog.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    if (dialog.id) trigger.setAttribute('aria-controls', dialog.id);
    if (trigger.getAttribute('data-contract') === 'cart-open') renderCart();
    requestAnimationFrame(function () { dialogFocusTarget(dialog).focus(); });
    return true;
  }
  function createStaticDialog(trigger) {
    var currentId = trigger.getAttribute('aria-controls');
    var current = currentId ? document.getElementById(currentId) : null;
    if (current && current.getAttribute('data-static-overlay-panel')) return current.parentElement;
    var kind = trigger.getAttribute('data-static-overlay-kind');
    if (!kind) return null;
    dialogCounter += 1;
    var panelId = 'static-' + kind + '-dialog-' + dialogCounter;
    var overlay = document.createElement('div');
    var panel = document.createElement('section');
    var title = document.createElement('h2');
    var close = document.createElement('button');
    var content = document.createElement('div');
    overlay.hidden = true;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.setAttribute('data-static-overlay', kind);
    overlay.setAttribute('role', 'presentation');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;place-items:center;background:rgba(0,0,0,.48);padding:1rem;';
    panel.id = panelId;
    panel.tabIndex = -1;
    panel.setAttribute('data-static-overlay-panel', kind);
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', panelId + '-title');
    panel.style.cssText = 'width:min(32rem,100%);max-height:min(40rem,90vh);overflow:auto;border:1px solid var(--border,rgba(0,0,0,.14));border-radius:1rem;background:var(--background,#fff);color:var(--foreground,#111);box-shadow:0 24px 80px rgba(0,0,0,.28);padding:1.25rem;';
    title.id = panelId + '-title';
    title.textContent = trigger.getAttribute('aria-label') || kind;
    close.type = 'button';
    close.textContent = '×';
    close.setAttribute('aria-label', messages.close);
    close.setAttribute('data-slot', 'dialog-close');
    close.style.cssText = 'float:right;border:0;background:transparent;color:inherit;font-size:1.5rem;cursor:pointer;';
    content.style.cssText = 'clear:both;padding-top:1rem;';
    if (kind === 'search') {
      var input = document.createElement('input');
      input.type = 'search';
      input.setAttribute('aria-label', messages.search);
      input.placeholder = messages.search;
      content.appendChild(input);
    } else if (kind === 'cart') {
      content.setAttribute('data-cart-items', '');
    } else {
      var signIn = document.createElement('button');
      signIn.type = 'button';
      signIn.textContent = messages.signIn;
      signIn.setAttribute('data-contract', 'sign-in');
      content.appendChild(signIn);
    }
    panel.appendChild(close);
    panel.appendChild(title);
    panel.appendChild(content);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);
    trigger.type = 'button';
    trigger.setAttribute('aria-controls', panelId);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-haspopup', 'dialog');
    close.addEventListener('click', function () {
      closeStaticDialog({ overlay: overlay, panel: panel, trigger: trigger });
    });
    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeStaticDialog({ overlay: overlay, panel: panel, trigger: trigger });
    });
    return overlay;
  }
  function openStaticDialog(trigger) {
    var overlay = createStaticDialog(trigger);
    var panel = overlay ? overlay.querySelector('[data-static-overlay-panel]') : null;
    if (!overlay || !panel) return false;
    activeDialog = { overlay: overlay, panel: panel, trigger: trigger };
    panel.setAttribute('role', 'dialog');
    overlay.hidden = false;
    overlay.setAttribute('aria-hidden', 'false');
    trigger.setAttribute('aria-expanded', 'true');
    if (trigger.getAttribute('data-static-overlay-kind') === 'cart') renderCart();
    requestAnimationFrame(function () { dialogFocusTarget(panel).focus(); });
    return true;
  }
  document.querySelectorAll('[data-static-overlay-kind]').forEach(function (trigger) {
    createStaticDialog(trigger);
  });
  document.addEventListener('click', function (event) {
    var target = event.target instanceof Element ? event.target.closest('button') : null;
    if (!target) return;
    if (target.hasAttribute('data-cart-remove')) {
      event.preventDefault();
      var index = Number.parseInt(target.getAttribute('data-cart-remove') || '', 10);
      if (Number.isInteger(index) && index >= 0 && index < cart.length) {
        cart.splice(index, 1);
        saveCart();
        renderCart();
      }
      return;
    }
    if (isAddToCart(target)) {
      event.preventDefault();
      cart.push(productFrom(target));
      saveCart();
      renderCart();
      target.setAttribute('aria-busy', 'false');
      return;
    }
    if (target.hasAttribute('data-static-overlay-kind')) {
      if (openStaticDialog(target)) event.preventDefault();
      return;
    }
    if (target.getAttribute('aria-haspopup') === 'dialog' && openExistingDialog(target)) {
      event.preventDefault();
      return;
    }
    if (target.matches('[data-contract="sign-in"], [data-slot="account-dropdown-unauthenticated"]')) {
      event.preventDefault();
      target.setAttribute('data-auth-state', 'signed-in');
      target.setAttribute('aria-pressed', 'true');
      try { window.localStorage.setItem(authStorageKey, 'signed-in'); } catch {}
    }
  });
  document.addEventListener('focusin', function (event) {
    if (!activeDialog || activeDialog.panel.contains(event.target)) return;
    dialogFocusTarget(activeDialog.panel).focus();
  });
  document.addEventListener('keydown', function (event) {
    if (!activeDialog) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeStaticDialog(activeDialog);
      return;
    }
    if (event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(activeDialog.panel.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) {
      event.preventDefault();
      activeDialog.panel.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('submit', function (event) {
    var form = event.target instanceof HTMLFormElement ? event.target : null;
    if (!form) return;
    event.preventDefault();
    var email = String(new FormData(form).get('email') || '').trim();
    var output = form.querySelector('output,[aria-live]');
    if (output) output.textContent = email ? 'Subscribed' : 'Email required';
    form.setAttribute('data-submit-state', email ? 'submitted' : 'invalid');
    if (email && isNewsletterForm(form)) {
      try { window.localStorage.setItem(newsletterStorageKey, email); } catch {}
    }
  });
  restorePersistedState();
  renderCart();
})();`
}

function stringifyJs(value: unknown): string {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

const escapeAttribute = escapeHtml

function buildRouteScript(
  routes: string[],
  targetMap: Record<string, string>,
  pageAttribute: 'data-export-page' | 'data-sf-export-page',
  messages: StaticUiMessages,
): string {
  return `
(function () {
  var routes = ${stringifyJs(routes)};
  var targetMap = ${stringifyJs(targetMap)};
  var messages = ${stringifyJs(messages)};
  var current = 0;
  var activeDrawer = null;
  function normalize(value) { return String(value || '').trim().toLowerCase(); }
  function decodeLocationPart(value) {
    try { return decodeURIComponent(String(value || '')); } catch { return String(value || ''); }
  }
  function routeSlug(value) {
    return encodeURIComponent(normalize(value).replace(/\\s+/g, '-'));
  }
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
    document.querySelectorAll('[${pageAttribute}]').forEach(function (page, pageIndex) {
      page.hidden = pageIndex !== current;
    });
  }
  function routeIndexFromLocationPart(value) {
    var encoded = String(value || '');
    while (encoded.startsWith('#')) encoded = encoded.slice(1);
    while (encoded.endsWith('/')) encoded = encoded.slice(0, -1);
    if (!encoded) return -1;
    var exact = routes.findIndex(function (route) { return routeSlug(route) === encoded.toLowerCase(); });
    if (exact >= 0) return exact;
    return findRoute(decodeLocationPart(encoded).replace(/-/g, ' '));
  }
  function locationRoute() {
    var hash = String(window.location.hash || '').replace(/^#/, '');
    if (hash) {
      var hashParts = hash.split('/');
      var hashIndex = routeIndexFromLocationPart(hashParts[0]);
      if (hashIndex >= 0) {
        return { index: hashIndex, sectionId: decodeLocationPart(hashParts.slice(1).join('/')) };
      }
      var decodedHash = decodeLocationPart(hash);
      var sectionNode = document.getElementById(decodedHash);
      if (sectionNode) {
        var pageNode = sectionNode.closest('[${pageAttribute}]');
        var pages = Array.prototype.slice.call(document.querySelectorAll('[${pageAttribute}]'));
        var pageIndex = pageNode ? pages.indexOf(pageNode) : current;
        return { index: pageIndex >= 0 ? pageIndex : current, sectionId: decodedHash };
      }
      var mapped = targetMap[decodedHash] || targetMap[normalize(decodedHash)];
      var parsed = parseTarget(mapped || decodedHash);
      var mappedIndex = parsed ? findRoute(parsed.page) : -1;
      if (mappedIndex >= 0) return { index: mappedIndex, sectionId: parsed.sectionId };
    }
    var pathParts = String(window.location.pathname || '').split('/').filter(Boolean);
    var pathIndex = routeIndexFromLocationPart(pathParts[pathParts.length - 1] || '');
    return { index: pathIndex >= 0 ? pathIndex : 0, sectionId: '' };
  }
  function routeAddress(index, sectionId) {
    if (sectionId) {
      return window.location.pathname + window.location.search + '#' + encodeURIComponent(sectionId);
    }
    var fragment = routeSlug(routes[index] || routes[0] || 'home');
    return window.location.pathname + window.location.search + '#' + fragment;
  }
  function writeRouteAddress(index, sectionId) {
    var address = routeAddress(index, sectionId);
    try {
      window.history.pushState({ staticSiteRoute: index }, '', address);
    } catch {
      window.location.hash = address.slice(address.indexOf('#'));
    }
  }
  function syncRouteFromLocation() {
    var target = locationRoute();
    show(target.index);
    if (target.sectionId) scrollToSection(target.sectionId);
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
        if (typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
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
    writeRouteAddress(idx, parsed.sectionId);
    if (parsed.sectionId) {
      scrollToSection(parsed.sectionId);
    } else {
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
    panel.setAttribute('aria-label', messages.mobileNavigation);
    panel.tabIndex = -1;
    panel.style.cssText = 'position:absolute;top:0;right:0;height:100%;width:min(22rem,100%);box-sizing:border-box;background:var(--background,#fff);color:var(--foreground,#111);border-left:1px solid var(--border,rgba(0,0,0,.12));box-shadow:-24px 0 80px rgba(0,0,0,.22);transform:translateX(100%);transition:transform .18s ease;display:flex;flex-direction:column;';

    var header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--border,rgba(0,0,0,.12));padding:1rem 1.25rem;';
    var title = document.createElement('div');
    title.textContent = window.__STATIC_SITE__?.projectName || 'Navigation';
    title.style.cssText = 'min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700;';
    var close = makeButton('×', '');
    close.setAttribute('aria-label', messages.closeMenu);
    close.setAttribute('data-slot', 'sheet-close');
    close.style.cssText = 'display:inline-flex;width:2rem;height:2rem;align-items:center;justify-content:center;border:0;border-radius:.5rem;background:transparent;color:inherit;font-size:1.5rem;line-height:1;cursor:pointer;';
    header.appendChild(title);
    header.appendChild(close);

    var nav = document.createElement('nav');
    nav.setAttribute('aria-label', messages.mobileNavigation);
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
    if (!panel) return false;
    overlay.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    activeDrawer = { overlay: overlay, panel: panel, trigger: trigger };
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      overlay.style.pointerEvents = 'auto';
      panel.style.transform = 'translateX(0)';
      var focusable = panel.querySelector('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
      (focusable || panel).focus();
    });
    return true;
  }
  function closeStaticDrawer(overlay, trigger) {
    var panel = overlay.querySelector('[role="dialog"]');
    if (activeDrawer && activeDrawer.overlay === overlay) activeDrawer = null;
    trigger.setAttribute('aria-expanded', 'false');
    overlay.style.opacity = '0';
    overlay.style.pointerEvents = 'none';
    if (panel) panel.style.transform = 'translateX(100%)';
    window.setTimeout(function () {
      overlay.hidden = true;
      overlay.setAttribute('aria-hidden', 'true');
      trigger.focus();
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
    if (target.hasAttribute('data-static-overlay-kind')) return;
    var navigated = navigate(target.textContent);
    if (!navigated) {
      var nav = target.closest('nav') || target.closest('header');
      var controls = nav ? Array.prototype.slice.call(nav.querySelectorAll('button,a')).filter(function (control) {
        return !control.getAttribute('aria-label') &&
          !control.hasAttribute('data-static-overlay-kind') &&
          !control.matches('[data-slot="sheet-trigger"]');
      }) : [];
      var routeIndex = controls.indexOf(target);
      navigated = routeIndex >= 0 && routeIndex < routes.length
        ? navigate(routes[routeIndex])
        : false;
    }
    if (!navigated) return;
    event.preventDefault();
  });
  document.addEventListener('focusin', function (event) {
    if (!activeDrawer || activeDrawer.panel.contains(event.target)) return;
    var focusable = activeDrawer.panel.querySelector('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    (focusable || activeDrawer.panel).focus();
  });
  document.addEventListener('keydown', function (event) {
    if (!activeDrawer) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeStaticDrawer(activeDrawer.overlay, activeDrawer.trigger);
      return;
    }
    if (event.key !== 'Tab') return;
    var focusable = Array.prototype.slice.call(activeDrawer.panel.querySelectorAll('button,a[href],input,select,textarea,[tabindex]:not([tabindex="-1"])'));
    if (!focusable.length) {
      event.preventDefault();
      activeDrawer.panel.focus();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  document.addEventListener('submit', function (event) { event.preventDefault(); });
  window.addEventListener('popstate', syncRouteFromLocation);
  window.addEventListener('hashchange', syncRouteFromLocation);
  syncRouteFromLocation();
})();`
}

export async function parseOpenUIForHtmlExport(
  source: string,
  siteSpecJson?: string,
): Promise<ParsedOpenUIProgram> {
  const cleaned = preprocessOpenUIResponse(source, {
    resolveRefs: false,
    fixNavLinks: false,
  })
  const library = await loadOpenUIRuntimeLibrary(cleaned)
  const schema = library.toJSONSchema()
  const parser = createParser(schema, 'root')
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

  unwrapObjectProps(result.root, readSchemaDefinitions(schema))

  const rawRoutes =
    result.root.typeName === 'PageSwitch' ? result.root.props.routes : undefined
  const rawPages =
    result.root.typeName === 'PageSwitch' ? result.root.props.pages : undefined
  const rawTargetMap =
    result.root.typeName === 'PageSwitch'
      ? result.root.props.targetMap
      : undefined
  const routes = Array.isArray(rawRoutes)
    ? rawRoutes.filter(isNonEmptyString)
    : ['Home']
  const pages = Array.isArray(rawPages)
    ? rawPages.filter(isElementNode)
    : [result.root]
  const siteSpec = parseSiteSpec(siteSpecJson)
  const parsedTargetMap =
    rawTargetMap &&
    typeof rawTargetMap === 'object' &&
    !Array.isArray(rawTargetMap)
      ? Object.fromEntries(Object.entries(rawTargetMap).filter(isStringEntry))
      : {}
  const localizedRouteByCanonicalName = new Map<string, string>()
  for (const route of routes) {
    const target = parsedTargetMap[route]
    const canonicalPage = target?.split('#')[0]?.trim()
    if (canonicalPage) {
      localizedRouteByCanonicalName.set(canonicalPage.toLowerCase(), route)
    }
  }
  const targetMap = Object.fromEntries(
    Object.entries(parsedTargetMap).map(([label, target]) => {
      const hashIndex = target.indexOf('#')
      const page = (hashIndex < 0 ? target : target.slice(0, hashIndex)).trim()
      const section = hashIndex < 0 ? '' : target.slice(hashIndex)
      const localizedPage =
        localizedRouteByCanonicalName.get(page.toLowerCase()) ?? page
      return [label, `${localizedPage}${section}`]
    }),
  )

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: pages.length > 0 ? pages : [result.root],
    targetMap,
    projectName: readProjectName(siteSpec, routes[0] ?? 'Generated Site'),
    library,
  }
}

async function renderPageHtml(
  page: ElementNode,
  library: ParsedOpenUIProgram['library'],
  locale: string,
  imageContext: ImageContext | null,
  brandLogo?: BrandLogoSelection | null,
  designIntent?: DesignIntent | null,
): Promise<string> {
  const pageSource = jsonToOpenUI(page, library)
  const { html } = await renderOpenUIToHTMLWithTheme(
    pageSource,
    undefined,
    locale,
    undefined,
    imageContext,
    brandLogo,
    designIntent,
  )
  return html
}

async function buildPagesMarkup(
  parsed: ParsedOpenUIProgram,
  locale: string,
  imageContext: ImageContext | null,
  brandLogo?: BrandLogoSelection | null,
  designIntent?: DesignIntent | null,
): Promise<string> {
  return (
    await Promise.all(
      parsed.pages.map(async (page, index) => {
        const label = parsed.routes[index] ?? `Page ${index + 1}`
        return `<section data-sf-export-page="${escapeHtml(label)}"${index === 0 ? '' : ' hidden'}>${await renderPageHtml(page, parsed.library, locale, imageContext, brandLogo, designIntent)}</section>`
      }),
    )
  ).join('\n')
}

export async function buildOpenUIRenderedPreviewMarkup(
  input: OpenUIExportInput,
): Promise<string | undefined> {
  if (isHtmlDocumentSource(input.source) || isHtmlLikeSource(input.source)) {
    return undefined
  }
  const parsed = await parseOpenUIForHtmlExport(
    input.source,
    input.siteSpecJson,
  )
  return stripPreviewSourceMetadata(
    await buildPagesMarkup(
      parsed,
      input.locale ?? 'en',
      buildExportImageContext(input),
      input.selectedBrandLogo,
      parseSiteSpecDesignIntent(input.siteSpecJson),
    ),
  )
}

async function buildStandaloneHtmlDocument(
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): Promise<string> {
  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const themeName = readThemeName(siteSpec, input.themeName)
  const isDark = input.isDark ?? true
  const locale = input.locale ?? 'en'
  const themeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const themeStylesheet = buildThemeStylesheet(themeStyles)
  // Font parity: the dashboard injects Google Fonts via `injectThemeFonts`
  // regardless of badge visibility. The export download path passes
  // `includeBadge: false` for offline isolation (no external stylesheets).
  // The gallery preview path passes `includeFonts: true` to force font links
  // so the captured screenshot matches the dashboard's font rendering.
  const themeFontLinks =
    input.includeBadge === false && input.includeFonts !== true
      ? ''
      : buildExportFontLinkTags(themeStyles, themeStylesheet)
  const imageContext = buildExportImageContext(input)
  const designIntent = parseSiteSpecDesignIntent(input.siteSpecJson)
  const { cssVars } = await renderOpenUIToHTMLWithTheme(
    input.source,
    undefined,
    locale,
    undefined,
    imageContext,
    input.selectedBrandLogo,
    designIntent,
  )
  const hasPreviewMarkup = isUsablePreviewHtml(input.previewHtml)
  const pagesMarkup = hasPreviewMarkup
    ? ''
    : await rewritePreviewImageUrls(
        await buildPagesMarkup(
          parsed,
          locale,
          imageContext,
          input.selectedBrandLogo,
          designIntent,
        ),
      )
  const previewMarkup = hasPreviewMarkup
    ? stripPreviewSourceMetadata(
        await rewritePreviewImageUrls(
          extractBodyMarkup(input.previewHtml ?? ''),
        ),
      )
    : ''
  const generatedPagesMarkup = ensurePrimaryHeading(
    prepareGeneratedMarkup(
      stripPreviewSourceMetadata(pagesMarkup).replace(
        /\sdata-openui-[\w-]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
        '',
      ),
      locale,
    ),
    parsed.projectName,
  )
  const bodyMarkup = hasPreviewMarkup ? previewMarkup : generatedPagesMarkup
  const previewRoutes = hasPreviewMarkup
    ? extractPreviewRoutes(previewMarkup)
    : []
  const routes = previewRoutes.length > 0 ? previewRoutes : parsed.routes
  const rootMarkup = hasPreviewMarkup
    ? applyPreviewRootTheme(bodyMarkup, themeStyle, isDark)
    : `<main id="openui-root" class="genui-preview size-full bg-background${isDark ? ' dark' : ''}" style="${escapeAttribute(`${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}`)}">${bodyMarkup}</main>`
  const css = await readPreviewCss(rootMarkup)
  const rootId = 'openui-root'
  const seoBundle = buildExportSeoBundle(
    enrichSiteSpecJson(input.siteSpecJson, parsed.projectName),
    routes.map((label, index) => {
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
      !tag.startsWith('<title>') &&
      !tag.includes('href="/llms.txt"'),
  )
  const seoHeadMarkup = seoHeadTags.length > 0 ? seoHeadTags.join('\n  ') : ''
  const htmlLang =
    input.locale?.trim() || seoBundle?.homeSeo?.seo.htmlLang || locale
  const htmlDirection = localeTextDirection(htmlLang)
  // Global CSS parity: append local CSS imports (styles/index.css :root
  // block with --ease-out, --radius-lg, --glass-bg, etc.) AFTER compiled
  // Tailwind CSS so custom values override Tailwind @theme defaults.
  const appLocalCss = readAppLocalCssImports()

  return buildHtmlExport(
    `<!doctype html>
<html lang="${escapeAttribute(htmlLang)}" dir="${htmlDirection}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob: https:; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; object-src 'none'; base-uri 'none'; form-action 'none'" />
  <title>${escapeHtml(seoBundle?.homeSeo?.seo.title ?? parsed.projectName)}</title>
  ${seoHeadMarkup}
  ${themeFontLinks}
  <style>
${css}
    ${themeStylesheet}
    #${rootId} { ${cssVars || ''} ${themeStyle} }
    html, body { min-height: 100%; margin: 0; background: var(--background); color: var(--foreground); }
${appLocalCss}
  </style>
</head>
<body class="min-h-screen bg-background text-foreground">
  ${rootMarkup}
  <script>
    window.__STATIC_SITE__ = ${stringifyJs({ routes, projectName: parsed.projectName, themeName, mode: isDark ? 'dark' : 'light' })};
    ${buildThemeRuntime(themeStyles, isDark, rootId)}
    ${buildRouteScript(routes, parsed.targetMap, 'data-sf-export-page', staticUiMessages(locale))}
    ${buildInteractionRuntime(staticUiMessages(locale), input.sessionId)}
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
  await input.onProgress?.('parsing')
  const body = await buildStandaloneHtmlDocument(input, parsed)
  await input.onProgress?.('generating')
  return {
    body,
    contentType: 'text/html; charset=utf-8',
    filename: 'index.html',
    fileCount: 1,
  }
}

/**
 * Render only the first page of a parsed OpenUI program, wrapped in the same
 * `data-sf-export-page` section convention the full export uses. Thumbnails
 * only ever show the landing page, so pages 2..N are never rendered.
 */
async function buildFirstPageMarkup(
  parsed: ParsedOpenUIProgram,
  locale: string,
  imageContext: ImageContext | null,
  brandLogo?: BrandLogoSelection | null,
  designIntent?: DesignIntent | null,
): Promise<string> {
  const firstPage = parsed.pages[0]
  if (!firstPage) return ''
  const pageHtml = await renderPageHtml(
    firstPage,
    parsed.library,
    locale,
    imageContext,
    brandLogo,
    designIntent,
  )
  return `<section data-sf-export-page="${escapeHtml(parsed.routes[0] ?? 'Home')}">${pageHtml}</section>`
}

/**
 * Build a lightweight static HTML document for gallery thumbnail capture
 * (html → PNG via Playwright in gallery-preview-image-response.ts).
 *
 * Optimization strategy vs. {@link buildOpenUIHtmlExport}:
 *
 * - **Exactly one SSR render.** Only the first page is rendered
 *   ({@link buildFirstPageMarkup}); the full export renders every page PLUS
 *   the whole source once more to obtain `cssVars`. That extra full-source
 *   render is skipped here entirely: it is invoked without theme tokens, so
 *   `cssVars` is always empty and the render is pure cost. An N-page site
 *   costs 1 render here vs. N+1 renders in the full export.
 * - **Zero JavaScript.** The theme is baked statically (root `style`
 *   attribute + `#openui-root` rule + static `dark` class), so the theme
 *   runtime, route script, interaction runtime, and `__STATIC_SITE__` state
 *   are all omitted. A static capture never switches pages, carts, or color
 *   schemes — every script would only slow `page.setContent` down.
 * - **No SEO bundle.** Thumbnails are never indexed, so the head carries only
 *   charset/viewport/style (no `<title>`, Open Graph, JSON-LD, or fonts).
 * - **No web-font links.** Remote font stylesheets would stall the
 *   network-idle grace window in the capture path; system fonts render fine
 *   at thumbnail size.
 * - **No badge.** `includeBadge` is forced off so branding never covers
 *   thumbnail content.
 */
export async function buildOpenUIHtmlThumbnail(
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
        includeBadge: false,
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

  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const themeName = readThemeName(siteSpec, input.themeName)
  const isDark = input.isDark ?? true
  const locale = input.locale ?? 'en'
  const themeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const imageContext = buildExportImageContext(input)
  const designIntent = parseSiteSpecDesignIntent(input.siteSpecJson)

  // Render the full preprocessed source directly instead of extracting the
  // first page, re-serializing via jsonToOpenUI, and rendering that. The
  // re-serialization loses source nuances that control component variants
  // (e.g. Navbar renders <button> instead of <a>, SplitHero loses its graph
  // paper decor). PageSwitch shows the first page by default, so rendering
  // the full source produces the same visible output as the dashboard.
  const preprocessed = preprocessOpenUIResponse(input.source, {
    resolveRefs: false,
    fixNavLinks: false,
  })
  const { html: rawHtml } = await renderOpenUIToHTMLWithTheme(
    preprocessed,
    undefined,
    locale,
    undefined,
    imageContext,
    input.selectedBrandLogo,
    designIntent,
  )
  const pagesMarkup = await rewritePreviewImageUrls(rawHtml)

  const bodyMarkup = prepareGeneratedMarkup(
    stripPreviewSourceMetadata(pagesMarkup).replace(
      /\sdata-openui-[\w-]+=(?:"[^"]*"|'[^']*'|[^\s>]+)/gi,
      '',
    ),
    locale,
    { convertNavLinksToButtons: false },
  )

  const rootMarkup = `<main id="openui-root" class="genui-preview size-full${isDark ? ' dark' : ''}">${bodyMarkup}</main>`

  const css = await readPreviewCss(rootMarkup)
  const rootId = 'openui-root'
  // Font parity: the dashboard injects Google Fonts via `injectThemeFonts`. The
  // thumbnail originally skipped fonts to avoid stalling Playwright's
  // network-idle grace window, but that caused visible font disparity between
  // the dashboard preview and the gallery thumbnail. Use the non-blocking
  // `media="print" onload="this.media='all'"` pattern so fonts load without
  // blocking the capture's network-idle wait.
  const themeFontLinks = buildExportFontLinkTags(themeStyles, css)
  const routes = [parsed.routes[0] ?? 'Home']
  // Global CSS parity: the dashboard loads src/styles.css which imports
  // styles/index.css, defining :root custom properties (--ease-out,
  // --radius-lg, --glass-bg, --glow, --text-muted, etc.). The compiled
  // Tailwind CSS overrides these with its own @theme defaults. Appending
  // the local CSS imports AFTER the compiled CSS restores the custom values
  // so the thumbnail matches the dashboard's nav scroll easing, radii,
  // glass effects, and other design-token-driven styling.
  const appLocalCss = readAppLocalCssImports()

  return {
    body: buildHtmlExport(
      `<!doctype html>
<html lang="${escapeAttribute(locale)}" dir="${localeTextDirection(locale)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'self' data: blob: https:; frame-ancestors 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; object-src 'none'; base-uri 'none'; form-action 'none'" />
  ${themeFontLinks}
  <style>
${css}
    :root { ${themeStyle} color-scheme: ${isDark ? 'dark' : 'light'}; }
    html, body { min-height: 100%; margin: 0; background: ${isDark ? '#070710' : '#ffffff'}; color: var(--foreground); }
    .dark { color-scheme: dark; }
${appLocalCss}
  </style>
</head>
<body class="min-h-screen text-foreground">
  ${rootMarkup}
  <script>
    window.__STATIC_SITE__ = ${stringifyJs({ routes, projectName: parsed.projectName, themeName, mode: isDark ? 'dark' : 'light' })};
    ${buildThemeRuntime(themeStyles, isDark, rootId)}
    ${buildInteractionRuntime(staticUiMessages(locale), input.sessionId)}
  </script>
</body>
</html>`,
      { includeBadge: false },
    ),
    contentType: 'text/html; charset=utf-8',
    filename: 'index.html',
    fileCount: 1,
  }
}
