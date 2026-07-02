import { Buffer } from 'node:buffer'
import { dirname, join, relative } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import { zipSync, strToU8 } from 'fflate'
import { format } from 'prettier'
import ts from 'typescript'
import type { ElementNode } from '@openuidev/lang-core'
import { library } from '@ship-fast/blocks'
import {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
  vendorSourceFilesBase64,
  vendorSourceFilesEncoding,
} from '@ship-fast/blocks/generated'

import {
  getBlockSourceFile,
  resolveBlockSourceManifestPath,
  resolveRelativeBlockSourcePath,
} from './block-source-manifest'
import { resolveThemeStyles } from '../../../genui/theme-apply'
import type { ThemeStyles } from '../../../genui/theme-presets'
import {
  orientationFromSize,
  picsumUrl,
  searchQueryFromAlt,
  seedFromAlt,
  slugifyAlt,
} from '../../../lib/image-query'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'
import { parseOpenUIForExport } from './openui-export-builder'

type ReactExportSourceEntry = {
  file: string
  source: string
}

type LakebedRoute = {
  label: string
  path: string
  componentName: string
  node?: ElementNode
  props: Record<string, unknown>
}

type LakebedAdminAccessConfig = {
  emails: string[]
  routes: Array<{ label: string; path: string }>
}

type ContentSection = {
  id: string
  title: string
  description: string
  meta: string
}

type LakebedDefinition = {
  schemaSource: string | null
  numericFieldNames: string[]
  queries: Record<string, string>
  mutations: Record<string, string>
  endpoints: Record<string, LakebedEndpointDefinition>
}

type LakebedEndpointDefinition = {
  method: string | null
  path: string | null
  source: string
}

type ClientComponentDefinition = {
  name: string
  preludeSources: string[]
  source: string
  imports: string[]
  vendorFiles: Set<string>
}

type ImageSource = {
  alt: string
  src: string
}

type StyleOverride = {
  classAnchor: string
  occurrenceIndex: number
  style: string
}

type ImageDimensions = {
  height: number
  width: number
}

export type LakebedProjectFiles = {
  files: Record<string, string>
  fileCount: number
  filename: string
  projectName: string
}

let manifestSourceIndex: Record<
  string,
  ReactExportSourceEntry | undefined
> | null = null
let vendorSourceFileIndex: Record<string, string | undefined> | null = null
const lakebedImageResolveConcurrency = 8
const lakebedImageFetchTimeoutMs = 2_500

const toPosixPath = (value: string): string => value.replaceAll('\\', '/')

const sourcePathCandidates = (base: string): string[] => [
  base,
  `${base}.ts`,
  `${base}.tsx`,
  `${base}.js`,
  `${base}.jsx`,
  `${base}.mjs`,
  `${base}.cjs`,
  `${base}.json`,
  `${base}.css`,
  join(base, 'index.ts'),
  join(base, 'index.tsx'),
  join(base, 'index.js'),
  join(base, 'index.jsx'),
  join(base, 'index.mjs'),
  join(base, 'index.cjs'),
  join(base, 'package.json'),
]

const relativeImportPath = (fromFile: string, toFile: string): string => {
  let path = toPosixPath(relative(dirname(fromFile), toFile))
  if (!path.startsWith('.')) path = `./${path}`
  return path
}

const readPublicPackageName = (specifier: string): string | null => {
  if (specifier.startsWith('.') || specifier.startsWith('/')) return null
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/')
    return scope && name ? `${scope}/${name}` : null
  }
  return specifier.split('/')[0] ?? null
}

const toProjectSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'lakebed-export'

const toIdentifier = (value: string): string =>
  value.replace(/[^A-Za-z0-9_$]/g, '_').replace(/^[^A-Za-z_$]/, '_$&')

const isHtmlDocumentSource = (source: string): boolean => {
  const trimmed = source.trim()
  return /^<!doctype\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)
}

const isHtmlLikeSource = (source: string): boolean => {
  const trimmed = source.trim()
  return (
    isHtmlDocumentSource(trimmed) || /^<[a-z][\w:-]*(?:\s|>|\/>)/i.test(trimmed)
  )
}

const decodeHtmlAttribute = (value: string): string =>
  value
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')

const readHtmlAttribute = (tag: string, name: string): string | null => {
  const match = tag.match(
    new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'),
  )
  const value = match?.[1] ?? match?.[2] ?? match?.[3]
  return value ? decodeHtmlAttribute(value).trim() : null
}

type PexelsPhoto = {
  src?: {
    large?: string
    large2x?: string
    original?: string
    medium?: string
  }
}

type PexelsResponse = {
  photos?: PexelsPhoto[]
}

const readServerEnv = (key: string): string =>
  typeof process !== 'undefined' ? (process.env[key]?.trim() ?? '') : ''

const choosePexelsPhotoUrl = (
  photo: PexelsPhoto | undefined,
  w: number,
  h: number,
): string | null => {
  if (!photo?.src) return null
  if (w > 1200 || h > 1200) {
    return (
      photo.src.original ??
      photo.src.large2x ??
      photo.src.large ??
      photo.src.medium ??
      null
    )
  }
  if (w > 800 || h > 800) {
    return (
      photo.src.large2x ??
      photo.src.large ??
      photo.src.original ??
      photo.src.medium ??
      null
    )
  }
  if (w > 400 || h > 400) {
    return (
      photo.src.large ??
      photo.src.large2x ??
      photo.src.medium ??
      photo.src.original ??
      null
    )
  }
  return (
    photo.src.medium ??
    photo.src.large ??
    photo.src.large2x ??
    photo.src.original ??
    null
  )
}

const resolvePexelsImageForLakebed = async (
  alt: string,
  w: number,
  h: number,
): Promise<string | null> => {
  const pexelsApiKey = readServerEnv('PEXELS_API_KEY')
  if (!pexelsApiKey) return null
  const searchUrl = new URL('https://api.pexels.com/v1/search')
  searchUrl.searchParams.set('query', searchQueryFromAlt(alt))
  searchUrl.searchParams.set('per_page', '15')
  searchUrl.searchParams.set('orientation', orientationFromSize(w, h))
  try {
    const response = await fetch(searchUrl, {
      headers: { Authorization: pexelsApiKey },
      signal: AbortSignal.timeout(lakebedImageFetchTimeoutMs),
    })
    if (!response.ok) return null
    const data = (await response.json()) as PexelsResponse
    const photos = data.photos ?? []
    if (!photos.length) return null
    return choosePexelsPhotoUrl(photos[seedFromAlt(alt) % photos.length], w, h)
  } catch {
    return null
  }
}

const mapWithConcurrency = async <TItem, TResult>(
  items: TItem[],
  limit: number,
  mapper: (item: TItem) => Promise<TResult>,
): Promise<TResult[]> => {
  const results: TResult[] = []
  let nextIndex = 0
  const workerCount = Math.min(limit, items.length)
  const workers = Array.from({ length: workerCount }, async () => {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      const item = items[index]
      if (item === undefined) continue
      results[index] = await mapper(item)
    }
  })
  await Promise.all(workers)
  return results
}

const lakebedImageDimensionsForAlt = (alt: string): ImageDimensions => {
  if (
    /\b(avatar|headshot|portrait)\b/i.test(alt) ||
    /\bwith (her|his|their)\b/i.test(alt)
  ) {
    return { height: 400, width: 400 }
  }

  return { height: 800, width: 1200 }
}

const normalizeRemoteImageUrlForLakebed = (
  src: string,
  dimensions: ImageDimensions,
): string => {
  try {
    const url = new URL(src)
    if (url.hostname === 'images.pexels.com') {
      url.searchParams.set('auto', 'compress')
      url.searchParams.set('cs', 'tinysrgb')
      url.searchParams.set('w', String(dimensions.width))
      url.searchParams.set('h', String(dimensions.height))
      url.searchParams.set('fit', 'crop')
      return url.toString()
    }
  } catch {
    return src
  }

  return src
}

const fallbackLakebedImageUrlFor = (
  alt: string,
  dimensions: ImageDimensions,
): string => picsumUrl(slugifyAlt(alt), dimensions.width, dimensions.height)

const isLikelyImageAltKey = (key: string): boolean => {
  const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '')
  if (normalized === 'alt') return true
  if (normalized.endsWith('imagealt') || normalized.endsWith('imagealts'))
    return true
  if (normalized.endsWith('photoalt') || normalized.endsWith('photoalts'))
    return true
  if (normalized.endsWith('avataralt') || normalized.endsWith('avataralts'))
    return true
  if (normalized.endsWith('headshotalt') || normalized.endsWith('headshotalts'))
    return true
  if (normalized.endsWith('coveralt') || normalized.endsWith('coveralts'))
    return true
  if (normalized.endsWith('logoalt') || normalized.endsWith('logoalts'))
    return true
  return false
}

const collectImageAltCandidates = (
  value: unknown,
  into: Set<string>,
  key = '',
): void => {
  if (typeof value === 'string') {
    if (isLikelyImageAltKey(key) && !/^https?:\/\//i.test(value)) {
      const normalized = value.trim()
      if (normalized) into.add(normalized)
    }
    return
  }
  if (Array.isArray(value)) {
    for (const item of value) collectImageAltCandidates(item, into, key)
    return
  }
  if (!isRecord(value)) return
  for (const [childKey, childValue] of Object.entries(value)) {
    collectImageAltCandidates(childValue, into, childKey)
  }
}

export const collectRouteImageAlts = (routes: LakebedRoute[]): string[] => {
  const alts = new Set<string>()
  for (const route of routes) collectImageAltCandidates(route.props, alts)
  return [...alts].slice(0, 80)
}

const normalizePreviewImageSource = (alt: string, src: string): string => {
  const dimensions = lakebedImageDimensionsForAlt(alt)
  if (/^https:\/\/images\.pexels\.com\//i.test(src)) {
    return normalizeRemoteImageUrlForLakebed(src, dimensions)
  }
  if (
    src.startsWith('/api/') ||
    /^https?:\/\/[^/]+\/api\//i.test(src) ||
    /source\.unsplash\.com/i.test(src)
  ) {
    return fallbackLakebedImageUrlFor(alt, dimensions)
  }
  return src
}

const extractImageSources = (html: string | undefined): ImageSource[] => {
  if (!html) return []
  const byAlt = new Map<string, string>()
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0]
    const alt = readHtmlAttribute(tag, 'alt')
    const src = readHtmlAttribute(tag, 'src')
    if (!alt || !src || byAlt.has(alt)) continue
    if (
      /^(https?:)?\/\//i.test(src) ||
      src.startsWith('/') ||
      src.startsWith('data:image/')
    ) {
      byAlt.set(alt, normalizePreviewImageSource(alt, src))
    }
  }
  return [...byAlt].map(([alt, src]) => ({ alt, src }))
}

const extractStyleOverrides = (html: string | undefined): StyleOverride[] => {
  if (!html) return []
  const classCounts = new Map<string, number>()
  const overrides: StyleOverride[] = []
  for (const match of html.matchAll(/<[a-zA-Z][\w:-]*\b[^>]*>/g)) {
    const tag = match[0]
    const classAnchor = readHtmlAttribute(tag, 'class')
    if (!classAnchor) continue
    const occurrenceIndex = classCounts.get(classAnchor) ?? 0
    classCounts.set(classAnchor, occurrenceIndex + 1)
    const style = readHtmlAttribute(tag, 'style')
    if (!style) continue
    overrides.push({ classAnchor, occurrenceIndex, style })
  }
  return overrides
}

export const resolveLakebedImageSources = async (
  routes: LakebedRoute[],
  previewHtml: string | undefined,
): Promise<ImageSource[]> => {
  const byAlt = new Map(
    extractImageSources(previewHtml).map((source) => [source.alt, source.src]),
  )

  const missingAlts = collectRouteImageAlts(routes).filter(
    (alt) => !byAlt.has(alt),
  )
  const resolvedImages = await mapWithConcurrency(
    missingAlts,
    lakebedImageResolveConcurrency,
    async (alt) => {
      const { height, width } = lakebedImageDimensionsForAlt(alt)
      const resolved =
        (await resolvePexelsImageForLakebed(alt, width, height)) ??
        picsumUrl(slugifyAlt(alt), width, height)
      return {
        alt,
        src: normalizeRemoteImageUrlForLakebed(resolved, { height, width }),
      }
    },
  )

  for (const { alt, src } of resolvedImages) {
    byAlt.set(alt, src)
  }

  return [...byAlt].map(([alt, src]) => ({ alt, src }))
}

const readHtmlTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = match?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return title || undefined
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

const readGenUIExportMetadata = (
  siteSpecJson: string | undefined,
): Record<string, unknown> | null => {
  const siteSpec = parseSiteSpec(siteSpecJson)
  const genui = siteSpec.genui
  return genui !== null && typeof genui === 'object' && !Array.isArray(genui)
    ? (genui as Record<string, unknown>)
    : null
}

const readAdminPolicy = (
  genui: Record<string, unknown>,
): Record<string, unknown> => {
  const policy = genui.adminPolicy
  return policy !== null && typeof policy === 'object' && !Array.isArray(policy)
    ? (policy as Record<string, unknown>)
    : {}
}

const readAdminEmails = (genui: Record<string, unknown>): string[] => {
  const policy = readAdminPolicy(genui)
  const values = Array.isArray(policy.adminEmails)
    ? policy.adminEmails
    : typeof policy.ownerEmail === 'string'
      ? [policy.ownerEmail]
      : typeof genui.ownerEmail === 'string'
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

const readAdminRoutes = (
  genui: Record<string, unknown>,
): Array<{ label: string; path: string }> => {
  const manifest = genui.openuiManifest
  const pages =
    manifest !== null &&
    typeof manifest === 'object' &&
    !Array.isArray(manifest) &&
    Array.isArray((manifest as { pages?: unknown }).pages)
      ? (manifest as { pages: unknown[] }).pages
      : []
  const routes = pages
    .filter(
      (page): page is { id?: string; label?: string; component?: string } =>
        page !== null && typeof page === 'object',
    )
    .filter((page) =>
      [page.id, page.label, page.component].some(
        (value) => typeof value === 'string' && /admin/i.test(value),
      ),
    )
    .map((page) => {
      const label = typeof page.label === 'string' ? page.label : 'Admin'
      return { label, path: `/${slugifyRoute(label)}` }
    })

  return routes.length > 0 ? routes : [{ label: 'Admin', path: '/admin' }]
}

const readLakebedAdminAccessConfig = (
  siteSpecJson: string | undefined,
): LakebedAdminAccessConfig | null => {
  const genui = readGenUIExportMetadata(siteSpecJson)
  if (genui === null) return null
  const emails = readAdminEmails(genui)
  if (emails.length === 0) return null
  return {
    emails,
    routes: readAdminRoutes(genui),
  }
}

const readProjectName = (
  siteSpecJson: string | undefined,
  fallback: string,
): string => {
  const siteSpec = parseSiteSpec(siteSpecJson)
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
  siteSpecJson: string | undefined,
  requestedThemeName?: string,
): string | undefined => {
  if (requestedThemeName) return requestedThemeName
  const siteSpec = parseSiteSpec(siteSpecJson)
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

const defaultLakebedThemeVars: Record<string, string> = {
  background: '#ffffff',
  foreground: '#171717',
  card: '#ffffff',
  'card-foreground': '#171717',
  popover: '#ffffff',
  'popover-foreground': '#171717',
  primary: '#3b82f6',
  'primary-foreground': '#ffffff',
  secondary: '#f3f4f6',
  'secondary-foreground': '#374151',
  muted: '#f9fafb',
  'muted-foreground': '#6b7280',
  accent: '#e0f2fe',
  'accent-foreground': '#1e3a8a',
  destructive: '#ef4444',
  'destructive-foreground': '#ffffff',
  border: '#e5e7eb',
  input: '#e5e7eb',
  ring: '#3b82f6',
  'chart-1': '#3b82f6',
  'chart-2': '#2563eb',
  'chart-3': '#1d4ed8',
  'chart-4': '#1e40af',
  'chart-5': '#1e3a8a',
  sidebar: '#f9fafb',
  'sidebar-foreground': '#171717',
  'sidebar-primary': '#3b82f6',
  'sidebar-primary-foreground': '#ffffff',
  'sidebar-accent': '#e0f2fe',
  'sidebar-accent-foreground': '#1e3a8a',
  'sidebar-border': '#e5e7eb',
  'sidebar-ring': '#3b82f6',
  'font-sans':
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  'font-serif': 'Georgia, Cambria, "Times New Roman", Times, serif',
  'font-mono':
    '"SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace',
  radius: '0.5rem',
}

const buildLakebedThemeCss = (
  styles: ThemeStyles | null,
  isDark: boolean,
): string => {
  const selected = styles
    ? { ...styles.light, ...(isDark ? styles.dark : {}) }
    : defaultLakebedThemeVars
  const declarations = themeVarKeys
    .map((key) => {
      const value = selected[key] ?? defaultLakebedThemeVars[key]
      return value == null ? null : `  --${key}: ${String(value)};`
    })
    .filter((line): line is string => Boolean(line))
    .join('\n')

  return `:root {
${declarations}
  color-scheme: ${isDark ? 'dark' : 'light'};
}

html,
body,
#root {
  min-height: 100%;
}

body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

.bg-background { background-color: var(--background); }
.bg-card { background-color: var(--card); }
.bg-popover { background-color: var(--popover); }
.bg-primary { background-color: var(--primary); }
.bg-secondary { background-color: var(--secondary); }
.bg-muted { background-color: var(--muted); }
.bg-accent { background-color: var(--accent); }
.bg-destructive { background-color: var(--destructive); }
.text-foreground { color: var(--foreground); }
.text-card-foreground { color: var(--card-foreground); }
.text-popover-foreground { color: var(--popover-foreground); }
.text-primary { color: var(--primary); }
.text-primary-foreground { color: var(--primary-foreground); }
.text-secondary-foreground { color: var(--secondary-foreground); }
.text-muted-foreground { color: var(--muted-foreground); }
.text-accent-foreground { color: var(--accent-foreground); }
.text-destructive { color: var(--destructive); }
.text-destructive-foreground { color: var(--destructive-foreground); }
.border-border { border-color: var(--border); }
.border-input { border-color: var(--input); }
.ring-ring { --tw-ring-color: var(--ring); }
.font-sans { font-family: var(--font-sans); }
.font-serif { font-family: var(--font-serif); }
.font-mono { font-family: var(--font-mono); }
.hover\\:bg-background:hover { background-color: var(--background); }
.hover\\:bg-card:hover { background-color: var(--card); }
.hover\\:bg-popover:hover { background-color: var(--popover); }
.hover\\:bg-primary:hover { background-color: var(--primary); }
.hover\\:bg-secondary:hover { background-color: var(--secondary); }
.hover\\:bg-muted:hover { background-color: var(--muted); }
.hover\\:bg-accent:hover { background-color: var(--accent); }
.hover\\:bg-destructive:hover { background-color: var(--destructive); }
.hover\\:text-foreground:hover { color: var(--foreground); }
.hover\\:text-primary:hover { color: var(--primary); }
.hover\\:text-primary-foreground:hover { color: var(--primary-foreground); }
.hover\\:text-muted-foreground:hover { color: var(--muted-foreground); }
.hover\\:text-accent-foreground:hover { color: var(--accent-foreground); }
.hover\\:text-destructive:hover { color: var(--destructive); }`
}

const slugifyRoute = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page'

const uniqueRoutePath = (
  label: string,
  index: number,
  used: Set<string>,
): string => {
  if (index === 0) {
    used.add('/')
    return '/'
  }
  const base = `/${slugifyRoute(label)}`
  let path = base
  let suffix = 2
  while (used.has(path)) {
    path = `${base}-${suffix}`
    suffix += 1
  }
  used.add(path)
  return path
}

const getManifestSourceIndex = (): Record<
  string,
  ReactExportSourceEntry | undefined
> => {
  if (manifestSourceIndex) return manifestSourceIndex
  if (reactExportSourcesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported React export source manifest encoding: ${reactExportSourcesEncoding}`,
    )
  }
  manifestSourceIndex = JSON.parse(
    brotliDecompressSync(
      Buffer.from(reactExportSourcesBase64, 'base64'),
    ).toString('utf8'),
  ) as Record<string, ReactExportSourceEntry | undefined>
  return manifestSourceIndex
}

const getVendorSourceFileIndex = (): Record<string, string | undefined> => {
  if (vendorSourceFileIndex) return vendorSourceFileIndex
  if (vendorSourceFilesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported vendor source file manifest encoding: ${vendorSourceFilesEncoding}`,
    )
  }
  vendorSourceFileIndex = JSON.parse(
    brotliDecompressSync(
      Buffer.from(vendorSourceFilesBase64, 'base64'),
    ).toString('utf8'),
  ) as Record<string, string | undefined>
  return vendorSourceFileIndex
}

const printNode = (node: ts.Node, sourceFile: ts.SourceFile): string =>
  ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
    .printNode(ts.EmitHint.Unspecified, node, sourceFile)

export const isExportableFactory = (expression: string): boolean =>
  expression === 'defineCapsule'

const propertyNameText = (name: ts.PropertyName, sourceFile: ts.SourceFile) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return name.getText(sourceFile)
}

const bindingIdentifierNames = (name: ts.BindingName): string[] => {
  if (ts.isIdentifier(name)) return [name.text]
  return name.elements.flatMap((element) =>
    ts.isOmittedExpression(element) ? [] : bindingIdentifierNames(element.name),
  )
}

const topLevelDeclarationNames = (statement: ts.Statement): string[] => {
  if (ts.isVariableStatement(statement)) {
    return statement.declarationList.declarations.flatMap((declaration) =>
      bindingIdentifierNames(declaration.name),
    )
  }
  if (
    (ts.isFunctionDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isEnumDeclaration(statement) ||
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)) &&
    statement.name
  ) {
    return [statement.name.text]
  }
  return []
}

const collectIdentifierTexts = (node: ts.Node) => {
  const identifiers = new Set<string>()
  const visit = (current: ts.Node) => {
    if (ts.isIdentifier(current)) {
      identifiers.add(current.text)
    }
    ts.forEachChild(current, visit)
  }
  visit(node)
  return identifiers
}

const collectClientComponentPreludeSources = (
  sourceFile: ts.SourceFile,
  targetStatement: ts.Statement,
  componentSource: ts.Node,
) => {
  const declarationByName = new Map<string, ts.Statement>()
  for (const statement of sourceFile.statements) {
    if (
      statement === targetStatement ||
      ts.isImportDeclaration(statement) ||
      ts.isExportDeclaration(statement)
    ) {
      continue
    }
    for (const name of topLevelDeclarationNames(statement)) {
      declarationByName.set(name, statement)
    }
  }

  const requiredNames = new Set<string>()
  const queuedNames = [...collectIdentifierTexts(componentSource)]
  for (const name of queuedNames) {
    if (requiredNames.has(name)) continue
    const statement = declarationByName.get(name)
    if (!statement) continue

    requiredNames.add(name)
    for (const identifier of collectIdentifierTexts(statement)) {
      if (!requiredNames.has(identifier)) {
        queuedNames.push(identifier)
      }
    }
  }

  return sourceFile.statements
    .filter((statement) =>
      topLevelDeclarationNames(statement).some((name) =>
        requiredNames.has(name),
      ),
    )
    .map((statement) =>
      normalizeClientComponentSource(printNode(statement, sourceFile)),
    )
}

const objectRecord = (
  object: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): Record<string, string> => {
  if (!object || !ts.isObjectLiteralExpression(object)) return {}
  return Object.fromEntries(
    object.properties
      .filter((property): property is ts.PropertyAssignment =>
        ts.isPropertyAssignment(property),
      )
      .map((property) => [
        propertyNameText(property.name, sourceFile),
        printNode(property.initializer, sourceFile),
      ]),
  )
}

const stringPropertyValue = (
  object: ts.ObjectLiteralExpression,
  name: string,
): string | null => {
  const property = object.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) &&
      ((ts.isIdentifier(item.name) && item.name.text === name) ||
        (ts.isStringLiteral(item.name) && item.name.text === name)),
  )
  const value = property?.initializer
  return value &&
    (ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value))
    ? value.text
    : null
}

const readEndpointRecord = (
  object: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): Record<string, LakebedEndpointDefinition> => {
  if (!object || !ts.isObjectLiteralExpression(object)) return {}
  return Object.fromEntries(
    object.properties
      .filter((property): property is ts.PropertyAssignment =>
        ts.isPropertyAssignment(property),
      )
      .map((property) => {
        const initializer = property.initializer
        const route =
          ts.isCallExpression(initializer) &&
          initializer.expression.getText(sourceFile) === 'endpoint' &&
          initializer.arguments[0] &&
          ts.isObjectLiteralExpression(initializer.arguments[0])
            ? initializer.arguments[0]
            : null
        return [
          propertyNameText(property.name, sourceFile),
          {
            method: route ? stringPropertyValue(route, 'method') : null,
            path: route ? stringPropertyValue(route, 'path') : null,
            source: printNode(initializer, sourceFile),
          },
        ]
      }),
  )
}

const readNumericSchemaFields = (
  schema: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): string[] => {
  if (!schema || !ts.isObjectLiteralExpression(schema)) return []
  const fields = new Set<string>()

  for (const tableProperty of schema.properties) {
    if (!ts.isPropertyAssignment(tableProperty)) continue
    const tableCall = tableProperty.initializer
    if (
      !ts.isCallExpression(tableCall) ||
      tableCall.expression.getText(sourceFile) !== 'table'
    ) {
      continue
    }

    const tableShape = tableCall.arguments[0]
    if (!tableShape || !ts.isObjectLiteralExpression(tableShape)) continue

    for (const fieldProperty of tableShape.properties) {
      if (!ts.isPropertyAssignment(fieldProperty)) continue
      const fieldInitializer = fieldProperty.initializer
      if (
        ts.isCallExpression(fieldInitializer) &&
        fieldInitializer.expression.getText(sourceFile) === 'number'
      ) {
        fields.add(propertyNameText(fieldProperty.name, sourceFile))
      }
    }
  }

  return [...fields]
}

const normalizeLakebedSchemaSource = (source: string | null): string | null =>
  source
    ?.replace(
      /\bnumber\s*\(\s*\)\s*\.default\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*\)/g,
      (_match, defaultValue: string) => `string().default('${defaultValue}')`,
    )
    .replace(/\bnumber\s*\(\s*\)/g, 'string()') ?? null

const lakebedSchemaSource = (
  schema: ts.ObjectLiteralExpression,
  sourceFile: ts.SourceFile,
): string => {
  const properties = schema.properties
    .filter(ts.isPropertyAssignment)
    .map((property) => {
      const initializer = unwrapExpression(property.initializer)
      const tableSource = ts.isObjectLiteralExpression(initializer)
        ? initializer.properties.find(
            (item): item is ts.SpreadAssignment =>
              ts.isSpreadAssignment(item) &&
              ts.isCallExpression(item.expression) &&
              item.expression.expression.getText(sourceFile) === 'table',
          )?.expression
        : undefined
      return `${property.name.getText(sourceFile)}: ${printNode(
        tableSource ?? initializer,
        sourceFile,
      )}`
    })
  return `{\n${properties.map((property) => `  ${property}`).join(',\n')}\n}`
}

const unwrapExpression = (expression: ts.Expression): ts.Expression => {
  if (
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isParenthesizedExpression(expression)
  ) {
    return unwrapExpression(expression.expression)
  }
  return expression
}

const findVariableInitializer = (
  sourceFile: ts.SourceFile,
  name: string,
): ts.Expression | null => {
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== name
      ) {
        continue
      }
      return declaration.initializer
        ? unwrapExpression(declaration.initializer)
        : null
    }
  }
  return null
}

const resolveSchemaObject = (
  schema: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
): ts.ObjectLiteralExpression | null => {
  if (!schema) return null
  const expression = unwrapExpression(schema)
  if (ts.isObjectLiteralExpression(expression)) return expression
  if (
    !ts.isPropertyAccessExpression(expression) ||
    expression.name.text !== 'schema' ||
    !ts.isIdentifier(expression.expression)
  ) {
    return null
  }
  const definitionInitializer = findVariableInitializer(
    sourceFile,
    expression.expression.text,
  )
  if (
    !definitionInitializer ||
    !ts.isCallExpression(definitionInitializer) ||
    definitionInitializer.expression.getText(sourceFile) !==
      'createLakebedDefinition'
  ) {
    return null
  }
  const definitionSchema = definitionInitializer.arguments[0]
  return definitionSchema && ts.isObjectLiteralExpression(definitionSchema)
    ? definitionSchema
    : null
}

type LakebedObjectSource = {
  object: ts.ObjectLiteralExpression
  sourceFile: ts.SourceFile
}

const importedLakebedName = (
  sourceFile: ts.SourceFile,
  localName: string,
): { moduleName: string; importedName: string } | null => {
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    const bindings = statement.importClause?.namedBindings
    if (!ts.isStringLiteral(specifier) || !bindings) {
      continue
    }
    if (!ts.isNamedImports(bindings)) {
      continue
    }
    for (const element of bindings.elements) {
      if (element.name.text !== localName) continue
      return {
        importedName: (element.propertyName ?? element.name).text,
        moduleName: specifier.text,
      }
    }
  }
  return null
}

const readImportedLakebedObject = (
  sourceFile: ts.SourceFile,
  entry: ReactExportSourceEntry,
  localName: string,
): LakebedObjectSource | null => {
  const imported = importedLakebedName(sourceFile, localName)
  if (!imported || !imported.moduleName.startsWith('.')) return null
  const sourcePath = resolveRelativeBlockSourcePath(
    entry.file,
    imported.moduleName,
  )
  if (!sourcePath) return null
  const source = getBlockSourceFile(sourcePath)
  const importedSourceFile = ts.createSourceFile(
    sourcePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    sourcePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const initializer = findVariableInitializer(
    importedSourceFile,
    imported.importedName,
  )
  return initializer && ts.isObjectLiteralExpression(initializer)
    ? { object: initializer, sourceFile: importedSourceFile }
    : null
}

const resolveLakebedObject = (
  lakebed: ts.Expression | undefined,
  sourceFile: ts.SourceFile,
  entry: ReactExportSourceEntry,
): LakebedObjectSource | null => {
  if (!lakebed) return null
  const expression = unwrapExpression(lakebed)
  if (ts.isObjectLiteralExpression(expression)) {
    return { object: expression, sourceFile }
  }
  return ts.isIdentifier(expression)
    ? readImportedLakebedObject(sourceFile, entry, expression.text)
    : null
}

export const readLakebedDefinition = (
  componentName: string,
  entry: ReactExportSourceEntry,
): LakebedDefinition | null => {
  const sourceFile = ts.createSourceFile(
    entry.file,
    entry.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== componentName
      ) {
        continue
      }

      const call = declaration.initializer
      if (
        !call ||
        !ts.isCallExpression(call) ||
        !isExportableFactory(call.expression.getText(sourceFile))
      ) {
        continue
      }

      const config = call.arguments[0]
      if (!config || !ts.isObjectLiteralExpression(config)) continue
      const lakebedProperty = config.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'lakebed',
      )
      const lakebed = lakebedProperty?.initializer
      const lakebedSource = resolveLakebedObject(lakebed, sourceFile, entry)
      if (!lakebedSource) return null

      const prop = (name: string) =>
        lakebedSource.object.properties.find(
          (property): property is ts.PropertyAssignment =>
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === name,
        )?.initializer

      const schema = resolveSchemaObject(
        prop('schema'),
        lakebedSource.sourceFile,
      )
      return {
        schemaSource: normalizeLakebedSchemaSource(
          schema ? lakebedSchemaSource(schema, lakebedSource.sourceFile) : null,
        ),
        numericFieldNames: readNumericSchemaFields(
          schema ?? undefined,
          lakebedSource.sourceFile,
        ),
        queries: objectRecord(prop('queries'), lakebedSource.sourceFile),
        mutations: objectRecord(prop('mutations'), lakebedSource.sourceFile),
        endpoints: readEndpointRecord(
          prop('endpoints'),
          lakebedSource.sourceFile,
        ),
      }
    }
  }

  return null
}

const normalizeClientComponentSource = (source: string): string =>
  source
    .replace(/\bReactNode\b/g, 'ComponentChildren')
    .replace(/\bReact\./g, '')

const transformClientComponentImports = (
  sourceFile: ts.SourceFile,
  outPath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
  sourcePath?: string,
): { imports: string[]; vendorFiles: Set<string> } => {
  const imports: string[] = [
    'import type { ComponentChildren } from "preact"',
    'import type { LakebedAdapter } from "../lib/lakebed"',
  ]
  const before = new Set(Object.keys(files))

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    if (!ts.isStringLiteral(specifier)) continue
    const moduleName = specifier.text
    const clause = statement.importClause
    if (!clause) continue
    if (clause.isTypeOnly) continue

    if (
      moduleName === '@openuidev/react-lang' ||
      moduleName === './openui.ts' ||
      moduleName === '#/capsules/openui.ts' ||
      moduleName === 'zod/v4' ||
      moduleName === '@ship-fast/lakebed/server'
    ) {
      continue
    }
    if (
      moduleName.startsWith('.') &&
      /(?:^|\/)[\w-]+-lakebed(?:\.[cm]?[jt]sx?)?$/.test(moduleName)
    ) {
      continue
    }

    if (moduleName === 'react') {
      const namedBindings = clause.namedBindings
      if (namedBindings && ts.isNamedImports(namedBindings)) {
        const hookNames = namedBindings.elements
          .map((element) => element.name.text)
          .filter((name) => !/^ReactNode$/.test(name))
        if (hookNames.length > 0) {
          imports.push(`import { ${hookNames.join(', ')} } from "preact/hooks"`)
        }
      }
      continue
    }

    const rewritten = rewriteLakebedClientImports(
      statement.getText(sourceFile),
      {
        outPath,
        files,
        seenVendorFiles,
        seenBlockFiles,
        sourcePath,
      },
    )
    imports.push(rewritten)
  }

  if (imports.some((line) => /\bcn\b/.test(line))) {
    copyBlocksClientSourceForLakebed(
      'src/lib/utils',
      files,
      seenVendorFiles,
      seenBlockFiles,
    )
  }

  return {
    imports: [...new Set(imports)],
    vendorFiles: new Set(
      Object.keys(files).filter((path) => !before.has(path)),
    ),
  }
}

const readClientComponentDefinition = (
  componentName: string,
  entry: ReactExportSourceEntry,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
): ClientComponentDefinition | null => {
  const sourceFile = ts.createSourceFile(
    entry.file,
    entry.source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (
        !ts.isIdentifier(declaration.name) ||
        declaration.name.text !== componentName
      ) {
        continue
      }

      const call = declaration.initializer
      if (
        !call ||
        !ts.isCallExpression(call) ||
        !isExportableFactory(call.expression.getText(sourceFile))
      ) {
        continue
      }

      const config = call.arguments[0]
      if (!config || !ts.isObjectLiteralExpression(config)) continue
      const componentProperty = config.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'component',
      )
      if (!componentProperty) return null
      const outPath = `client/components/${toIdentifier(componentName)}.tsx`
      const { imports, vendorFiles } = transformClientComponentImports(
        sourceFile,
        outPath,
        files,
        seenVendorFiles,
        seenBlockFiles,
        entry.file,
      )

      return {
        name: componentName,
        preludeSources: collectClientComponentPreludeSources(
          sourceFile,
          statement,
          componentProperty.initializer,
        ),
        source: normalizeClientComponentSource(
          printNode(componentProperty.initializer, sourceFile),
        ),
        imports,
        vendorFiles,
      }
    }
  }

  return null
}

const collectDefinitions = (componentNames: string[]): LakebedDefinition[] => {
  const manifest = getManifestSourceIndex()
  return componentNames
    .map((componentName) => {
      const entry = manifest[componentName]
      return entry ? readLakebedDefinition(componentName, entry) : null
    })
    .filter(
      (definition): definition is LakebedDefinition => definition !== null,
    )
}

const collectClientComponents = (
  componentNames: string[],
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
): ClientComponentDefinition[] => {
  const manifest = getManifestSourceIndex()
  return componentNames
    .map((componentName) => {
      const entry = manifest[componentName]
      return entry
        ? readClientComponentDefinition(
            componentName,
            entry,
            files,
            seenVendorFiles,
            seenBlockFiles,
          )
        : null
    })
    .filter(
      (definition): definition is ClientComponentDefinition =>
        definition !== null,
    )
}

const buildRoutes = (
  parsed: ReturnType<typeof parseOpenUIForExport>,
): LakebedRoute[] => {
  const used = new Set<string>()
  return parsed.pages.map((page, index) => {
    unwrapSingleObjectArgProps(page)
    const label = parsed.routes[index] ?? `Page ${index + 1}`
    return {
      label,
      path: uniqueRoutePath(label, index, used),
      componentName: `RoutePage${index + 1}${toIdentifier(label)}`,
      node: page,
      props: (page.props ?? {}) as Record<string, unknown>,
    }
  })
}

type ComponentSchemaDef = {
  properties?: Record<
    string,
    { type?: string; properties?: unknown; items?: unknown; $ref?: unknown }
  >
}

let componentSchemaDefs: Record<string, ComponentSchemaDef> | null = null

const getComponentSchemaDefs = (): Record<string, ComponentSchemaDef> => {
  if (componentSchemaDefs) return componentSchemaDefs
  try {
    const schema = library.toJSONSchema() as Record<string, unknown>
    const defs = (schema.$defs ?? schema.properties ?? {}) as Record<
      string,
      ComponentSchemaDef
    >
    componentSchemaDefs = defs
    return defs
  } catch {
    componentSchemaDefs = {}
    return componentSchemaDefs
  }
}

const isObjectLikeSchema = (def: {
  type?: string
  properties?: unknown
  items?: unknown
  $ref?: unknown
}): boolean =>
  def.type === 'object' ||
  def.type === 'array' ||
  Boolean(def.properties) ||
  Boolean(def.items) ||
  Boolean(def.$ref)

// The OpenUI parser maps positional arguments to a component's declared prop
// slots in order. When a component is called with a single object literal
// argument (e.g. `EcommerceNavbar({"brand":"CocoaCraft","nav":["Shop"]})`),
// the parser assigns that object to the first positional slot (`brand`)
// instead of spreading it as the props bag. Detect that mis-assignment — the
// sole prop slot expects a scalar but received a non-array object whose keys
// are all valid prop names of the component — and unwrap it so the object
// becomes the component props.
const unwrapSingleObjectArgProps = (node: unknown): void => {
  if (!isOpenUIElementNode(node)) return
  const props = node.props
  if (props && typeof props === 'object' && !Array.isArray(props)) {
    const keys = Object.keys(props)
    if (
      keys.length === 1 &&
      !routeRenderPrimitives.has(node.typeName) &&
      node.typeName !== 'PageSwitch'
    ) {
      const onlyKey = keys[0]
      const wrapped = props[onlyKey] as unknown
      if (wrapped && typeof wrapped === 'object' && !Array.isArray(wrapped)) {
        const def = getComponentSchemaDefs()[node.typeName]
        const propNames = def?.properties
          ? new Set(Object.keys(def.properties))
          : null
        const onlyKeyDef = def?.properties?.[onlyKey]
        const wrappedKeys = Object.keys(wrapped as Record<string, unknown>)
        if (
          propNames &&
          wrappedKeys.length >= 2 &&
          (!onlyKeyDef || !isObjectLikeSchema(onlyKeyDef)) &&
          wrappedKeys.every((key) => propNames.has(key))
        ) {
          for (const key of keys) delete props[key]
          Object.assign(props, wrapped as Record<string, unknown>)
        }
      }
    }
  }
  for (const value of Object.values(node.props ?? {})) {
    if (Array.isArray(value))
      value.forEach((item) => unwrapSingleObjectArgProps(item))
    else unwrapSingleObjectArgProps(value)
  }
}

const routeRenderPrimitives = new Set([
  'Box',
  'Grid',
  'Heading',
  'PageSwitch',
  'Section',
  'SectionAnchor',
  'Spacer',
  'Stack',
  'Text',
])

const isOpenUIElementNode = (value: unknown): value is ElementNode =>
  value !== null &&
  typeof value === 'object' &&
  !Array.isArray(value) &&
  'type' in value &&
  value.type === 'element' &&
  'typeName' in value &&
  typeof value.typeName === 'string'

const collectNodeComponentNames = (
  value: unknown,
  names = new Set<string>(),
): Set<string> => {
  if (Array.isArray(value)) {
    for (const item of value) collectNodeComponentNames(item, names)
    return names
  }

  if (!isOpenUIElementNode(value)) return names
  if (value.typeName && !routeRenderPrimitives.has(value.typeName)) {
    names.add(value.typeName)
  }
  for (const propValue of Object.values(value.props ?? {})) {
    collectNodeComponentNames(propValue, names)
  }
  return names
}

const collectRouteComponentNames = (routes: LakebedRoute[]): string[] => [
  ...new Set(
    routes.flatMap((route) => [...collectNodeComponentNames(route.node)]),
  ),
]

const routeGapClass = (value: unknown): string => {
  if (value === 'none') return 'gap-0'
  if (value === 'xs') return 'gap-1'
  if (value === 'sm') return 'gap-2'
  if (value === 'lg') return 'gap-6'
  if (value === 'xl') return 'gap-10'
  return 'gap-4'
}

const routeAlignClass = (value: unknown): string => {
  if (value === 'start') return 'items-start'
  if (value === 'center') return 'items-center'
  if (value === 'end') return 'items-end'
  if (value === 'stretch') return 'items-stretch'
  return ''
}

const routeJustifyClass = (value: unknown): string => {
  if (value === 'start') return 'justify-start'
  if (value === 'center') return 'justify-center'
  if (value === 'end') return 'justify-end'
  if (value === 'between') return 'justify-between'
  if (value === 'around') return 'justify-around'
  return ''
}

const routeStackClass = (props: Record<string, unknown>) =>
  [
    'flex',
    props.direction === 'row' ? 'flex-row' : 'flex-col',
    routeGapClass(props.gap),
    routeAlignClass(props.align),
    routeJustifyClass(props.justify),
    props.wrap === true ? 'flex-wrap' : '',
    props.className,
  ]
    .filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    )
    .join(' ')

const routeGridClass = (cols: unknown, gap: unknown, className: unknown) => {
  const colsClass =
    cols === '1'
      ? 'grid-cols-1'
      : cols === '2'
        ? 'grid-cols-1 sm:grid-cols-2'
        : cols === '4'
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
          : cols === '5'
            ? 'grid-cols-2 lg:grid-cols-5'
            : cols === '6'
              ? 'grid-cols-2 lg:grid-cols-6'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
  return ['grid', colsClass, routeGapClass(gap), className]
    .filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    )
    .join(' ')
}

const routeHeadingClass = (level: unknown): string => {
  if (level === '1') return 'text-4xl font-bold tracking-tight md:text-5xl'
  if (level === '3') return 'text-2xl font-semibold'
  if (level === '4') return 'text-lg font-semibold'
  return 'text-3xl font-semibold tracking-tight'
}

const routeSpacerClass = (size: unknown): string => {
  if (size === 'xs') return 'h-2'
  if (size === 'sm') return 'h-4'
  if (size === 'lg') return 'h-16'
  if (size === 'xl') return 'h-28'
  return 'h-8'
}

const jsxAttribute = (name: string, value: unknown): string =>
  typeof value === 'string' && value.length > 0
    ? ` ${name}=${JSON.stringify(value)}`
    : ''

const renderRouteNodeChildren = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map((item) => renderRouteNode(item)).join('\n')
  }
  return renderRouteNode(value)
}

const renderRouteNode = (value: unknown): string => {
  if (!isOpenUIElementNode(value)) return ''

  const props = value.props ?? {}
  if (value.typeName === 'Stack') {
    return `<div className=${JSON.stringify(routeStackClass(props))}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Grid') {
    return `<div className=${JSON.stringify(routeGridClass(props.cols, props.gap, props.className))}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Box') {
    return `<div${jsxAttribute('className', props.className)}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Section') {
    return `<section className=${JSON.stringify(
      ['w-full px-4 py-12 md:py-20', props.className]
        .filter(
          (item): item is string => typeof item === 'string' && item.length > 0,
        )
        .join(' '),
    )}>
  <div className="mx-auto max-w-6xl">
${renderRouteNodeChildren(props.children)}
  </div>
</section>`
  }
  if (value.typeName === 'SectionAnchor') {
    return `<div${jsxAttribute('id', props.id)}${jsxAttribute('className', props.className)}>
${renderRouteNodeChildren(props.children)}
</div>`
  }
  if (value.typeName === 'Spacer') {
    return `<div className=${JSON.stringify(routeSpacerClass(props.size))} />`
  }
  if (value.typeName === 'Heading') {
    return `<h2 className=${JSON.stringify(
      [routeHeadingClass(props.level), props.className]
        .filter(
          (item): item is string => typeof item === 'string' && item.length > 0,
        )
        .join(' '),
    )}>{${JSON.stringify(String(props.text ?? ''))}}</h2>`
  }
  if (value.typeName === 'Text') {
    return `<p className=${JSON.stringify(
      [
        'leading-7',
        props.tone === 'muted' ? 'text-muted-foreground' : '',
        props.className,
      ]
        .filter(
          (item): item is string => typeof item === 'string' && item.length > 0,
        )
        .join(' '),
    )}>{${JSON.stringify(String(props.text ?? ''))}}</p>`
  }
  if (!value.typeName || value.typeName === 'PageSwitch') return ''

  return `<${toIdentifier(value.typeName)}Block props={${JSON.stringify(
    props,
  )}} lakebed={input.lakebed} />`
}

const renderRouteClientComponentDefinition = (
  route: LakebedRoute,
  nestedComponentNames: string[],
): ClientComponentDefinition => ({
  name: route.componentName,
  preludeSources: [],
  source: `(input) => (
    <>
${renderRouteNode(route.node)}
    </>
  )`,
  imports: [
    'import type { ComponentChildren } from "preact";',
    'import type { LakebedAdapter } from "../lib/lakebed";',
    ...nestedComponentNames.map(
      (name) =>
        `import { ${toIdentifier(name)}Block } from "./${toIdentifier(name)}";`,
    ),
  ],
  vendorFiles: new Set<string>(),
})

const normalizeRouteTarget = (value: string): string =>
  value.trim().toLowerCase()

const resolveLakebedRouteTarget = (
  target: string,
  routes: LakebedRoute[],
): string | null => {
  const [pageLabel, sectionId] = target.split('#')
  const route = routes.find(
    (entry) =>
      normalizeRouteTarget(entry.label) ===
      normalizeRouteTarget(pageLabel ?? ''),
  )
  if (!route) return null
  return sectionId ? `${route.path}#${sectionId}` : route.path
}

const buildLakebedTargetMap = (
  routes: LakebedRoute[],
  sourceTargetMap: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(sourceTargetMap)
      .map(([alias, target]) => [
        alias,
        resolveLakebedRouteTarget(target, routes),
      ])
      .filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
  )

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const firstString = (
  source: Record<string, unknown>,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
    if (typeof value === 'number' && Number.isFinite(value))
      return String(value)
  }
  return undefined
}

const sanitizeSharedText = (value: string): string =>
  value
    .replace(/\bprocesses\b/gi, (match) =>
      match[0] === match[0]?.toUpperCase() ? 'Workflows' : 'workflows',
    )
    .replace(/\bprocess\b/gi, (match) =>
      match[0] === match[0]?.toUpperCase() ? 'Workflow' : 'workflow',
    )

const sectionTitleKeys = [
  'title',
  'name',
  'heading',
  'headline',
  'label',
  'question',
  'category',
]

const sectionDescriptionKeys = [
  'description',
  'excerpt',
  'body',
  'answer',
  'summary',
  'subtitle',
  'copy',
  'text',
]

const sectionMetaKeys = [
  'price',
  'tag',
  'date',
  'author',
  'location',
  'role',
  'status',
  'cta',
]

const collectContentSections = (
  value: unknown,
  routeId: string,
  sections: ContentSection[] = [],
): ContentSection[] => {
  if (sections.length >= 12 || value == null) return sections

  if (Array.isArray(value)) {
    value.forEach((item) => collectContentSections(item, routeId, sections))
    return sections
  }

  if (!isRecord(value)) return sections

  const title = firstString(value, sectionTitleKeys)
  const description = firstString(value, sectionDescriptionKeys)
  if (title && description) {
    sections.push({
      id: `${routeId}-${sections.length + 1}`,
      title: sanitizeSharedText(title),
      description: sanitizeSharedText(description),
      meta: sanitizeSharedText(firstString(value, sectionMetaKeys) ?? ''),
    })
  }

  for (const nested of Object.values(value)) {
    collectContentSections(nested, routeId, sections)
    if (sections.length >= 12) break
  }

  return sections
}

type ServerSchemaRender = {
  source: string
  tableFields: Map<string, string[]>
}

const collectTableFieldsFromSchemaSource = (
  source: string,
  tableFields: Map<string, Map<string, string>>,
) => {
  const sourceFile = ts.createSourceFile(
    'merged-schema.ts',
    `const schema = ${source}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])[0]
  const schema = declaration?.initializer
  if (!schema || !ts.isObjectLiteralExpression(schema)) return

  for (const tableProperty of schema.properties) {
    if (!ts.isPropertyAssignment(tableProperty)) continue
    const tableName = propertyNameText(tableProperty.name, sourceFile)
    const tableCall = tableProperty.initializer
    if (
      !ts.isCallExpression(tableCall) ||
      tableCall.expression.getText(sourceFile) !== 'table'
    ) {
      continue
    }
    const shape = tableCall.arguments[0]
    if (!shape || !ts.isObjectLiteralExpression(shape)) continue

    const fields = tableFields.get(tableName) ?? new Map<string, string>()
    for (const fieldProperty of shape.properties) {
      if (!ts.isPropertyAssignment(fieldProperty)) continue
      fields.set(
        propertyNameText(fieldProperty.name, sourceFile),
        printNode(fieldProperty.initializer, sourceFile),
      )
    }
    tableFields.set(tableName, fields)
  }
}

const renderMergedSchema = (
  sources: Array<string | null>,
  fallback: string,
): ServerSchemaRender => {
  const schemaSources = sources.filter((source): source is string =>
    Boolean(source?.trim()),
  )
  const sourceForFields = schemaSources.length > 0 ? schemaSources : [fallback]
  const tableFieldsByName = new Map<string, Map<string, string>>()

  for (const source of sourceForFields) {
    collectTableFieldsFromSchemaSource(source, tableFieldsByName)
  }

  if (tableFieldsByName.size === 0) {
    return { source: fallback, tableFields: new Map() }
  }

  const tableFields = new Map<string, string[]>()
  const tableSources = [...tableFieldsByName.entries()].map(
    ([tableName, fields]) => {
      tableFields.set(tableName, [...fields.keys()])
      const fieldSource = [...fields.entries()]
        .map(([fieldName, initializer]) => `    ${fieldName}: ${initializer}`)
        .join(',\n')
      return `  ${tableName}: table({\n${fieldSource}\n  })`
    },
  )

  return {
    source: `{\n${tableSources.join(',\n')}\n}`,
    tableFields,
  }
}

const singularTableName = (tableName: string): string => {
  if (tableName.endsWith('ies')) return `${tableName.slice(0, -3)}y`
  if (tableName.endsWith('s')) return tableName.slice(0, -1)
  return tableName
}

const isPlainRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

const collectionItemsForTable = (
  props: Record<string, unknown>,
  tableName: string,
): Record<string, unknown>[] => {
  const candidates = [tableName, singularTableName(tableName)]
  const items: Record<string, unknown>[] = []
  const seen = new Set<unknown>()

  const visit = (value: unknown) => {
    if (!isPlainRecord(value) || seen.has(value)) return
    seen.add(value)

    for (const key of candidates) {
      const collection = value[key]
      if (Array.isArray(collection)) {
        items.push(...collection.filter(isPlainRecord))
        continue
      }
      if (isPlainRecord(collection) && Array.isArray(collection.items)) {
        items.push(...collection.items.filter(isPlainRecord))
      }
    }

    for (const nested of Object.values(value)) {
      if (isPlainRecord(nested)) {
        visit(nested)
      } else if (Array.isArray(nested)) {
        for (const entry of nested) visit(entry)
      }
    }
  }

  visit(props)
  return items
}

const DEFAULT_COMMERCE_PRODUCTS: Record<string, string>[] = [
  {
    brand: 'Featured',
    name: 'Signature Series',
    alt: 'Featured product on a clean studio background',
    price: '$195',
    oldPrice: '$230',
    badge: 'New',
    image: '',
  },
  {
    brand: 'Featured',
    name: 'Everyday Essential',
    alt: 'Lifestyle product photography on a neutral background',
    price: '$250',
    oldPrice: '',
    badge: '',
    image: '',
  },
  {
    brand: 'Featured',
    name: 'Classic Edition',
    alt: 'Close-up product detail on a neutral background',
    price: '$175',
    oldPrice: '$210',
    badge: 'Sale',
    image: '',
  },
  {
    brand: 'Featured',
    name: 'Studio Collection',
    alt: 'Featured product on a clean studio background',
    price: '$160',
    oldPrice: '',
    badge: '',
    image: '',
  },
]

const usesDefaultCommerceProducts = (route: LakebedRoute): boolean => {
  if (!/commerce|ecommerce|shop|store|marketplace/i.test(route.componentName)) {
    return false
  }

  return collectionItemsForTable(route.props, 'products').length === 0
}

const defaultRowsForTable = (
  tableName: string,
  fields: string[],
  routes: LakebedRoute[],
): Record<string, unknown>[] => {
  const fieldSet = new Set(fields)
  if (
    tableName !== 'products' ||
    !fieldSet.has('name') ||
    !fieldSet.has('price') ||
    !routes.some(usesDefaultCommerceProducts)
  ) {
    return []
  }

  return DEFAULT_COMMERCE_PRODUCTS
}

const seedRowsForTable = (
  tableName: string,
  fields: string[],
  routes: LakebedRoute[],
): Array<Record<string, string>> => {
  const rowsByKey = new Map<string, Record<string, string>>()
  for (const route of routes) {
    const items = collectionItemsForTable(route.props, tableName)
    for (const item of items) {
      const row: Record<string, string> = {}
      let hasFieldValue = false
      for (const field of fields) {
        const raw = item[field]
        const value = raw == null ? '' : String(raw)
        row[field] = value
        if (value) hasFieldValue = true
      }
      if (!hasFieldValue) continue
      rowsByKey.set(JSON.stringify(row), row)
    }
  }

  if (rowsByKey.size === 0) {
    for (const item of defaultRowsForTable(tableName, fields, routes)) {
      const row: Record<string, string> = {}
      let hasFieldValue = false
      for (const field of fields) {
        const raw = item[field]
        const value = raw == null ? '' : String(raw)
        row[field] = value
        if (value) hasFieldValue = true
      }
      if (!hasFieldValue) continue
      rowsByKey.set(JSON.stringify(row), row)
    }
  }

  return [...rowsByKey.values()]
}

const renderSeedData = (
  routes: LakebedRoute[],
  tableFields: Map<string, string[]>,
): string => {
  const seedRows = Object.fromEntries(
    [...tableFields.entries()]
      .map(([tableName, fields]) => [
        tableName,
        seedRowsForTable(tableName, fields, routes),
      ])
      .filter(([, rows]) => rows.length > 0),
  )

  return `const seedRows: Record<string, Array<Record<string, string>>> = ${JSON.stringify(seedRows, null, 2)};

const seededTables = new Set<string>();

type LakebedSeedTable = {
  all(): unknown[];
  insert(row: Record<string, string>): unknown;
};

function ensureSeedData(db: Record<string, LakebedSeedTable | undefined>) {
  for (const [tableName, rows] of Object.entries(seedRows)) {
    if (seededTables.has(tableName)) continue;
    const table = db[tableName];
    if (!table || table.all().length > 0) {
      seededTables.add(tableName);
      continue;
    }
    for (const row of rows) {
      table.insert(row);
    }
    seededTables.add(tableName);
  }
}
`
}

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const allowedLakebedClientBareImport = (specifier: string): string | null => {
  if (specifier === 'react' || specifier === 'react-dom') return 'preact/compat'
  if (specifier === 'react/jsx-runtime') return 'preact/jsx-runtime'
  if (specifier === 'react/jsx-dev-runtime') return 'preact/jsx-dev-runtime'
  if (specifier === 'react-dom/client') return 'preact/compat'
  if (
    specifier === 'preact' ||
    specifier === 'preact/hooks' ||
    specifier === 'preact/compat' ||
    specifier === 'preact/jsx-runtime' ||
    specifier === 'preact/jsx-dev-runtime' ||
    specifier === 'lakebed/client'
  ) {
    return specifier
  }
  return null
}

const packageSubpath = (specifier: string, packageName: string): string =>
  specifier === packageName ? '.' : `.${specifier.slice(packageName.length)}`

const exportedPackagePath = (
  exportTarget: unknown,
  subpath = '.',
): string | null => {
  if (typeof exportTarget === 'string') {
    if (exportTarget.includes('*') && subpath.startsWith('./')) {
      return exportTarget.replace('*', subpath.slice(2))
    }
    return exportTarget
  }
  if (!exportTarget || typeof exportTarget !== 'object') return null
  const record = exportTarget as Record<string, unknown>
  return (
    exportedPackagePath(record.import, subpath) ??
    exportedPackagePath(record.default, subpath) ??
    exportedPackagePath(record.browser, subpath) ??
    null
  )
}

const resolvePackageExportTarget = (
  exportsField: unknown,
  subpath: string,
): unknown => {
  if (subpath === '.') {
    return exportsField && typeof exportsField === 'object'
      ? (exportsField as Record<string, unknown>)['.']
      : exportsField
  }
  if (!exportsField || typeof exportsField !== 'object') return null
  const exportsRecord = exportsField as Record<string, unknown>
  if (exportsRecord[subpath]) return exportsRecord[subpath]
  for (const [key, value] of Object.entries(exportsRecord)) {
    if (!key.includes('*')) continue
    const [prefix, suffix = ''] = key.split('*')
    if (subpath.startsWith(prefix) && subpath.endsWith(suffix)) return value
  }
  return null
}

const resolveVendorSourceManifestPath = (
  sourceRelPath: string,
): string | null => {
  const normalizedRel = toPosixPath(sourceRelPath)
    .replace(/^node_modules\//, '')
    .replace(/^client\/vendor\//, '')
    .replace(/^\.\//, '')
  const sourceFiles = getVendorSourceFileIndex()
  const candidates = sourcePathCandidates(normalizedRel)
  return (
    candidates.find((candidate) => sourceFiles[candidate] !== undefined) ?? null
  )
}

const resolveRelativeVendorSourcePath = (
  sourcePath: string,
  moduleName: string,
): string | null =>
  resolveVendorSourceManifestPath(
    toPosixPath(join(dirname(sourcePath), moduleName)),
  )

const resolveBareImportFile = (specifier: string): string => {
  const packageName = readPublicPackageName(specifier)
  if (!packageName) {
    throw new Error(`Cannot resolve non-package import: ${specifier}`)
  }
  const packageJsonPath = resolveVendorSourceManifestPath(
    `${packageName}/package.json`,
  )
  if (!packageJsonPath) {
    throw new Error(`Missing vendored package metadata for ${packageName}`)
  }
  const packageRoot = dirname(packageJsonPath)
  const packageJsonSource = getVendorSourceFileIndex()[packageJsonPath]
  if (packageJsonSource === undefined) {
    throw new Error(`Missing vendored package metadata for ${packageName}`)
  }
  const packageJson = JSON.parse(packageJsonSource) as {
    exports?: Record<string, unknown> | string
    'jsnext:main'?: string
    module?: string
    main?: string
  }
  const subpath = packageSubpath(specifier, packageName)
  const exportTarget = resolvePackageExportTarget(packageJson.exports, subpath)
  const exported = exportedPackagePath(exportTarget, subpath)
  const candidate =
    exported ??
    (subpath === '.' ? (packageJson.module ?? packageJson.main) : subpath)
  if (!candidate) {
    throw new Error(`Cannot resolve vendored package import: ${specifier}`)
  }
  const resolved = resolveVendorSourceManifestPath(join(packageRoot, candidate))
  if (resolved?.endsWith('/package.json')) {
    const nestedPackageJsonSource = getVendorSourceFileIndex()[resolved]
    if (!nestedPackageJsonSource) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJson = JSON.parse(nestedPackageJsonSource) as {
      'jsnext:main'?: string
      module?: string
      main?: string
    }
    const nestedCandidate =
      nestedPackageJson.module ??
      nestedPackageJson['jsnext:main'] ??
      nestedPackageJson.main
    const nestedResolved = nestedCandidate
      ? resolveVendorSourceManifestPath(
          join(dirname(resolved), nestedCandidate),
        )
      : null
    if (!nestedResolved) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    return nestedResolved
  }
  if (!resolved) {
    const nestedPackageJsonPath = resolveVendorSourceManifestPath(
      join(packageRoot, candidate, 'package.json'),
    )
    if (!nestedPackageJsonPath) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJsonSource =
      getVendorSourceFileIndex()[nestedPackageJsonPath]
    if (!nestedPackageJsonSource) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    const nestedPackageJson = JSON.parse(nestedPackageJsonSource) as {
      'jsnext:main'?: string
      module?: string
      main?: string
    }
    const nestedCandidate =
      nestedPackageJson.module ??
      nestedPackageJson['jsnext:main'] ??
      nestedPackageJson.main
    const nestedResolved = nestedCandidate
      ? resolveVendorSourceManifestPath(
          join(dirname(nestedPackageJsonPath), nestedCandidate),
        )
      : null
    if (!nestedResolved) {
      throw new Error(`Missing vendored package source for ${specifier}`)
    }
    return nestedResolved
  }
  return resolved
}

const vendorOutPathFor = (sourcePath: string): string => {
  const relativeToNodeModules = resolveVendorSourceManifestPath(sourcePath)
  if (!relativeToNodeModules) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  return `client/vendor/${relativeToNodeModules}`
}

type SourceRewriteContext = {
  outPath: string
  sourcePath?: string
  files: Record<string, string>
  seenVendorFiles: Set<string>
  seenBlockFiles: Set<string>
}

const replaceRanges = (
  source: string,
  ranges: Array<{ start: number; end: number; text: string }>,
): string => {
  let next = source
  for (const range of ranges.sort((a, b) => b.start - a.start)) {
    next = `${next.slice(0, range.start)}${range.text}${next.slice(range.end)}`
  }
  return next
}

const applyLakebedVendorCompatibility = (
  source: string,
  sourcePath: string,
): string => {
  const relativeToNodeModules = resolveVendorSourceManifestPath(sourcePath)
  if (relativeToNodeModules !== '@radix-ui/react-presence/dist/index.mjs') {
    return source
  }
  return source.replace(
    'stylesRef.current = node2 ? getComputedStyle(node2) : null;\n      setNode(node2);',
    'const element = node2 instanceof Element ? node2 : null;\n      stylesRef.current = element ? getComputedStyle(element) : null;\n      setNode(element);',
  )
}

type VendorExportTarget = {
  importName: string
  namespace: boolean
  sourcePath: string
}

const vendorSourceFileKind = (path: string): ts.ScriptKind =>
  /\.(tsx|jsx)$/.test(path) ? ts.ScriptKind.TSX : ts.ScriptKind.JS

const resolveVendorNamedExportInFile = (
  sourcePath: string,
  exportedName: string,
  seen = new Set<string>(),
): VendorExportTarget | null => {
  const manifestPath = resolveVendorSourceManifestPath(sourcePath)
  if (!manifestPath || seen.has(manifestPath)) return null
  seen.add(manifestPath)

  const source = getVendorSourceFileIndex()[manifestPath]
  if (source === undefined) return null
  const sourceFile = ts.createSourceFile(
    manifestPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    vendorSourceFileKind(manifestPath),
  )
  const namespaceImports = new Map<string, string>()

  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    const bindings = statement.importClause?.namedBindings
    if (
      !ts.isStringLiteral(specifier) ||
      !bindings ||
      !ts.isNamespaceImport(bindings)
    ) {
      continue
    }
    namespaceImports.set(bindings.name.text, specifier.text)
  }

  for (const statement of sourceFile.statements) {
    if (!ts.isExportDeclaration(statement)) continue
    const exportClause = statement.exportClause

    if (
      !exportClause &&
      statement.moduleSpecifier &&
      ts.isStringLiteral(statement.moduleSpecifier)
    ) {
      const moduleName = statement.moduleSpecifier.text
      const target = moduleName.startsWith('.')
        ? resolveRelativeVendorSourcePath(manifestPath, moduleName)
        : resolveBareImportFile(moduleName)
      const resolved = target
        ? resolveVendorNamedExportInFile(target, exportedName, seen)
        : null
      if (resolved) return resolved
      continue
    }

    if (!exportClause || !ts.isNamedExports(exportClause)) continue

    for (const element of exportClause.elements) {
      if (element.name.text !== exportedName) continue
      const localName = (element.propertyName ?? element.name).text
      const moduleSpecifier = statement.moduleSpecifier

      if (moduleSpecifier && ts.isStringLiteral(moduleSpecifier)) {
        const moduleName = moduleSpecifier.text
        const target = moduleName.startsWith('.')
          ? resolveRelativeVendorSourcePath(manifestPath, moduleName)
          : resolveBareImportFile(moduleName)
        return target
          ? { importName: localName, namespace: false, sourcePath: target }
          : null
      }

      const namespaceModule = namespaceImports.get(localName)
      if (namespaceModule) {
        return {
          importName: '*',
          namespace: true,
          sourcePath: resolveBareImportFile(namespaceModule),
        }
      }

      return {
        importName: exportedName,
        namespace: false,
        sourcePath: manifestPath,
      }
    }
  }

  return null
}

const resolveVendorNamedExport = (
  specifier: string,
  exportedName: string,
): VendorExportTarget => {
  const entry = resolveBareImportFile(specifier)
  return (
    resolveVendorNamedExportInFile(entry, exportedName) ?? {
      importName: exportedName,
      namespace: false,
      sourcePath: entry,
    }
  )
}

const copyVendorSourceFile = (
  sourcePath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
): string => {
  const manifestPath = resolveVendorSourceManifestPath(sourcePath)
  if (!manifestPath) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  const outPath = vendorOutPathFor(manifestPath)
  if (seenVendorFiles.has(outPath)) return outPath
  seenVendorFiles.add(outPath)
  const vendorSource = getVendorSourceFileIndex()[manifestPath]
  if (vendorSource === undefined) {
    throw new Error(`Cannot find vendored dependency source: ${sourcePath}`)
  }
  const source = applyLakebedVendorCompatibility(vendorSource, manifestPath)
  files[outPath] = rewriteLakebedClientImports(source, {
    outPath,
    sourcePath: manifestPath,
    files,
    seenVendorFiles,
    seenBlockFiles: new Set(),
  })
  return outPath
}

const copyBareVendorImport = (
  specifier: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
): string =>
  copyVendorSourceFile(resolveBareImportFile(specifier), files, seenVendorFiles)

const rewriteNamedBareImport = (
  statement: ts.ImportDeclaration,
  context: SourceRewriteContext,
): string | null => {
  const specifier = statement.moduleSpecifier
  if (!ts.isStringLiteral(specifier)) return null
  const moduleName = specifier.text
  if (
    allowedLakebedClientBareImport(moduleName) ||
    moduleName === '@ship-fast/lakebed/react' ||
    moduleName.startsWith('.') ||
    moduleName.startsWith('#/')
  ) {
    return null
  }
  const clause = statement.importClause
  const namedBindings = clause?.namedBindings
  if (!namedBindings || !ts.isNamedImports(namedBindings)) return null

  return namedBindings.elements
    .map((element) => {
      const localName = element.name.text
      const importedName = (element.propertyName ?? element.name).text
      const target = resolveVendorNamedExport(moduleName, importedName)
      const vendorPath = copyVendorSourceFile(
        target.sourcePath,
        context.files,
        context.seenVendorFiles,
      )
      const importPath = relativeImportPath(context.outPath, vendorPath)
      if (target.namespace)
        return `import * as ${localName} from "${importPath}";`
      if (target.importName === 'default') {
        return `import { default as ${localName} } from "${importPath}";`
      }
      if (target.importName === localName) {
        return `import { ${target.importName} } from "${importPath}";`
      }
      return `import { ${target.importName} as ${localName} } from "${importPath}";`
    })
    .join('\n')
}

function rewriteLakebedClientImports(
  source: string,
  context: SourceRewriteContext,
): string {
  const sourceFile = ts.createSourceFile(
    context.outPath,
    source,
    ts.ScriptTarget.Latest,
    true,
    context.outPath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const ranges: Array<{ start: number; end: number; text: string }> = []

  const rewriteModuleSpecifier = (moduleName: string) => {
    const allowed = allowedLakebedClientBareImport(moduleName)
    if (allowed) return allowed

    if (moduleName.startsWith('#/lib/utils')) {
      copyBlocksClientSourceForLakebed(
        'src/lib/utils',
        context.files,
        context.seenVendorFiles,
        context.seenBlockFiles,
      )
      return relativeImportPath(context.outPath, 'client/lib/cn.ts')
    }
    if (moduleName.startsWith('#/lib/use-navigate')) {
      return relativeImportPath(context.outPath, 'client/lib/navigation.tsx')
    }
    if (moduleName.startsWith('#/lib/img')) {
      return relativeImportPath(context.outPath, 'client/lib/image.tsx')
    }
    if (moduleName === '@ship-fast/lakebed/react') {
      return relativeImportPath(context.outPath, 'client/lib/lakebed.ts')
    }
    if (moduleName.startsWith('#/')) {
      const targetRel = resolveBlockSourceManifestPath(
        `src/${moduleName.slice(2)}`,
      )
      if (!targetRel) {
        throw new Error(
          `Lakebed export cannot rewrite private import ${moduleName}`,
        )
      }
      const targetOut = copyBlocksClientSourceForLakebed(
        targetRel,
        context.files,
        context.seenVendorFiles,
        context.seenBlockFiles,
      )
      return relativeImportPath(context.outPath, targetOut)
    }
    if (moduleName.startsWith('.')) {
      if (!context.sourcePath) return moduleName
      const blockSourcePath = resolveRelativeBlockSourcePath(
        context.sourcePath,
        moduleName,
      )
      if (blockSourcePath) {
        const targetOut = copyBlocksClientSourceForLakebed(
          blockSourcePath,
          context.files,
          context.seenVendorFiles,
          context.seenBlockFiles,
        )
        return relativeImportPath(context.outPath, targetOut)
      }
      const target = resolveRelativeVendorSourcePath(
        context.sourcePath,
        moduleName,
      )
      if (!target) return moduleName
      const vendorPath = copyVendorSourceFile(
        target,
        context.files,
        context.seenVendorFiles,
      )
      return relativeImportPath(context.outPath, vendorPath)
    }

    const vendorPath = copyBareVendorImport(
      moduleName,
      context.files,
      context.seenVendorFiles,
    )
    return relativeImportPath(context.outPath, vendorPath)
  }

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      if (statement.importClause?.isTypeOnly) {
        ranges.push({
          start: statement.getFullStart(),
          end: statement.getEnd(),
          text: '',
        })
        continue
      }
      const special = rewriteNamedBareImport(statement, context)
      if (special) {
        ranges.push({
          start: statement.getStart(sourceFile),
          end: statement.getEnd(),
          text: special,
        })
        continue
      }
    }
    if (
      !ts.isImportDeclaration(statement) &&
      !ts.isExportDeclaration(statement)
    ) {
      continue
    }
    const specifier = statement.moduleSpecifier
    if (!specifier || !ts.isStringLiteral(specifier)) continue
    const rewritten = rewriteModuleSpecifier(specifier.text)
    if (rewritten === specifier.text) continue
    ranges.push({
      start: specifier.getStart(sourceFile) + 1,
      end: specifier.getEnd() - 1,
      text: rewritten,
    })
  }

  return replaceRanges(source, ranges).replace(
    /^['"]use client['"];?\n\n?/g,
    '',
  )
}

function copyBlocksClientSourceForLakebed(
  sourceRelPath: string,
  files: Record<string, string>,
  seenVendorFiles: Set<string>,
  seenBlockFiles: Set<string>,
): string {
  const sourcePath = resolveBlockSourceManifestPath(sourceRelPath)
  if (!sourcePath) {
    throw new Error(`Cannot find block dependency source: ${sourceRelPath}`)
  }
  const blocksRel = sourcePath
  const outPath =
    blocksRel === 'src/lib/utils.ts'
      ? 'client/lib/cn.ts'
      : blocksRel.startsWith('src/components/')
        ? `client/${blocksRel.slice('src/'.length)}`
        : blocksRel.startsWith('src/section-kit/')
          ? `client/${blocksRel.slice('src/'.length)}`
          : `client/vendor/ship-fast-blocks/${blocksRel}`
  if (seenBlockFiles.has(outPath)) return outPath
  seenBlockFiles.add(outPath)
  const source = getBlockSourceFile(sourcePath)
  files[outPath] = rewriteLakebedClientImports(source, {
    outPath,
    sourcePath,
    files,
    seenVendorFiles,
    seenBlockFiles,
  })
  return outPath
}

const normalizeNumericFieldWrites = (
  source: string,
  numericFieldNames: Set<string>,
): string => {
  let normalized = source
  for (const fieldName of numericFieldNames) {
    const field = escapeRegExp(fieldName)
    normalized = normalized.replace(
      new RegExp(`\\b([A-Za-z_$][\\w$]*\\.${field})\\s*\\+\\s*(\\d+)`, 'g'),
      (_match, left: string, right: string) => `Number(${left}) + ${right}`,
    )
    normalized = normalized.replace(
      new RegExp(`([,{]\\s*)${field}(\\s*[,}])`, 'g'),
      `$1${fieldName}: String(${fieldName})$2`,
    )
    normalized = normalized.replace(
      new RegExp(
        `(${field}\\s*:\\s*)(?!\\s*String\\()([^,}\\n]+)(?=\\s*[,}])`,
        'g',
      ),
      (_match, prefix: string, expression: string) =>
        `${prefix}String(${expression.trim()})`,
    )
  }
  return normalized
}

const transformHandler = (
  name: string,
  source: string,
  wrapper: 'query' | 'mutation',
  numericFieldNames: Set<string>,
): string => {
  const sourceFile = ts.createSourceFile(
    `${name}.ts`,
    `const handler = ${source}`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  )
  const declaration = sourceFile.statements
    .filter(ts.isVariableStatement)
    .flatMap((statement) => [...statement.declarationList.declarations])[0]
  const initializer = declaration?.initializer
    ? unwrapExpression(declaration.initializer)
    : undefined
  const handler =
    initializer && ts.isCallExpression(initializer)
      ? initializer.arguments.find(ts.isArrowFunction)
      : initializer
  if (!handler || !ts.isArrowFunction(handler)) {
    return `${name}: ${wrapper}((ctx) => {
  ensureSeedData(ctx.db);
  return { ok: true, userId: ctx.auth.userId };
})`
  }

  const firstParameter = handler.parameters[0]?.name
  const contextName = firstParameter?.getText(sourceFile) ?? 'ctx'
  const contextAlias =
    contextName && contextName !== 'ctx' ? `  const ${contextName} = ctx\n` : ''
  const args = handler.parameters
    .slice(1)
    .map((parameter) => parameter.name.getText(sourceFile))
    .join(', ')
  const prefix = args ? `ctx, ${args}` : 'ctx'

  const normalizeHandlerSource = (value: string) =>
    normalizeNumericFieldWrites(
      value.replace(
        /\.orderBy\((['"])createdAt\1\)/g,
        '.orderBy("createdAt", "desc")',
      ),
      numericFieldNames,
    )

  if (ts.isBlock(handler.body)) {
    const body = handler.body.statements
      .map((statement) => printNode(statement, sourceFile))
      .join('\n')
    return `${name}: ${wrapper}((${prefix}) => {
  ensureSeedData(ctx.db);
  const db = ctx.db
${contextAlias}${normalizeHandlerSource(body)
      .split('\n')
      .map((line) => `  ${line}`)
      .join('\n')}
})`
  }

  const expression = normalizeHandlerSource(
    printNode(handler.body, sourceFile),
  ).replace(/(^|[^A-Za-z0-9_$.])db\./g, '$1ctx.db.')
  return `${name}: ${wrapper}((${prefix}) => {
  ensureSeedData(ctx.db);
${contextAlias}  return ${expression};
})`
}

const mergeHandlers = (
  definitions: LakebedDefinition[],
  key: 'queries' | 'mutations',
  wrapper: 'query' | 'mutation',
  fallback: string,
): string => {
  const numericFieldNames = new Set(
    definitions.flatMap((definition) => definition.numericFieldNames),
  )
  const handlersByName = new Map<string, string>()
  for (const definition of definitions) {
    for (const [name, source] of Object.entries(definition[key])) {
      const identifier = toIdentifier(name)
      handlersByName.set(
        identifier,
        transformHandler(identifier, source, wrapper, numericFieldNames),
      )
    }
  }
  const handlers = [...handlersByName.values()]
  return handlers.length > 0 ? `{\n${handlers.join(',\n')}\n}` : fallback
}

const mergeEndpointHandlers = (definitions: LakebedDefinition[]): string => {
  const handlersByName = new Map<string, string>()
  for (const definition of definitions) {
    for (const [name, endpointDefinition] of Object.entries(
      definition.endpoints,
    )) {
      handlersByName.set(toIdentifier(name), endpointDefinition.source)
    }
  }
  const handlers = [...handlersByName.entries()].map(
    ([name, source]) => `${name}: ${source}`,
  )
  return handlers.length > 0 ? `{\n${handlers.join(',\n')}\n}` : '{}'
}

const primitiveImportsFor = (schemaSource: string): string[] =>
  ['boolean', 'string', 'table'].filter((name) =>
    new RegExp(`\\b${name}\\s*\\(`).test(schemaSource),
  )

const lakebedEndpointImportsFor = (endpointsSource: string): string[] =>
  ['endpoint', 'empty', 'json', 'redirect', 'text'].filter((name) =>
    new RegExp(`\\b${name}\\s*\\(`).test(endpointsSource),
  )

const renderReadme = (projectName: string): string => `# ${projectName}

Run this Lakebed app:

\`\`\`sh
npx lakebed dev
\`\`\`

The exported app has one client entry, one server entry, and shared TypeScript.

Generated with [ShipFast](https://ship-fast.io) 🚀.
`

const renderAgents = (): string => `# Lakebed App Instructions

- Run Lakebed commands with \`npx lakebed <command>\`.
- Client code belongs in \`client/index.tsx\`.
- Server code belongs in \`server/index.ts\`.
- Shared code belongs in \`shared/\` and must stay free of DOM, Node, env, and runtime imports.
- Use \`lakebed/client\` only from client code.
- Use \`lakebed/server\` only from server code.
- Use relative imports for local code.
`

const renderSharedContent = (
  projectName: string,
  routes: LakebedRoute[],
): string => {
  const pages = routes.map((route, index) => {
    const hero = route.props.hero as
      | Record<string, unknown>
      | string
      | undefined
    const title =
      (typeof hero === 'object' && typeof hero.title === 'string'
        ? hero.title
        : undefined) ??
      (typeof route.props.heading === 'string'
        ? route.props.heading
        : undefined) ??
      (typeof route.props.title === 'string' ? route.props.title : undefined) ??
      route.label
    const description =
      (typeof hero === 'object' && typeof hero.description === 'string'
        ? hero.description
        : undefined) ??
      (typeof route.props.description === 'string'
        ? route.props.description
        : undefined) ??
      `${route.label} page for ${projectName}.`
    const routeId = slugifyRoute(route.label || `page-${index + 1}`)
    const sections = collectContentSections(route.props, routeId)

    return {
      label: sanitizeSharedText(route.label),
      path: route.path,
      title: sanitizeSharedText(title),
      description: sanitizeSharedText(description),
      sections:
        sections.length > 0
          ? sections
          : [
              {
                id: `${routeId}-1`,
                title: sanitizeSharedText(title),
                description: sanitizeSharedText(description),
                meta: sanitizeSharedText(route.label),
              },
            ],
    }
  })

  return `export type ContentSection = {
  id: string
  title: string
  description: string
  meta: string
}

export type PageData = {
  label: string
  path: string
  title: string
  description: string
  sections: ContentSection[]
}

export type Article = {
  id: string
  title: string
  excerpt: string
  tag: string
  author: string
  date: string
  alt: string
  createdAt?: string
  updatedAt?: string
}

export const projectName = ${JSON.stringify(sanitizeSharedText(projectName))}

export const pages = ${JSON.stringify(pages, null, 2)} satisfies PageData[]

export const fallbackArticles = pages.flatMap((page) =>
  page.sections.slice(0, 4).map((section, index) => ({
  id: section.id,
  title: section.title,
  excerpt: section.description,
  tag: page.label,
  author: projectName,
  date: section.meta || 'Today',
  alt: section.title,
}))) satisfies Article[]

export function cleanText(value: string): string {
  return value.trim().slice(0, 240)
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase().slice(0, 240)
}
`
}

const renderClientRoutes = (
  routes: LakebedRoute[],
  imageSources: ImageSource[],
  targetMap: Record<string, string>,
): string => {
  const routeData = routes.map((route) => ({
    label: route.label,
    path: route.path,
    componentName: route.componentName,
    props: route.props,
  }))
  return `export type SitePage = {
  label: string
  path: string
  componentName: string
  props: Record<string, unknown>
}

export const pages = ${JSON.stringify(routeData, null, 2)} satisfies SitePage[]

export const routeByLabel = new Map(
  pages.map((page) => [page.label, page.path]),
)

export const routeTargets = ${JSON.stringify(targetMap, null, 2)} satisfies Record<string, string>

export const imageSources = ${JSON.stringify(imageSources, null, 2)} satisfies Array<{ alt: string; src: string }>
`
}

const renderClientTheme = (
  themeCss: string,
): string => `import { useEffect } from "preact/hooks";

export const themeCss = ${JSON.stringify(themeCss)};

export function StyleRuntime() {
  useEffect(() => {
    let style = document.getElementById("site-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "site-theme";
      document.head.appendChild(style);
    }
    style.textContent = themeCss;
  }, []);

  return null;
}
`

const renderClientStyleOverrides = (
  styleOverrides: StyleOverride[],
): string => `import { useEffect } from "preact/hooks";

const styleOverrides = ${JSON.stringify(styleOverrides, null, 2)} satisfies Array<{
  classAnchor: string;
  occurrenceIndex: number;
  style: string;
}>;

function applyStyleOverrides() {
  for (const override of styleOverrides) {
    if (!override.classAnchor) continue;
    const matches = Array.from(document.querySelectorAll<HTMLElement>("*")).filter(
      (element) => element.getAttribute("class") === override.classAnchor,
    );
    const element = matches[override.occurrenceIndex] ?? matches[0];
    if (!element) continue;
    for (const declaration of override.style.split(";")) {
      const colon = declaration.indexOf(":");
      if (colon === -1) continue;
      const property = declaration.slice(0, colon).trim();
      const value = declaration.slice(colon + 1).trim();
      if (property) element.style.setProperty(property, value);
    }
  }
}

export function StyleOverrides() {
  useEffect(() => {
    if (styleOverrides.length === 0) return;
    applyStyleOverrides();
    const observer = new MutationObserver(() => applyStyleOverrides());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return null;
}
`

const renderClientNavigation =
  (): string => `import { routeByLabel, routeTargets } from "../routes";

function slugFragment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function navigateTo(path: string) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new PopStateEvent("popstate"));
  const sectionId = path.includes("#") ? path.split("#").pop() : "";
  if (sectionId) {
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  } else {
    window.scrollTo({ top: 0 });
  }
}

export function useNavigate() {
  return (target: unknown) => {
    if (typeof target !== "string" || !target.trim()) return;
    const value = target.trim();
    const route =
      routeTargets[value] ??
      routeTargets[value.toLowerCase()] ??
      routeByLabel.get(value) ??
      (value.startsWith("/") ? value : null);
    if (route) {
      navigateTo(route);
      return;
    }
    console.warn("[ShipFast] Unresolved navigation target:", slugFragment(value));
  };
}
`

const renderClientImage =
  (): string => `import { imageSources } from "../routes";

const imageSourcesByAlt = new Map(
  imageSources.map((image) => [image.alt, image.src]),
);

function fallbackImageUrl(alt: unknown): string {
  const seed =
    String(alt || "image")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 48) || "image";
  return \`https://picsum.photos/seed/\${seed}/1200/800\`;
}

function imageUrl(alt: unknown, src?: string): string {
  if (typeof src === "string" && src.trim()) return src;
  const altText = String(alt || "").trim();
  const generatedSrc = imageSourcesByAlt.get(altText);
  if (generatedSrc) return generatedSrc;
  return fallbackImageUrl(altText);
}

export function Image({
  alt,
  src,
  className,
  loading,
  ...rest
}: {
  alt?: unknown;
  src?: string;
  className?: string;
  loading?: "lazy" | "eager";
  [key: string]: unknown;
}) {
  const resolvedSrc = imageUrl(alt, src);
  const shouldLoadEagerly = /\\b(size-10|size-12|rounded-full)\\b/.test(className || "");

  return (
    <img
      alt={String(alt || "")}
      className={className}
      loading={shouldLoadEagerly ? "eager" : loading}
      referrerPolicy="no-referrer"
      src={resolvedSrc}
      onError={(event) => {
        const fallback = fallbackImageUrl(alt);
        if (event.currentTarget.src !== fallback) {
          event.currentTarget.src = fallback;
        }
      }}
      {...rest}
    />
  );
}
`

const renderClientLakebed = (): string => `import {
  signInWithGoogle,
  signOut,
  useAuth,
} from "lakebed/client";
import { useCallback, useMemo, useRef, useState } from "preact/hooks";

export { signInWithGoogle, signOut, useAuth };

export type LakebedAdapter = ReturnType<typeof useLakebedAdapter>;

type LakebedMutationFunction<Args extends unknown[], Result> = ((
  ...args: Args
) => Promise<Result>) & {
  isPending: boolean;
  lastError: unknown | null;
  pendingCount: number;
  reset(): void;
};

export type LakebedClientRuntime<TDefinition = unknown> = LakebedAdapter & {
  readonly __definition?: TDefinition;
};

export type LakebedKeyedMutationFunction<Args extends unknown[], Result> = {
  hasPending: boolean;
  isPending(key: string): boolean;
  lastError: unknown | null;
  pendingKey: string | null;
  pendingKeys: readonly string[];
  reset(): void;
  run(key: string, ...args: Args): Promise<Result | undefined>;
};

function normalizeQueryValue(name: string, value: unknown) {
  if (!/(Names|Titles|Emails)$/.test(name)) return value;
  if (value instanceof Set) return value;
  if (Array.isArray(value)) return new Set(value);
  if (value && typeof value === "object") return new Set(Object.values(value));
  if (value == null) return new Set<string>();
  return value;
}

function isDbRecordCollection(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const entries = Object.entries(value);
  if (!entries.length) return false;
  // A DB-shaped record collection maps record IDs to record objects. Tolerate
  // malformed rows (null / undefined / non-object entries) by ignoring them,
  // but reject values that contain genuine scalar primitive fields (strings,
  // numbers, booleans) or arrays — those indicate a scalar record, not a
  // collection. At least one entry must be a record object.
  let hasRecord = false;
  for (const [, v] of entries) {
    if (v == null) continue;
    if (typeof v === "object" && !Array.isArray(v)) {
      hasRecord = true;
      continue;
    }
    return false;
  }
  return hasRecord;
}

function recordCollectionValues(
  value: Record<string, unknown>,
): Record<string, unknown>[] {
  return Object.values(value).filter(
    (v): v is Record<string, unknown> =>
      Boolean(v) && typeof v === "object" && !Array.isArray(v),
  );
}

function normalizeDbShapedQueryResult(name: string, value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return value;
  const collectionKeys = ["items", "rows", "data", "result"];
  // Null / undefined entries are malformed rows, not scalar fields — exclude
  // them so a DB record collection with missing rows is still detected.
  const hasScalarField = Object.values(value).some(
    (v) => v != null && (typeof v !== "object" || Array.isArray(v)),
  );
  if (!hasScalarField && !collectionKeys.some((key) => key in value)) {
    if (isDbRecordCollection(value)) {
      return recordCollectionValues(value as Record<string, unknown>);
    }
    return value;
  }
  let normalized = value as Record<string, unknown>;
  for (const key of collectionKeys) {
    if (!(key in normalized)) continue;
    const nested = normalized[key];
    if (Array.isArray(nested)) continue;
    if (isDbRecordCollection(nested)) {
      if (normalized === value) normalized = { ...normalized };
      normalized[key] = recordCollectionValues(
        nested as Record<string, unknown>,
      );
    } else if (nested == null) {
      if (normalized === value) normalized = { ...normalized };
      normalized[key] = [];
    }
  }
  if ("count" in normalized && !("items" in normalized)) {
    if (normalized === value) normalized = { ...normalized };
    normalized.items = [];
  }
  return normalized;
}

function collectionValues(value: unknown) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  const nestedCollection = Object.entries(value).find(([key, nested]) => {
    return ["items", "rows", "data", "result"].includes(key) && Array.isArray(nested);
  });
  if (nestedCollection) {
    const [, nested] = nestedCollection;
    if (Array.isArray(nested)) return nested;
  }
  return Object.values(value);
}

function normalizeEntityListValue(name: string, value: unknown) {
  if (!/(Items|Lines)$/.test(name)) return value;
  return collectionValues(value).map((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return item;
    if (!("quantity" in item) || typeof item.quantity !== "string") return item;
    const quantity = Number(item.quantity);
    return Number.isFinite(quantity) ? { ...item, quantity } : item;
  });
}

function fallbackLakebedQueryValue(name: string): unknown {
  if (/(Names|Titles|Emails)$/.test(name)) return new Set<string>();
  return [];
}

function useLakebedMutation<Args extends unknown[] = unknown[], Result = unknown>(
  name: string,
): LakebedMutationFunction<Args, Result> {
  const [lastError, setLastError] = useState<unknown | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const reset = useCallback(() => setLastError(null), []);
  const callable = useMemo(() => {
    const run = (async (...args: Args) => {
      void name;
      void args;
      setPendingCount((count) => count + 1);
      setLastError(null);
      try {
        return undefined as Result;
      } catch (error) {
        setLastError(error);
        throw error;
      } finally {
        setPendingCount((count) => Math.max(0, count - 1));
      }
    }) as LakebedMutationFunction<Args, Result>;
    run.isPending = false;
    run.lastError = null;
    run.pendingCount = 0;
    run.reset = reset;
    return run;
  }, [reset]);

  callable.isPending = pendingCount > 0;
  callable.lastError = lastError;
  callable.pendingCount = pendingCount;
  callable.reset = reset;

  return callable;
}

export function useKeyedLakebedMutation<
  TDefinition = unknown,
  Args extends unknown[] = unknown[],
  Result = unknown,
>(
  lakebed: LakebedClientRuntime<TDefinition>,
  name: string,
): LakebedKeyedMutationFunction<Args, Result> {
  const mutation = lakebed.useMutation<Args, Result>(name);
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([]);
  const pendingKeysRef = useRef<readonly string[]>([]);

  pendingKeysRef.current = pendingKeys;

  const run = useCallback(
    async (key: string, ...args: Args): Promise<Result | undefined> => {
      if (pendingKeysRef.current.includes(key)) return undefined;

      const addKey = (current: readonly string[]) =>
        current.includes(key) ? current : [...current, key];
      pendingKeysRef.current = addKey(pendingKeysRef.current);
      setPendingKeys(addKey);

      try {
        return await mutation(...args);
      } finally {
        const removeKey = (current: readonly string[]) =>
          current.filter((item) => item !== key);
        pendingKeysRef.current = removeKey(pendingKeysRef.current);
        setPendingKeys(removeKey);
      }
    },
    [mutation],
  );

  const isPending = useCallback(
    (key: string) => pendingKeys.includes(key),
    [pendingKeys],
  );
  const reset = useCallback(() => {
    pendingKeysRef.current = [];
    setPendingKeys([]);
    mutation.reset();
  }, [mutation]);

  return {
    hasPending: pendingKeys.length > 0,
    isPending,
    lastError: mutation.lastError,
    pendingKey: pendingKeys[0] ?? null,
    pendingKeys,
    reset,
    run,
  };
}

export function AuthRuntime() {
  useAuth();
  return null;
}

export function useLakebedAdapter() {
  const auth = useAuth();

  return {
    useQuery<T = unknown>(name: string): T {
      const value = fallbackLakebedQueryValue(name);
      const dbNormalized = normalizeDbShapedQueryResult(name, value);
      return normalizeQueryValue(
        name,
        normalizeEntityListValue(name, dbNormalized),
      ) as T;
    },
    useMutation<Args extends unknown[] = unknown[], Result = unknown>(
      name: string,
    ): LakebedMutationFunction<Args, Result> {
      return useLakebedMutation<Args, Result>(name);
    },
    useAuth() {
      return auth;
    },
    signInWithGoogle() {
      void signInWithGoogle({
        returnTo:
          window.location.pathname + window.location.search + window.location.hash,
      });
    },
    signOut() {
      signOut();
    },
  };
}
`

const renderClientComponentModule = (
  component: ClientComponentDefinition,
): string => `${component.imports.join('\n')}

${component.preludeSources.join('\n\n')}

export const ${toIdentifier(component.name)}Block: (input: {
  props: Record<string, unknown>;
  lakebed: LakebedAdapter;
}) => ComponentChildren = ${component.source};
`

const renderClientIndex = (
  routes: LakebedRoute[],
  components: ClientComponentDefinition[],
  adminAccess: LakebedAdminAccessConfig | null,
  input: OpenUIExportInput,
): string => {
  void routes
  const selectedBrandLogo = input.selectedBrandLogo ?? null
  const brandLogoImport = selectedBrandLogo
    ? 'import { BrandLogoProvider } from "./section-kit/Logo";\n'
    : ''
  const brandLogoDefinition = selectedBrandLogo
    ? `const selectedBrandLogo = ${JSON.stringify(selectedBrandLogo, null, 2)} as const;\n`
    : ''
  const componentImports = components
    .map(
      (component) =>
        `import { ${toIdentifier(component.name)}Block } from "./components/${toIdentifier(component.name)}";`,
    )
    .join('\n')
  const componentEntries = components
    .map(
      (component) =>
        `${JSON.stringify(component.name)}: ${toIdentifier(component.name)}Block`,
    )
    .join(',\n')
  const adminEmails = adminAccess?.emails ?? []
  const adminRouteLabels = [
    ...new Set(
      (adminAccess?.routes ?? []).map((route) =>
        route.label.trim().toLowerCase(),
      ),
    ),
  ]
  const adminRoutePaths = [
    ...new Set(
      (adminAccess?.routes ?? []).map((route) =>
        route.path.trim().toLowerCase(),
      ),
    ),
  ]

  return `import { Link, Route, Router, Routes } from "lakebed/client";
import type { ComponentChildren } from "preact";
import { useMemo, useState } from "preact/hooks";
import { pages, type SitePage } from "./routes";
import { AuthRuntime, useLakebedAdapter, type LakebedAdapter } from "./lib/lakebed";
import { StyleOverrides } from "./lib/style-overrides";
import { StyleRuntime } from "./lib/theme";
${brandLogoImport}${componentImports}

${brandLogoDefinition}

type PageComponent = (input: {
  props: Record<string, unknown>;
  lakebed: LakebedAdapter;
}) => ComponentChildren;

const pageComponents = {
${componentEntries}
} satisfies Record<string, PageComponent>;

const shipFastAdminEmails = ${JSON.stringify(adminEmails, null, 2)} as readonly string[];
const shipFastAdminRouteLabels = ${JSON.stringify(adminRouteLabels, null, 2)} as readonly string[];
const shipFastAdminRoutePaths = ${JSON.stringify(adminRoutePaths, null, 2)} as readonly string[];

function normalizeAdminValue(value: unknown): string {
  return String(value || "").trim().toLowerCase();
}

function isShipFastAdminRoute(page: SitePage): boolean {
  return (
    shipFastAdminRouteLabels.includes(normalizeAdminValue(page.label)) ||
    shipFastAdminRoutePaths.includes(normalizeAdminValue(page.path))
  );
}

function assertShipFastAdminAccess(email: string) {
  const normalized = normalizeAdminValue(email);
  if (!normalized || !shipFastAdminEmails.includes(normalized)) {
    throw new Error("Ship Fast admin access denied for this email.");
  }
  return { email: normalized, role: normalized === shipFastAdminEmails[0] ? "owner" : "editor" };
}

function ShipFastAdminGate({
  children,
  routeLabel,
}: {
  children: ComponentChildren;
  routeLabel: string;
}) {
  const firstAdminEmail = shipFastAdminEmails[0] ?? "";
  const [email, setEmail] = useState(() =>
    window.localStorage.getItem("shipFastAdminEmail") ?? firstAdminEmail,
  );
  const [submittedEmail, setSubmittedEmail] = useState(() =>
    window.localStorage.getItem("shipFastAdminEmail") ?? "",
  );
  const [error, setError] = useState("");

  const access = useMemo(() => {
    if (shipFastAdminEmails.length === 0) return { email: "", role: "owner" };
    try {
      return assertShipFastAdminAccess(submittedEmail);
    } catch {
      return null;
    }
  }, [submittedEmail]);

  if (access) return <>{children}</>;

  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6 text-slate-50">
      <form
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950/95 p-6 shadow-2xl"
        onSubmit={(event) => {
          event.preventDefault();
          try {
            const result = assertShipFastAdminAccess(email);
            window.localStorage.setItem("shipFastAdminEmail", result.email);
            setSubmittedEmail(result.email);
            setError("");
          } catch (cause) {
            setError(cause instanceof Error ? cause.message : "Admin access denied.");
          }
        }}
      >
        <p className="text-xs font-bold uppercase tracking-widest text-blue-300">
          Ship Fast Admin
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">
          Verify access to {routeLabel}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Use the owner email baked into this Lakebed export to open the generated admin area.
        </p>
        <label className="mt-5 grid gap-2 text-sm text-slate-300">
          Email
          <input
            autoComplete="email"
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 outline-none focus:border-blue-400"
            onInput={(event) => setEmail(event.currentTarget.value)}
            placeholder="owner@example.com"
            type="email"
            value={email}
          />
        </label>
        {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}
        <button
          className="mt-5 w-full rounded-lg bg-blue-500 px-4 py-2.5 font-bold text-white hover:bg-blue-400"
          type="submit"
        >
          Open admin
        </button>
      </form>
    </main>
  );
}

function PageView({ page }: { page: SitePage }) {
  const lakebed = useLakebedAdapter();
  const Page = pageComponents[page.componentName];
  const rendered = Page ? <Page props={page.props} lakebed={lakebed} /> : <NotFoundPage />;
  return isShipFastAdminRoute(page) ? (
    <ShipFastAdminGate routeLabel={page.label}>{rendered}</ShipFastAdminGate>
  ) : (
    rendered
  );
}

function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold">Not found</h1>
        <Link className="text-muted-foreground hover:text-foreground" to="/">
          Back home
        </Link>
      </section>
    </main>
  );
}

export function App() {
  const app = (
    <Router>
      <StyleRuntime />
      <StyleOverrides />
      <AuthRuntime />
      <Routes>
        {pages.map((page) => (
          <Route
            element={<PageView page={page} />}
            key={page.path}
            path={page.path}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
  return ${selectedBrandLogo ? '<BrandLogoProvider value={selectedBrandLogo}>{app}</BrandLogoProvider>' : 'app'};
}
`
}

const renderStaticClientIndex = (
  projectName: string,
  html: string,
): string => `import { Route, Router, Routes } from "lakebed/client";
import { projectName } from "../shared/content";

const html = ${JSON.stringify(html)};

function StaticPage() {
  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{projectName || ${JSON.stringify(projectName)}}</h1>
        </div>
        <section className="overflow-hidden rounded border border-neutral-800 bg-white text-black" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<StaticPage />} />
        <Route path="*" element={<StaticPage />} />
      </Routes>
    </Router>
  );
}
`

const renderServerIndex = (
  projectName: string,
  definitions: LakebedDefinition[],
  routes: LakebedRoute[],
): string => {
  const renderedSchema = renderMergedSchema(
    definitions.map((definition) => definition.schemaSource),
    `{
  articles: table({
    alt: string(),
    author: string(),
    date: string(),
    excerpt: string(),
    tag: string(),
    title: string(),
    ownerId: string(),
  }),
  readingList: table({
    articleTitle: string(),
    ownerId: string(),
  }),
}`,
  )
  const schemaSource = renderedSchema.source
  const queriesSource = mergeHandlers(
    definitions,
    'queries',
    'query',
    `{
  articles: query((ctx) =>
    ctx.db.articles.orderBy("createdAt", "desc").all()
  ),
}`,
  )
  const mutationsSource = mergeHandlers(
    definitions,
    'mutations',
    'mutation',
    `{
  addToReadingList: mutation((ctx, articleTitle: string) => {
    const existing = ctx.db.readingList.where("articleTitle", articleTitle).all()[0]
    if (!existing) {
      ctx.db.readingList.insert({ articleTitle, ownerId: ctx.auth.userId })
    }
    return ctx.db.readingList.all()
  }),
}`,
  )
  const endpointsSource = mergeEndpointHandlers(definitions)
  const imports = [
    'capsule',
    'mutation',
    'query',
    ...primitiveImportsFor(schemaSource),
    ...lakebedEndpointImportsFor(endpointsSource),
  ]

  return `import { ${[...new Set(imports)].sort().join(', ')} } from "lakebed/server";

${renderSeedData(routes, renderedSchema.tableFields)}

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},

  schema: ${schemaSource},

  queries: ${queriesSource},

  mutations: ${mutationsSource},

  endpoints: ${endpointsSource}
});
`
}

const renderStaticServerIndex = (
  projectName: string,
): string => `import { capsule } from "lakebed/server";

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},
  schema: {},
  queries: {},
  mutations: {},
  endpoints: {}
});
`

const zipFiles = (files: Record<string, string>): Uint8Array =>
  zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
    { level: 9 },
  )

const prettierParserForPath = (
  path: string,
): 'babel-ts' | 'markdown' | null => {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'babel-ts'
  if (path.endsWith('.md')) return 'markdown'
  return null
}

const formatOutputFiles = async (
  files: Record<string, string>,
): Promise<Record<string, string>> => {
  const formatted = await Promise.all(
    Object.entries(files).map(async ([path, content]) => {
      const parser = prettierParserForPath(path)
      if (!parser) return [path, content] as const
      return [
        path,
        await format(content, {
          parser,
          printWidth: 90,
          semi: true,
          singleQuote: false,
          trailingComma: 'all',
        }),
      ] as const
    }),
  )
  return Object.fromEntries(formatted)
}

const assertNoLeakedSourceTerms = (files: Record<string, string>) => {
  const forbiddenPathParts = ['/capsules/']
  const forbiddenTerms = [
    '@openuidev',
    '@ship-fast',
    'defineCapsule',
    'defineComponent',
    'root =',
    'OpenUI',
  ]
  for (const path of Object.keys(files)) {
    const normalized = `/${path}`
    const leakedPath = forbiddenPathParts.find((part) =>
      normalized.includes(part),
    )
    if (leakedPath) {
      throw new Error(`Lakebed export contains forbidden path: ${path}`)
    }
  }
  for (const [path, content] of Object.entries(files)) {
    if (path.startsWith('client/vendor/')) continue
    const leakedTerm = forbiddenTerms.find((term) => content.includes(term))
    if (leakedTerm) {
      throw new Error(`Lakebed export contains ${leakedTerm} in ${path}`)
    }
  }
}

const buildStaticLakebedProjectFiles = async (
  input: OpenUIExportInput,
  projectName: string,
): Promise<LakebedProjectFiles> => {
  const html = input.previewHtml?.trim() || input.source.trim()
  const routes = [
    {
      label: 'Home',
      path: '/',
      componentName: 'StaticPage',
      props: { title: projectName, description: 'Static Lakebed review app' },
    },
  ]
  const files = await formatOutputFiles({
    'AGENTS.md': renderAgents(),
    'CLAUDE.md': renderAgents(),
    'README.md': renderReadme(projectName),
    'client/index.tsx': renderStaticClientIndex(projectName, html),
    'server/index.ts': renderStaticServerIndex(projectName),
    'shared/content.ts': renderSharedContent(projectName, routes),
  })
  assertNoLeakedSourceTerms(files)

  return {
    files,
    filename: `${toProjectSlug(projectName)}-lakebed.zip`,
    fileCount: Object.keys(files).length,
    projectName,
  }
}

export async function buildOpenUILakebedProjectFiles(
  input: OpenUIExportInput,
): Promise<LakebedProjectFiles> {
  if (isHtmlLikeSource(input.source)) {
    return await buildStaticLakebedProjectFiles(
      input,
      readProjectName(
        input.siteSpecJson,
        readHtmlTitle(input.source) ?? 'Lakebed Site',
      ),
    )
  }

  const parsed = parseOpenUIForExport(input.source, input.siteSpecJson)
  const routes = buildRoutes(parsed)
  const componentNames = collectRouteComponentNames(routes)
  const definitions = collectDefinitions(componentNames)
  const files: Record<string, string> = {}
  const seenVendorFiles = new Set<string>()
  const seenBlockFiles = new Set<string>()
  if (input.selectedBrandLogo) {
    copyBlocksClientSourceForLakebed(
      'src/section-kit/Logo.tsx',
      files,
      seenVendorFiles,
      seenBlockFiles,
    )
  }
  const nestedClientComponents = collectClientComponents(
    componentNames,
    files,
    seenVendorFiles,
    seenBlockFiles,
  )
  const routeClientComponents = routes.map((route) =>
    renderRouteClientComponentDefinition(route, componentNames),
  )
  const clientComponents = [...routeClientComponents, ...nestedClientComponents]
  const themeName = readThemeName(input.siteSpecJson, input.themeName)
  const themeCss = buildLakebedThemeCss(
    resolveThemeStyles(themeName),
    input.isDark ?? true,
  )
  const imageSources = await resolveLakebedImageSources(
    routes,
    input.previewHtml,
  )
  const targetMap = buildLakebedTargetMap(routes, parsed.targetMap)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  const adminAccess = readLakebedAdminAccessConfig(input.siteSpecJson)
  Object.assign(files, {
    'AGENTS.md': renderAgents(),
    'CLAUDE.md': renderAgents(),
    'README.md': renderReadme(parsed.projectName),
    'client/index.tsx': renderClientIndex(
      routes,
      clientComponents,
      adminAccess,
      input,
    ),
    'client/routes.ts': renderClientRoutes(routes, imageSources, targetMap),
    'client/lib/image.tsx': renderClientImage(),
    'client/lib/lakebed.ts': renderClientLakebed(),
    'client/lib/navigation.tsx': renderClientNavigation(),
    'client/lib/style-overrides.tsx':
      renderClientStyleOverrides(styleOverrides),
    'client/lib/theme.tsx': renderClientTheme(themeCss),
    'server/index.ts': renderServerIndex(
      parsed.projectName,
      definitions,
      routes,
    ),
    'shared/content.ts': renderSharedContent(parsed.projectName, routes),
  })
  for (const component of clientComponents) {
    files[`client/components/${toIdentifier(component.name)}.tsx`] =
      renderClientComponentModule(component)
  }
  const formattedFiles = await formatOutputFiles(files)
  assertNoLeakedSourceTerms(formattedFiles)

  return {
    files: formattedFiles,
    filename: `${toProjectSlug(parsed.projectName)}-lakebed.zip`,
    fileCount: Object.keys(formattedFiles).length,
    projectName: parsed.projectName,
  }
}

export async function buildOpenUILakebedExport(
  input: OpenUIExportInput,
): Promise<BuiltExport> {
  const built = await buildOpenUILakebedProjectFiles(input)

  return {
    body: zipFiles(built.files),
    contentType: 'application/zip',
    filename: built.filename,
    fileCount: built.fileCount,
  }
}
