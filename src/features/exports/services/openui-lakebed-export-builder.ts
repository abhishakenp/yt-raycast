import { Buffer } from 'node:buffer'
import { dirname, join, relative } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import { zipSync, strToU8 } from 'fflate'
import { format } from 'prettier'
import ts from 'typescript'
import {
  blockSourceFilesBase64,
  blockSourceFilesEncoding,
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
  vendorSourceFilesBase64,
  vendorSourceFilesEncoding,
} from '@ship-fast/blocks/generated'

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
  props: Record<string, unknown>
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
}

type ClientComponentDefinition = {
  name: string
  source: string
  imports: string[]
  vendorFiles: Set<string>
}

type ImageSource = {
  alt: string
  src: string
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
let blockSourceFileIndex: Record<string, string | undefined> | null = null
let vendorSourceFileIndex: Record<string, string | undefined> | null = null

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

export const resolveLakebedImageSources = async (
  routes: LakebedRoute[],
  previewHtml: string | undefined,
): Promise<ImageSource[]> => {
  const byAlt = new Map(
    extractImageSources(previewHtml).map((source) => [source.alt, source.src]),
  )

  for (const alt of collectRouteImageAlts(routes)) {
    if (byAlt.has(alt)) continue
    const { height, width } = lakebedImageDimensionsForAlt(alt)
    const resolved =
      (await resolvePexelsImageForLakebed(alt, width, height)) ??
      picsumUrl(slugifyAlt(alt), width, height)
    byAlt.set(
      alt,
      normalizeRemoteImageUrlForLakebed(resolved, { height, width }),
    )
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

const getBlockSourceFileIndex = (): Record<string, string | undefined> => {
  if (blockSourceFileIndex) return blockSourceFileIndex
  if (blockSourceFilesEncoding !== 'br+base64') {
    throw new Error(
      `Unsupported block source file manifest encoding: ${blockSourceFilesEncoding}`,
    )
  }
  blockSourceFileIndex = JSON.parse(
    brotliDecompressSync(
      Buffer.from(blockSourceFilesBase64, 'base64'),
    ).toString('utf8'),
  ) as Record<string, string | undefined>
  return blockSourceFileIndex
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

const normalizeBlockSourceRelPath = (sourceRelPath: string): string =>
  toPosixPath(sourceRelPath)
    .replace(/^packages\/ship-fast-blocks\//, '')
    .replace(/^src\//, '')
    .replace(/\.(ts|tsx|js|jsx|mjs|json|css)$/, '')

const resolveBlockSourceManifestPath = (
  sourceRelPath: string,
): string | null => {
  const normalizedRel = normalizeBlockSourceRelPath(sourceRelPath)
  const sourceFiles = getBlockSourceFileIndex()
  const candidates = sourcePathCandidates(`src/${normalizedRel}`)
  return (
    candidates.find((candidate) => sourceFiles[candidate] !== undefined) ?? null
  )
}

const resolveRelativeBlockSourcePath = (
  sourcePath: string,
  moduleName: string,
): string | null => {
  const normalizedSourcePath = toPosixPath(sourcePath).replace(
    /^packages\/ship-fast-blocks\//,
    '',
  )
  return resolveBlockSourceManifestPath(
    toPosixPath(join(dirname(normalizedSourcePath), moduleName)),
  )
}

const printNode = (node: ts.Node, sourceFile: ts.SourceFile): string =>
  ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
    .printNode(ts.EmitHint.Unspecified, node, sourceFile)

const isExportableFactory = (expression: string): boolean =>
  expression === 'defineComponent' || expression === 'defineCapsule'

const propertyNameText = (name: ts.PropertyName, sourceFile: ts.SourceFile) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return name.getText(sourceFile)
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
  source?.replace(/\bnumber\s*\(\s*\)/g, 'string()') ?? null

const readLakebedDefinition = (
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
      if (!lakebed || !ts.isObjectLiteralExpression(lakebed)) return null

      const prop = (name: string) =>
        lakebed.properties.find(
          (property): property is ts.PropertyAssignment =>
            ts.isPropertyAssignment(property) &&
            ts.isIdentifier(property.name) &&
            property.name.text === name,
        )?.initializer

      const schema = prop('schema')
      return {
        schemaSource: normalizeLakebedSchemaSource(
          schema && ts.isObjectLiteralExpression(schema)
            ? printNode(schema, sourceFile)
            : null,
        ),
        numericFieldNames: readNumericSchemaFields(schema, sourceFile),
        queries: objectRecord(prop('queries'), sourceFile),
        mutations: objectRecord(prop('mutations'), sourceFile),
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

    if (
      moduleName === '@openuidev/react-lang' ||
      moduleName === './openui.ts' ||
      moduleName === 'zod/v4' ||
      moduleName === '@ship-fast/lakebed/server'
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
      )

      return {
        name: componentName,
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
  return parsed.pages.map((page, index) => ({
    label: parsed.routes[index] ?? `Page ${index + 1}`,
    path: uniqueRoutePath(
      parsed.routes[index] ?? `Page ${index + 1}`,
      index,
      used,
    ),
    componentName: page.typeName,
    props: (page.props ?? {}) as Record<string, unknown>,
  }))
}

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

const stripOuterBraces = (source: string): string =>
  source
    .trim()
    .replace(/^\{\s*/, '')
    .replace(/\s*\}$/, '')
    .trim()

const mergeObjectSources = (
  sources: Array<string | null>,
  fallback: string,
): string => {
  const parts = sources
    .filter((source): source is string => Boolean(source?.trim()))
    .map(stripOuterBraces)
    .map((source) => source.replace(/,+\s*$/, '').trim())
    .filter(Boolean)
  return parts.length > 0 ? `{\n${parts.join(',\n')}\n}` : fallback
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
    const nestedPackageJsonSource = nestedPackageJsonPath
      ? getVendorSourceFileIndex()[nestedPackageJsonPath]
      : undefined
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
      return relativeImportPath(context.outPath, 'client/lib/cn.ts')
    }
    if (moduleName.startsWith('#/lib/use-navigate')) {
      return relativeImportPath(context.outPath, 'client/lib/navigation.tsx')
    }
    if (moduleName.startsWith('#/lib/img')) {
      return relativeImportPath(context.outPath, 'client/lib/image.tsx')
    }
    if (moduleName.startsWith('#/components/ui/')) {
      const targetRel = `src/${moduleName.slice(2).replace(/\.(ts|tsx|js|jsx)$/, '')}`
      const targetOut = copyBlocksClientSourceForLakebed(
        targetRel,
        context.files,
        context.seenVendorFiles,
        context.seenBlockFiles,
      )
      return relativeImportPath(context.outPath, targetOut)
    }
    if (moduleName.startsWith('#/')) {
      throw new Error(
        `Lakebed export cannot rewrite private import ${moduleName}`,
      )
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
        : `client/vendor/ship-fast-blocks/${blocksRel}`
  if (seenBlockFiles.has(outPath)) return outPath
  seenBlockFiles.add(outPath)
  const source = getBlockSourceFileIndex()[sourcePath]
  if (source === undefined) {
    throw new Error(`Cannot find block dependency source: ${sourceRelPath}`)
  }
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
  if (!initializer || !ts.isArrowFunction(initializer)) {
    return `${name}: ${wrapper}((ctx) => ({ ok: true, userId: ctx.auth.userId }))`
  }

  const args = initializer.parameters
    .slice(1)
    .map((parameter) => parameter.getText(sourceFile))
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

  if (ts.isBlock(initializer.body)) {
    const body = initializer.body.statements
      .map((statement) => printNode(statement, sourceFile))
      .join('\n')
    return `${name}: ${wrapper}((${prefix}) => {
  const db = ctx.db
${normalizeHandlerSource(body)
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
})`
  }

  const expression = normalizeHandlerSource(
    printNode(initializer.body, sourceFile),
  ).replace(/\bdb\./g, 'ctx.db.')
  return `${name}: ${wrapper}((${prefix}) => ${expression})`
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
  const handlers = definitions.flatMap((definition) =>
    Object.entries(definition[key]).map(([name, source]) =>
      transformHandler(toIdentifier(name), source, wrapper, numericFieldNames),
    ),
  )
  return handlers.length > 0 ? `{\n${handlers.join(',\n')}\n}` : fallback
}

const primitiveImportsFor = (schemaSource: string): string[] =>
  ['boolean', 'string', 'table'].filter((name) =>
    new RegExp(`\\b${name}\\s*\\(`).test(schemaSource),
  )

const renderReadme = (projectName: string): string => `# ${projectName}

Run this Lakebed app:

\`\`\`sh
npx lakebed dev
\`\`\`

The exported app has one client entry, one server entry, and shared TypeScript.
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
      `Generated page for ${route.label}.`
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
): string => {
  const routeData = routes.map((route) => ({
    label: route.label,
    path: route.path,
    componentName: route.componentName,
    props: route.props,
  }))
  return `export type GeneratedPage = {
  label: string
  path: string
  componentName: string
  props: Record<string, unknown>
}

export const generatedPages = ${JSON.stringify(routeData, null, 2)} satisfies GeneratedPage[]

export const generatedRouteByLabel = new Map(
  generatedPages.map((page) => [page.label, page.path]),
)

export const generatedImageSources = ${JSON.stringify(imageSources, null, 2)} satisfies Array<{ alt: string; src: string }>
`
}

const renderClientTheme = (
  themeCss: string,
): string => `import { useEffect } from "preact/hooks";

export const generatedThemeCss = ${JSON.stringify(themeCss)};

export function StyleRuntime() {
  useEffect(() => {
    let style = document.getElementById("ship-fast-generated-theme");
    if (!style) {
      style = document.createElement("style");
      style.id = "ship-fast-generated-theme";
      document.head.appendChild(style);
    }
    style.textContent = generatedThemeCss;
  }, []);

  return null;
}
`

const renderClientNavigation =
  (): string => `import { useNavigate as useLakebedNavigate } from "lakebed/client";
import { generatedRouteByLabel } from "../routes";

function slugFragment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function useNavigate() {
  const navigate = useLakebedNavigate();

  return (target: unknown) => {
    if (typeof target !== "string" || !target.trim()) return;
    const value = target.trim();
    const route = generatedRouteByLabel.get(value) ?? (value.startsWith("/") ? value : null);
    if (route) {
      navigate(route);
      return;
    }
    window.location.hash = slugFragment(value);
  };
}
`

const renderClientImage =
  (): string => `import { generatedImageSources } from "../routes";

const imageSourcesByAlt = new Map(
  generatedImageSources.map((image) => [image.alt, image.src]),
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
  useMutation,
  useQuery,
} from "lakebed/client";

export type LakebedAdapter = ReturnType<typeof useLakebedAdapter>;

export function AuthRuntime() {
  useAuth();
  return null;
}

export function useLakebedAdapter() {
  const auth = useAuth();

  return {
    useQuery<T = unknown>(name: string): T {
      return useQuery<T>(name);
    },
    useMutation<Args extends unknown[] = unknown[], Result = unknown>(
      name: string,
    ): (...args: Args) => Promise<Result> {
      return useMutation<Args, Result>(name);
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

export const ${toIdentifier(component.name)}Block: (input: {
  props: Record<string, unknown>;
  lakebed: LakebedAdapter;
}) => ComponentChildren = ${component.source};
`

const renderClientIndex = (
  routes: LakebedRoute[],
  components: ClientComponentDefinition[],
): string => {
  void routes
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

  return `import { Link, Route, Router, Routes } from "lakebed/client";
import type { ComponentChildren } from "preact";
import { useState } from "preact/hooks";
import { generatedPages, type GeneratedPage } from "./routes";
import { AuthRuntime, useLakebedAdapter, type LakebedAdapter } from "./lib/lakebed";
import { StyleRuntime } from "./lib/theme";
${componentImports}

type GeneratedBlock = (input: {
  props: Record<string, unknown>;
  lakebed: LakebedAdapter;
}) => ComponentChildren;

const generatedBlocks = {
${componentEntries}
} satisfies Record<string, GeneratedBlock>;

function FallbackGeneratedPage({ page }: { page: GeneratedPage }) {
  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">
          {page.label}
        </p>
        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          {page.label}
        </h1>
      </section>
    </main>
  );
}

function GeneratedRoute({ page }: { page: GeneratedPage }) {
  const lakebed = useLakebedAdapter();
  const Block = generatedBlocks[page.componentName];
  return Block ? <Block props={page.props} lakebed={lakebed} /> : <FallbackGeneratedPage page={page} />;
}

function StatusPage() {
  const [status, setStatus] = useState("not checked");

  async function checkStatus() {
    const response = await fetch("/api/status");
    setStatus(response.ok ? await response.text() : "error " + response.status);
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16 text-foreground">
      <section className="mx-auto max-w-4xl">
        <h1 className="mb-4 text-4xl font-bold tracking-tight">Status</h1>
        <button
          className="border border-foreground px-4 py-2 font-medium"
          type="button"
          onClick={() => void checkStatus()}
        >
          Check endpoint
        </button>
        <p className="mt-4 font-mono text-sm text-muted-foreground">
          endpoint: {status}
        </p>
      </section>
    </main>
  );
}

export function App() {
  return (
    <Router>
      <StyleRuntime />
      <AuthRuntime />
      <Routes>
        {generatedPages.map((page) => (
          <Route
            element={<GeneratedRoute page={page} />}
            key={page.path}
            path={page.path}
          />
        ))}
        <Route path="/status" element={<StatusPage />} />
        <Route
          path="*"
          element={
            <main className="min-h-screen bg-background px-6 py-16 text-foreground">
              <section className="mx-auto max-w-4xl">
                <h1 className="mb-4 text-4xl font-bold">Not found</h1>
                <Link className="text-muted-foreground hover:text-foreground" to="/">
                  Back home
                </Link>
              </section>
            </main>
          }
        />
      </Routes>
    </Router>
  );
}
`
}

const renderStaticClientIndex = (
  projectName: string,
  html: string,
): string => `import { useState } from "preact/hooks";
import { projectName } from "../shared/content";

const html = ${JSON.stringify(html)};

export function App() {
  const [status, setStatus] = useState("not checked");

  async function checkStatus() {
    const response = await fetch("/api/status");
    setStatus(response.ok ? await response.text() : "error " + response.status);
  }

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <section className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">{projectName || ${JSON.stringify(projectName)}}</h1>
          <button className="border border-white px-4 py-2 font-medium" type="button" onClick={() => void checkStatus()}>
            Check endpoint
          </button>
        </div>
        <p className="mb-6 font-mono text-sm text-neutral-400">endpoint: {status}</p>
        <section className="overflow-hidden rounded border border-neutral-800 bg-white text-black" dangerouslySetInnerHTML={{ __html: html }} />
      </section>
    </main>
  );
}
`

const renderServerIndex = (
  projectName: string,
  definitions: LakebedDefinition[],
): string => {
  const schemaSource = mergeObjectSources(
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
  const imports = [
    'capsule',
    'endpoint',
    'mutation',
    'query',
    'text',
    ...primitiveImportsFor(schemaSource),
  ]

  return `import { ${[...new Set(imports)].sort().join(', ')} } from "lakebed/server";

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},

  schema: ${schemaSource},

  queries: ${queriesSource},

  mutations: ${mutationsSource},

  endpoints: {
    status: endpoint({ method: "GET", path: "/api/status" }, () => text("ok"))
  }
});
`
}

const renderStaticServerIndex = (
  projectName: string,
): string => `import { capsule, endpoint, text } from "lakebed/server";

export default capsule({
  name: ${JSON.stringify(toProjectSlug(projectName))},
  schema: {},
  queries: {},
  mutations: {},
  endpoints: {
    status: endpoint({ method: "GET", path: "/api/status" }, () => text("ok"))
  }
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
  const componentNames = [
    ...new Set(
      parsed.pages
        .map((page) => page.typeName)
        .filter((name): name is string => typeof name === 'string'),
    ),
  ]
  const routes = buildRoutes(parsed)
  const definitions = collectDefinitions(componentNames)
  const files: Record<string, string> = {}
  const seenVendorFiles = new Set<string>()
  const seenBlockFiles = new Set<string>()
  const clientComponents = collectClientComponents(
    componentNames,
    files,
    seenVendorFiles,
    seenBlockFiles,
  )
  const themeName = readThemeName(input.siteSpecJson, input.themeName)
  const themeCss = buildLakebedThemeCss(
    resolveThemeStyles(themeName),
    input.isDark ?? true,
  )
  const imageSources = await resolveLakebedImageSources(
    routes,
    input.previewHtml,
  )
  Object.assign(files, {
    'AGENTS.md': renderAgents(),
    'CLAUDE.md': renderAgents(),
    'README.md': renderReadme(parsed.projectName),
    'client/index.tsx': renderClientIndex(routes, clientComponents),
    'client/routes.ts': renderClientRoutes(routes, imageSources),
    'client/lib/image.tsx': renderClientImage(),
    'client/lib/lakebed.ts': renderClientLakebed(),
    'client/lib/navigation.tsx': renderClientNavigation(),
    'client/lib/theme.tsx': renderClientTheme(themeCss),
    'server/index.ts': renderServerIndex(parsed.projectName, definitions),
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
