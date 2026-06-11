import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import ts from 'typescript'
import { createParser, jsonToOpenUI, type ElementNode } from '@openuidev/lang-core'
import { library, reactExportSources } from '@ship-fast/blocks'
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

type ExportRoute = {
  label: string
  path: string
  componentName: string
  props: Record<string, unknown>
}

type ExtractedComponent = {
  name: string
  source: string
  dependencies: Set<string>
}

type ExportStack = 'react' | 'next'

type ReactExportSourceEntry = {
  file: string
  source: string
}

const textDecoder = new TextDecoder()
const cssPath = join(process.cwd(), 'public', 'styles', 'openui-preview-tailwind.css')
const blocksRegistryPath = join(process.cwd(), 'packages', 'ship-fast-blocks', 'src', 'registry')
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

const uniqueRoutePath = (label: string, index: number, used: Set<string>): string => {
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
  if (specifier.startsWith('.') || specifier.startsWith('@/') || specifier.startsWith('#/')) return null
  if (specifier.startsWith('@')) {
    const [scope, name] = specifier.split('/')
    return scope && name ? `${scope}/${name}` : specifier
  }
  return specifier.split('/')[0] ?? null
}

const normalizeRouteTarget = (value: string): string => value.trim().toLowerCase()

const resolveRouteTarget = (target: string, routes: ExportRoute[]): string => {
  const normalized = normalizeRouteTarget(target)
  const exact = routes.find((route) => normalizeRouteTarget(route.label) === normalized)
  if (exact) return exact.path

  const find = (pattern: RegExp) => routes.find((route) => pattern.test(normalizeRouteTarget(route.label)))
  const byKeyword =
    (/shop|store|product|buy|cart|order|browse|collection/.test(normalized) && find(/shop|store|product|collection|menu|work|gallery/)) ||
    (/price|plan|pricing|subscribe|upgrade|tier|membership/.test(normalized) && find(/pric|plan|member/)) ||
    (/contact|reach|get in touch|book|reserve|demo|quote|sign ?up|start|join|get started|register|tour/.test(normalized) && find(/contact|book|reserve|demo|start|join/)) ||
    (/about|story|team|who we are|mission/.test(normalized) && find(/about|team|story/)) ||
    (/blog|news|post|article|read|stories|journal|tips/.test(normalized) && find(/blog|news|post|article|stories|tips/)) ||
    (/feature|service|how it works|learn|explore|tour|class|schedule|trainer/.test(normalized) && find(/feature|service|how|class|home/)) ||
    null

  return byKeyword?.path ?? routes[0]?.path ?? '/'
}

const navigationKeyPattern = /(^|_|\b)(nav|cta|link|links|href|route|routes|action|button|buttons|primary|secondary|submit|phone|email|legal)(\b|_|$)/i

const collectNavigationStrings = (
  value: unknown,
  values = new Set<string>(),
  navigationContext = false,
  key = '',
): Set<string> => {
  const nextNavigationContext = navigationContext || navigationKeyPattern.test(key)
  if (typeof value === 'string') {
    if (nextNavigationContext && value.trim()) values.add(value)
    return values
  }
  if (Array.isArray(value)) {
    for (const item of value) collectNavigationStrings(item, values, nextNavigationContext, key)
    return values
  }
  if (value && typeof value === 'object') {
    for (const [entryKey, item] of Object.entries(value)) {
      collectNavigationStrings(item, values, nextNavigationContext, entryKey)
    }
  }
  return values
}

const buildRouteTargetMap = (routes: ExportRoute[]): Record<string, string> => {
  const targets = new Set<string>()
  for (const route of routes) {
    targets.add(route.label)
    collectNavigationStrings(route.props, targets)
  }
  return Object.fromEntries(
    [...targets]
      .sort((a, b) => a.localeCompare(b))
      .map((target) => [target, resolveRouteTarget(target, routes)]),
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

const manifestSourceIndex = reactExportSources as Record<string, ReactExportSourceEntry | undefined>
let componentSourceIndex: Map<string, ReactExportSourceEntry> | null = null

const getComponentSourceIndex = (): Map<string, ReactExportSourceEntry> => {
  if (componentSourceIndex) return componentSourceIndex
  const index = new Map<string, ReactExportSourceEntry>()
  for (const [name, entry] of Object.entries(manifestSourceIndex)) {
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
    const sourceFile = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
    for (const statement of sourceFile.statements) {
      if (!ts.isVariableStatement(statement)) continue
      const isExported = statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      if (!isExported) continue
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.initializer?.getText(sourceFile).startsWith('defineComponent(')) {
          index.set(declaration.name.text, {
            file: relative(join(process.cwd(), 'packages', 'ship-fast-blocks'), file).replaceAll('\\', '/'),
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

const transformComponentImports = (
  sourceFile: ts.SourceFile,
  componentName: string,
  stack: ExportStack,
): { imports: string[]; dependencies: Set<string> } => {
  const imports: string[] = []
  const dependencies = new Set<string>(['zod'])
  for (const statement of sourceFile.statements) {
    if (!ts.isImportDeclaration(statement)) continue
    const specifier = statement.moduleSpecifier
    if (!ts.isStringLiteral(specifier)) continue
    const moduleName = specifier.text
    const clause = statement.importClause
    if (!clause) continue

    if (moduleName === '@openuidev/react-lang') continue
    if (moduleName === '#/lib/utils.ts') {
      imports.push("import { cn } from '../lib/cn'")
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
      imports.push("import { Image } from '../lib/image'")
      continue
    }
    if (moduleName.startsWith('#/components/ui/')) {
      throw new Error(`React export does not yet support UI primitive dependency in ${componentName}: ${moduleName}`)
    }
    if (moduleName.startsWith('#/')) {
      throw new Error(`React export does not support private helper import in ${componentName}: ${moduleName}`)
    }

    const packageName = readPublicPackageName(moduleName)
    if (packageName) dependencies.add(packageName)
    imports.push(statement.getText(sourceFile))
  }
  return { imports: [...new Set(imports)], dependencies }
}

const findDefineComponentParts = (
  componentName: string,
  entry: ReactExportSourceEntry,
): { sourceFile: ts.SourceFile; propsSchema: string; body: string; isExpressionBody: boolean } => {
  const sourceFile = ts.createSourceFile(entry.file, entry.source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue
    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || declaration.name.text !== componentName) continue
      const call = declaration.initializer
      if (!call || !ts.isCallExpression(call) || call.expression.getText(sourceFile) !== 'defineComponent') continue
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
      if (!ts.isArrowFunction(component) && !ts.isFunctionExpression(component)) {
        throw new Error(`Unsupported component function shape in ${componentName}`)
      }
      const componentText = component.getText(sourceFile)
      if (/\brenderNode\b|\buseStateField\b/.test(componentText)) {
        throw new Error(`React export does not support renderer/state internals in ${componentName}`)
      }
      return {
        sourceFile,
        propsSchema: printNode(propsProperty.initializer, sourceFile),
        body: ts.isBlock(component.body)
          ? component.body.statements.map((statement) => printNode(statement, sourceFile)).join('\n')
          : printNode(component.body, sourceFile),
        isExpressionBody: !ts.isBlock(component.body),
      }
    }
  }
  throw new Error(`Component source not found for ${componentName}`)
}

const navigationVarPattern = /\bconst\s+([A-Za-z_$][\w$]*)\s*=\s*useNavigate\(\)/g

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

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

const renderNavigationArgument = (argument: string, routeTargets: Record<string, string>): string => {
  const trimmed = argument.trim()
  if (isStringLiteralSource(trimmed)) {
    const literal = parseStringLiteralSource(trimmed)
    if (literal) return JSON.stringify(routeTargets[literal] ?? '/')
  }
  return `(routePaths[String(${trimmed})] ?? '/')`
}

const rewriteNavigationCalls = (
  body: string,
  stack: ExportStack,
  routeTargets: Record<string, string>,
): { body: string; usesNavigation: boolean } => {
  const navigationVars = [...body.matchAll(navigationVarPattern)].map((match) => match[1]).filter(Boolean)
  if (navigationVars.length === 0) return { body, usesNavigation: false }

  let nextBody = body
  if (stack === 'next') {
    nextBody = nextBody.replace(navigationVarPattern, 'const $1 = useRouter()')
  }

  for (const name of new Set(navigationVars)) {
    const callPattern = new RegExp(`\\b${escapeRegExp(name)}\\(([^()\\n]+)\\)`, 'g')
    nextBody = nextBody.replace(callPattern, (_match, argument: string) => {
      const destination = renderNavigationArgument(argument, routeTargets)
      return stack === 'react' ? `${name}(${destination})` : `${name}.push(${destination})`
    })
  }

  return { body: nextBody, usesNavigation: true }
}

const extractComponent = (
  componentName: string,
  stack: ExportStack,
  routeTargets: Record<string, string>,
): ExtractedComponent => {
  const entry = getComponentSourceIndex().get(componentName)
  if (!entry) throw new Error(`React export does not support unknown component: ${componentName}`)

  const { sourceFile, propsSchema, body, isExpressionBody } = findDefineComponentParts(componentName, entry)
  const { imports, dependencies } = transformComponentImports(sourceFile, componentName, stack)
  const functionBody = isExpressionBody ? `return ${body}` : body
  const rewrittenNavigation = rewriteNavigationCalls(functionBody, stack, routeTargets)
  const routePaths = rewrittenNavigation.usesNavigation
    ? `\nconst routePaths: Record<string, string> = ${JSON.stringify(routeTargets, null, 2)}\n`
    : ''
  const source = `${imports.join('\n')}${routePaths}

export const ${componentName}PropsSchema = ${propsSchema}

export type ${componentName}Props = z.infer<typeof ${componentName}PropsSchema>

export function ${componentName}(props: ${componentName}Props) {
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
  }
}

const buildRoutes = (parsed: ParsedOpenUIProgram): ExportRoute[] => {
  const used = new Set<string>()
  return parsed.pages.map((page, index) => {
    const label = parsed.routes[index] ?? `Page ${index + 1}`
    if (!page.typeName || page.typeName === 'PageSwitch') {
      throw new Error(`React export cannot render route "${label}" because it does not resolve to a page component`)
    }
    return {
      label,
      path: uniqueRoutePath(label, index, used),
      componentName: page.typeName,
      props: page.props as Record<string, unknown>,
    }
  })
}

const dependencyVersions: Record<string, string> = {
  '@types/node': '^22.10.2',
  '@types/react': '^19.2.0',
  '@types/react-dom': '^19.2.0',
  '@vitejs/plugin-react': '^6.0.1',
  vite: '^8.0.0',
  typescript: '^6.0.2',
  react: '^19.2.0',
  'react-dom': '^19.2.0',
  'react-router-dom': '^7.10.1',
  next: '^16.0.8',
  tailwindcss: '^4.1.18',
  zod: '^4.4.3',
  'lucide-react': '^0.577.0',
  clsx: '^2.1.1',
  'tailwind-merge': '^3.5.0',
}

const toDependencyRecord = (names: Iterable<string>): Record<string, string> =>
  Object.fromEntries([...names].sort().map((name) => [name, dependencyVersions[name] ?? 'latest']))

const resolveDependencyVersions = (
  packages: Iterable<string>,
  target: 'react' | 'next',
): { dependencies: Record<string, string>; devDependencies: Record<string, string> } => {
  const names = new Set(packages)
  const devNames = new Set<string>(['@types/react', '@types/react-dom', 'tailwindcss', 'typescript'])
  names.add('react')
  names.add('react-dom')
  names.add('zod')
  names.add('clsx')
  names.add('tailwind-merge')
  if (target === 'react') {
    devNames.add('@vitejs/plugin-react')
    devNames.add('vite')
    names.add('react-router-dom')
  } else {
    devNames.add('@types/node')
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
  const themeStyles = resolveThemeStyles(themeName)
  const themeStyle = buildThemeStyle(themeStyles, isDark)

  return `@import "tailwindcss";

:root {
  ${themeStyle.replaceAll('; ', ';\n  ')}
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

const renderImageHelper = (target: 'react' | 'next'): string => {
  const envName = target === 'react' ? 'import.meta.env.VITE_SERVER_URL' : 'process.env.NEXT_PUBLIC_SERVER_URL'
  return `import type { ImgHTMLAttributes } from 'react'

const serverUrl = (${envName} || 'https://ship-fast.io').replace(/\\/$/, '')

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
  const imageSrc = typeof src === 'string' && src.trim()
    ? src
    : \`\${serverUrl}/api/pexels?query=\${encodeURIComponent(slugify(normalizedAlt))}&w=\${w}&h=\${h}\`

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

const absolutizeHtmlAssetUrls = (html: string): string =>
  html.replaceAll('="/api/pexels?', '="https://ship-fast.io/api/pexels?')

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
  const pagesMarkup = absolutizeHtmlAssetUrls(buildPagesMarkup(parsed))

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

const renderReadme = (projectName: string, target: 'react' | 'next'): string => {
  const commands =
    target === 'react'
      ? ['bun install', 'bun dev', 'bun run build', 'bun run preview']
      : ['bun install', 'bun dev', 'bun run build', 'bun run start']

  return `# ${projectName}

This project was generated by Ship Fast.

## Run locally

\`\`\`bash
${commands.join('\n')}
\`\`\`
`
}

const renderTsConfig = (jsx: 'react-jsx' | 'preserve' = 'react-jsx'): string => {
  const include =
    jsx === 'preserve'
      ? ['next-env.d.ts', 'src/**/*.ts', 'src/**/*.tsx', 'app/**/*.ts', 'app/**/*.tsx', '.next/types/**/*.ts']
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

const renderRouteData = (routes: ExportRoute[], componentNames: string[]): string => {
  const serializedRoutes = routes.map(({ componentName, ...route }) => ({
    ...route,
    component: componentName,
  }))
  const typeImports = componentNames
    .map((name) => `import type { ${name}Props } from '../components/${name}'`)
    .join('\n')
  const propsUnion = componentNames.map((name) => `${name}Props`).join(' | ') || 'Record<string, never>'
  return `${typeImports}

export type GeneratedPageProps = ${propsUnion}

export type GeneratedRoute = {
  label: string
  path: string
  component: ${componentNames.map((name) => JSON.stringify(name)).join(' | ') || 'never'}
  props: Record<string, unknown>
}

export const routes = ${JSON.stringify(serializedRoutes, null, 2)} satisfies GeneratedRoute[]
`
}

const renderReactApp = (componentNames: string[]): string => {
  const imports = componentNames.map((name) => `import { ${name} } from './components/${name}'`).join('\n')
  const mapEntries = componentNames.map((name) => `  ${name},`).join('\n')
  return `import type { ComponentType } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { routes } from './data/pages'
${imports}

const components = {
${mapEntries}
}

function GeneratedPage({ route }: { route: (typeof routes)[number] }) {
  const Page = components[route.component] as ComponentType<any>
  return <Page {...route.props} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={<GeneratedPage route={route} />} />
        ))}
        <Route path="*" element={<Navigate to={routes[0]?.path ?? '/'} replace />} />
      </Routes>
    </BrowserRouter>
  )
}
`
}

const renderReactMain = (): string => `import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
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

const asClientComponent = (source: string): string => `'use client'

${source}`

const zipFiles = (files: Record<string, string>): Uint8Array => {
  assertNoOpenUIInternals(files)
  return zipSync(
    Object.fromEntries(Object.entries(files).map(([name, content]) => [name, strToU8(content)])),
    { level: 9 },
  )
}

const collectExportComponents = (
  routes: ExportRoute[],
  stack: ExportStack,
  routeTargets: Record<string, string>,
): ExtractedComponent[] => {
  const names = [...new Set(routes.map((route) => route.componentName))]
  return names.map((name) => extractComponent(name, stack, routeTargets))
}

const buildReactExport = (input: OpenUIExportInput, parsed: ParsedOpenUIProgram): BuiltExport => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes)
  const components = collectExportComponents(routes, 'react', routeTargets)
  const { dependencies, devDependencies } = resolveDependencyVersions(
    components.flatMap((component) => [...component.dependencies]),
    'react',
  )
  const componentNames = components.map((component) => component.name)
  const files: Record<string, string> = {
    'package.json': renderReactPackageJson(parsed.projectName, dependencies, devDependencies),
    'index.html': '<!doctype html><html><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>Ship Fast Export</title></head><body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body></html>\n',
    '.env.local': 'VITE_SERVER_URL=https://ship-fast.io\n',
    'tsconfig.json': renderTsConfig(),
    'src/main.tsx': renderReactMain(),
    'src/App.tsx': renderReactApp(componentNames),
    'src/data/pages.ts': renderRouteData(routes, componentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper('react'),
    'src/styles.css': renderThemeCss(input),
    'README.md': renderReadme(parsed.projectName, 'react'),
  }

  for (const component of components) {
    files[`src/components/${component.name}.tsx`] = component.source
  }

  return {
    body: zipFiles(files),
    contentType: 'application/zip',
    filename: `${toProjectSlug(parsed.projectName)}-react.zip`,
    fileCount: Object.keys(files).length,
  }
}

const buildNextExport = (input: OpenUIExportInput, parsed: ParsedOpenUIProgram): BuiltExport => {
  const routes = buildRoutes(parsed)
  const routeTargets = buildRouteTargetMap(routes)
  const components = collectExportComponents(routes, 'next', routeTargets)
  const { dependencies, devDependencies } = resolveDependencyVersions(
    components.flatMap((component) => [...component.dependencies]),
    'next',
  )
  const componentNames = components.map((component) => component.name)
  const files: Record<string, string> = {
    'package.json': renderNextPackageJson(parsed.projectName, dependencies, devDependencies),
    '.env.local': 'NEXT_PUBLIC_SERVER_URL=https://ship-fast.io\n',
    'next.config.mjs': '/** @type {import("next").NextConfig} */\nconst nextConfig = {}\n\nexport default nextConfig\n',
    'next-env.d.ts': renderNextEnv(),
    'tsconfig.json': renderTsConfig('preserve'),
    'app/layout.tsx': `import type { ReactNode } from 'react'
import './globals.css'

export const metadata = { title: ${JSON.stringify(parsed.projectName)} }

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>
}
`,
    'app/globals.css': renderThemeCss(input),
    'src/data/pages.ts': renderRouteData(routes, componentNames),
    'src/lib/cn.ts': renderLibCn(),
    'src/lib/image.tsx': renderImageHelper('next'),
    'README.md': renderReadme(parsed.projectName, 'next'),
  }

  for (const component of components) {
    files[`src/components/${component.name}.tsx`] = asClientComponent(component.source)
  }

  for (const route of routes) {
    if (route.path === '/') {
      files['app/page.tsx'] = renderNextRoutePage(route, route.componentName, '../src/data/pages', '../src/components/' + route.componentName)
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

export function buildOpenUIExport(input: OpenUIExportInput): BuiltExport {
  const parsed = parseOpenUIForExport(input.source, input.siteSpecJson)

  if (input.target === 'html') {
    const documentHtml = buildStandaloneHtmlDocument(input, parsed)
    return {
      body: documentHtml,
      contentType: 'text/html; charset=utf-8',
      filename: 'index.html',
      fileCount: 1,
    }
  }

  return input.target === 'react'
    ? buildReactExport(input, parsed)
    : buildNextExport(input, parsed)
}

export const decodeExportBody = (body: string | Uint8Array): string =>
  typeof body === 'string' ? body : textDecoder.decode(body)
