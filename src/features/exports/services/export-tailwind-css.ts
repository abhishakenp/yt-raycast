import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, join, relative, resolve } from 'node:path'

type TailwindNodeModule = typeof import('@tailwindcss/node')
type TailwindOxideModule = typeof import('@tailwindcss/oxide')
type TailwindCompiler = Awaited<ReturnType<TailwindNodeModule['compile']>>
type TailwindCompilerContext = {
  compiler: TailwindCompiler
  Scanner: TailwindOxideModule['Scanner']
}

type TailwindVirtualSource = {
  contents: string
  extension?: string
  file?: string
}

type CompileTailwindOptions = {
  includeProjectSources?: boolean
}

export type AppCssSourceMap = Record<string, string | undefined>

type AppLocalCssImportOptions = {
  detachedDocument?: boolean
}

const appStylesPath = join(process.cwd(), 'src', 'styles.css')
const appStylesBase = dirname(appStylesPath)
const projectCandidateRoots = [
  join(process.cwd(), 'packages', 'ship-fast-blocks', 'src'),
  join(process.cwd(), 'src'),
]
const projectCandidateExtensions = new Set([
  '.html',
  '.js',
  '.jsx',
  '.mdx',
  '.ts',
  '.tsx',
])
const cssCompileBaseCandidates = [
  'min-h-screen',
  'bg-background',
  'text-foreground',
  'genui-preview',
  'size-full',
  'dark',
  'font-sans',
]
let tailwindCompilerPromise: Promise<TailwindCompilerContext> | undefined
const compiledCssCache = new Map<string, string>()

const runtimeImport = async <Module>(specifier: string): Promise<Module> =>
  import(/* @vite-ignore */ specifier) as Promise<Module>

const toPosixPath = (value: string): string => value.replaceAll('\\', '/')

const readCssSource = (
  path: string,
  sourceMap: AppCssSourceMap = {},
): string => {
  const absolutePath = resolve(path)
  const source =
    sourceMap[toPosixPath(relative(process.cwd(), absolutePath))] ??
    sourceMap[toPosixPath(path)] ??
    sourceMap[toPosixPath(absolutePath)]
  if (source !== undefined) return source
  return existsSync(absolutePath) ? readFileSync(absolutePath, 'utf8') : ''
}

const readAppStylesSource = (sourceMap: AppCssSourceMap = {}): string =>
  readCssSource(appStylesPath, sourceMap)

const loadTailwindCompiler = async (): Promise<TailwindCompilerContext> => {
  if (tailwindCompilerPromise === undefined) {
    tailwindCompilerPromise = Promise.all([
      runtimeImport<TailwindNodeModule>('@tailwindcss/node'),
      runtimeImport<TailwindOxideModule>('@tailwindcss/oxide'),
    ]).then(async ([{ compile }, { Scanner }]) => {
      const source = readAppStylesSource()
      if (!source) {
        throw new Error(`App Tailwind stylesheet not found at ${appStylesPath}`)
      }

      const compiler = await compile(source, {
        base: appStylesBase,
        from: appStylesPath,
        onDependency: () => {},
      })
      return {
        compiler,
        Scanner,
      }
    })
  }

  return tailwindCompilerPromise
}

const readClassCandidates = (markup: string): string[] => {
  const candidates = new Set(cssCompileBaseCandidates)
  const classAttributePattern =
    /\b(?:class(?:Name)?|[A-Za-z_$][\w$]*ClassName)\s*(?:=|:)\s*(['"`])([\s\S]*?)\1/g

  for (const match of markup.matchAll(classAttributePattern)) {
    const value = match[2]
    value
      ?.split(/\s+/)
      .map((candidate) => candidate.trim())
      .filter(Boolean)
      .forEach((candidate) => candidates.add(candidate))
  }

  return [...candidates].sort()
}

const fileExtension = (path: string): string => {
  const match = path.match(/(\.[^.\\/]+)$/)
  return match?.[1] ?? ''
}

const readProjectCandidateSources = (): TailwindVirtualSource[] => {
  const files: TailwindVirtualSource[] = []
  const visit = (directory: string): void => {
    if (!existsSync(directory)) return
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const absolutePath = join(directory, entry.name)
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist') continue
        visit(absolutePath)
        continue
      }
      if (!entry.isFile()) continue
      const extension = fileExtension(entry.name)
      if (!projectCandidateExtensions.has(extension)) continue
      files.push({
        contents: readFileSync(absolutePath, 'utf8'),
        extension: extension.slice(1),
        file: toPosixPath(relative(process.cwd(), absolutePath)),
      })
    }
  }
  projectCandidateRoots.forEach(visit)
  return files
}

const cssClassEscape = (value: string): string =>
  value.replace(/[^a-zA-Z0-9_-]/g, (char) => `\\${char}`)

const opacityToPercentage = (opacity: string): string => {
  const arbitrary = opacity.match(/^\[(.+)\]$/)?.[1]?.trim()
  const value = arbitrary ?? opacity
  if (value.endsWith('%')) return value

  const numeric = Number(value)
  if (Number.isFinite(numeric)) {
    const percent = numeric <= 1 ? numeric * 100 : numeric
    return `${Number(percent.toFixed(4))}%`
  }

  return `calc(${value} * 100%)`
}

const opacityColorValue = (
  token: string,
  opacity: string | undefined,
): string =>
  opacity === undefined
    ? `var(--${token})`
    : `color-mix(in oklab, var(--${token}) ${opacityToPercentage(opacity)}, transparent)`

const readThemeColorTokensFromCss = (source: string): string[] =>
  [...source.matchAll(/--color-([a-z][a-z0-9-]*)\s*:/g)]
    .map((match) => match[1])
    .filter((token): token is string => token !== undefined)

const readThemeColorTokensFromSources = (
  sources: TailwindVirtualSource[],
): Set<string> =>
  new Set(
    sources.flatMap((source) => readThemeColorTokensFromCss(source.contents)),
  )

const splitTailwindUtility = (
  candidate: string,
): { variants: string[]; utility: string } => {
  const parts = candidate.split(':')
  return {
    utility: parts.at(-1) ?? candidate,
    variants: parts.slice(0, -1),
  }
}

const themeTokenUtilityDeclaration = (
  utility: string,
  themeColorTokens: Set<string>,
): string | undefined => {
  const colorMatch = utility.match(
    /^(bg|text|border|decoration|outline|ring|shadow|from|via|to)-([a-z][a-z0-9-]*)(?:\/(\d{1,3}|\[[^\]]+\]))?$/,
  )
  if (!colorMatch) return undefined

  const [, kind, token, opacity] = colorMatch
  if (!kind || !token) return undefined
  if (!themeColorTokens.has(token)) return undefined

  const value = opacityColorValue(token, opacity)
  if (kind === 'bg') return `background-color: ${value};`
  if (kind === 'text') return `color: ${value};`
  if (kind === 'border') return `border-color: ${value};`
  if (kind === 'decoration') return `text-decoration-color: ${value};`
  if (kind === 'outline') return `outline-color: ${value};`
  if (kind === 'ring') return `--tw-ring-color: ${value};`
  if (kind === 'shadow') return `--tw-shadow-color: ${value};`
  if (kind === 'from') {
    return [
      `--tw-gradient-from: ${value};`,
      `--tw-gradient-to: color-mix(in oklab, ${value} 0%, transparent);`,
      '--tw-gradient-stops: var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position, 0%), var(--tw-gradient-to) var(--tw-gradient-to-position, 100%);',
    ].join(' ')
  }
  if (kind === 'via') {
    return [
      `--tw-gradient-via: ${value};`,
      '--tw-gradient-via-stops: var(--tw-gradient-position), var(--tw-gradient-from) var(--tw-gradient-from-position, 0%), var(--tw-gradient-via) var(--tw-gradient-via-position, 50%), var(--tw-gradient-to) var(--tw-gradient-to-position, 100%);',
      '--tw-gradient-stops: var(--tw-gradient-via-stops);',
    ].join(' ')
  }
  if (kind === 'to') return `--tw-gradient-to: ${value};`
  return undefined
}

const variantSelectorSuffix = (variant: string): string => {
  if (variant === 'hover') return ':hover'
  if (variant === 'active') return ':active'
  if (variant === 'focus') return ':focus'
  if (variant === 'focus-visible') return ':focus-visible'
  if (variant === 'disabled') return ':disabled'
  return ''
}

const responsiveVariantMediaQuery = (variant: string): string | undefined => {
  if (variant === 'sm') return '@media (min-width: 640px)'
  if (variant === 'md') return '@media (min-width: 768px)'
  if (variant === 'lg') return '@media (min-width: 1024px)'
  if (variant === 'xl') return '@media (min-width: 1280px)'
  if (variant === '2xl') return '@media (min-width: 1536px)'
  return undefined
}

const renderFallbackThemeUtilityRule = (
  candidate: string,
  themeColorTokens: Set<string>,
): string | undefined => {
  const { variants, utility } = splitTailwindUtility(candidate)
  const declaration = themeTokenUtilityDeclaration(utility, themeColorTokens)
  if (!declaration) return undefined

  const selectorSuffix = variants.map(variantSelectorSuffix).join('')
  const selector = `.${cssClassEscape(candidate)}${selectorSuffix}`
  const rule = `${selector} { ${declaration} }`
  return variants
    .map(responsiveVariantMediaQuery)
    .filter((query): query is string => query !== undefined)
    .reduceRight((body, query) => `${query} { ${body} }`, rule)
}

const buildFallbackThemeUtilityCss = (
  sources: TailwindVirtualSource[],
  extraCandidates: string[],
): string => {
  const candidates = new Set(cssCompileBaseCandidates)
  const themeColorTokens = readThemeColorTokensFromSources(sources)
  extraCandidates.forEach((candidate) => candidates.add(candidate))
  sources
    .flatMap((source) => readClassCandidates(source.contents))
    .forEach((candidate) => candidates.add(candidate))

  return [...candidates]
    .map((candidate) =>
      renderFallbackThemeUtilityRule(candidate, themeColorTokens),
    )
    .filter((rule): rule is string => rule !== undefined)
    .join('\n')
}

const scanVirtualSources = (
  Scanner: TailwindOxideModule['Scanner'],
  sources: TailwindVirtualSource[],
): string[] => {
  if (sources.length === 0) return []

  const scanner = new Scanner({ sources: [] })
  return scanner.scanFiles(
    sources.map((source, index) => ({
      file: source.file ?? `virtual-${index}.${source.extension ?? 'tsx'}`,
      extension: source.extension ?? 'tsx',
      content: source.contents,
    })),
  )
}

export const buildCompiledTailwindCssForSources = async (
  sources: TailwindVirtualSource[],
  extraCandidates: string[] = [],
  options: CompileTailwindOptions = {},
): Promise<string> => {
  const projectSources = options.includeProjectSources
    ? readProjectCandidateSources()
    : []
  const cacheKey = JSON.stringify({
    extraCandidates: [...extraCandidates].sort(),
    includeProjectSources: options.includeProjectSources === true,
    sources: [...sources, ...projectSources].map((source) => source.contents),
  })
  const cached = compiledCssCache.get(cacheKey)
  if (cached !== undefined) return cached

  try {
    const { compiler, Scanner } = await loadTailwindCompiler()
    const candidates = new Set(cssCompileBaseCandidates)
    extraCandidates.forEach((candidate) => candidates.add(candidate))
    ;[...sources, ...projectSources]
      .flatMap((source) => readClassCandidates(source.contents))
      .forEach((candidate) => candidates.add(candidate))
    scanVirtualSources(Scanner, [...sources, ...projectSources]).forEach(
      (candidate) => candidates.add(candidate),
    )
    const css = [
      compiler.build([...candidates]),
      buildFallbackThemeUtilityCss(
        [...sources, ...projectSources],
        [...candidates],
      ),
    ]
      .filter(Boolean)
      .join('\n')
    compiledCssCache.set(cacheKey, css)
    return css
  } catch {
    const css = buildFallbackThemeUtilityCss(
      [...sources, ...projectSources],
      extraCandidates,
    )
    compiledCssCache.set(cacheKey, css)
    return css
  }
}

export const buildCompiledTailwindCssForMarkup = async (
  markup: string,
): Promise<string> =>
  buildCompiledTailwindCssForSources(
    [{ contents: markup, extension: 'html' }],
    [...readClassCandidates(markup)],
    { includeProjectSources: true },
  )

const localCssImportPattern =
  /@import\s+(?:url\()?['"]([^'"]+\.css)['"]\)?\s*;/g

const stripCssComments = (value: string): string =>
  value.replace(/\/\*[\s\S]*?\*\//g, '')

const normalizedTopLevelSelectors = (prelude: string): string[] =>
  stripCssComments(prelude)
    .trim()
    .split(',')
    .map((selector) => selector.trim())
    .filter(Boolean)

const topLevelCssRules = (
  source: string,
  predicate: (prelude: string) => boolean,
): string[] => {
  const rules: string[] = []
  let ruleStart = 0

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === ';') {
      ruleStart = index + 1
      continue
    }
    if (char !== '{') continue

    const prelude = source.slice(ruleStart, index)
    let depth = 1
    let endIndex = index
    let quote: '"' | "'" | null = null
    let inComment = false

    for (endIndex = index + 1; endIndex < source.length; endIndex += 1) {
      const current = source[endIndex]
      const next = source[endIndex + 1]
      if (inComment) {
        if (current === '*' && next === '/') {
          inComment = false
          endIndex += 1
        }
        continue
      }
      if (quote) {
        if (current === '\\') {
          endIndex += 1
          continue
        }
        if (current === quote) quote = null
        continue
      }
      if (current === '/' && next === '*') {
        inComment = true
        endIndex += 1
        continue
      }
      if (current === '"' || current === "'") {
        quote = current
        continue
      }
      if (current === '{') {
        depth += 1
        continue
      }
      if (current === '}') {
        depth -= 1
        if (depth === 0) break
      }
    }

    if (predicate(prelude)) {
      rules.push(source.slice(ruleStart, endIndex + 1).trim())
    }
    ruleStart = endIndex + 1
    index = endIndex
  }

  return rules.filter(Boolean)
}

const withoutTopLevelCssRules = (
  source: string,
  predicate: (prelude: string) => boolean,
): string => {
  let output = ''
  let copyStart = 0
  let ruleStart = 0

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index]
    if (char === ';') {
      ruleStart = index + 1
      continue
    }
    if (char !== '{') continue

    const prelude = source.slice(ruleStart, index)
    let depth = 1
    let endIndex = index
    let quote: '"' | "'" | null = null
    let inComment = false

    for (endIndex = index + 1; endIndex < source.length; endIndex += 1) {
      const current = source[endIndex]
      const next = source[endIndex + 1]
      if (inComment) {
        if (current === '*' && next === '/') {
          inComment = false
          endIndex += 1
        }
        continue
      }
      if (quote) {
        if (current === '\\') {
          endIndex += 1
          continue
        }
        if (current === quote) quote = null
        continue
      }
      if (current === '/' && next === '*') {
        inComment = true
        endIndex += 1
        continue
      }
      if (current === '"' || current === "'") {
        quote = current
        continue
      }
      if (current === '{') {
        depth += 1
        continue
      }
      if (current === '}') {
        depth -= 1
        if (depth === 0) break
      }
    }

    if (predicate(prelude)) {
      output += source.slice(copyStart, ruleStart)
      copyStart = endIndex + 1
    }
    ruleStart = endIndex + 1
    index = endIndex
  }

  output += source.slice(copyStart)
  return output.replace(/\n{3,}/g, '\n\n').trim()
}

const isGlobalBodyRule = (prelude: string): boolean => {
  const selectors = normalizedTopLevelSelectors(prelude)
  return (
    selectors.length > 0 && selectors.every((selector) => selector === 'body')
  )
}

const appBaseResetSelectors = new Set([
  '*',
  ':root',
  'html',
  'body',
  '#app',
  '#root',
  '#__root',
])

const isAppBaseResetRule = (prelude: string): boolean => {
  const selectors = normalizedTopLevelSelectors(prelude)
  return (
    selectors.length > 0 &&
    selectors.every((selector) => appBaseResetSelectors.has(selector))
  )
}

const readLocalCssImport = (
  path: string,
  seen: Set<string>,
  sourceMap: AppCssSourceMap,
  options: AppLocalCssImportOptions,
): string => {
  const absolutePath = resolve(path)
  if (seen.has(absolutePath)) return ''

  seen.add(absolutePath)
  const source = readCssSource(absolutePath, sourceMap)
  if (!source) return ''
  const nestedImports = [...source.matchAll(localCssImportPattern)]
    .map((match) => match[1])
    .filter((specifier): specifier is string => specifier !== undefined)
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) =>
      readLocalCssImport(
        join(dirname(absolutePath), specifier),
        seen,
        sourceMap,
        options,
      ),
    )
    .filter(Boolean)

  const importedSource = options.detachedDocument
    ? withoutTopLevelCssRules(source, isGlobalBodyRule)
    : source
  const withoutImports = importedSource
    .replace(localCssImportPattern, '')
    .trim()
  return [...nestedImports, withoutImports].filter(Boolean).join('\n\n')
}

export const readAppLocalCssImports = (
  sourceMap: AppCssSourceMap = {},
  options: AppLocalCssImportOptions = {},
): string => {
  const source = readAppStylesSource(sourceMap)
  if (!source) return ''

  const seen = new Set<string>()
  return [...source.matchAll(localCssImportPattern)]
    .map((match) => match[1])
    .filter((specifier): specifier is string => specifier !== undefined)
    .filter((specifier) => specifier.startsWith('.'))
    .map((specifier) =>
      readLocalCssImport(
        join(appStylesBase, specifier),
        seen,
        sourceMap,
        options,
      ),
    )
    .filter(Boolean)
    .join('\n\n')
}

export const readAppTailwindBaseThemeCss = (
  sourceMap: AppCssSourceMap = {},
): string => {
  const source = readAppStylesSource(sourceMap)
  if (!source) return ''

  const declarations = ['sans', 'serif', 'mono']
    .map((key) => source.match(new RegExp(`--font-${key}:\\s*([^;]+);`)))
    .map((match) => match?.[0])
    .filter((value): value is string => value !== undefined)

  const fontRule =
    declarations.length > 0
      ? `:root {\n${declarations.map((value) => `  ${value}`).join('\n')}\n}`
      : ''
  const baseRules = topLevelCssRules(source, isAppBaseResetRule)

  return [fontRule, ...baseRules].filter(Boolean).join('\n\n')
}
