import { Buffer } from 'node:buffer'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { brotliDecompressSync } from 'node:zlib'
import ts from 'typescript'
import { createParser, type ElementNode } from '@openuidev/lang-core'
import { library } from '@ship-fast/blocks'
import {
  reactExportSourcesBase64,
  reactExportSourcesEncoding,
} from '@ship-fast/blocks/generated'
import { zipSync, strToU8 } from 'fflate'

import { preprocessOpenUIResponse } from '@ship-fast/engine'
import { resolveThemeStyles } from '@/genui/theme-apply'
import type { ThemeStyles } from '@/genui/theme-presets'
import {
  getBlockSourceFile,
  resolveBlockSourceManifestPath,
  resolveRelativeBlockSourcePath,
} from './block-source-manifest'
import type { BuiltExport, OpenUIExportInput } from './openui-export-types'
import { formatExportFiles } from './format-export-files'
import {
  buildExportSeoBundle,
  renderJsonLdScript,
  renderNextMetadataExport,
  renderNextViewportExport,
  renderNextRobotsRoute,
  renderNextSitemapRoute,
  type ExportRouteSeo,
} from './export-seo'
import {
  createDataKeys,
  mutationActionName,
  queryActionName,
  renderKeyedMutationHook,
  renderNextServerActions,
  renderNextStore,
  renderQueryClientProvider,
  renderReactStore,
  renderShooAuthProvider,
  renderShooCallbackRoute,
  type DataKeys,
} from './export-data'
import { resolvePreviewImageUrl } from './preview-image-url-resolution'

type ParsedOpenUIProgram = {
  root: ElementNode
  routes: string[]
  pages: ElementNode[]
  targetMap: Record<string, string>
  projectName: string
}

export type ExportRoute = {
  label: string
  path: string
  componentName: string
  node: ElementNode
  props: Record<string, unknown>
}

type ExtractedComponent = {
  name: string
  source: string
  dependencies: Set<string>
  blockSources: Set<string>
  usesLakebed: boolean
}

type LakebedEndpointDefinition = {
  componentName: string
  method: string
  name: string
  path: string
  source: string
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

type ExportStack = 'react' | 'next'

type ReactExportSourceEntry = {
  file: string
  source: string
}

type ImportTransformResult = {
  imports: string[]
  dependencies: Set<string>
  blockSources: Set<string>
}

const textDecoder = new TextDecoder()
const blocksSourcePath = join(process.cwd(), 'packages', 'ship-fast-blocks')
const blocksRegistryPath = join(blocksSourcePath, 'src', 'registry')
const forbiddenExportTokens = [
  '@openuidev',
  'defineComponent',
  'Renderer',
  '.openui',
  'OpenUI',
  'openui',
  'ship-fast-blocks',
  'data-tsd-source',
] as const

const toProjectSlug = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'ship-fast-export'

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

const readHtmlTitle = (html: string): string | undefined => {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = match?.[1]
    ?.replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return title || undefined
}

const readHtmlAttribute = (tag: string, name: string): string | null => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const quoted = tag.match(
    new RegExp(`${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'),
  )
  if (quoted?.[2]) return quoted[2].trim()

  const unquoted = tag.match(new RegExp(`${escaped}\\s*=\\s*([^\\s>]+)`, 'i'))
  return unquoted?.[1]?.trim() || null
}

const normalizePreviewImageSource = async (
  src: string,
  alt: string,
): Promise<string> => {
  const resolved = await resolvePreviewImageUrl(src, alt)
  if (resolved) return resolved

  if (/^https?:\/\/[^/]+\/api\//i.test(src)) {
    try {
      const url = new URL(src)
      return `${url.pathname}${url.search}${url.hash}`
    } catch {
      return src
    }
  }
  return src
}

const extractImageSources = async (
  html: string | undefined,
): Promise<ImageSource[]> => {
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
      byAlt.set(alt, await normalizePreviewImageSource(src, alt))
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

const buildThemeStyle = (
  styles: ThemeStyles | null,
  isDark: boolean,
): string => {
  if (!styles) return ''
  const merged = { ...styles.light, ...(isDark ? styles.dark : {}) }
  return themeVarKeys
    .map((key) => {
      const value = merged[key]
      return value == null ? null : `--${key}: ${String(value)};`
    })
    .filter((declaration): declaration is string => declaration !== null)
    .join(' ')
}

const buildTailwindThemeStyle = (styles: ThemeStyles | null): string => {
  if (!styles) return ''
  const merged = { ...styles.light, ...styles.dark }
  const declarations = themeVarKeys
    .flatMap((key) => {
      if (merged[key] == null) return []
      if (key.startsWith('font-')) return [`--${key}: var(--${key});`]
      if (key === 'radius') {
        return [
          '--radius-sm: calc(var(--radius) - 4px);',
          '--radius-md: calc(var(--radius) - 2px);',
          '--radius-lg: var(--radius);',
          '--radius-xl: calc(var(--radius) + 4px);',
        ]
      }
      if (
        key.startsWith('shadow-') ||
        key === 'letter-spacing' ||
        key === 'spacing'
      ) {
        return []
      }
      return [`--color-${key}: var(--${key});`]
    })
    .join(' ')
  return declarations
}

const assertNoOpenUIInternals = (files: Record<string, string>): void => {
  for (const [name, content] of Object.entries(files)) {
    for (const token of forbiddenExportTokens) {
      if (name.includes(token) || content.includes(token)) {
        throw new Error(`Export contains forbidden internal token: ${token}`)
      }
    }
  }
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

const readPublicPackageName = (specifier: string): string | null => {
  if (
    specifier.startsWith('.') ||
    specifier.startsWith('@/') ||
    specifier.startsWith('#/')
  )
    return null
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/')
    return scope && name ? `${scope}/${name}` : specifier
  }
  return specifier.split('/')[0] ?? null
}

const stripTsExtension = (value: string): string =>
  value.replace(/\.(?:tsx?|jsx?)$/, '')

const toPosixPath = (value: string): string => value.replaceAll('\\', '/')

const relativeImportPath = (fromFile: string, toFile: string): string => {
  let path = toPosixPath(relative(dirname(fromFile), toFile))
  if (!path.startsWith('.')) path = `./${path}`
  return stripTsExtension(path)
}

const blockAliasSourcePath = (moduleName: string): string | null => {
  if (!moduleName.startsWith('#/')) return null
  return resolveBlockSourceManifestPath(`src/${moduleName.slice(2)}`)
}

const exportedBlockSourceOutPath = (sourcePath: string): string => {
  if (sourcePath === 'src/lib/utils.ts') return 'src/lib/cn.ts'
  if (sourcePath === 'src/lib/img.tsx') return 'src/lib/image.tsx'
  if (sourcePath.startsWith('src/components/')) return sourcePath
  if (sourcePath.startsWith('src/hooks/')) return sourcePath
  if (sourcePath.startsWith('src/lib/')) return sourcePath
  if (sourcePath.startsWith('src/section-kit/')) return sourcePath
  if (sourcePath.startsWith('src/registry/')) {
    return `src/vendor/blocks/${sourcePath}`
  }
  if (sourcePath.startsWith('src/capsules/')) {
    return `src/vendor/blocks/${sourcePath}`
  }
  throw new Error(`Unsupported block dependency source path: ${sourcePath}`)
}

const sourceFileScriptKind = (sourcePath: string): ts.ScriptKind => {
  if (sourcePath.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (sourcePath.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (sourcePath.endsWith('.js')) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

const shouldTransformSourceImports = (sourcePath: string): boolean =>
  /\.(tsx?|jsx?)$/.test(sourcePath)

const normalizeRouteTarget = (value: string): string =>
  value.trim().toLowerCase()

const resolveMappedRouteTarget = (
  target: string,
  routes: ExportRoute[],
): string | null => {
  const [pageLabel, sectionId] = target.split('#')
  const exact = routes.find(
    (route) =>
      normalizeRouteTarget(route.label) ===
      normalizeRouteTarget(pageLabel ?? ''),
  )
  if (!exact) return null
  return sectionId ? `${exact.path}#${sectionId}` : exact.path
}

const resolveRouteTarget = (
  target: string,
  routes: ExportRoute[],
  sourceTargetMap: Record<string, string>,
): string | null => {
  const normalized = normalizeRouteTarget(target)
  const mapped = sourceTargetMap[target] ?? sourceTargetMap[normalized]
  if (mapped) return resolveMappedRouteTarget(mapped, routes)

  const exact = routes.find(
    (route) => normalizeRouteTarget(route.label) === normalized,
  )
  if (exact) return exact.path

  const find = (pattern: RegExp) =>
    routes.find((route) => pattern.test(normalizeRouteTarget(route.label)))
  const byKeyword =
    (/shop|store|product|buy|cart|order|browse|collection/.test(normalized) &&
      find(/shop|store|product|collection|menu|work|gallery/)) ||
    (/price|plan|pricing|subscribe|upgrade|tier|membership/.test(normalized) &&
      find(/pric|plan|member/)) ||
    (/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register|tour/.test(
      normalized,
    ) &&
      find(/contact|book|reserve|demo|start|join/)) ||
    (/about|story|team|who we are|mission/.test(normalized) &&
      find(/about|team|story/)) ||
    (/blog|news|post|article|read|stories|journal|tips/.test(normalized) &&
      find(/blog|news|post|article|stories|tips/)) ||
    (/feature|service|how it works|learn|explore|tour|class|schedule|trainer/.test(
      normalized,
    ) &&
      find(/feature|service|how|class|home/)) ||
    null

  return byKeyword?.path ?? null
}

const navigationKeyPattern =
  /(^|_|\b)(nav|cta|link|links|href|route|routes|action|button|buttons|primary|secondary|submit|phone|email|legal)(\b|_|$)/i

const collectNavigationStrings = (
  value: unknown,
  values = new Set<string>(),
  navigationContext = false,
  key = '',
): Set<string> => {
  const nextNavigationContext =
    navigationContext || navigationKeyPattern.test(key)
  if (typeof value === 'string') {
    if (nextNavigationContext && value.trim()) values.add(value)
    return values
  }
  if (Array.isArray(value)) {
    for (const item of value)
      collectNavigationStrings(item, values, nextNavigationContext, key)
    return values
  }
  if (value && typeof value === 'object') {
    for (const [entryKey, item] of Object.entries(value)) {
      collectNavigationStrings(item, values, nextNavigationContext, entryKey)
    }
  }
  return values
}

const buildRouteTargetMap = (
  routes: ExportRoute[],
  sourceTargetMap: Record<string, string>,
): Record<string, string> => {
  const targets = new Set<string>()
  for (const route of routes) {
    targets.add(route.label)
    collectNavigationStrings(route.props, targets)
  }
  for (const target of Object.keys(sourceTargetMap)) targets.add(target)
  return Object.fromEntries(
    [...targets]
      .sort((a, b) => a.localeCompare(b))
      .map((target) => [
        target,
        resolveRouteTarget(target, routes, sourceTargetMap),
      ])
      .filter(
        (entry): entry is [string, string] => typeof entry[1] === 'string',
      ),
  )
}

const walkRegistryFiles = (dir: string, files: string[] = []): string[] => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      walkRegistryFiles(path, files)
    } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
      files.push(path)
    }
  }
  return files
}

let manifestSourceIndex: Record<
  string,
  ReactExportSourceEntry | undefined
> | null = null
let componentSourceIndex: Map<string, ReactExportSourceEntry> | null = null

export const isExportableComponentFactory = (expression: string): boolean =>
  expression === 'defineCapsule'

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
  const manifestJson = brotliDecompressSync(
    Buffer.from(reactExportSourcesBase64, 'base64'),
  ).toString('utf8')
  manifestSourceIndex = JSON.parse(manifestJson) as Record<
    string,
    ReactExportSourceEntry | undefined
  >
  return manifestSourceIndex
}

const getComponentSourceIndex = (): Map<string, ReactExportSourceEntry> => {
  if (componentSourceIndex) return componentSourceIndex
  const index = new Map<string, ReactExportSourceEntry>()
  for (const [name, entry] of Object.entries(getManifestSourceIndex())) {
    if (entry?.source) index.set(name, entry)
  }
  if (index.size > 0) {
    componentSourceIndex = index
    return index
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('React export source manifest is missing')
  }

  for (const file of walkRegistryFiles(blocksRegistryPath)) {
    const source = readFileSync(file, 'utf8')
    const sourceFile = ts.createSourceFile(
      file,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TSX,
    )
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue
      const isExported = statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      )
      if (!isExported) continue
      for (const declaration of statement.declarationList.declarations) {
        if (
          ts.isIdentifier(declaration.name) &&
          declaration.initializer &&
          ts.isCallExpression(declaration.initializer) &&
          isExportableComponentFactory(
            declaration.initializer.expression.getText(sourceFile),
          )
        ) {
          index.set(declaration.name.text, {
            file: relative(
              join(process.cwd(), 'packages', 'ship-fast-blocks'),
              file,
            ).replaceAll('\\', '/'),
            source,
          })
        }
      }
    }
  }
  componentSourceIndex = index
  return index
}

const printNode = (node: ts.Node, sourceFile: ts.SourceFile): string =>
  ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed, removeComments: true })
    .printNode(ts.EmitHint.Unspecified, node, sourceFile)

const propertyNameText = (name: ts.PropertyName, sourceFile: ts.SourceFile) => {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
  return name.getText(sourceFile)
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

const collectIdentifierTexts = (node: ts.Node): Set<string> => {
  const identifiers = new Set<string>()
  const visit = (current: ts.Node) => {
    if (ts.isIdentifier(current)) identifiers.add(current.text)
    ts.forEachChild(current, visit)
  }
  visit(node)
  return identifiers
}

const collectComponentPreludeSources = (
  sourceFile: ts.SourceFile,
  targetStatement: ts.Statement,
  componentSource: ts.Node,
): string[] => {
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
      if (!requiredNames.has(identifier)) queuedNames.push(identifier)
    }
  }

  return sourceFile.statements
    .filter((statement) =>
      topLevelDeclarationNames(statement).some((name) =>
        requiredNames.has(name),
      ),
    )
    .map((statement) => printNode(statement, sourceFile))
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

const rewriteImportModule = (
  statement: ts.ImportDeclaration,
  sourceFile: ts.SourceFile,
  moduleName: string,
  nextModuleName: string,
): string =>
  statement
    .getText(sourceFile)
    .replace(
      new RegExp(`(['"])${escapeRegExp(moduleName)}\\1`),
      (_match, quote: string) => `${quote}${nextModuleName}${quote}`,
    )

const prependImports = (source: string, imports: string[]): string => {
  const importText = imports.join('\n')
  if (!importText) return source.trimStart()

  const body = source.trimStart()
  const directiveMatch = body.match(/^((?:['"][^'"]+['"];?\s*)+)/)
  if (directiveMatch?.[1].includes('use client')) {
    const directive = directiveMatch[1].trimEnd()
    return `${directive}\n\n${importText}\n${body.slice(directiveMatch[1].length).trimStart()}`
  }
  return `${importText}\n${body}`
}

const ensureReactNodeImport = (imports: string[], source: string): string[] => {
  if (!/\bReactNode\b/.test(source)) return imports
  if (
    imports.some(
      (line) =>
        /\bReactNode\b/.test(line) ||
        /\*\s+as\s+React\b/.test(line) ||
        /import\s+React\b/.test(line),
    )
  ) {
    return imports
  }
  return [`import type { ReactNode } from 'react'`, ...imports]
}

const removeImportDeclarations = (
  source: string,
  sourceFile: ts.SourceFile,
): string =>
  replaceRanges(
    source,
    sourceFile.statements.filter(ts.isImportDeclaration).map((statement) => ({
      start: statement.getFullStart(),
      end: statement.end,
      text: '',
    })),
  )

const transformComponentImports = (
  sourceFile: ts.SourceFile,
  componentName: string,
  stack: ExportStack,
  generatedFilePath: string,
  sourcePath?: string,
): ImportTransformResult => {
  const imports: string[] = []
  const dependencies = new Set<string>()
  const blockSources = new Set<string>()
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    if (!ts.isStringLiteral(specifier)) continue
    const moduleName = specifier.text
    const importClause = statement.importClause

    if (
      moduleName === '@ship-fast/lakebed/react' ||
      moduleName === '@ship-fast/lakebed/server'
    ) {
      // Rewrite lakebed imports to point to the store, which exports
      // createLakebedDefinition, string, number, table, LakebedClientRuntime.
      // useKeyedLakebedMutation is translated to useKeyedMutation in
      // component bodies, so we filter it out of the import.
      const storePath = relativeImportPath(
        generatedFilePath,
        'src/lib/store.ts',
      )
      if (importClause?.isTypeOnly) {
        // Type-only import: rewrite to store
        if (
          importClause.namedBindings &&
          ts.isNamedImports(importClause.namedBindings)
        ) {
          const typeNames = importClause.namedBindings.elements.map(
            (el) => el.name.text,
          )
          imports.push(
            `import type { ${typeNames.join(', ')} } from '${storePath}'`,
          )
        }
      } else if (
        importClause?.namedBindings &&
        ts.isNamedImports(importClause.namedBindings)
      ) {
        const names = importClause.namedBindings.elements.map((el) =>
          el.propertyName
            ? `${el.propertyName.text} as ${el.name.text}`
            : el.name.text,
        )
        if (names.length > 0) {
          imports.push(`import { ${names.join(', ')} } from '${storePath}'`)
        }
      }
      continue
    }

    if (importClause?.isTypeOnly && moduleName.startsWith('#/')) continue

    if (moduleName === '@openuidev/react-lang') continue
    if (moduleName === 'zod' || moduleName.startsWith('zod/')) continue
    if (moduleName === './openui.ts') continue
    if (moduleName === '#/capsules/openui.ts') continue
    if (moduleName === '#/lib/utils.ts') {
      imports.push(
        rewriteImportModule(
          statement,
          sourceFile,
          moduleName,
          relativeImportPath(generatedFilePath, 'src/lib/cn.ts'),
        ),
      )
      continue
    }
    if (moduleName === '#/lib/use-navigate.tsx') {
      if (stack === 'react') {
        imports.push("import { useNavigate } from 'react-router-dom'")
        dependencies.add('react-router-dom')
      } else {
        imports.push("import { useRouter } from 'next/navigation'")
        dependencies.add('next')
      }
      continue
    }
    if (moduleName === '#/lib/img.tsx') {
      imports.push(
        rewriteImportModule(
          statement,
          sourceFile,
          moduleName,
          relativeImportPath(generatedFilePath, 'src/lib/image.tsx'),
        ),
      )
      continue
    }
    const aliasSourcePath = blockAliasSourcePath(moduleName)
    if (aliasSourcePath) {
      blockSources.add(aliasSourcePath)
      imports.push(
        rewriteImportModule(
          statement,
          sourceFile,
          moduleName,
          relativeImportPath(
            generatedFilePath,
            exportedBlockSourceOutPath(aliasSourcePath),
          ),
        ),
      )
      continue
    }
    if (moduleName.startsWith('#/')) {
      throw new Error(
        `React export does not support private helper import in ${componentName}: ${moduleName}`,
      )
    }
    if (moduleName.startsWith('.') && sourcePath) {
      const relativeSourcePath = resolveRelativeBlockSourcePath(
        sourcePath,
        moduleName,
      )
      if (!relativeSourcePath) {
        throw new Error(
          `React export cannot resolve relative block import in ${componentName}: ${moduleName}`,
        )
      }
      blockSources.add(relativeSourcePath)
      imports.push(
        rewriteImportModule(
          statement,
          sourceFile,
          moduleName,
          relativeImportPath(
            generatedFilePath,
            exportedBlockSourceOutPath(relativeSourcePath),
          ),
        ),
      )
      continue
    }

    const packageName = readPublicPackageName(moduleName)
    if (packageName) dependencies.add(packageName)
    imports.push(statement.getText(sourceFile))
  }
  return { imports: [...new Set(imports)], dependencies, blockSources }
}

const unwrapZodCall = (
  expression: ts.Expression,
): { expression: ts.Expression; optional: boolean; nullable: boolean } => {
  let current = expression
  let optional = false
  let nullable = false
  const passthroughMethods = new Set([
    'describe',
    'email',
    'int',
    'max',
    'min',
    'nonempty',
    'regex',
    'trim',
    'url',
    'uuid',
  ])

  while (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression)
  ) {
    const method = current.expression.name.text
    if (method === 'optional' || method === 'default') {
      optional = true
      current = current.expression.expression
      continue
    }
    if (method === 'nullable') {
      nullable = true
      current = current.expression.expression
      continue
    }
    if (passthroughMethods.has(method)) {
      current = current.expression.expression
      continue
    }
    break
  }

  return { expression: current, optional, nullable }
}

const zodBaseCallName = (expression: ts.Expression): string | null => {
  if (!ts.isCallExpression(expression)) return null
  const callee = expression.expression
  if (!ts.isPropertyAccessExpression(callee)) return null
  const receiver = callee.expression
  return ts.isIdentifier(receiver) && receiver.text === 'z'
    ? callee.name.text
    : null
}

const renderPropertyName = (name: ts.PropertyName): string | null => {
  if (ts.isIdentifier(name)) return name.text
  if (ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return JSON.stringify(name.text)
  }
  return null
}

const renderZodType = (
  expression: ts.Expression,
  sourceFile: ts.SourceFile,
  depth = 0,
): string => {
  const unwrapped = unwrapZodCall(expression)
  const baseExpression = unwrapped.expression
  const baseName = zodBaseCallName(baseExpression)
  let rendered = 'unknown'

  if (baseName && ts.isCallExpression(baseExpression)) {
    if (baseName === 'string') rendered = 'string'
    else if (baseName === 'number' || baseName === 'int') rendered = 'number'
    else if (baseName === 'boolean') rendered = 'boolean'
    else if (baseName === 'any') rendered = 'any'
    else if (baseName === 'unknown') rendered = 'unknown'
    else if (baseName === 'array') {
      const item = baseExpression.arguments[0]
      rendered = item
        ? `Array<${renderZodType(item, sourceFile, depth + 1)}>`
        : 'unknown[]'
    } else if (baseName === 'enum') {
      const values = baseExpression.arguments[0]
      rendered =
        values && ts.isArrayLiteralExpression(values)
          ? values.elements
              .map((element) =>
                ts.isStringLiteral(element)
                  ? JSON.stringify(element.text)
                  : element.getText(sourceFile),
              )
              .join(' | ') || 'string'
          : 'string'
    } else if (baseName === 'literal') {
      const literal = baseExpression.arguments[0]
      rendered = literal ? literal.getText(sourceFile) : 'unknown'
    } else if (baseName === 'union') {
      const options = baseExpression.arguments[0]
      rendered =
        options && ts.isArrayLiteralExpression(options)
          ? options.elements
              .map((element) => renderZodType(element, sourceFile, depth))
              .join(' | ') || 'unknown'
          : 'unknown'
    } else if (baseName === 'record') {
      const value =
        baseExpression.arguments[baseExpression.arguments.length - 1]
      rendered = `Record<string, ${value ? renderZodType(value, sourceFile, depth + 1) : 'unknown'}>`
    } else if (baseName === 'object') {
      const shape = baseExpression.arguments[0]
      if (shape && ts.isObjectLiteralExpression(shape)) {
        const indent = '  '.repeat(depth + 1)
        const closeIndent = '  '.repeat(depth)
        const properties = shape.properties
          .map((property) => {
            if (!ts.isPropertyAssignment(property)) return null
            const propertyName = renderPropertyName(property.name)
            if (!propertyName) return null
            const value = unwrapZodCall(property.initializer)
            const type = renderZodType(
              property.initializer,
              sourceFile,
              depth + 1,
            )
            return `${indent}${propertyName}${value.optional ? '?' : ''}: ${type}`
          })
          .filter((line): line is string => Boolean(line))
        rendered = properties.length
          ? `{\n${properties.join('\n')}\n${closeIndent}}`
          : 'Record<string, never>'
      }
    }
  }

  return unwrapped.nullable ? `${rendered} | null` : rendered
}

const renderPropsType = (
  componentName: string,
  propsSchema: ts.Expression,
  sourceFile: ts.SourceFile,
): string => {
  const type = renderZodType(propsSchema, sourceFile)
  return type.startsWith('{\n')
    ? `export type ${componentName}Props = ${type}`
    : `export type ${componentName}Props = ${type}`
}

const findDefineComponentParts = (
  componentName: string,
  entry: ReactExportSourceEntry,
): {
  sourceFile: ts.SourceFile
  propsSchema: ts.Expression
  preludeSources: string[]
  body: string
  isExpressionBody: boolean
} => {
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
      )
        continue
      const call = declaration.initializer
      if (
        !call ||
        !ts.isCallExpression(call) ||
        !isExportableComponentFactory(call.expression.getText(sourceFile))
      )
        continue
      const config = call.arguments[0]
      if (!config || !ts.isObjectLiteralExpression(config)) continue
      const propsProperty = config.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'props',
      )
      const componentProperty = config.properties.find(
        (property): property is ts.PropertyAssignment =>
          ts.isPropertyAssignment(property) &&
          ts.isIdentifier(property.name) &&
          property.name.text === 'component',
      )
      if (!propsProperty || !componentProperty) {
        throw new Error(`Cannot extract props/component from ${componentName}`)
      }
      const component = componentProperty.initializer
      if (
        !ts.isArrowFunction(component) &&
        !ts.isFunctionExpression(component)
      ) {
        throw new Error(
          `Unsupported component function shape in ${componentName}`,
        )
      }
      // Components that use renderNode (e.g. Card, Tabs, Accordion) or
      // useStateField (e.g. StateButton, StateInput, StateText) are runtime
      // primitives. The export provides stub implementations so the exported
      // code compiles and produces a valid zip. See extractComponent for the
      // helper injection.
      return {
        sourceFile,
        propsSchema: propsProperty.initializer,
        preludeSources: collectComponentPreludeSources(
          sourceFile,
          statement,
          component,
        ),
        body: ts.isBlock(component.body)
          ? component.body.statements
              .map((bodyStatement) => printNode(bodyStatement, sourceFile))
              .join('\n')
          : printNode(component.body, sourceFile),
        isExpressionBody: !ts.isBlock(component.body),
      }
    }
  }
  throw new Error(`Component source not found for ${componentName}`)
}

const findComponentLakebedProperty = (
  componentName: string,
  entry: ReactExportSourceEntry,
): {
  lakebed: ts.ObjectLiteralExpression
  sourceFile: ts.SourceFile
} | null => {
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
        !isExportableComponentFactory(call.expression.getText(sourceFile))
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
      if (lakebed && ts.isObjectLiteralExpression(lakebed)) {
        return { lakebed, sourceFile }
      }
    }
  }

  return null
}

const readLakebedEndpointDefinitions = (
  componentName: string,
  entry: ReactExportSourceEntry,
): LakebedEndpointDefinition[] => {
  const found = findComponentLakebedProperty(componentName, entry)
  if (!found) return []
  const endpointsProperty = found.lakebed.properties.find(
    (property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property) &&
      ts.isIdentifier(property.name) &&
      property.name.text === 'endpoints',
  )
  const endpoints = endpointsProperty?.initializer
  if (!endpoints || !ts.isObjectLiteralExpression(endpoints)) return []

  return endpoints.properties
    .filter((property): property is ts.PropertyAssignment =>
      ts.isPropertyAssignment(property),
    )
    .map((property) => {
      const initializer = property.initializer
      const route =
        ts.isCallExpression(initializer) &&
        initializer.expression.getText(found.sourceFile) === 'endpoint' &&
        initializer.arguments[0] &&
        ts.isObjectLiteralExpression(initializer.arguments[0])
          ? initializer.arguments[0]
          : null
      const method = route ? stringPropertyValue(route, 'method') : null
      const path = route ? stringPropertyValue(route, 'path') : null
      if (!method || !path) return null
      return {
        componentName,
        method: method.toUpperCase(),
        name: propertyNameText(property.name, found.sourceFile),
        path,
        source: printNode(initializer, found.sourceFile),
      }
    })
    .filter(
      (definition): definition is LakebedEndpointDefinition =>
        definition !== null,
    )
}

const sourceEndpointName = (
  method: string,
  path: string,
  index: number,
): string => {
  const slug =
    path.split(/[?#]/)[0]?.split('/').filter(Boolean).join('_') || 'root'
  return `${method.toLowerCase()}_${slug}_${index + 1}`.replace(
    /[^A-Za-z0-9_$]+/g,
    '_',
  )
}

const readSourceEndpointDefinitions = (
  source: string,
): LakebedEndpointDefinition[] => {
  const sourceFile = ts.createSourceFile(
    'openui-source.ts',
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  )
  const endpoints: LakebedEndpointDefinition[] = []

  const visit = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(sourceFile) === 'endpoint'
    ) {
      const route = node.arguments[0]
      const method =
        route && ts.isObjectLiteralExpression(route)
          ? stringPropertyValue(route, 'method')
          : null
      const path =
        route && ts.isObjectLiteralExpression(route)
          ? stringPropertyValue(route, 'path')
          : null
      if (method && path) {
        endpoints.push({
          componentName: 'Source',
          method: method.toUpperCase(),
          name: sourceEndpointName(method, path, endpoints.length),
          path,
          source: printNode(node, sourceFile),
        })
      }
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return endpoints
}

const navigationVarPattern =
  /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*useNavigate\(\)/g

const escapeRegExp = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const isStringLiteralSource = (value: string): boolean =>
  /^(['"`])[\s\S]*\1$/.test(value.trim())

const parseStringLiteralSource = (value: string): string | null => {
  try {
    const parsed = Function(`"use strict"; return (${value});`)() as unknown
    return typeof parsed === 'string' ? parsed : null
  } catch {
    return null
  }
}

const renderNavigationArgument = (
  argument: string,
  routeTargets: Record<string, string>,
): string => {
  const trimmed = argument.trim()
  if (isStringLiteralSource(trimmed)) {
    const literal = parseStringLiteralSource(trimmed)
    if (literal) return JSON.stringify(routeTargets[literal]) ?? 'undefined'
  }
  return `routePaths[String(${trimmed})]`
}

const rewriteNavigationCalls = (
  body: string,
  stack: ExportStack,
  routeTargets: Record<string, string>,
): { body: string; usesNavigation: boolean } => {
  const navigationVars = [...body.matchAll(navigationVarPattern)]
    .map((match) => match[1])
    .filter(Boolean)
  if (navigationVars.length === 0) return { body, usesNavigation: false }

  let nextBody = body
  if (stack === 'next') {
    nextBody = nextBody.replace(navigationVarPattern, 'const $1 = useRouter()')
  }

  for (const name of new Set(navigationVars)) {
    const callPattern = new RegExp(
      `\\b${escapeRegExp(name)}\\(([^()\\n]+)\\)`,
      'g',
    )
    nextBody = nextBody.replace(callPattern, (_match, argument: string) => {
      const destination = renderNavigationArgument(argument, routeTargets)
      return stack === 'react'
        ? `${name}(${destination})`
        : `${name}.push(${destination})`
    })
  }

  return { body: nextBody, usesNavigation: true }
}

const renderTranslatedQuery = (
  variableName: string,
  queryName: string,
  fallback?: string,
) => {
  const actionName = queryActionName(queryName)
  const defaultValue = fallback ? `(${fallback.trim()})` : `[]`
  return `const { data: ${variableName} = ${defaultValue} } = useQuery({
    queryKey: [${JSON.stringify(queryName)}],
    queryFn: ${actionName},
  });`
}

const renderTranslatedMutation = (
  variableName: string,
  mutationName: string,
) => {
  const actionName = mutationActionName(mutationName)
  // Extract mutateAsync so the variable is callable, matching the original
  // lakebed.useMutation() API where the result was a callable function
  return `const ${variableName} = useMutation({
    mutationFn: ${actionName},
    onSuccess: () => queryClient.invalidateQueries(),
  }).mutateAsync`
}

const translateLakebedRuntimeCalls = (body: string, dataKeys: DataKeys) => {
  const usesSignIn = /\blakebed\.signInWithGoogle\(\)/.test(body)
  const usesSignOut = /\blakebed\.signOut\(\)/.test(body)

  let nextBody = body.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useQuery\(([^;\n]+)\)(\s*\?\?\s*[^;\n]+)?;?/g,
    (_match, variableName: string, queryName: string, fallback?: string) => {
      dataKeys.queries.add(queryName.trim().replace(/['"]/g, ''))
      return renderTranslatedQuery(
        variableName,
        queryName.trim().replace(/['"]/g, ''),
        fallback?.replace(/^\s*\?\?\s*/, ''),
      )
    },
  )

  nextBody = nextBody.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useMutation\(([^;\n]+)\);?/g,
    (_match, variableName: string, mutationName: string) => {
      const cleanName = mutationName.trim().replace(/['"]/g, '')
      dataKeys.mutations.add(cleanName)
      return renderTranslatedMutation(variableName, cleanName)
    },
  )

  // Translate inline lakebed.useQuery('name') (not assigned to const)
  // e.g. lakebed.useQuery('productCatalog') → useQuery({ queryKey: ['productCatalog'], queryFn: ... })
  nextBody = nextBody.replace(
    /\blakebed\.useQuery\(\s*['"]([^'"]+)['"]\s*\)/g,
    (_match, queryName: string) => {
      dataKeys.queries.add(queryName)
      const actionName = queryActionName(queryName)
      return `useQuery({ queryKey: [${JSON.stringify(queryName)}], queryFn: ${actionName} })`
    },
  )

  // Translate inline lakebed.useMutation('name') (not assigned to const)
  nextBody = nextBody.replace(
    /\blakebed\.useMutation\(\s*['"]([^'"]+)['"]\s*\)/g,
    (_match, mutationName: string) => {
      dataKeys.mutations.add(mutationName)
      const actionName = mutationActionName(mutationName)
      return `useMutation({ mutationFn: ${actionName} })`
    },
  )

  // Translate useKeyedLakebedMutation(lakebed, 'name') → useKeyedMutation(nameAction)
  // Handle both `const x = useKeyedLakebedMutation(lakebed, 'name')` and inline usage
  // Also handle multi-line calls where `lakebed` and `'name'` are on separate lines
  nextBody = nextBody.replace(
    /\buseKeyedLakebedMutation\(\s*lakebed\s*,\s*['"]([^'"]+)['"]\s*[\s\S]*?\)/g,
    (_match, mutationName: string) => {
      dataKeys.mutations.add(mutationName)
      const actionName = mutationActionName(mutationName)
      return `useKeyedMutation(${actionName})`
    },
  )

  // Translate lakebed.useAuth() → useShooAuth() + adaptShooIdentity
  nextBody = nextBody.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useAuth\(\);?/g,
    (_match, variableName: string) => {
      dataKeys.usesAuth = true
      return `const { identity: shooIdentity, signIn, clearIdentity } = useShooAuth()\n  const ${variableName} = adaptShooIdentity(shooIdentity)`
    },
  )

  // Translate inline lakebed.useAuth() (not assigned to const)
  nextBody = nextBody.replace(/\blakebed\.useAuth\(\)/g, () => {
    dataKeys.usesAuth = true
    return 'adaptShooIdentity(useShooAuth().identity)'
  })

  // Translate lakebed.signInWithGoogle() → signIn()
  if (usesSignIn) {
    dataKeys.usesSignIn = true
    dataKeys.usesAuth = true
    nextBody = nextBody.replace(/\blakebed\.signInWithGoogle\(\)/g, 'signIn()')
  }

  // Translate lakebed.signOut() → clearIdentity()
  if (usesSignOut) {
    dataKeys.usesSignOut = true
    dataKeys.usesAuth = true
    nextBody = nextBody.replace(/\blakebed\.signOut\(\)/g, 'clearIdentity()')
  }

  // If auth is used but no specific variable was bound, still mark it
  if (/\blakebed\.useAuth\(\)/.test(body)) {
    dataKeys.usesAuth = true
  }

  const needsQueryClient =
    dataKeys.mutations.size > 0 || usesSignIn || usesSignOut

  return {
    body: nextBody,
    needsQueryClient,
    usesAuth: dataKeys.usesAuth,
    usesMutation: dataKeys.mutations.size > 0,
    usesQuery: dataKeys.queries.size > 0,
  }
}

const sourceUsesLakebedRuntime = (source: string): boolean =>
  /\blakebed\b/.test(source) ||
  /@ship-fast\/lakebed\/(?:react|server)/.test(source)

/**
 * Translate lakebed runtime calls in block source files for Next.js/React
 * exports. Removes `lakebed` parameters, translates `lakebed.useQuery()` →
 * `useQuery()`, removes lakebed type imports, and adds React Query imports.
 * Also collects query/mutation names into dataKeys.
 */
const translateBlockSourceLakebed = (
  source: string,
  stack: ExportStack,
  dataKeys: DataKeys,
  outPath: string,
): { source: string; skip: boolean } => {
  // Process lakebed definition files: keep types and utility functions,
  // but remove the createLakebedDefinition call and its imports
  const isLakebedDefFile =
    /cart-lakebed\.ts$/.test(outPath) || /newsletter-lakebed\.ts$/.test(outPath)

  if (isLakebedDefFile) {
    // Remove createLakebedDefinition import
    let body = source.replace(
      /import\s+\{[^}]*createLakebedDefinition[^}]*\}\s+from[^\n]+;?\n?/g,
      '',
    )
    // Remove other lakebed-specific imports (string, number, table)
    body = body.replace(
      /import\s+\{[^}]*(?:string|number|table)[^}]*\}\s+from\s+['"]@ship-fast\/lakebed\/(?:server|react)['"];?\n?/g,
      '',
    )
    // Remove the createLakebedDefinition call and everything after it
    // (the lakebed definition, queries, mutations, etc.)
    // Keep everything before `const commerce = createLakebedDefinition`
    const defStart = body.search(/const\s+\w+\s*=\s*createLakebedDefinition/)
    if (defStart !== -1) {
      body = body.substring(0, defStart).trimEnd() + '\n'
    }
    // Remove `export type ...Lakebed = LakebedClientRuntime<...>` lines
    body = body.replace(
      /export\s+type\s+\w+Lakebed\s*=\s*LakebedClientRuntime[^;\n]*;?\n?/g,
      '',
    )
    // Remove LakebedClientRuntime type import
    body = body.replace(
      /import\s+type\s+\{[^}]*LakebedClientRuntime[^}]*\}\s+from[^\n]+;?\n?/g,
      '',
    )
    return { source: body, skip: false }
  }

  if (!sourceUsesLakebedRuntime(source)) return { source, skip: false }

  // Collect query/mutation names from lakebed calls in this block source
  const queryNameRegex = /lakebed\.useQuery\(\s*['"]([^'"]+)['"]\s*\)/g
  const mutationNameRegex = /lakebed\.useMutation\(\s*['"]([^'"]+)['"]\s*\)/g
  const keyedMutationRegex =
    /useKeyedLakebedMutation\(\s*lakebed\s*,\s*['"]([^'"]+)['"]\s*\)/g

  let match: RegExpExecArray | null
  while ((match = queryNameRegex.exec(source)) !== null) {
    dataKeys.queries.add(match[1])
  }
  while ((match = mutationNameRegex.exec(source)) !== null) {
    dataKeys.mutations.add(match[1])
  }
  while ((match = keyedMutationRegex.exec(source)) !== null) {
    dataKeys.mutations.add(match[1])
  }

  // Check for auth usage
  if (/\blakebed\.useAuth\(\)/.test(source)) {
    dataKeys.usesAuth = true
  }
  if (/\blakebed\.signInWithGoogle\(\)/.test(source)) {
    dataKeys.usesSignIn = true
    dataKeys.usesAuth = true
  }
  if (/\blakebed\.signOut\(\)/.test(source)) {
    dataKeys.usesSignOut = true
    dataKeys.usesAuth = true
  }

  // Run the standard lakebed translation (handles lakebed.useQuery → useQuery,
  // lakebed.useMutation → useMutation, useKeyedLakebedMutation → useKeyedMutation,
  // lakebed.useAuth → useShooAuth, etc.)
  const translated = translateLakebedRuntimeCalls(source, dataKeys)
  let body = translated.body

  // Remove `lakebed: CommerceLakebed` and `lakebed: NewsletterLakebed` from
  // function parameters. Handles both single-param and multi-param signatures.
  body = body.replace(/,\s*lakebed:\s*[A-Za-z_]+Lakebed/g, '')
  body = body.replace(/lakebed:\s*[A-Za-z_]+Lakebed\s*,?\s*/g, '')

  // Remove `lakebed` from destructured props: { lakebed, ... } → { ... }
  // Also handles { item, lakebed } and { lakebed, item, ... }
  body = body.replace(/\{\s*lakebed\s*,\s*/g, '{ ')
  body = body.replace(/,\s*lakebed\s*(?=\})/g, '')
  body = body.replace(/,\s*lakebed\s*,/g, ',')

  // Remove `lakebed={lakebed}` from JSX props
  body = body.replace(/\s*lakebed=\{lakebed\}/g, '')

  // Remove `lakebed` from function call arguments
  // e.g. useCommerceSearch(lakebed) → useCommerceSearch()
  // e.g. useSyncCommerceCatalog(lakebed, products) → useSyncCommerceCatalog(products)
  body = body.replace(/\b(\w+)\(lakebed\s*,\s*/g, '$1(')
  body = body.replace(/\b(\w+)\(lakebed\s*\)/g, '$1()')
  // Multi-line: func(\n  lakebed,\n  ...) → func(\n  ...)
  body = body.replace(/\b(\w+)\(\s*\n\s*lakebed\s*,\s*\n/g, '$1(\n')
  body = body.replace(/\b(\w+)\(\s*\n\s*lakebed\s*\n\s*\)/g, '$1()')

  // Remove `lakebed` from import lists (e.g., `import { lakebed } from ...`)
  // and remove lakebed type imports
  body = body.replace(
    /import\s+type\s*\{[^}]*LakebedClientRuntime[^}]*\}\s+from[^\n]+;?\n?/g,
    '',
  )
  body = body.replace(
    /import\s+type\s*\{[^}]*\b[A-Z]\w*Lakebed\b[^}]*\}\s+from[^\n]+;?\n?/g,
    '',
  )
  body = body.replace(
    /import\s+\{[^}]*useKeyedLakebedMutation[^}]*\}\s+from\s+['"]@ship-fast\/lakebed\/react['"];?\n?/g,
    '',
  )
  // Also remove useKeyedLakebedMutation import that was rewritten to lib/store
  body = body.replace(
    /import\s+\{[^}]*useKeyedLakebedMutation[^}]*\}\s+from\s+['"][^'"]*lib\/store['"];?\n?/g,
    '',
  )
  body = body.replace(
    /import\s+\{[^}]*createLakebedDefinition[^}]*\}\s+from[^\n]+;?\n?/g,
    '',
  )

  // Remove type aliases that reference lakebed (use [^;\n] to avoid eating across lines)
  body = body.replace(
    /export\s+type\s+[A-Za-z_]+Lakebed\s*=\s*LakebedClientRuntime[^;\n]*;?\n?/g,
    '',
  )
  body = body.replace(
    /type\s+[A-Za-z_]+Lakebed\s*=\s*LakebedClientRuntime[^;\n]*;?\n?/g,
    '',
  )

  // Replace type definitions that reference lakebed definitions with any.
  // Handles multi-line definitions with nested generics like:
  //   type CommerceCatalogProduct = NonNullable<
  //     ReturnType<typeof commerceCartLakebed.queries.productCatalog>
  //   >[number]
  // Matches from "type X =" to the newline before the next declaration/blank line.
  // MUST run before removing lakebed definition names from imports
  body = body.replace(
    /type\s+(\w+)\s*=(?:(?!^type\s)[\s\S])*?\b[a-z]\w*Lakebed\b[\s\S]*?\n(?=(?:type\s|export\s|const\s|function\s|import\s|\n|$))/gm,
    'type $1 = any\n',
  )

  // Remove lakebed-specific names from imports of cart-lakebed/newsletter-lakebed
  // but keep imports of utility functions and types (commerceCartItemKey, CommerceCartItemInput, etc.)
  // Only remove the lakebed definition names from the import list
  body = body.replace(/,\s*(?:commerceCartLakebed|newsletterLakebed)\b/g, '')
  body = body.replace(/\b(?:commerceCartLakebed|newsletterLakebed)\s*,\s*/g, '')
  body = body.replace(/\b(?:commerceCartLakebed|newsletterLakebed)\b/g, '')
  // Remove LakebedClientRuntime type imports entirely
  body = body.replace(
    /import\s+type\s+\{[^}]*LakebedClientRuntime[^}]*\}\s+from[^\n]+;?\n?/g,
    '',
  )

  // Remove `CommerceLakebed = LakebedClientRuntime<...>` type exports
  body = body.replace(
    /export\s+type\s+CommerceLakebed\s*=\s*LakebedClientRuntime[^;\n]*;?\n?/g,
    '',
  )

  // Remove standalone `type CommerceLakebed = ...` lines
  body = body.replace(/^type\s+[A-Za-z_]+Lakebed\b.*$/gm, '')

  // Remove `export type { ... Lakebed ... }` re-exports
  body = body.replace(
    /export\s+type\s+\{[^}]*Lakebed[^}]*\}\s+from[^\n]+;?\n?/g,
    '',
  )

  // Add React Query imports if the file uses useQuery/useMutation after translation
  const needsReactQuery =
    /\buseQuery\b/.test(body) || /\buseMutation\b/.test(body)
  const needsQueryClient = /\bqueryClient\b/.test(body)
  const needsKeyedMutation = /\buseKeyedMutation\b/.test(body)
  const needsShooAuth = /\buseShooAuth\b/.test(body)
  const needsAdaptShoo = /\badaptShooIdentity\b/.test(body)

  // Calculate relative path from the block source file to src/lib/
  // outPath is like "src/vendor/blocks/src/registry/sections/commerce/commerce-interactions.tsx"
  // The file's directory is 7 levels deep; src/ is 1 level deep, so we need 6 ../
  const outPathDepth = outPath.split('/').length - 1 // number of path segments including filename
  const upLevels = outPathDepth - 1 // directory depth - src/ depth(1) → how many ../ to reach src/
  const relPrefix = `${'../'.repeat(Math.max(1, upLevels))}`

  const extraImports: string[] = []
  if (needsReactQuery) {
    const imports: string[] = []
    if (/\buseQuery\b/.test(body)) imports.push('useQuery')
    if (/\buseMutation\b/.test(body)) imports.push('useMutation')
    if (needsQueryClient) imports.push('useQueryClient')
    extraImports.push(
      `import { ${imports.join(', ')} } from '@tanstack/react-query'`,
    )
  }
  if (needsKeyedMutation) {
    extraImports.push(
      `import { useKeyedMutation } from '${relPrefix}lib/use-keyed-mutation'`,
    )
  }
  if (needsShooAuth) {
    extraImports.push(`import { useShooAuth } from '${relPrefix}lib/auth'`)
  }
  if (needsAdaptShoo) {
    extraImports.push(
      `import { adaptShooIdentity } from '${relPrefix}lib/auth'`,
    )
  }

  // Add queryClient declaration if needed
  if (needsQueryClient) {
    // Insert `const queryClient = useQueryClient()` once per function that uses useMutation.
    // We find each function body that contains useMutation and insert the declaration
    // before the first useMutation call in that function.
    // To avoid duplicate declarations, we only insert before the first useMutation
    // in each function scope.
    const lines = body.split('\n')
    const result: string[] = []
    let inFunction = false
    let functionBraceDepth = 0
    let insertedInCurrentFunction = false
    for (const line of lines) {
      // Track function entry by looking for `useMutation({` without an existing queryClient
      if (
        !insertedInCurrentFunction &&
        inFunction &&
        /useMutation\(\{/.test(line) &&
        !/queryClient/.test(line)
      ) {
        result.push('  const queryClient = useQueryClient()')
        insertedInCurrentFunction = true
      }
      // Track function boundaries
      if (/^(export\s+)?(async\s+)?function\s+\w+/.test(line.trim())) {
        inFunction = true
        functionBraceDepth = 0
        insertedInCurrentFunction = false
      }
      // Count braces to detect function end
      if (inFunction) {
        for (const ch of line) {
          if (ch === '{') functionBraceDepth++
          else if (ch === '}') {
            functionBraceDepth--
            if (functionBraceDepth <= 0) {
              inFunction = false
              insertedInCurrentFunction = false
            }
          }
        }
      }
      result.push(line)
    }
    body = result.join('\n')
  }

  // Collect all action names used in the body and add imports
  const usedActionNames: string[] = []
  for (const q of dataKeys.queries) {
    const action = queryActionName(q)
    if (new RegExp(`\\b${action}\\b`).test(body)) {
      usedActionNames.push(action)
    }
  }
  for (const m of dataKeys.mutations) {
    const action = mutationActionName(m)
    if (new RegExp(`\\b${action}\\b`).test(body)) {
      usedActionNames.push(action)
    }
  }

  if (usedActionNames.length > 0) {
    if (stack === 'next') {
      // Next.js: import from server actions
      // Query actions are exported as `${actionName}Action`, mutations as `${actionName}Server`
      const queryActionSet = new Set(
        [...dataKeys.queries].map((q) => queryActionName(q)),
      )
      const actionImports = usedActionNames.map((n) => {
        const isQuery = queryActionSet.has(n)
        return isQuery ? `${n}Action as ${n}` : `${n}Server as ${n}`
      })
      extraImports.push(
        `import { ${actionImports.join(', ')} } from '${relPrefix}../app/actions/server-actions'`,
      )
    } else {
      // React: import from store
      extraImports.push(
        `import { ${usedActionNames.join(', ')} } from '${relPrefix}lib/store'`,
      )
    }
  }

  // Add React import if needed for hooks
  if (needsReactQuery || translated.usesAuth) {
    if (
      !/^import\s+React\b/m.test(body) &&
      !/^import\s+\*\s+as\s+React\b/m.test(body)
    ) {
      // Check if React is needed (for useState, useRef, etc.)
      if (
        /\bReact\.(useState|useRef|useCallback|useMemo|useEffect)\b/.test(body)
      ) {
        extraImports.unshift(`import React from 'react'`)
      }
    }
  }

  if (extraImports.length > 0) {
    body = `${extraImports.join('\n')}\n${body}`
  }

  return { source: body, skip: false }
}

const extractComponent = (
  componentName: string,
  stack: ExportStack,
  routeTargets: Record<string, string>,
  dataKeys: DataKeys,
): ExtractedComponent => {
  const entry = getComponentSourceIndex().get(componentName)
  if (!entry)
    throw new Error(
      `React export does not support unknown component: ${componentName}`,
    )

  const { sourceFile, propsSchema, preludeSources, body, isExpressionBody } =
    findDefineComponentParts(componentName, entry)
  const generatedFilePath = `src/components/${componentName}.tsx`
  const { imports, dependencies, blockSources } = transformComponentImports(
    sourceFile,
    componentName,
    stack,
    generatedFilePath,
    entry.file,
  )
  const functionBody = isExpressionBody ? `return ${body}` : body
  const usesLakebed =
    sourceUsesLakebedRuntime(functionBody) ||
    [...blockSources].some((sourcePath) =>
      sourceUsesLakebedRuntime(getBlockSourceFile(sourcePath)),
    )
  const translatedLakebed = usesLakebed
    ? translateLakebedRuntimeCalls(functionBody, dataKeys)
    : {
        body: functionBody,
        needsQueryClient: false,
        usesAuth: false,
        usesMutation: false,
        usesQuery: false,
      }
  // After translation, remove any remaining `lakebed` references:
  // - `lakebed={lakebed}` JSX props (block components no longer take lakebed)
  // - `const lakebed = useLakebed()` (no adapter needed)
  // - `lakebed` as first argument to hook calls (e.g. useSyncCommerceCatalog(lakebed, products))
  //   Handles both single-line and multi-line call patterns
  const lakebedPurgedBody = translatedLakebed.body
    .replace(/\s*lakebed=\{lakebed\}/g, '')
    .replace(/const\s+lakebed\s*=\s*useLakebed\(\)\s*\n?/g, '')
    // Single-line: func(lakebed, ...) → func(...)
    .replace(/\b(\w+)\(lakebed\s*,\s*/g, '$1(')
    .replace(/\b(\w+)\(lakebed\s*\)/g, '$1()')
    // Multi-line: func(\n  lakebed,\n  ...) → func(\n  ...)
    .replace(/\b(\w+)\(\s*\n\s*lakebed\s*,\s*\n/g, '$1(\n')
    .replace(/\b(\w+)\(\s*\n\s*lakebed\s*\n\s*\)/g, '$1()')
  const translatedBody = lakebedPurgedBody
  const rewrittenNavigation = rewriteNavigationCalls(
    translatedBody,
    stack,
    routeTargets,
  )
  const routePaths = rewrittenNavigation.usesNavigation
    ? `\nconst routePaths: Record<string, string> = ${JSON.stringify(routeTargets, null, 2)}\n`
    : ''
  const componentSource = `${preludeSources.join('\n\n')}\n${rewrittenNavigation.body}`
  const queryHookImport =
    usesLakebed &&
    (translatedLakebed.usesAuth ||
      translatedLakebed.usesMutation ||
      translatedLakebed.usesQuery)
      ? `\nimport { useMutation, useQuery${translatedLakebed.needsQueryClient ? ', useQueryClient' : ''} } from '@tanstack/react-query'`
      : ''
  // Build named data imports based on what this component actually uses
  const dataImportNames: string[] = []
  // Collect query/mutation names used in THIS component's body
  const componentQueryNames = [...dataKeys.queries].filter((name) =>
    componentSource.includes(queryActionName(name)),
  )
  const componentMutationNames = [...dataKeys.mutations].filter((name) =>
    componentSource.includes(mutationActionName(name)),
  )
  const usesKeyedMutation = /\buseKeyedMutation\b/.test(componentSource)
  const usesShooAuth = /\buseShooAuth\b/.test(componentSource)
  const dataImportPath =
    stack === 'next' ? '../../app/actions/server-actions' : '../lib/store'
  if (componentQueryNames.length > 0 || componentMutationNames.length > 0) {
    const isNext = stack === 'next'
    const allNames = [
      ...componentQueryNames.map((n) =>
        isNext
          ? `${queryActionName(n)}Action as ${queryActionName(n)}`
          : queryActionName(n),
      ),
      ...componentMutationNames.map((n) =>
        isNext
          ? `${mutationActionName(n)}Server as ${mutationActionName(n)}`
          : mutationActionName(n),
      ),
    ]
    dataImportNames.push(
      `import { ${allNames.join(', ')} } from '${dataImportPath}'`,
    )
  }
  if (usesKeyedMutation) {
    dataImportNames.push(
      `import { useKeyedMutation } from '../lib/use-keyed-mutation'`,
    )
  }
  if (usesShooAuth) {
    dataImportNames.push(
      `import { useShooAuth, adaptShooIdentity } from '../lib/auth'`,
    )
  }
  const dataImports =
    dataImportNames.length > 0 ? `\n${dataImportNames.join('\n')}` : ''
  // Detect runtime primitives (renderNode/useStateField) that need stub
  // implementations in the export. The runtime uses these to render child
  // element nodes and manage shared state. In the export we provide simple
  // stubs so the code compiles and produces a valid zip.
  const usesRenderNode = /\brenderNode\b/.test(componentSource)
  const usesStateField = /\buseStateField\b/.test(componentSource)
  const runtimeHelpers = [
    usesRenderNode
      ? `function renderNode(node: unknown): React.ReactNode {
  if (node == null || node === false) return null
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return React.createElement(React.Fragment, null, ...node.map(renderNode))
  if (typeof node === 'object' && 'typeName' in (node as Record<string, unknown>)) {
    const el = node as { typeName: string; props: Record<string, unknown> }
    if (el.typeName === 'Text' && el.props?.text != null) return String(el.props.text)
    if (el.typeName === 'Heading' && el.props?.text != null) return String(el.props.text)
    return renderNode(el.props?.children)
  }
  return null
}`
      : '',
    usesStateField
      ? `function useStateField<T>(field: string, initial: T): { value: T; setValue: (v: T) => void } {
  const [value, setValue] = React.useState<T>(initial)
  return { value, setValue }
}`
      : '',
  ]
    .filter(Boolean)
    .join('\n\n')
  const needsReactImport = usesRenderNode || usesStateField
  let componentImports = ensureReactNodeImport(imports, componentSource)
  if (
    needsReactImport &&
    !componentImports.some(
      (line) => /import\s+React\b/.test(line) || /\*\s+as\s+React\b/.test(line),
    )
  ) {
    componentImports = [`import React from 'react'`, ...componentImports]
  }
  const helpersSection = runtimeHelpers ? `\n${runtimeHelpers}\n` : ''
  // Build full source first, then filter out imports whose named bindings
  // are not referenced anywhere in the component (e.g. commerceCartLakebed
  // becomes unused after lakebed runtime translation replaces
  // `lakebed: commerceCartLakebed` with `const lakebed = useLakebed()`).
  const fullSource = `${componentImports.join('\n')}${queryHookImport}${dataImports}${routePaths}

${preludeSources.join('\n\n')}
${helpersSection}
${renderPropsType(componentName, propsSchema, sourceFile)}

export function ${componentName}(props: ${componentName}Props) {
${translatedLakebed.needsQueryClient ? '  const queryClient = useQueryClient()\n' : ''}${rewrittenNavigation.body
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n')}
}`
  const filteredImports = componentImports.filter((importLine) => {
    const namedMatch = importLine.match(/import\s+\{([^}]+)\}\s+from/)
    if (!namedMatch) return true // Keep default/namespace imports
    const names = namedMatch[1]
      .split(',')
      .map((n) => {
        const parts = n.trim().split(/\s+as\s+/)
        // Use the local name (after 'as') — that's what appears in the body
        return parts[parts.length - 1].trim()
      })
      .filter(Boolean)
    // Check against the full source minus the import lines themselves
    const sourceWithoutImports = fullSource.replace(/^import .*$/gm, '')
    return names.some((name) => {
      const re = new RegExp(
        `\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`,
      )
      return re.test(sourceWithoutImports)
    })
  })
  const source = `${filteredImports.join('\n')}${queryHookImport}${dataImports}${routePaths}

${preludeSources.join('\n\n')}
${helpersSection}
${renderPropsType(componentName, propsSchema, sourceFile)}

export function ${componentName}(props: ${componentName}Props) {
${translatedLakebed.needsQueryClient ? '  const queryClient = useQueryClient()\n' : ''}
${rewrittenNavigation.body
  .split('\n')
  .map((line) => `  ${line}`)
  .join('\n')}
}
`

  return {
    name: componentName,
    source,
    dependencies,
    blockSources,
    usesLakebed,
  }
}

const collectBlockSourceFiles = (
  sourcePaths: Iterable<string>,
  stack: ExportStack,
  dataKeys?: DataKeys,
  routeTargets?: Record<string, string>,
): { files: Record<string, string>; dependencies: Set<string> } => {
  const pending = [...new Set(sourcePaths)]
  const seen = new Set<string>()
  const files: Record<string, string> = {}
  const dependencies = new Set<string>()

  let index = 0
  while (index < pending.length) {
    const sourcePath = pending[index]
    index += 1
    if (!sourcePath || seen.has(sourcePath)) continue
    seen.add(sourcePath)

    const source = getBlockSourceFile(sourcePath)
    const sourceFile = ts.createSourceFile(
      sourcePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      sourceFileScriptKind(sourcePath),
    )
    const outPath = exportedBlockSourceOutPath(sourcePath)
    if (!shouldTransformSourceImports(sourcePath)) {
      files[outPath] = source
      continue
    }
    const transformed = transformComponentImports(
      sourceFile,
      sourcePath,
      stack,
      outPath,
      sourcePath,
    )

    for (const dependency of transformed.dependencies) {
      dependencies.add(dependency)
    }
    for (const nestedSourcePath of transformed.blockSources) {
      if (!seen.has(nestedSourcePath)) pending.push(nestedSourcePath)
    }

    // For Next.js/React exports, translate lakebed runtime calls in block
    // source files and skip lakebed definition files.
    if (dataKeys && (stack === 'next' || stack === 'react')) {
      const rawSource = prependImports(
        removeImportDeclarations(source, sourceFile),
        ensureReactNodeImport(transformed.imports, source),
      )
      const result = translateBlockSourceLakebed(
        rawSource,
        stack,
        dataKeys,
        outPath,
      )
      if (result.skip) continue
      const navRewritten = routeTargets
        ? rewriteNavigationCalls(result.source, stack, routeTargets)
        : { body: result.source, usesNavigation: false }
      const routePathsConst = navRewritten.usesNavigation
        ? `const routePaths: Record<string, string> = ${JSON.stringify(routeTargets, null, 2)}\n`
        : ''
      files[outPath] = routePathsConst + navRewritten.body
    } else {
      const rawSource = prependImports(
        removeImportDeclarations(source, sourceFile),
        ensureReactNodeImport(transformed.imports, source),
      )
      const navRewritten = routeTargets
        ? rewriteNavigationCalls(rawSource, stack, routeTargets)
        : { body: rawSource, usesNavigation: false }
      const routePathsConst = navRewritten.usesNavigation
        ? `const routePaths: Record<string, string> = ${JSON.stringify(routeTargets, null, 2)}\n`
        : ''
      files[outPath] = routePathsConst + navRewritten.body
    }
  }

  return { files, dependencies }
}

const buildRoutes = (parsed: ParsedOpenUIProgram): ExportRoute[] => {
  const usedPaths = new Set<string>()
  const usedNames = new Set<string>()
  // Only create routes for pages that have corresponding route labels.
  // The PageSwitch routes array defines the intended navigation structure;
  // extra pages beyond that are nested/child elements, not top-level routes.
  const routeCount = parsed.routes.length
  return parsed.pages.slice(0, routeCount).map((page, index) => {
    unwrapSingleObjectArgProps(page)
    const label = parsed.routes[index] ?? `Page ${index + 1}`
    if (!page.typeName || page.typeName === 'PageSwitch') {
      throw new Error(
        `React export cannot render route "${label}" because it does not resolve to a page component`,
      )
    }
    const baseName = `${toIdentifier(label)}Page`
    const componentName = usedNames.has(baseName)
      ? `${baseName}${index + 1}`
      : baseName
    usedNames.add(componentName)
    return {
      label,
      path: uniqueRoutePath(label, index, usedPaths),
      componentName,
      node: page,
      props: page.props as Record<string, unknown>,
    }
  })
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

// ─── JSON-LD extraction from the OpenUI element tree ───────────
//
// JSON-LD's purpose is to describe ENTITIES on the page (products, reviews,
// FAQ items, articles) — data that ISN'T already in the HTML <title> and
// <meta description>. We walk the parsed element tree and classify array
// props by their item SHAPE — no component name matching, no hardcoding.
// An array of objects with {name, price} → Products. {question, answer} →
// FAQ. {quote, rating} → Reviews. {title, author, date} → Articles.

const isStr = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0
const isObj = (v: unknown): v is Record<string, unknown> =>
  v !== null && typeof v === 'object' && !Array.isArray(v)

const str = (o: Record<string, unknown>, k: string): string | undefined =>
  isStr(o[k]) ? o[k] : undefined

const num = (o: Record<string, unknown>, k: string): number | undefined => {
  const v = o[k]
  return typeof v === 'number'
    ? v
    : isStr(v)
      ? Number(v) || undefined
      : undefined
}

const cleanPrice = (v: unknown): string | undefined => {
  if (!isStr(v)) return undefined
  const d = v.replace(/[^0-9.]/g, '')
  return d || undefined
}

/** Walk the element tree yielding all ElementNodes (depth-first). */
function* walkElements(node: ElementNode): Generator<ElementNode> {
  yield node
  for (const v of Object.values(node.props || {})) {
    if (isOpenUIElementNode(v)) {
      yield* walkElements(v)
    } else if (Array.isArray(v)) {
      for (const item of v)
        if (isOpenUIElementNode(item)) yield* walkElements(item)
    }
  }
}

/** Classify an array of objects by item shape → schema.org entity. */
type Entity =
  | { kind: 'Product'; data: Record<string, unknown> }
  | { kind: 'Review'; data: Record<string, unknown> }
  | { kind: 'Question'; question: string; answer: string }
  | { kind: 'Article'; data: Record<string, unknown> }

const classifyItem = (o: Record<string, unknown>): Entity | null => {
  // Product: has a name/title AND a price (or oldPrice)
  const pname = str(o, 'name') ?? str(o, 'title')
  const price = cleanPrice(o.price) ?? cleanPrice(o.oldPrice)
  if (pname && (price || 'price' in o || 'oldPrice' in o)) {
    return {
      kind: 'Product',
      data: {
        '@type': 'Product',
        name: pname,
        description:
          str(o, 'subtitle') ?? str(o, 'description') ?? str(o, 'body'),
        offers: price
          ? { '@type': 'Offer', price, priceCurrency: 'USD' }
          : undefined,
      },
    }
  }

  // Review: has a quote AND (rating or author name)
  const quote = str(o, 'quote') ?? str(o, 'reviewBody')
  const rating = num(o, 'rating')
  const author = str(o, 'name') ?? str(o, 'author')
  if (quote && (rating !== undefined || author)) {
    return {
      kind: 'Review',
      data: {
        '@type': 'Review',
        author: author ? { '@type': 'Person', name: author } : undefined,
        reviewBody: quote,
        reviewRating:
          rating !== undefined
            ? {
                '@type': 'Rating',
                ratingValue: String(rating),
                bestRating: '5',
              }
            : undefined,
      },
    }
  }

  // Question: has question AND answer
  const question = str(o, 'question')
  const answer = str(o, 'answer')
  if (question && answer) {
    return { kind: 'Question', question, answer }
  }

  // Article: has title/headline AND (author or date)
  const headline = str(o, 'title') ?? str(o, 'headline')
  const artAuthor = str(o, 'author')
  const date = str(o, 'date')
  if (headline && (artAuthor || date)) {
    return {
      kind: 'Article',
      data: {
        '@type': 'Article',
        headline,
        description: str(o, 'excerpt') ?? str(o, 'description'),
        author: artAuthor ? { '@type': 'Person', name: artAuthor } : undefined,
        datePublished: date,
      },
    }
  }

  return null
}

/**
 * Extract JSON-LD entries from the OpenUI element tree for a route.
 * Scans ALL array props on ALL elements, classifies items by shape.
 * Also checks scalar props for featured product signals (name+price).
 */
const extractJsonLdFromRoute = (
  routeNode: ElementNode,
  orgName: string,
): Record<string, unknown>[] => {
  const products: Record<string, unknown>[] = []
  const reviews: Record<string, unknown>[] = []
  const questions: Array<{ question: string; answer: string }> = []
  const articles: Record<string, unknown>[] = []

  for (const el of walkElements(routeNode)) {
    const props = el.props
    if (!isObj(props)) continue

    // Scan all array props — classify by item shape
    for (const [key, value] of Object.entries(props)) {
      if (!Array.isArray(value)) continue
      // Skip non-object arrays (strings, numbers)
      if (!value.every((v) => isObj(v))) continue
      // Skip nav/CTA arrays (items with only href/label)
      if (key === 'trust' || key === 'features' || key === 'benefits') continue

      for (const item of value) {
        const entity = classifyItem(item)
        if (!entity) continue
        if (entity.kind === 'Product') {
          if (orgName) entity.data.brand = { '@type': 'Brand', name: orgName }
          products.push(entity.data)
        } else if (entity.kind === 'Review') {
          reviews.push(entity.data)
        } else if (entity.kind === 'Question') {
          questions.push({ question: entity.question, answer: entity.answer })
        } else if (entity.kind === 'Article') {
          articles.push(entity.data)
        }
      }
    }

    // Also check scalar props for a single featured product (hero pattern)
    const featName = str(props, 'featuredProductName')
    const featPrice = cleanPrice(props.featuredProductPrice)
    if (featName && featPrice) {
      products.push({
        '@type': 'Product',
        name: featName,
        description: str(props, 'featuredProductSubtitle'),
        offers: { '@type': 'Offer', price: featPrice, priceCurrency: 'USD' },
        brand: orgName ? { '@type': 'Brand', name: orgName } : undefined,
      })
    }
  }

  // Assemble JSON-LD entries — only entities that actually exist on the page
  const entries: Record<string, unknown>[] = []

  if (products.length === 1) {
    entries.push({ '@context': 'https://schema.org', ...products[0] })
  } else if (products.length > 1) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: products.map((p, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: p,
      })),
    })
  }

  if (reviews.length > 0) {
    // Attach reviews to the first product entry (single Product or ItemList's first product)
    const firstEntry = entries[0]
    let productTarget: Record<string, unknown> | null = null
    if (firstEntry?.['@type'] === 'Product') {
      productTarget = firstEntry
    } else if (firstEntry?.['@type'] === 'ItemList') {
      const items = firstEntry.itemListElement as Array<Record<string, unknown>>
      if (items?.[0]?.item)
        productTarget = items[0].item as Record<string, unknown>
    }
    if (productTarget) {
      productTarget.review = reviews
      const rated = reviews.filter((r) => r.reviewRating)
      if (rated.length > 0) {
        const avg =
          rated.reduce(
            (s, r) =>
              s +
              Number(
                (r.reviewRating as Record<string, unknown>)?.ratingValue || 0,
              ),
            0,
          ) / rated.length
        productTarget.aggregateRating = {
          '@type': 'AggregateRating',
          ratingValue: String(avg),
          reviewCount: String(reviews.length),
        }
      }
    } else {
      for (const r of reviews)
        entries.push({ '@context': 'https://schema.org', ...r })
    }
  }

  if (questions.length > 0) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: questions.map((q) => ({
        '@type': 'Question',
        name: q.question,
        acceptedAnswer: { '@type': 'Answer', text: q.answer },
      })),
    })
  }

  if (articles.length === 1) {
    entries.push({ '@context': 'https://schema.org', ...articles[0] })
  } else if (articles.length > 1) {
    entries.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: articles.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: a,
      })),
    })
  }

  return entries
}

/**
 * Build a map of route path → JSON-LD entries by walking the actual
 * OpenUI element tree for each route page.
 */
export const buildRouteJsonLd = (
  routes: ExportRoute[],
  orgName: string,
): Map<string, Record<string, unknown>[]> => {
  const map = new Map<string, Record<string, unknown>[]>()
  for (const route of routes) {
    if (!route.node) continue
    const entries = extractJsonLdFromRoute(route.node, orgName)
    if (entries.length > 0) map.set(route.path, entries)
  }
  return map
}

/**
 * Extract products and restaurants from the route tree at export time.
 * Uses shape inference (same as classifyItem for JSON-LD): any array of
 * objects with name + price is a product collection. This replaces the
 * runtime `collectionItems()` walker that was in store.ts.
 */
const extractCollections = (
  routes: ExportRoute[],
): {
  products: Array<Record<string, unknown>>
  restaurants: Array<Record<string, unknown>>
} => {
  const products: Array<Record<string, unknown>> = []
  const restaurants: Array<Record<string, unknown>> = []
  const seenProductNames = new Set<string>()
  const seenRestaurantNames = new Set<string>()

  for (const route of routes) {
    if (!route.node) continue
    for (const el of walkElements(route.node)) {
      const props = el.props
      if (!isObj(props)) continue
      for (const [, value] of Object.entries(props)) {
        if (!Array.isArray(value) || !value.every((v) => isObj(v))) continue
        for (const item of value) {
          // Product shape: name + (price or oldPrice)
          const pname = str(item, 'name') ?? str(item, 'title')
          const hasPrice = 'price' in item || 'oldPrice' in item
          if (pname && hasPrice && !seenProductNames.has(pname)) {
            seenProductNames.add(pname)
            products.push(item)
            continue
          }
          // Restaurant shape: name + description (no price)
          const rname = str(item, 'name') ?? str(item, 'title')
          const hasDesc = str(item, 'description') ?? str(item, 'body')
          const hasCuisine = 'cuisine' in item || 'menu' in item
          if (
            rname &&
            (hasDesc || hasCuisine) &&
            !hasPrice &&
            !seenRestaurantNames.has(rname)
          ) {
            seenRestaurantNames.add(rname)
            restaurants.push(item)
          }
        }
      }
    }
  }

  // Fallback: if no products found but routes have commerce-like components,
  // use default commerce products (same logic as the old productsCollection())
  if (products.length === 0) {
    const hasCommerceRoute = routes.some((route) =>
      /commerce|ecommerce|shop|store|marketplace/i.test(
        String(route.componentName),
      ),
    )
    if (hasCommerceRoute) {
      products.push(
        {
          alt: 'Featured product on a clean studio background',
          badge: 'New',
          brand: 'Featured',
          image: '',
          name: 'Signature Series',
          oldPrice: '$230',
          price: '$195',
        },
        {
          alt: 'Lifestyle product photography on a neutral background',
          badge: '',
          brand: 'Featured',
          image: '',
          name: 'Everyday Essential',
          oldPrice: '',
          price: '$250',
        },
        {
          alt: 'Close-up product detail on a neutral background',
          badge: 'Sale',
          brand: 'Featured',
          image: '',
          name: 'Classic Edition',
          oldPrice: '$210',
          price: '$175',
        },
        {
          alt: 'Featured product on a clean studio background',
          badge: '',
          brand: 'Featured',
          image: '',
          name: 'Studio Collection',
          oldPrice: '',
          price: '$160',
        },
      )
    }
  }

  return { products, restaurants }
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
// argument (e.g. `ProductDetailHero({"title":"Aurora Pro"})`), the parser
// assigns that object to the first positional slot instead of spreading it
// as the props bag. Detect that mis-assignment — the sole prop slot expects a
// scalar but received a non-array object whose keys are all valid prop names
// of the component — and unwrap it so the object becomes the component props.
export const unwrapSingleObjectArgProps = (node: unknown): void => {
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
          wrappedKeys.length >= 1 &&
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

const collectRouteComponentNames = (routes: ExportRoute[]): string[] => [
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

  return `<${value.typeName} {...${JSON.stringify(props)}} />`
}

const renderRouteComponentSource = (
  route: ExportRoute,
  nestedComponentNames: string[],
): string => {
  const known = new Set(nestedComponentNames)
  const used = [...collectNodeComponentNames(route.node)].filter((name) =>
    known.has(name),
  )
  const imports = used
    .map((name) => `import { ${name} } from './${name}'`)
    .join('\n')
  return `${imports}

export type ${route.componentName}Props = Record<string, never>

export function ${route.componentName}(_props: ${route.componentName}Props) {
  return (
    <>
${renderRouteNode(route.node)}
    </>
  )
}
`
}

const dependencyVersions: Record<string, string> = {
  '@types/node': '^22.10.2',
  '@types/react': '^19.2.0',
  '@types/react-dom': '^19.2.0',
  '@tailwindcss/postcss': '^4.1.18',
  '@tailwindcss/vite': '^4.1.18',
  '@vitejs/plugin-react': '^6.0.1',
  postcss: '^8.5.6',
  vite: '^8.0.0',
  typescript: '^6.0.2',
  react: '^19.2.0',
  'react-dom': '^19.2.0',
  'react-router-dom': '^7.10.1',
  next: '^16.0.8',
  tailwindcss: '^4.1.18',
  'lucide-react': '^0.577.0',
  clsx: '^2.1.1',
  'tailwind-merge': '^3.5.0',
  '@radix-ui/react-slot': '^1.2.4',
  'class-variance-authority': '^0.7.1',
  'radix-ui': '^1.4.3',
  '@tanstack/react-query': '^5.90.19',
  '@shoojs/react': '^0.1.0',
  'framer-motion': '^12.40.0',
}

const toDependencyRecord = (names: Iterable<string>): Record<string, string> =>
  Object.fromEntries(
    [...names]
      .sort()
      .map((name) => [name, dependencyVersions[name] ?? 'latest']),
  )

const resolveDependencyVersions = (
  packages: Iterable<string>,
  target: 'react' | 'next',
): {
  dependencies: Record<string, string>
  devDependencies: Record<string, string>
} => {
  const names = new Set(packages)
  const devNames = new Set<string>([
    '@types/react',
    '@types/react-dom',
    'tailwindcss',
    'typescript',
  ])
  names.add('react')
  names.add('react-dom')
  names.add('clsx')
  names.add('tailwind-merge')
  if (target === 'react') {
    devNames.add('@vitejs/plugin-react')
    devNames.add('@tailwindcss/vite')
    devNames.add('vite')
    names.add('react-router-dom')
  } else {
    devNames.add('@tailwindcss/postcss')
    devNames.add('@types/node')
    devNames.add('postcss')
    names.add('next')
  }
  for (const name of devNames) names.delete(name)
  return {
    dependencies: toDependencyRecord(names),
    devDependencies: toDependencyRecord(devNames),
  }
}

const renderThemeCss = (input: OpenUIExportInput): string => {
  const siteSpec = parseSiteSpec(input.siteSpecJson)
  const themeName = readThemeName(siteSpec, input.themeName)
  const isDark = input.isDark ?? true
  const themeStyles =
    resolveThemeStyles(themeName) ?? resolveThemeStyles('modern-minimal')
  const themeStyle = buildThemeStyle(themeStyles, isDark)
  const tailwindThemeStyle = buildTailwindThemeStyle(themeStyles)

  return `@import "tailwindcss";

@theme {
  ${tailwindThemeStyle.replaceAll('; ', ';\n  ')}
}

:root {
  ${themeStyle.replaceAll('; ', ';\n  ')}
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
}
`
}

const renderLibCn = (): string => `import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
`

const renderImageHelper = (imageSources: ImageSource[]): string => {
  return `import type { ImgHTMLAttributes } from 'react'

const previewImageSources: Array<{ alt: string; src: string }> = ${JSON.stringify(imageSources, null, 2)}
const previewImageSourceByAlt = new Map(previewImageSources.map((image) => [image.alt, image.src]))

function normalizeAlt(alt: unknown): string {
  if (typeof alt === 'string') return alt.trim() || 'image'
  if (typeof alt === 'number' || typeof alt === 'boolean' || typeof alt === 'bigint') return String(alt)
  if (alt && typeof alt === 'object') {
    for (const key of ['alt', 'label', 'title', 'name', 'description']) {
      const value = (alt as Record<string, unknown>)[key]
      if (typeof value === 'string' && value.trim().length > 0) return value.trim()
    }
  }
  return 'image'
}

function slugify(alt: unknown): string {
  return normalizeAlt(alt)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'image'
}

function fallbackImageUrl(alt: unknown, w: number, h: number): string {
  return \`https://picsum.photos/seed/\${slugify(alt)}/\${w}/\${h}\`
}

export function Image({
  alt,
  src,
  w = 800,
  h = 600,
  className,
  loading,
  ...rest
}: {
  alt?: unknown
  src?: string
  w?: number
  h?: number
} & Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt' | 'width' | 'height'>) {
  const normalizedAlt = normalizeAlt(alt)
  const previewSrc = previewImageSourceByAlt.get(normalizedAlt)
  const imageSrc = previewSrc || (typeof src === 'string' && src.trim()
    ? src
    : fallbackImageUrl(normalizedAlt, w, h))

  return (
    <img
      src={imageSrc}
      alt={normalizedAlt}
      width={w}
      height={h}
      className={className}
      loading={loading}
      {...rest}
    />
  )
}
`
}

const renderStyleOverridesCss = (styleOverrides: StyleOverride[]): string => {
  if (styleOverrides.length === 0) return ''
  const rules = styleOverrides
    .map((override) => {
      // Use attribute selector for exact class match (same as runtime behavior)
      const selector = `[class="${override.classAnchor}"]`
      const declarations = override.style
        .split(';')
        .map((d) => {
          const colon = d.indexOf(':')
          if (colon === -1) return ''
          const prop = d.slice(0, colon).trim()
          const val = d.slice(colon + 1).trim()
          return prop ? `  ${prop}: ${val};` : ''
        })
        .filter(Boolean)
        .join('\n')
      return declarations ? `${selector} {\n${declarations}\n}` : ''
    })
    .filter(Boolean)
    .join('\n\n')
  return rules
    ? `/* Style overrides extracted at export time */\n${rules}\n`
    : ''
}

const endpointRouteFilePath = (path: string): string => {
  const cleaned = path.split(/[?#]/)[0]?.trim() || '/'
  const segments = cleaned
    .split('/')
    .filter(Boolean)
    .map((segment) => {
      if (segment.startsWith(':')) {
        const name = segment
          .slice(1)
          .replace(/[^A-Za-z0-9_$-]+/g, '-')
          .replace(/^-+|-+$/g, '')
        return `[${name || 'param'}]`
      }
      if (segment === '*') return '[...path]'
      return (
        segment.replace(/[^A-Za-z0-9_$.-]+/g, '-').replace(/^-+|-+$/g, '') ||
        'endpoint'
      )
    })
  return `app/${segments.length > 0 ? segments.join('/') : 'api'}/route.ts`
}

const endpointConstName = (
  endpointDefinition: LakebedEndpointDefinition,
  index: number,
) =>
  `${toIdentifier(endpointDefinition.componentName)}${toIdentifier(
    endpointDefinition.name,
  )}Endpoint${index + 1}`

export const renderNextEndpointRouteFiles = (
  endpoints: LakebedEndpointDefinition[],
): Record<string, string> => {
  const byRoute = new Map<string, LakebedEndpointDefinition[]>()
  for (const endpointDefinition of endpoints) {
    const routePath = endpointRouteFilePath(endpointDefinition.path)
    byRoute.set(routePath, [
      ...(byRoute.get(routePath) ?? []),
      endpointDefinition,
    ])
  }

  return Object.fromEntries(
    [...byRoute.entries()].map(([routePath, routeEndpoints]) => {
      const importPath = relativeImportPath(routePath, 'src/lib/store.ts')
      const declarations = routeEndpoints
        .map(
          (endpointDefinition, index) =>
            `const ${endpointConstName(endpointDefinition, index)} = ${endpointDefinition.source}`,
        )
        .join('\n\n')
      const handlers = routeEndpoints
        .map((endpointDefinition, index) => {
          const method = endpointDefinition.method.toUpperCase()
          return `export async function ${method}(request: Request) {
  return runEndpoint(${endpointConstName(endpointDefinition, index)}, request)
}`
        })
        .join('\n\n')
      return [
        routePath,
        `import {
  createSiteEndpointContext,
  empty,
  endpoint,
  json,
  redirect,
  text,
  toEndpointRequest,
  toEndpointResponse,
} from '${importPath}'

${declarations}

async function runEndpoint(
  endpointDefinition: {
    handler: (ctx: ReturnType<typeof createSiteEndpointContext>, request: ReturnType<typeof toEndpointRequest>) => unknown | Promise<unknown>
  },
  request: Request,
) {
  const result = await endpointDefinition.handler(
    createSiteEndpointContext(),
    toEndpointRequest(request),
  )
  return toEndpointResponse(result)
}

${handlers}
`,
      ]
    }),
  )
}

/** Enrich siteSpecJson with projectName so SEO resolvers can use it as fallback title. */
export const enrichSiteSpecJson = (
  siteSpecJson: string | undefined,
  projectName: string,
): string | undefined => {
  if (!siteSpecJson) {
    return JSON.stringify({ projectName })
  }
  try {
    const parsed = JSON.parse(siteSpecJson) as Record<string, unknown>
    if (parsed.projectName === undefined) {
      parsed.projectName = projectName
      return JSON.stringify(parsed)
    }
    return siteSpecJson
  } catch {
    return JSON.stringify({ projectName })
  }
}

/** Extract siteUrl and orgName from siteSpecJson for JSON-LD entity extraction. */
const extractSiteMeta = (
  siteSpecJson: string | undefined,
): { siteUrl: string; orgName: string } => {
  try {
    if (!siteSpecJson) return { siteUrl: '', orgName: '' }
    const spec = JSON.parse(siteSpecJson) as Record<string, unknown>
    const seo = (
      spec.seo && typeof spec.seo === 'object' ? spec.seo : {}
    ) as Record<string, unknown>
    return {
      siteUrl: String(seo.siteUrl || ''),
      orgName: String(spec.projectName || seo.siteName || ''),
    }
  } catch {
    return { siteUrl: '', orgName: '' }
  }
}

export function parseOpenUIForExport(
  source: string,
  siteSpecJson?: string,
): ParsedOpenUIProgram {
  const cleaned = preprocessOpenUIResponse(source, { resolveRefs: false })
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
  // calls (e.g. `StateButton("Toggle Drama", "drama", "toggle", undefined, undefined, false, "default")`)
  // use literal `undefined` to skip optional slots, so filter it out.
  const unresolved = result.meta.unresolved.filter(
    (name) => name !== 'undefined',
  )
  if (unresolved.length > 0) {
    throw new Error(
      `OpenUI source has unresolved references: ${unresolved.join(', ')}`,
    )
  }
  // AI capsule components (AICustom_ prefix) are generated by section edits
  // and stored in the Convex sessionAiCapsules table at runtime. The export
  // parser doesn't have access to the capsule definitions, but the parsed
  // tree still contains element nodes for them (the parser materializes
  // unknown components as pass-through nodes). Skip the unknown-component
  // validation for AICustom_ prefixed names so export parsing doesn't crash.
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

  // Truncate pages to match routes length — extra pages are nested/child
  // elements that should not become top-level routes (prevents page-N routes)
  const alignedPages = pages.slice(0, routes.length)

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: alignedPages.length > 0 ? alignedPages : [result.root],
    targetMap,
    projectName: readProjectName(siteSpec, routes[0] ?? 'Generated Site'),
  }
}

const renderReactPackageJson = (
  projectName: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): string =>
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
      dependencies,
      devDependencies,
    },
    null,
    2,
  )

const renderNextPackageJson = (
  projectName: string,
  dependencies: Record<string, string>,
  devDependencies: Record<string, string>,
): string =>
  JSON.stringify(
    {
      name: toProjectSlug(projectName),
      private: true,
      version: '0.0.0',
      packageManager: 'bun@1.2.5',
      scripts: {
        dev: 'next dev',
        build: 'NODE_ENV=production next build',
        start: 'next start',
      },
      dependencies,
      devDependencies,
    },
    null,
    2,
  )

const renderViteConfig =
  (): string => `import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
`

const renderNextPostcssConfig = (): string => `const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}

export default config
`

const renderReadme = (
  projectName: string,
  target: 'react' | 'next',
): string => {
  const commands =
    target === 'react'
      ? ['bun install', 'bun dev', 'bun run build', 'bun run preview']
      : ['bun install', 'bun dev', 'bun run build', 'bun run start']

  return `# ${projectName}

Generated with [ShipFast](https://ship-fast.io) 🚀.

## Run locally

\`\`\`bash
${commands.join('\n')}
\`\`\`
`
}

const renderTsConfig = (
  jsx: 'react-jsx' | 'preserve' = 'react-jsx',
): string => {
  const include =
    jsx === 'preserve'
      ? [
          'next-env.d.ts',
          'src/**/*.ts',
          'src/**/*.tsx',
          'app/**/*.ts',
          'app/**/*.tsx',
          '.next/types/**/*.ts',
        ]
      : ['src']
  return JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2020',
        useDefineForClassFields: true,
        lib: ['DOM', 'DOM.Iterable', 'ES2020'],
        allowJs: false,
        skipLibCheck: true,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        strict: true,
        noImplicitAny: false,
        forceConsistentCasingInFileNames: true,
        module: 'ESNext',
        moduleResolution: 'Bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        noEmit: true,
        jsx,
      },
      include,
      references: [],
    },
    null,
    2,
  )
}

const renderNextEnv = (): string => `/// <reference types="next" />
/// <reference types="next/image-types/global" />

// This file is generated by Next.js conventions for TypeScript projects.
`

const renderViteEnv = (): string => `/// <reference types="vite/client" />
`

const renderRouteData = (
  routes: ExportRoute[],
  componentNames: string[],
): string => {
  const serializedRoutes = routes.map((route) => ({
    label: route.label,
    path: route.path,
    component: route.componentName,
    props: route.props,
  }))
  const typeImports = componentNames
    .map((name) => `import type { ${name}Props } from '../components/${name}'`)
    .join('\n')
  const propsUnion =
    componentNames.map((name) => `${name}Props`).join(' | ') ||
    'Record<string, never>'
  return `${typeImports}

export type PageProps = ${propsUnion}

export type SiteRoute = {
  label: string
  path: string
  component: ${componentNames.map((name) => JSON.stringify(name)).join(' | ') || 'never'}
  props: Record<string, unknown>
}

export const routes = ${JSON.stringify(serializedRoutes, null, 2)} satisfies SiteRoute[]
`
}

/**
 * Generate a simplified Logo.tsx at export time with the brand logo
 * src hardcoded. No runtime DOM manipulation, no MutationObserver,
 * no context provider — just a pure component that renders the logo.
 */
const renderExportLogoComponent = (input: OpenUIExportInput): string => {
  const selection = input.selectedBrandLogo
  const icon = typeof selection?.icon === 'string' ? selection.icon.trim() : ''
  const logo = typeof selection?.logo === 'string' ? selection.logo.trim() : ''
  const src = icon || logo || ''
  const brandName = selection?.name ?? ''
  return `import type { ReactNode } from 'react'
import { cn } from '../lib/cn'

const brandLogoSrc = ${JSON.stringify(src)}
const brandName = ${JSON.stringify(brandName)}

export function Logo({
  fallback,
  className,
  imageClassName,
  labelClassName,
  showLabel = true,
  brand = brandName,
}: {
  brand?: string
  fallback?: ReactNode
  className?: string
  imageClassName?: string
  labelClassName?: string
  showLabel?: boolean
}) {
  return (
    <>
      {brandLogoSrc ? (
        <span
          aria-hidden="true"
          className={cn(
            'inline-grid size-8 shrink-0 place-items-center overflow-hidden rounded-md bg-transparent',
            className,
          )}
          data-brand-logo-selected="true"
        >
          <img
            alt=""
            className={cn('block size-full object-contain', imageClassName)}
            draggable={false}
            src={brandLogoSrc}
          />
        </span>
      ) : (
        fallback
      )}
      {showLabel ? <span className={labelClassName}>{brand}</span> : null}
    </>
  )
}
`
}

const renderReactApp = (
  componentNames: string[],
  _input: OpenUIExportInput,
): string => {
  const imports = componentNames
    .map((name) => `import { ${name} } from './components/${name}'`)
    .join('\n')
  const mapEntries = componentNames.map((name) => `  ${name},`).join('\n')
  const appTree = `<BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<RoutePage route={route} />} />
        ))}
        <Route path="*" element={<Navigate to={routes[0]?.path ?? '/'} replace />} />
      </Routes>
    </BrowserRouter>`
  return `import type { ComponentType } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routes } from './data/pages'
${imports}

const components = {
${mapEntries}
}

function RoutePage({ route }: { route: (typeof routes)[number] }) {
  const Page = components[route.component] as ComponentType<any>
  return <Page {...route.props} />
}

export default function App() {
  return (
    ${appTree}
  )
}`
}

const renderReactMain = (usesLakebed: boolean, usesAuth: boolean): string => {
  const providerImports = usesLakebed
    ? `import { QueryProvider } from './lib/query-provider'\n${usesAuth ? `import { AuthProvider } from './lib/auth'\n` : ''}`
    : ''
  const app = usesLakebed
    ? `<QueryProvider>\n      ${usesAuth ? '<AuthProvider>\n        ' : ''}<App />${usesAuth ? '\n      </AuthProvider>' : ''}\n    </QueryProvider>`
    : '<App />'

  return `import React from 'react'
import { createRoot } from 'react-dom/client'
${providerImports}import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    ${app}
  </React.StrictMode>,
)
`
}

const renderNextRoutePage = (
  componentName: string,
  componentImportPath: string,
  routeSeo: ExportRouteSeo | null,
): string => {
  const metadataExport = routeSeo
    ? `${renderNextMetadataExport(routeSeo)}\n\n`
    : ''
  const viewportExport = routeSeo
    ? `${renderNextViewportExport(routeSeo)}\n\n`
    : ''
  const jsonLdBlock = routeSeo ? renderJsonLdScript(routeSeo) : ''
  // jsonLdBlock contains a module-level `const jsonLd = {...}` declaration
  // plus a `<script>` JSX element. Split them: declaration goes before the
  // component, script goes inside the JSX.
  let jsonLdDecl = ''
  let jsonLdJsx = ''
  if (jsonLdBlock) {
    const scriptIdx = jsonLdBlock.indexOf('<script')
    if (scriptIdx >= 0) {
      jsonLdDecl = `${jsonLdBlock.slice(0, scriptIdx).trim()}\n\n`
      jsonLdJsx = `\n      ${jsonLdBlock.slice(scriptIdx).trim()}`
    } else {
      jsonLdJsx = `\n      ${jsonLdBlock}`
    }
  }
  return `import { ${componentName} } from '${componentImportPath}'

${jsonLdDecl}${metadataExport}${viewportExport}export default function Page() {
  return (
    <>
      <${componentName} />${jsonLdJsx}
    </>
  )
}`
}

const asClientComponent = (source: string): string => `'use client'

${source}`

const zipFiles = (files: Record<string, string>): Uint8Array => {
  assertNoOpenUIInternals(files)
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
    { level: 9 },
  )
}

const zipRawFiles = (files: Record<string, string>): Uint8Array =>
  zipSync(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [name, strToU8(content)]),
    ),
    { level: 9 },
  )

const collectExportComponents = (
  routes: ExportRoute[],
  stack: ExportStack,
  routeTargets: Record<string, string>,
  dataKeys: DataKeys,
): ExtractedComponent[] => {
  const names = collectRouteComponentNames(routes)
  return names.map((name) =>
    extractComponent(name, stack, routeTargets, dataKeys),
  )
}

const collectLakebedEndpoints = (
  componentNames: string[],
): LakebedEndpointDefinition[] =>
  componentNames.flatMap((name) => {
    const entry = getComponentSourceIndex().get(name)
    return entry ? readLakebedEndpointDefinitions(name, entry) : []
  })

const collectNextEndpoints = (
  componentNames: string[],
  source: string,
): LakebedEndpointDefinition[] => [
  ...collectLakebedEndpoints(componentNames),
  ...readSourceEndpointDefinitions(source),
]

const buildReactExport = async (
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): Promise<BuiltExport> => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes, parsed.targetMap)
  const dataKeys = createDataKeys()
  const components = collectExportComponents(
    routes,
    'react',
    routeTargets,
    dataKeys,
  )
  const nestedComponentNames = components.map((component) => component.name)
  const routeComponents = routes.map((route) => ({
    name: route.componentName,
    source: renderRouteComponentSource(route, nestedComponentNames),
  }))
  const blockSources = collectBlockSourceFiles(
    [...components.flatMap((component) => [...component.blockSources])],
    'react',
    dataKeys,
    routeTargets,
  )
  const { dependencies, devDependencies } = resolveDependencyVersions(
    [
      ...components.flatMap((component) => [...component.dependencies]),
      ...blockSources.dependencies,
    ],
    'react',
  )
  const routeComponentNames = routeComponents.map((component) => component.name)
  const usesLakebed = components.some((component) => component.usesLakebed)
  const imageSources = await extractImageSources(input.previewHtml)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  if (usesLakebed) {
    dependencies['@tanstack/react-query'] =
      dependencyVersions['@tanstack/react-query']
  }
  const enrichedSpec = enrichSiteSpecJson(
    input.siteSpecJson,
    parsed.projectName,
  )
  const { orgName } = extractSiteMeta(enrichedSpec)
  const routeJsonLd = buildRouteJsonLd(routes, orgName)
  const seoBundle = buildExportSeoBundle(
    enrichedSpec,
    routes.map((r) => ({ path: r.path, label: r.label })),
    {},
    routeJsonLd,
  )
  const homeHeadTags = seoBundle?.homeSeo?.headTags ?? []
  const htmlLang = seoBundle?.homeSeo?.seo.htmlLang ?? 'en'
  const indexHtml =
    homeHeadTags.length > 0
      ? `<!doctype html><html lang="${htmlLang}"><head>${homeHeadTags.join('\n')}</head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n`
      : '<!doctype html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Ship Fast Export</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n'
  const files: Record<string, string> = {
    'package.json': renderReactPackageJson(
      parsed.projectName,
      dependencies,
      devDependencies,
    ),
    'index.html': indexHtml,
    'tsconfig.json': renderTsConfig(),
    'src/vite-env.d.ts': renderViteEnv(),
    'vite.config.ts': renderViteConfig(),
    'src/main.tsx': renderReactMain(usesLakebed, dataKeys.usesAuth),
    'src/App.tsx': renderReactApp(routeComponentNames, input),
    'src/data/pages.ts': renderRouteData(routes, routeComponentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper(imageSources),
    'src/styles.css':
      renderThemeCss(input) + renderStyleOverridesCss(styleOverrides),
    'README.md': renderReadme(parsed.projectName, 'react'),
  }
  if (usesLakebed) {
    files['src/lib/store.ts'] = renderReactStore(
      dataKeys,
      extractCollections(routes),
    )
    files['src/lib/use-keyed-mutation.ts'] = renderKeyedMutationHook()
    files['src/lib/query-provider.tsx'] = renderQueryClientProvider()
    if (dataKeys.usesAuth) {
      files['src/lib/auth.tsx'] = renderShooAuthProvider()
    }
  }

  for (const component of routeComponents) {
    files[`src/components/${component.name}.tsx`] = component.source
  }
  for (const component of components) {
    files[`src/components/${component.name}.tsx`] = component.source
  }
  Object.assign(files, blockSources.files)
  if (files['src/section-kit/Logo.tsx']) {
    files['src/section-kit/Logo.tsx'] = renderExportLogoComponent(input)
  }

  if (seoBundle) {
    files['public/robots.txt'] = seoBundle.robotsTxt
    if (seoBundle.sitemapXml) files['public/sitemap.xml'] = seoBundle.sitemapXml
    if (seoBundle.llmsTxt) files['public/llms.txt'] = seoBundle.llmsTxt
  }

  const formattedFiles = await formatExportFiles(files)
  return {
    body: zipFiles(formattedFiles),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-react.zip`,
    fileCount: Object.keys(formattedFiles).length,
  }
}

const buildNextExport = async (
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): Promise<BuiltExport> => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes, parsed.targetMap)
  const dataKeys = createDataKeys()
  const components = collectExportComponents(
    routes,
    'next',
    routeTargets,
    dataKeys,
  )
  const nestedComponentNames = components.map((component) => component.name)
  const routeComponents = routes.map((route) => ({
    name: route.componentName,
    source: renderRouteComponentSource(route, nestedComponentNames),
  }))
  const routeComponentNames = routeComponents.map((component) => component.name)
  const blockSources = collectBlockSourceFiles(
    [...components.flatMap((component) => [...component.blockSources])],
    'next',
    dataKeys,
    routeTargets,
  )
  const { dependencies, devDependencies } = resolveDependencyVersions(
    [
      ...components.flatMap((component) => [...component.dependencies]),
      ...blockSources.dependencies,
    ],
    'next',
  )
  const usesLakebed = components.some((component) => component.usesLakebed)
  const endpoints = collectNextEndpoints(nestedComponentNames, input.source)
  const imageSources = await extractImageSources(input.previewHtml)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  if (usesLakebed) {
    dependencies['@tanstack/react-query'] =
      dependencyVersions['@tanstack/react-query']
  }
  const layoutImport = `${usesLakebed ? "import { QueryProvider } from '../src/lib/query-provider'\n" : ''}${usesLakebed && dataKeys.usesAuth ? "import { AuthProvider } from '../src/lib/auth'\n" : ''}`
  const layoutChildren = `${usesLakebed ? `<QueryProvider>${dataKeys.usesAuth ? '<AuthProvider>' : ''}{children}${dataKeys.usesAuth ? '</AuthProvider>' : ''}</QueryProvider>` : '{children}'}`
  const nextEnrichedSpec = enrichSiteSpecJson(
    input.siteSpecJson,
    parsed.projectName,
  )
  const { orgName: nextOrgName } = extractSiteMeta(nextEnrichedSpec)
  const nextRouteJsonLd = buildRouteJsonLd(routes, nextOrgName)
  const seoBundle = buildExportSeoBundle(
    nextEnrichedSpec,
    routes.map((r) => ({ path: r.path, label: r.label })),
    {},
    nextRouteJsonLd,
  )
  const layoutMetadata = seoBundle?.homeSeo
    ? renderNextMetadataExport(seoBundle.homeSeo)
    : `export const metadata = { title: ${JSON.stringify(parsed.projectName)} }`
  const layoutViewport = seoBundle?.homeSeo
    ? renderNextViewportExport(seoBundle.homeSeo)
    : ''
  const files: Record<string, string> = {
    'package.json': renderNextPackageJson(
      parsed.projectName,
      dependencies,
      devDependencies,
    ),
    'postcss.config.mjs': renderNextPostcssConfig(),
    'next.config.mjs':
      'import { dirname } from "node:path"\nimport { fileURLToPath } from "node:url"\n\nconst projectRoot = dirname(fileURLToPath(import.meta.url))\n\n/** @type {import("next").NextConfig} */\nconst nextConfig = {\n  images: {\n    remotePatterns: [\n      { protocol: "https", hostname: "images.pexels.com" },\n      { protocol: "https", hostname: "picsum.photos" },\n      { protocol: "https", hostname: "images.unsplash.com" },\n    ],\n  },\n  turbopack: {\n    root: projectRoot,\n  },\n}\n\nexport default nextConfig\n',
    'next-env.d.ts': renderNextEnv(),
    'tsconfig.json': renderTsConfig('preserve'),
    'app/layout.tsx': `import type { PropsWithChildren } from 'react'
${layoutImport}import './globals.css'

${layoutMetadata}
${layoutViewport ? `${layoutViewport}\n\n` : ''}
export default function RootLayout({ children }: PropsWithChildren) {
  return <html lang="${seoBundle?.homeSeo?.seo.htmlLang ?? 'en'}"><body>${layoutChildren}</body></html>
}
`,
    'app/globals.css':
      renderThemeCss(input) + renderStyleOverridesCss(styleOverrides),
    'src/data/pages.ts': renderRouteData(routes, routeComponentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper(imageSources),
    'README.md': renderReadme(parsed.projectName, 'next'),
  }
  if (usesLakebed) {
    files['src/lib/store.ts'] = renderNextStore(
      dataKeys,
      extractCollections(routes),
    )
    files['src/lib/query-provider.tsx'] = renderQueryClientProvider()
    files['src/lib/use-keyed-mutation.ts'] = renderKeyedMutationHook()
    files['app/actions/server-actions.ts'] = renderNextServerActions(dataKeys)
    if (dataKeys.usesAuth) {
      files['src/lib/auth.tsx'] = renderShooAuthProvider()
      files['app/auth/callback/page.tsx'] = renderShooCallbackRoute()
    }
  }
  if (endpoints.length > 0) {
    // Endpoint route files import from store.ts which is generated above
    if (!usesLakebed) {
      files['src/lib/store.ts'] = renderNextStore(
        dataKeys,
        extractCollections(routes),
      )
    }
  }
  Object.assign(files, renderNextEndpointRouteFiles(endpoints))

  // Emit route wrapper components (client) + nested block components.
  for (const component of routeComponents) {
    files[`src/components/${component.name}.tsx`] = asClientComponent(
      component.source,
    )
  }
  for (const component of components) {
    files[`src/components/${component.name}.tsx`] = asClientComponent(
      component.source,
    )
  }
  Object.assign(files, blockSources.files)
  if (files['src/section-kit/Logo.tsx']) {
    files['src/section-kit/Logo.tsx'] = renderExportLogoComponent(input)
  }

  for (const route of routes) {
    const routeSeo = seoBundle?.routes.get(route.path) ?? null
    if (route.path === '/') {
      files['app/page.tsx'] = renderNextRoutePage(
        route.componentName,
        '../src/components/' + route.componentName,
        routeSeo,
      )
    } else {
      const dir = route.path.slice(1)
      files[`app/${dir}/page.tsx`] = renderNextRoutePage(
        route.componentName,
        '../../src/components/' + route.componentName,
        routeSeo,
      )
    }
  }

  if (seoBundle) {
    files['app/robots.ts'] = renderNextRobotsRoute(seoBundle.robotsTxt)
    const sitemapRoute = renderNextSitemapRoute(seoBundle.sitemapXml)
    if (sitemapRoute) files['app/sitemap.ts'] = sitemapRoute
    if (seoBundle.llmsTxt) files['public/llms.txt'] = seoBundle.llmsTxt
    files['public/robots.txt'] = seoBundle.robotsTxt
    if (seoBundle.sitemapXml) files['public/sitemap.xml'] = seoBundle.sitemapXml
  }

  const formattedFiles = await formatExportFiles(files)
  return {
    body: zipFiles(formattedFiles),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-next.zip`,
    fileCount: Object.keys(formattedFiles).length,
  }
}

const buildRawHtmlExport = (input: OpenUIExportInput): BuiltExport => {
  const html = input.source.trim()
  const spec = parseSiteSpec(input.siteSpecJson)
  const projectName =
    typeof spec.projectName === 'string' && spec.projectName.trim()
      ? spec.projectName.trim()
      : (readHtmlTitle(html) ?? 'Ship Fast Site')

  if (input.target === 'html') {
    return {
      body: html,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  const slug = toProjectSlug(projectName)
  const files = {
    'README.md': `# ${projectName}

This export contains a static single-file HTML website from Ship Fast v2.

Generated with [ShipFast](https://ship-fast.io) 🚀.

Open index.html directly, or serve this folder with any static host.
`,
    'index.html': html,
    'package.json': JSON.stringify(
      {
        name: slug,
        private: true,
        scripts: {
          dev: 'vite --host 0.0.0.0',
          build: 'vite build',
          preview: 'vite preview',
        },
        dependencies: {
          '@vitejs/plugin-react': '^6.0.1',
          vite: '^8.0.0',
        },
        devDependencies: {},
      },
      null,
      2,
    ),
  }

  return {
    body: zipRawFiles(files),
    contentType: 'application/zip',
    filename: `${slug}-${input.target}.zip`,
    fileCount: Object.keys(files).length,
  }
}

export async function buildOpenUIExport(
  input: OpenUIExportInput,
): Promise<BuiltExport> {
  if (input.target === 'html') {
    const { buildOpenUIHtmlExport } =
      await import('./openui-html-export-builder')
    return buildOpenUIHtmlExport(input)
  }

  if (isHtmlLikeSource(input.source)) {
    return buildRawHtmlExport(input)
  }

  const parsed = parseOpenUIForExport(input.source, input.siteSpecJson)

  return input.target === 'react'
    ? await buildReactExport(input, parsed)
    : await buildNextExport(input, parsed)
}

export const decodeExportBody = (body: string | Uint8Array): string =>
  typeof body === 'string' ? body : textDecoder.decode(body)
