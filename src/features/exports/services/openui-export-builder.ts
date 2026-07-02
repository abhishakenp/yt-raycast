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

type ParsedOpenUIProgram = {
  root: ElementNode
  routes: string[]
  pages: ElementNode[]
  targetMap: Record<string, string>
  projectName: string
}

type ExportRoute = {
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
  'dangerouslySetInnerHTML',
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

const normalizePreviewImageSource = (src: string): string => {
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
      byAlt.set(alt, normalizePreviewImageSource(src))
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
      imports.push(
        rewriteImportModule(
          statement,
          sourceFile,
          moduleName,
          relativeImportPath(generatedFilePath, 'src/lib/site-data.ts'),
        ),
      )
      continue
    }

    if (importClause?.isTypeOnly) continue

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

const lakebedDataImport = `import {
  applySiteMutation,
  defaultSiteQueryValue,
  guestAuth,
  invalidateSiteQueries,
  readSiteAuth,
  readSiteData,
  readSiteDataSnapshot,
  runSiteMutation,
  signInWithGoogle,
  signOut,
  siteAuthQueryKey,
  siteMutationKey,
  siteQueryKey,
  updateSiteQueries,
  useLakebedAdapter,
} from '../lib/site-data'`

const renderTranslatedQuery = (
  variableName: string,
  queryName: string,
  fallback?: string,
) => {
  const defaultValue = fallback
    ? `(${fallback.trim()}) as any`
    : `defaultSiteQueryValue(${queryName}) as any`
  return `const { data: ${variableName} = ${defaultValue} } = useQuery({
    queryKey: siteQueryKey(${queryName}),
    queryFn: () => readSiteData(${queryName}),
    initialData: () => readSiteDataSnapshot(${queryName}),
    staleTime: Infinity,
    gcTime: Infinity,
  });`
}

const renderTranslatedMutation = (variableName: string, mutationName: string) =>
  `const ${variableName}Mutation = useMutation({
    mutationKey: siteMutationKey(${mutationName}),
    mutationFn: (args: unknown[]) => runSiteMutation(${mutationName}, args),
    onSuccess: () => invalidateSiteQueries(queryClient, ${mutationName}),
  });
  const ${variableName} = Object.assign(async (...args: any[]) => {
    const result = applySiteMutation(${mutationName}, args);
    updateSiteQueries(queryClient, ${mutationName});
    await ${variableName}Mutation.mutateAsync(args);
    return result;
  }, {
    get isPending() {
      return ${variableName}Mutation.isPending;
    },
    get lastError() {
      return ${variableName}Mutation.error ?? null;
    },
    get pendingCount() {
      return ${variableName}Mutation.isPending ? 1 : 0;
    },
    reset() {
      ${variableName}Mutation.reset();
    },
  });`

const translateLakebedRuntimeCalls = (body: string) => {
  let usesQuery = false
  let usesMutation = false
  let usesAuth = false
  const usesSignIn = /\blakebed\.signInWithGoogle\(\)/.test(body)
  const usesSignOut = /\blakebed\.signOut\(\)/.test(body)

  let nextBody = body.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useQuery\(([^;\n]+)\)(\s*\?\?\s*[^;\n]+)?;?/g,
    (_match, variableName: string, queryName: string, fallback?: string) => {
      usesQuery = true
      return renderTranslatedQuery(
        variableName,
        queryName.trim(),
        fallback?.replace(/^\s*\?\?\s*/, ''),
      )
    },
  )

  nextBody = nextBody.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useMutation\(([^;\n]+)\);?/g,
    (_match, variableName: string, mutationName: string) => {
      usesMutation = true
      return renderTranslatedMutation(variableName, mutationName.trim())
    },
  )

  nextBody = nextBody.replace(
    /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*lakebed\.useAuth\(\);?/g,
    (_match, variableName: string) => {
      usesAuth = true
      return `const { data: ${variableName} = guestAuth } = useQuery({
    queryKey: siteAuthQueryKey,
    queryFn: readSiteAuth,
    initialData: guestAuth,
    staleTime: Infinity,
    gcTime: Infinity,
  });`
    },
  )

  nextBody = nextBody
    .replace(
      /\blakebed\.signInWithGoogle\(\)/g,
      'signInWithGoogleMutation.mutateAsync()',
    )
    .replace(/\blakebed\.signOut\(\)/g, 'signOutMutation.mutate()')

  const authMutationPrelude =
    usesSignIn || usesSignOut
      ? `${
          usesSignIn
            ? `const signInWithGoogleMutation = useMutation({
    mutationKey: ['site-auth', 'sign-in'],
    mutationFn: signInWithGoogle,
    onSuccess: (auth) => queryClient.setQueryData(siteAuthQueryKey, auth),
  });`
            : ''
        }
  ${
    usesSignOut
      ? `const signOutMutation = useMutation({
    mutationKey: ['site-auth', 'sign-out'],
    mutationFn: signOut,
    onSuccess: (auth) => queryClient.setQueryData(siteAuthQueryKey, auth),
  });`
      : ''
  }`
      : ''

  if (authMutationPrelude) {
    nextBody = `${authMutationPrelude}\n${nextBody}`
  }

  return {
    body: nextBody,
    needsQueryClient: usesMutation || usesSignIn || usesSignOut,
    usesAuth,
    usesMutation,
    usesQuery,
  }
}

const sourceUsesLakebedRuntime = (source: string): boolean =>
  /\blakebed\b/.test(source) ||
  /@ship-fast\/lakebed\/(?:react|server)/.test(source)

const extractComponent = (
  componentName: string,
  stack: ExportStack,
  routeTargets: Record<string, string>,
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
    ? translateLakebedRuntimeCalls(functionBody)
    : {
        body: functionBody,
        needsQueryClient: false,
        usesAuth: false,
        usesMutation: false,
        usesQuery: false,
      }
  const needsLakebedAdapter =
    usesLakebed && /\blakebed\b/.test(translatedLakebed.body)
  const translatedBody = needsLakebedAdapter
    ? `const lakebed = useLakebedAdapter()\n${translatedLakebed.body}`
    : translatedLakebed.body
  const rewrittenNavigation = rewriteNavigationCalls(
    translatedBody,
    stack,
    routeTargets,
  )
  const routePaths = rewrittenNavigation.usesNavigation
    ? `\nconst routePaths: Record<string, string> = ${JSON.stringify(routeTargets, null, 2)}\n`
    : ''
  const queryHookImport =
    usesLakebed &&
    (translatedLakebed.usesAuth ||
      translatedLakebed.usesMutation ||
      translatedLakebed.usesQuery)
      ? `\nimport { useMutation, useQuery${translatedLakebed.needsQueryClient ? ', useQueryClient' : ''} } from '@tanstack/react-query'`
      : ''
  const componentSource = `${preludeSources.join('\n\n')}\n${rewrittenNavigation.body}`
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
  const source = `${componentImports.join('\n')}${queryHookImport}${usesLakebed ? `\n${lakebedDataImport}` : ''}${routePaths}

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

    files[outPath] = prependImports(
      removeImportDeclarations(source, sourceFile),
      transformed.imports,
    )
  }

  return { files, dependencies }
}

const buildRoutes = (parsed: ParsedOpenUIProgram): ExportRoute[] => {
  const used = new Set<string>()
  return parsed.pages.map((page, index) => {
    unwrapSingleObjectArgProps(page)
    const label = parsed.routes[index] ?? `Page ${index + 1}`
    if (!page.typeName || page.typeName === 'PageSwitch') {
      throw new Error(
        `React export cannot render route "${label}" because it does not resolve to a page component`,
      )
    }
    return {
      label,
      path: uniqueRoutePath(label, index, used),
      componentName: `RoutePage${index + 1}${toIdentifier(label)}`,
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
  const imports = nestedComponentNames
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

const renderImageHelper = (
  target: 'react' | 'next',
  imageSources: ImageSource[],
): string => {
  const envName =
    target === 'react'
      ? 'import.meta.env.VITE_SERVER_URL'
      : 'process.env.NEXT_PUBLIC_SERVER_URL'
  return `import type { ImgHTMLAttributes } from 'react'

const serverUrl = (${envName} || 'https://ship-fast.io').replace(/\\/$/, '')
const previewImageSources = ${JSON.stringify(imageSources, null, 2)} satisfies Array<{ alt: string; src: string }>
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
    : \`\${serverUrl}/api/pexels?query=\${encodeURIComponent(slugify(normalizedAlt))}&w=\${w}&h=\${h}\`)

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

const renderStyleOverridesRuntime = (
  styleOverrides: StyleOverride[],
): string => `'use client'

import { useEffect } from 'react'

const styleOverrides = ${JSON.stringify(styleOverrides, null, 2)} satisfies Array<{
  classAnchor: string
  occurrenceIndex: number
  style: string
}>

function applyStyleOverrides() {
  for (const override of styleOverrides) {
    if (!override.classAnchor) continue
    const matches = Array.from(document.querySelectorAll<HTMLElement>('*')).filter(
      (element) => element.getAttribute('class') === override.classAnchor,
    )
    const element = matches[override.occurrenceIndex] ?? matches[0]
    if (!element) continue
    for (const declaration of override.style.split(';')) {
      const colon = declaration.indexOf(':')
      if (colon === -1) continue
      const property = declaration.slice(0, colon).trim()
      const value = declaration.slice(colon + 1).trim()
      if (property) element.style.setProperty(property, value)
    }
  }
}

export function StyleOverrides() {
  useEffect(() => {
    if (styleOverrides.length === 0) return
    applyStyleOverrides()
    const observer = new MutationObserver(() => applyStyleOverrides())
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
`

const renderSiteDataRuntime = (target: 'react' | 'next'): string => {
  const nextActionImport =
    target === 'next'
      ? `import {
  runSiteMutationAction,
  signInWithGoogleAction,
  signOutAction,
} from './site-data-actions'
`
      : ''
  const transport =
    target === 'next'
      ? `async function readRemote(name: string): Promise<unknown> {
  const response = await fetch(\`/api/data?query=\${encodeURIComponent(name)}\`, {
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(\`Failed to read \${name}\`)
  const payload = (await response.json()) as { value?: unknown }
  return payload.value
}

async function writeRemote(name: string, args: unknown[]): Promise<unknown> {
  if (name === 'auth:signIn') return signInWithGoogleAction()
  if (name === 'auth:signOut') return signOutAction()
  return runSiteMutationAction(name, args)
}
`
      : `async function readRemote(name: string): Promise<unknown> {
  if (name === 'auth') return localAuth
  return readQueryValue(localStore, name)
}

async function writeRemote(name: string, args: unknown[]): Promise<unknown> {
  if (name === 'auth:signIn') {
    localAuth = createDemoAuth()
    return localAuth
  }
  if (name === 'auth:signOut') {
    localAuth = guestAuth
    return localAuth
  }
  return mutationResult(localStore, name)
}
`

  return `import { useCallback, useMemo, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { routes } from '../data/pages'
${nextActionImport}

type Store = Record<string, unknown>
type FieldBuilder = { default(value: unknown): FieldBuilder }
type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture: string | null
  user: {
    displayName: string
    email: string
    picture: string | null
  } | null
  userId: string
}
type LakebedMutation = ((...args: unknown[]) => Promise<unknown>) & {
  isPending: boolean
  lastError: unknown | null
  pendingCount: number
  reset(): void
}
export type LakebedClientRuntime<_Definition = unknown> = {
  signInWithGoogle(): Promise<AuthState>
  signOut(): void
  useAuth(): AuthState
  useMutation(name: string): LakebedMutation
  useQuery<TValue = unknown>(name: string): TValue
}

export const string = (): FieldBuilder => ({
  default: () => string(),
})

export const number = (): FieldBuilder => ({
  default: () => number(),
})

export const table = <TTable extends Record<string, unknown>>(
  definition: TTable,
): TTable => definition

export const createLakebedDefinition = <TSchema extends Record<string, unknown>>(
  schema: TSchema,
) => ({
  schema,
  mutation: <TInput extends unknown[], TResult>(
    handler: (ctx: unknown, ...input: TInput) => TResult,
  ) => handler,
  query: <TResult>(handler: (ctx: unknown) => TResult) => handler,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function collectionItems(name: string): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = []
  const visit = (value: unknown) => {
    if (!isRecord(value)) return
    const collection = value[name]
    if (Array.isArray(collection)) {
      items.push(...collection.filter(isRecord))
    } else if (isRecord(collection) && Array.isArray(collection.items)) {
      items.push(...collection.items.filter(isRecord))
    }
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) nested.forEach(visit)
      else visit(nested)
    }
  }
  routes.forEach((route) => visit(route.props))
  return items
}

const defaultCommerceProducts: Array<Record<string, unknown>> = [
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
]

function productsCollection(): Array<Record<string, unknown>> {
  const products = collectionItems('products')
  if (products.length > 0) return products
  const hasCommerceRoute = routes.some((route) =>
    /commerce|ecommerce|shop|store|marketplace/i.test(String(route.component)),
  )
  return hasCommerceRoute ? defaultCommerceProducts : products
}

const initialStore: Store = {
  cartLines: [],
  orderLines: [],
  favoriteProductNames: new Set<string>(),
  wishlistTitles: new Set<string>(),
  favoriteTitles: new Set<string>(),
  favoriteRestaurantNames: new Set<string>(),
  favoriteMemberNames: new Set<string>(),
  subscriberEmails: new Set<string>(),
  orders: [],
  inquiries: [],
  products: productsCollection(),
  restaurants: collectionItems('restaurants'),
  subscribers: [],
}

export const guestAuth: AuthState = {
  displayName: null,
  email: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  picture: null,
  user: null,
  userId: 'guest',
}

function createDemoAuth(): AuthState {
  return {
    displayName: 'Demo Shopper',
    email: 'demo@ship-fast.local',
    isAuthenticated: true,
    isGuest: false,
    isLoading: false,
    picture: null,
    user: {
      displayName: 'Demo Shopper',
      email: 'demo@ship-fast.local',
      picture: null,
    },
    userId: 'demo-user',
  }
}

let localStore = initialStore
let localAuth = guestAuth

${transport}
const readList = (store: Store, name: string): unknown[] =>
  store[name] instanceof Set
    ? [...(store[name] as Set<unknown>)]
    : Array.isArray(store[name])
      ? [...(store[name] as unknown[])]
      : []

const emptyQueryValue = (name: string): unknown =>
  /(?:Names|Titles|Emails)$/.test(name) ? new Set<string>() : []

const normalizeQueryValue = (name: string, value: unknown): unknown => {
  if (!/(?:Names|Titles|Emails)$/.test(name)) return value ?? []
  if (value instanceof Set) return value
  if (Array.isArray(value)) return new Set(value.filter((item): item is string => typeof item === 'string'))
  if (isRecord(value)) {
    return new Set(
      Object.values(value).filter((item): item is string => typeof item === 'string'),
    )
  }
  return new Set<string>()
}

const readQueryValue = (store: Store, name: string): unknown =>
  normalizeQueryValue(name, store[name] ?? emptyQueryValue(name))

const productNameFromArgs = (args: unknown[]) =>
  typeof args[0] === 'string' ? args[0] : 'Item'

const stableId = (prefix: string, value: unknown): string =>
  \`\${prefix}-\${String(value || 'item')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'}\`

const lineName = (item: Record<string, unknown>): unknown =>
  item.name ??
  (item.product && typeof item.product === 'object'
    ? (item.product as { name?: unknown }).name
    : undefined) ??
  (item.restaurant && typeof item.restaurant === 'object'
    ? (item.restaurant as { name?: unknown }).name
    : undefined)

const lineMatches = (item: Record<string, unknown>, value: unknown): boolean =>
  item.id === value ||
  item.productId === value ||
  item.restaurantId === value ||
  lineName(item) === value

const productFromStore = (store: Store, itemName: string): Record<string, unknown> | null =>
  (readList(store, 'products') as Array<Record<string, unknown>>).find(
    (item) => item.name === itemName,
  ) ?? null

const restaurantFromStore = (
  store: Store,
  itemName: string,
): Record<string, unknown> | null =>
  (readList(store, 'restaurants') as Array<Record<string, unknown>>).find(
    (item) => item.name === itemName,
  ) ?? null

function applyMutation(store: Store, name: string, args: unknown[]): Store {
  const next = { ...store }

  if (/clear/i.test(name)) {
    if (/cart/i.test(name)) next.cartLines = []
    if (/order/i.test(name)) next.orderLines = []
    if (/wishlist|favorite/i.test(name)) next.favoriteProductNames = []
    return next
  }

  if (/remove/i.test(name)) {
    const itemName = productNameFromArgs(args)
    if (/order/i.test(name)) {
      next.orderLines = readList(next, 'orderLines').filter(
        (item) => !isRecord(item) || !lineMatches(item, itemName),
      )
    } else {
      next.cartLines = readList(next, 'cartLines').filter(
        (item) => !isRecord(item) || !lineMatches(item, itemName),
      )
      next.favoriteProductNames = new Set(
        readList(next, 'favoriteProductNames').filter((item) => item !== itemName),
      )
    }
    return next
  }

  if (/favorite|wishlist|saved/i.test(name) && /toggle/i.test(name)) {
    const itemName = productNameFromArgs(args)
    const list = readList(next, 'favoriteProductNames')
    next.favoriteProductNames = new Set(
      list.includes(itemName)
        ? list.filter((item) => item !== itemName)
        : [...list, itemName],
    )
    return next
  }

  if (/cart|bag/i.test(name) && /add/i.test(name)) {
    const [nameArg, price, alt, image, category, badge, oldPrice] = args
    const itemName = typeof nameArg === 'string' ? nameArg : 'Item'
    const productId = stableId('product', itemName)
    const product = productFromStore(next, itemName) ?? {
      alt: typeof alt === 'string' ? alt : itemName,
      badge: typeof badge === 'string' ? badge : '',
      category: typeof category === 'string' ? category : '',
      image: typeof image === 'string' ? image : '',
      name: itemName,
      oldPrice: typeof oldPrice === 'string' ? oldPrice : '',
      price: typeof price === 'string' ? price : '',
    }
    const productRecord = { ...product, id: String(product.id ?? productId) }
    const cart = readList(next, 'cartLines') as Array<Record<string, unknown>>
    const existing = cart.find((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName))
    next.cartLines = existing
      ? cart.map((item) =>
          lineMatches(item, productRecord.id) || lineMatches(item, itemName)
            ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
            : item,
        )
      : [
          ...cart,
          {
            ...productRecord,
            product: productRecord,
            productId: productRecord.id,
            quantity: 1,
          },
        ]
    return next
  }

  if (/order/i.test(name) && /add/i.test(name)) {
    const itemName = productNameFromArgs(args)
    const restaurantId = stableId('restaurant', itemName)
    const restaurant = restaurantFromStore(next, itemName) ?? { name: itemName }
    const restaurantRecord = { ...restaurant, id: String(restaurant.id ?? restaurantId) }
    const lines = readList(next, 'orderLines') as Array<Record<string, unknown>>
    const existing = lines.find(
      (item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName),
    )
    next.orderLines = existing
      ? lines.map((item) =>
          lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName)
            ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
            : item,
        )
      : [
          ...lines,
          {
            ...restaurantRecord,
            restaurant: restaurantRecord,
            restaurantId: restaurantRecord.id,
            quantity: 1,
          },
        ]
    return next
  }

  if (/quantity/i.test(name)) {
    const [nameArg, quantityArg] = args
    const itemName = typeof nameArg === 'string' ? nameArg : ''
    const quantity = Math.max(1, Number(quantityArg) || 1)
    const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'
    next[listName] = (readList(next, listName) as Array<Record<string, unknown>>).map((item) =>
      lineMatches(item, itemName) ? { ...item, quantity } : item,
    )
    return next
  }

  if (/subscribe/i.test(name)) {
    next.subscribers = [...readList(next, 'subscribers'), { email: args[0] }]
    return next
  }

  if (/submit|create|add|book|reserve|register/i.test(name)) {
    const key = /inquir|contact|message/i.test(name) ? 'inquiries' : 'orders'
    next[key] = [...readList(next, key), { id: Date.now().toString(36), values: args }]
    return next
  }

  return next
}

const mutationResult = (store: Store, name: string): unknown => {
  if (/favorite|wishlist|saved/i.test(name)) return readQueryValue(store, 'favoriteProductNames')
  if (/order/i.test(name)) return readQueryValue(store, 'orderLines')
  if (/cart|bag|quantity|remove|clear/i.test(name)) return readQueryValue(store, 'cartLines')
  if (/subscribe/i.test(name)) return readQueryValue(store, 'subscribers')
  if (/inquir|contact|message/i.test(name)) return readQueryValue(store, 'inquiries')
  return true
}

const affectedQueryNames = (name: string): string[] => {
  const names = new Set<string>()
  if (/favorite|wishlist|saved/i.test(name)) names.add('favoriteProductNames')
  if (/cart|bag|quantity|remove|clear/i.test(name)) names.add('cartLines')
  if (/order/i.test(name)) names.add('orderLines')
  if (/subscribe/i.test(name)) {
    names.add('subscribers')
    names.add('subscriberEmails')
  }
  if (/inquir|contact|message/i.test(name)) names.add('inquiries')
  if (/order/i.test(name)) names.add('orders')
  return [...names]
}

export const siteAuthQueryKey = ['site-auth'] as const

export const siteQueryKey = (name: string) => ['site-data', name] as const

export const siteMutationKey = (name: string) => ['site-mutation', name] as const

export const defaultSiteQueryValue = (name: string): any =>
  emptyQueryValue(name) as any

export async function readSiteAuth(): Promise<AuthState> {
  return (await readRemote('auth')) as AuthState
}

export async function signInWithGoogle(): Promise<AuthState> {
  return (await writeRemote('auth:signIn', [])) as AuthState
}

export async function signOut(): Promise<AuthState> {
  return (await writeRemote('auth:signOut', [])) as AuthState
}

export function useAuth(): AuthState {
  const { data = guestAuth } = useQuery({
    queryKey: siteAuthQueryKey,
    queryFn: readSiteAuth,
    initialData: guestAuth,
    staleTime: Infinity,
    gcTime: Infinity,
  })
  return data
}

export async function readSiteData<T = any>(name: string): Promise<T> {
  return normalizeQueryValue(name, await readRemote(name)) as T
}

export function readSiteDataSnapshot<T = any>(name: string): T {
  return readQueryValue(localStore, name) as T
}

export async function runSiteMutation<Result = any>(
  name: string,
  args: unknown[],
): Promise<Result> {
  return (await writeRemote(name, args)) as Result
}

export function applySiteMutation<Result = any>(
  name: string,
  args: unknown[],
): Result {
  localStore = applyMutation(localStore, name, args)
  return mutationResult(localStore, name) as Result
}

export function updateSiteQueries(queryClient: QueryClient, name: string) {
  for (const queryName of affectedQueryNames(name)) {
    queryClient.setQueryData(siteQueryKey(queryName), readQueryValue(localStore, queryName))
  }
}

export function invalidateSiteQueries(queryClient: QueryClient, name: string) {
  for (const queryName of affectedQueryNames(name)) {
    void queryClient.invalidateQueries({ queryKey: siteQueryKey(queryName) })
  }
}

export function useLakebedAdapter(): LakebedClientRuntime {
  const queryClient = useQueryClient()

  return {
    async signInWithGoogle() {
      const auth = (await writeRemote('auth:signIn', [])) as AuthState
      queryClient.setQueryData(siteAuthQueryKey, auth)
      return auth
    },
    signOut() {
      void writeRemote('auth:signOut', []).then((auth) => {
        queryClient.setQueryData(siteAuthQueryKey, auth as AuthState)
      })
    },
    useAuth() {
      const { data = guestAuth } = useQuery({
        queryKey: siteAuthQueryKey,
        queryFn: readSiteAuth,
        initialData: guestAuth,
        staleTime: Infinity,
        gcTime: Infinity,
      })
      return data
    },
    useMutation(name: string) {
      const mutation = useMutation({
        mutationKey: siteMutationKey(name),
        mutationFn: (args: unknown[]) => runSiteMutation(name, args),
        onSuccess: () => invalidateSiteQueries(queryClient, name),
      })
      return Object.assign(
        async (...args: unknown[]) => {
          const result = applySiteMutation(name, args)
          updateSiteQueries(queryClient, name)
          await mutation.mutateAsync(args)
          return result
        },
        {
          get isPending() {
            return mutation.isPending
          },
          get lastError() {
            return mutation.error ?? null
          },
          get pendingCount() {
            return mutation.isPending ? 1 : 0
          },
          reset() {
            mutation.reset()
          },
        },
      )
    },
    useQuery<TValue = unknown>(name: string): TValue {
      const { data = defaultSiteQueryValue(name) } = useQuery({
        queryKey: siteQueryKey(name),
        queryFn: () => readSiteData(name),
        initialData: () => readSiteDataSnapshot(name),
        staleTime: Infinity,
        gcTime: Infinity,
      })
      return data as TValue
    },
  }
}

export function useKeyedLakebedMutation(
  lakebed: LakebedClientRuntime,
  name: string,
) {
  const mutation = lakebed.useMutation(name)
  const [pendingKeys, setPendingKeys] = useState<readonly string[]>([])
  const pendingKeySetRef = useRef(new Set<string>())
  const syncPendingKeys = useCallback(() => {
    setPendingKeys(Array.from(pendingKeySetRef.current))
  }, [])
  const run = useCallback(
    async (key: string, ...args: unknown[]) => {
      if (pendingKeySetRef.current.has(key)) return undefined

      pendingKeySetRef.current.add(key)
      syncPendingKeys()
      try {
        return await mutation(...args)
      } finally {
        pendingKeySetRef.current.delete(key)
        syncPendingKeys()
      }
    },
    [mutation, syncPendingKeys],
  )
  const isPending = useCallback(
    (key: string) => pendingKeys.includes(key),
    [pendingKeys],
  )
  const reset = useCallback(() => {
    pendingKeySetRef.current.clear()
    syncPendingKeys()
    mutation.reset()
  }, [mutation, syncPendingKeys])
  const pendingKey = pendingKeys[0] ?? null

  return useMemo(
    () => ({
      hasPending: pendingKeys.length > 0,
      isPending,
      lastError: mutation.lastError,
      pendingKey,
      pendingKeys,
      reset,
      run,
    }),
    [isPending, mutation.lastError, pendingKey, pendingKeys, reset, run],
  )
}
`
}

const renderNextDataStore =
  (): string => `import { routes } from '../data/pages'

type Store = Record<string, unknown>
type AuthState = {
  displayName: string | null
  email: string | null
  isAuthenticated: boolean
  isGuest: boolean
  isLoading: boolean
  picture: string | null
  user: {
    displayName: string
    email: string
    picture: string | null
  } | null
  userId: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value)

function collectionItems(name: string): Array<Record<string, unknown>> {
  const items: Array<Record<string, unknown>> = []
  const visit = (value: unknown) => {
    if (!isRecord(value)) return
    const collection = value[name]
    if (Array.isArray(collection)) {
      items.push(...collection.filter(isRecord))
    } else if (isRecord(collection) && Array.isArray(collection.items)) {
      items.push(...collection.items.filter(isRecord))
    }
    for (const nested of Object.values(value)) {
      if (Array.isArray(nested)) nested.forEach(visit)
      else visit(nested)
    }
  }
  routes.forEach((route) => visit(route.props))
  return items
}

const defaultCommerceProducts: Array<Record<string, unknown>> = [
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
]

function productsCollection(): Array<Record<string, unknown>> {
  const products = collectionItems('products')
  if (products.length > 0) return products
  const hasCommerceRoute = routes.some((route) =>
    /commerce|ecommerce|shop|store|marketplace/i.test(String(route.component)),
  )
  return hasCommerceRoute ? defaultCommerceProducts : products
}

const siteDataGlobal = globalThis as typeof globalThis & {
  __shipFastSiteDataDatabase?: Store
}

const database: Store = siteDataGlobal.__shipFastSiteDataDatabase ??= {
  cartLines: [],
  orderLines: [],
  favoriteProductNames: [],
  inquiries: [],
  orders: [],
  products: productsCollection(),
  restaurants: collectionItems('restaurants'),
  subscribers: [],
}

const guestAuth: AuthState = {
  displayName: null,
  email: null,
  isAuthenticated: false,
  isGuest: true,
  isLoading: false,
  picture: null,
  user: null,
  userId: 'guest',
}

function createDemoAuth(): AuthState {
  return {
    displayName: 'Demo Shopper',
    email: 'demo@ship-fast.local',
    isAuthenticated: true,
    isGuest: false,
    isLoading: false,
    picture: null,
    user: {
      displayName: 'Demo Shopper',
      email: 'demo@ship-fast.local',
      picture: null,
    },
    userId: 'demo-user',
  }
}

const siteAuthGlobal = globalThis as typeof globalThis & {
  __shipFastSiteDataAuth?: AuthState
}

if (!siteAuthGlobal.__shipFastSiteDataAuth) {
  siteAuthGlobal.__shipFastSiteDataAuth = guestAuth
}

const readAuth = (): AuthState => siteAuthGlobal.__shipFastSiteDataAuth ?? guestAuth

const writeAuth = (nextAuth: AuthState): AuthState => {
  siteAuthGlobal.__shipFastSiteDataAuth = nextAuth
  return nextAuth
}

const readList = (name: string): unknown[] =>
  Array.isArray(database[name]) ? [...(database[name] as unknown[])] : []

const itemNameFromArgs = (args: unknown[]) =>
  typeof args[0] === 'string' ? args[0] : 'Item'

const stableId = (prefix: string, value: unknown): string =>
  \`\${prefix}-\${String(value || 'item')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'item'}\`

const lineName = (item: Record<string, unknown>): unknown =>
  item.name ??
  (item.product && typeof item.product === 'object'
    ? (item.product as { name?: unknown }).name
    : undefined) ??
  (item.restaurant && typeof item.restaurant === 'object'
    ? (item.restaurant as { name?: unknown }).name
    : undefined)

const lineMatches = (item: Record<string, unknown>, value: unknown): boolean =>
  item.id === value ||
  item.productId === value ||
  item.restaurantId === value ||
  lineName(item) === value

const productFromDatabase = (itemName: string): Record<string, unknown> | null =>
  (readList('products') as Array<Record<string, unknown>>).find(
    (item) => item.name === itemName,
  ) ?? null

const restaurantFromDatabase = (itemName: string): Record<string, unknown> | null =>
  (readList('restaurants') as Array<Record<string, unknown>>).find(
    (item) => item.name === itemName,
  ) ?? null

function applyMutation(name: string, args: unknown[]): unknown {
  if (name === 'auth:signIn') {
    return writeAuth(createDemoAuth())
  }

  if (name === 'auth:signOut') {
    return writeAuth(guestAuth)
  }

  if (/clear/i.test(name)) {
    if (/cart/i.test(name)) database.cartLines = []
    if (/order/i.test(name)) database.orderLines = []
    if (/wishlist|favorite/i.test(name)) database.favoriteProductNames = []
    return true
  }

  if (/remove/i.test(name)) {
    const itemName = itemNameFromArgs(args)
    if (/order/i.test(name)) {
      database.orderLines = readList('orderLines').filter(
        (item) => !isRecord(item) || !lineMatches(item, itemName),
      )
    } else {
      database.cartLines = readList('cartLines').filter(
        (item) => !isRecord(item) || !lineMatches(item, itemName),
      )
      database.favoriteProductNames = readList('favoriteProductNames').filter((item) => item !== itemName)
    }
    return true
  }

  if (/favorite|wishlist|saved/i.test(name) && /toggle/i.test(name)) {
    const itemName = itemNameFromArgs(args)
    const list = readList('favoriteProductNames')
    database.favoriteProductNames = list.includes(itemName)
      ? list.filter((item) => item !== itemName)
      : [...list, itemName]
    return database.favoriteProductNames
  }

  if (/cart|bag/i.test(name) && /add/i.test(name)) {
    const [nameArg, price, alt, image, category, badge, oldPrice] = args
    const itemName = typeof nameArg === 'string' ? nameArg : 'Item'
    const productId = stableId('product', itemName)
    const product = productFromDatabase(itemName) ?? {
      alt: typeof alt === 'string' ? alt : itemName,
      badge: typeof badge === 'string' ? badge : '',
      category: typeof category === 'string' ? category : '',
      image: typeof image === 'string' ? image : '',
      name: itemName,
      oldPrice: typeof oldPrice === 'string' ? oldPrice : '',
      price: typeof price === 'string' ? price : '',
    }
    const productRecord = { ...product, id: String(product.id ?? productId) }
    const cart = readList('cartLines') as Array<Record<string, unknown>>
    const existing = cart.find((item) => lineMatches(item, productRecord.id) || lineMatches(item, itemName))
    database.cartLines = existing
      ? cart.map((item) =>
          lineMatches(item, productRecord.id) || lineMatches(item, itemName)
            ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
            : item,
        )
      : [
          ...cart,
          {
            ...productRecord,
            product: productRecord,
            productId: productRecord.id,
            quantity: 1,
          },
        ]
    return database.cartLines
  }

  if (/order/i.test(name) && /add/i.test(name)) {
    const itemName = itemNameFromArgs(args)
    const restaurantId = stableId('restaurant', itemName)
    const restaurant = restaurantFromDatabase(itemName) ?? { name: itemName }
    const restaurantRecord = { ...restaurant, id: String(restaurant.id ?? restaurantId) }
    const lines = readList('orderLines') as Array<Record<string, unknown>>
    const existing = lines.find(
      (item) => lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName),
    )
    database.orderLines = existing
      ? lines.map((item) =>
          lineMatches(item, restaurantRecord.id) || lineMatches(item, itemName)
            ? { ...item, quantity: Number(item.quantity ?? 1) + 1 }
            : item,
        )
      : [
          ...lines,
          {
            ...restaurantRecord,
            restaurant: restaurantRecord,
            restaurantId: restaurantRecord.id,
            quantity: 1,
          },
        ]
    return database.orderLines
  }

  if (/quantity/i.test(name)) {
    const [nameArg, quantityArg] = args
    const itemName = typeof nameArg === 'string' ? nameArg : ''
    const quantity = Math.max(1, Number(quantityArg) || 1)
    const listName = /order/i.test(name) ? 'orderLines' : 'cartLines'
    database[listName] = (readList(listName) as Array<Record<string, unknown>>).map((item) =>
      lineMatches(item, itemName) ? { ...item, quantity } : item,
    )
    return database[listName]
  }

  if (/subscribe/i.test(name)) {
    database.subscribers = [...readList('subscribers'), { email: args[0] }]
    return database.subscribers
  }

  if (/submit|create|add|book|reserve|register/i.test(name)) {
    const key = /inquir|contact|message/i.test(name) ? 'inquiries' : 'orders'
    database[key] = [...readList(key), { id: Date.now().toString(36), values: args }]
    return database[key]
  }

  return null
}

export function readSiteDataValue(name: string): unknown {
  if (name === 'auth') return readAuth()
  return database[name] ?? []
}

export function runSiteMutationValue(name: string, args: unknown[]): unknown {
  return applyMutation(name, args)
}

type EndpointResponse = {
  body: string
  headers: Record<string, string>
  kind: 'response'
  status: number
}

type EndpointResponseOptions = {
  headers?: Record<string, string>
  status?: number
}

type SiteEndpointHandler = (
  ctx: ReturnType<typeof createSiteEndpointContext>,
  request: ReturnType<typeof toEndpointRequest>,
) => unknown | Promise<unknown>

const endpointResponse = (
  body: string,
  { headers = {}, status = 200 }: EndpointResponseOptions = {},
): EndpointResponse => ({
  body,
  headers,
  kind: 'response',
  status,
})

export function json(value: unknown, options: EndpointResponseOptions = {}) {
  return endpointResponse(JSON.stringify(value ?? null), {
    ...options,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...(options.headers ?? {}),
    },
  })
}

export function text(value: unknown, options: EndpointResponseOptions = {}) {
  return endpointResponse(String(value ?? ''), {
    ...options,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      ...(options.headers ?? {}),
    },
  })
}

export function empty(options: EndpointResponseOptions = {}) {
  return endpointResponse('', { status: 204, ...options })
}

export function redirect(url: string, options: EndpointResponseOptions = {}) {
  return endpointResponse('', {
    status: 302,
    ...options,
    headers: {
      Location: String(url),
      ...(options.headers ?? {}),
    },
  })
}

export function endpoint(route: { method: string; path: string }, handler: SiteEndpointHandler) {
  return {
    handler,
    method: String(route.method || '').toUpperCase(),
    path: String(route.path || ''),
  }
}

const rowWithMeta = (value: Record<string, unknown>) => {
  const now = new Date().toISOString()
  return {
    id: String(value.id ?? Date.now().toString(36)),
    createdAt: String(value.createdAt ?? now),
    updatedAt: String(value.updatedAt ?? now),
    ...value,
  }
}

const tableRows = (name: string): Array<Record<string, unknown>> => {
  if (!Array.isArray(database[name])) database[name] = []
  return database[name] as Array<Record<string, unknown>>
}

const queryBuilder = (
  name: string,
  filters: Array<[string, unknown]> = [],
  order: [string, 'asc' | 'desc'] | null = null,
  limitCount: number | null = null,
) => ({
  where(field: string, value: unknown) {
    return queryBuilder(name, [...filters, [field, value]], order, limitCount)
  },
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
    return queryBuilder(name, filters, [field, direction], limitCount)
  },
  limit(count: number) {
    return queryBuilder(name, filters, order, count)
  },
  all() {
    let rows = tableRows(name).map(rowWithMeta)
    for (const [field, value] of filters) {
      rows = rows.filter((row) => row[field] === value)
    }
    if (order) {
      const [field, direction] = order
      rows = [...rows].sort((left, right) => {
        const a = String(left[field] ?? '')
        const b = String(right[field] ?? '')
        return direction === 'desc' ? b.localeCompare(a) : a.localeCompare(b)
      })
    }
    return typeof limitCount === 'number' ? rows.slice(0, limitCount) : rows
  },
})

const tableApi = (name: string) => ({
  ...queryBuilder(name),
  get(id: string) {
    return tableRows(name).map(rowWithMeta).find((row) => row.id === id) ?? null
  },
  insert(value: Record<string, unknown>) {
    const row = rowWithMeta(value)
    database[name] = [...tableRows(name), row]
    return row
  },
  update(id: string, patch: Record<string, unknown>) {
    database[name] = tableRows(name).map((row) =>
      rowWithMeta(row).id === id ? { ...row, ...patch, updatedAt: new Date().toISOString() } : row,
    )
  },
  delete(id: string) {
    database[name] = tableRows(name).filter((row) => rowWithMeta(row).id !== id)
  },
})

export function createSiteEndpointContext() {
  return {
    auth: readAuth(),
    db: new Proxy({} as Record<string, ReturnType<typeof tableApi>>, {
      get(_target, property) {
        return tableApi(String(property))
      },
    }),
    env: process.env,
    log: console,
  }
}

export function toEndpointRequest(request: Request) {
  const url = new URL(request.url)
  return {
    method: request.method,
    path: url.pathname,
    url: request.url,
    headers: request.headers,
    query: url.searchParams,
    text: () => request.clone().text(),
    json: <T = any>() => request.clone().json() as Promise<T>,
    bytes: async () => new Uint8Array(await request.clone().arrayBuffer()),
  }
}

export function toEndpointResponse(value: unknown): Response {
  if (value instanceof Response) return value
  if (
    value &&
    typeof value === 'object' &&
    (value as { kind?: unknown }).kind === 'response'
  ) {
    const response = value as EndpointResponse
    return new Response(response.body, {
      headers: response.headers,
      status: response.status,
    })
  }
  return Response.json(value ?? null)
}
`

const renderNextDataApiRoute = (): string => `import {
  readSiteDataValue,
  runSiteMutationValue,
} from '../../../src/lib/site-data-store'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const name = url.searchParams.get('query') ?? ''
  return Response.json({ value: readSiteDataValue(name) })
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    name?: unknown
    args?: unknown
  } | null
  const name = typeof payload?.name === 'string' ? payload.name : ''
  const args = Array.isArray(payload?.args) ? payload.args : []
  return Response.json({ ok: true, value: runSiteMutationValue(name, args) })
}
`

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
      const importPath = relativeImportPath(
        routePath,
        'src/lib/site-data-store.ts',
      )
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

const renderNextDataActions = (): string => `'use server'

import { runSiteMutationValue } from './site-data-store'

export async function runSiteMutationAction(
  name: string,
  args: unknown[],
): Promise<unknown> {
  return runSiteMutationValue(name, args)
}

export async function signInWithGoogleAction(): Promise<unknown> {
  return runSiteMutationValue('auth:signIn', [])
}

export async function signOutAction(): Promise<unknown> {
  return runSiteMutationValue('auth:signOut', [])
}
`

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

  return {
    root: result.root,
    routes: routes.length > 0 ? routes : ['Home'],
    pages: pages.length > 0 ? pages : [result.root],
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

const brandLogoLiteral = (input: OpenUIExportInput): string =>
  JSON.stringify(input.selectedBrandLogo ?? null, null, 2)

const brandLogoBlockSourcePaths = (input: OpenUIExportInput): string[] =>
  input.selectedBrandLogo ? ['src/section-kit/Logo.tsx'] : []

const renderReactApp = (
  componentNames: string[],
  input: OpenUIExportInput,
): string => {
  const imports = componentNames
    .map((name) => `import { ${name} } from './components/${name}'`)
    .join('\n')
  const mapEntries = componentNames.map((name) => `  ${name},`).join('\n')
  const logoImport = input.selectedBrandLogo
    ? "import { BrandLogoProvider } from './section-kit/Logo'\n"
    : ''
  const brandLogo = brandLogoLiteral(input)
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
${logoImport}${input.selectedBrandLogo ? `const selectedBrandLogo = ${brandLogo} as const\n` : ''}${imports}

const components = {
${mapEntries}
}

function RoutePage({ route }: { route: (typeof routes)[number] }) {
  const Page = components[route.component] as ComponentType<any>
  return <Page {...route.props} />
}

export default function App() {
  return (
    ${
      input.selectedBrandLogo
        ? `<BrandLogoProvider value={selectedBrandLogo}>
      ${appTree}
    </BrandLogoProvider>`
        : appTree
    }
  )
}
`
}

const renderReactMain = (usesLakebed: boolean): string => {
  const queryImports = usesLakebed
    ? `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'\n`
    : ''
  const queryClient = usesLakebed
    ? `\nconst queryClient = new QueryClient({\n  defaultOptions: {\n    queries: {\n      gcTime: 1000 * 60 * 60,\n      refetchOnWindowFocus: false,\n      staleTime: Infinity,\n    },\n  },\n})\n`
    : ''
  const app = usesLakebed
    ? `<QueryClientProvider client={queryClient}>\n      <App />\n    </QueryClientProvider>`
    : '<App />'

  return `import React from 'react'
import { createRoot } from 'react-dom/client'
${queryImports}import App from './App'
import { StyleOverrides } from './lib/style-overrides'
import './styles.css'
${queryClient}

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StyleOverrides />
    ${app}
  </React.StrictMode>,
)
`
}

const renderNextSiteDataProvider = (): string => `'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 1000 * 60 * 60,
            refetchOnWindowFocus: false,
            staleTime: Infinity,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
`

const renderNextRoutePage = (
  route: ExportRoute,
  componentName: string,
  dataImportPath: string,
  componentImportPath: string,
): string => `import { routes } from '${dataImportPath}'
import { ${componentName} } from '${componentImportPath}'
import type { ${componentName}Props } from '${componentImportPath}'

const route = routes.find((entry) => entry.path === ${JSON.stringify(route.path)})!

export default function Page() {
  return <${componentName} {...(route.props as ${componentName}Props)} />
}
`

const renderNextBrandLogoProvider = (
  input: OpenUIExportInput,
): string => `'use client'

import type { ReactNode } from 'react'
import { BrandLogoProvider } from '../section-kit/Logo'

const selectedBrandLogo = ${brandLogoLiteral(input)} as const

export function ExportBrandLogoProvider({ children }: { children: ReactNode }) {
  return <BrandLogoProvider value={selectedBrandLogo}>{children}</BrandLogoProvider>
}
`

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
): ExtractedComponent[] => {
  const names = collectRouteComponentNames(routes)
  return names.map((name) => extractComponent(name, stack, routeTargets))
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

const buildReactExport = (
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): BuiltExport => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes, parsed.targetMap)
  const components = collectExportComponents(routes, 'react', routeTargets)
  const nestedComponentNames = components.map((component) => component.name)
  const routeComponents = routes.map((route) => ({
    name: route.componentName,
    source: renderRouteComponentSource(route, nestedComponentNames),
  }))
  const blockSources = collectBlockSourceFiles(
    [
      ...brandLogoBlockSourcePaths(input),
      ...components.flatMap((component) => [...component.blockSources]),
    ],
    'react',
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
  const imageSources = extractImageSources(input.previewHtml)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  if (usesLakebed) {
    dependencies['@tanstack/react-query'] =
      dependencyVersions['@tanstack/react-query']
  }
  const files: Record<string, string> = {
    'package.json': renderReactPackageJson(
      parsed.projectName,
      dependencies,
      devDependencies,
    ),
    'index.html':
      '<!doctype html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Ship Fast Export</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
    '.env.local': 'VITE_SERVER_URL=https://ship-fast.io\n',
    'tsconfig.json': renderTsConfig(),
    'src/vite-env.d.ts': renderViteEnv(),
    'vite.config.ts': renderViteConfig(),
    'src/main.tsx': renderReactMain(usesLakebed),
    'src/App.tsx': renderReactApp(routeComponentNames, input),
    'src/data/pages.ts': renderRouteData(routes, routeComponentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper('react', imageSources),
    'src/lib/style-overrides.tsx': renderStyleOverridesRuntime(styleOverrides),
    'src/styles.css': renderThemeCss(input),
    'README.md': renderReadme(parsed.projectName, 'react'),
  }
  if (usesLakebed)
    files['src/lib/site-data.ts'] = renderSiteDataRuntime('react')

  for (const component of routeComponents) {
    files[`src/components/${component.name}.tsx`] = component.source
  }
  for (const component of components) {
    files[`src/components/${component.name}.tsx`] = component.source
  }
  Object.assign(files, blockSources.files)

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-react.zip`,
    fileCount: Object.keys(files).length,
  }
}

const buildNextExport = (
  input: OpenUIExportInput,
  parsed: ParsedOpenUIProgram,
): BuiltExport => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes, parsed.targetMap)
  const components = collectExportComponents(routes, 'next', routeTargets)
  const nestedComponentNames = components.map((component) => component.name)
  const routeComponents = routes.map((route) => ({
    name: route.componentName,
    source: renderRouteComponentSource(route, nestedComponentNames),
  }))
  const blockSources = collectBlockSourceFiles(
    [
      ...brandLogoBlockSourcePaths(input),
      ...components.flatMap((component) => [...component.blockSources]),
    ],
    'next',
  )
  const { dependencies, devDependencies } = resolveDependencyVersions(
    [
      ...components.flatMap((component) => [...component.dependencies]),
      ...blockSources.dependencies,
    ],
    'next',
  )
  const routeComponentNames = routeComponents.map((component) => component.name)
  const usesLakebed = components.some((component) => component.usesLakebed)
  const endpoints = collectNextEndpoints(nestedComponentNames, input.source)
  const imageSources = extractImageSources(input.previewHtml)
  const styleOverrides = extractStyleOverrides(input.previewHtml)
  if (usesLakebed) {
    dependencies['@tanstack/react-query'] =
      dependencyVersions['@tanstack/react-query']
  }
  const layoutImport = `${usesLakebed ? "import { SiteDataProvider } from '../src/lib/site-data-provider'\n" : ''}${input.selectedBrandLogo ? "import { ExportBrandLogoProvider } from '../src/lib/brand-logo-provider'\n" : ''}`
  const layoutChildren = `${input.selectedBrandLogo ? '<ExportBrandLogoProvider>' : ''}${usesLakebed ? '<SiteDataProvider>{children}</SiteDataProvider>' : '{children}'}${input.selectedBrandLogo ? '</ExportBrandLogoProvider>' : ''}`
  const files: Record<string, string> = {
    'package.json': renderNextPackageJson(
      parsed.projectName,
      dependencies,
      devDependencies,
    ),
    '.env.local': 'NEXT_PUBLIC_SERVER_URL=https://ship-fast.io\n',
    'postcss.config.mjs': renderNextPostcssConfig(),
    'next.config.mjs':
      'import { dirname } from "node:path"\nimport { fileURLToPath } from "node:url"\n\nconst projectRoot = dirname(fileURLToPath(import.meta.url))\n\n/** @type {import("next").NextConfig} */\nconst nextConfig = {\n  images: {\n    remotePatterns: [\n      { protocol: "https", hostname: "images.pexels.com" },\n      { protocol: "https", hostname: "picsum.photos" },\n      { protocol: "https", hostname: "ship-fast.io" },\n    ],\n  },\n  turbopack: {\n    root: projectRoot,\n  },\n}\n\nexport default nextConfig\n',
    'next-env.d.ts': renderNextEnv(),
    'tsconfig.json': renderTsConfig('preserve'),
    'app/layout.tsx': `import type { ReactNode } from 'react'
${layoutImport}import { StyleOverrides } from '../src/lib/style-overrides'
import './globals.css'

export const metadata = { title: ${JSON.stringify(parsed.projectName)} }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body><StyleOverrides />${layoutChildren}</body></html>
}
`,
    'app/globals.css': renderThemeCss(input),
    'src/data/pages.ts': renderRouteData(routes, routeComponentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper('next', imageSources),
    'src/lib/style-overrides.tsx': renderStyleOverridesRuntime(styleOverrides),
    'README.md': renderReadme(parsed.projectName, 'next'),
  }
  if (usesLakebed) {
    files['src/lib/site-data.ts'] = renderSiteDataRuntime('next')
    files['src/lib/site-data-actions.ts'] = renderNextDataActions()
    files['src/lib/site-data-provider.tsx'] = renderNextSiteDataProvider()
    files['app/api/data/route.ts'] = renderNextDataApiRoute()
  }
  if (input.selectedBrandLogo) {
    files['src/lib/brand-logo-provider.tsx'] =
      renderNextBrandLogoProvider(input)
  }
  if (usesLakebed || endpoints.length > 0) {
    files['src/lib/site-data-store.ts'] = renderNextDataStore()
  }
  Object.assign(files, renderNextEndpointRouteFiles(endpoints))

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

  for (const route of routes) {
    if (route.path === '/') {
      files['app/page.tsx'] = renderNextRoutePage(
        route,
        route.componentName,
        '../src/data/pages',
        '../src/components/' + route.componentName,
      )
    } else {
      const dir = route.path.slice(1)
      files[`app/${dir}/page.tsx`] = renderNextRoutePage(
        route,
        route.componentName,
        '../../src/data/pages',
        '../../src/components/' + route.componentName,
      )
    }
  }

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-next.zip`,
    fileCount: Object.keys(files).length,
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
    ? buildReactExport(input, parsed)
    : buildNextExport(input, parsed)
}

export const decodeExportBody = (body: string | Uint8Array): string =>
  typeof body === 'string' ? body : textDecoder.decode(body)
