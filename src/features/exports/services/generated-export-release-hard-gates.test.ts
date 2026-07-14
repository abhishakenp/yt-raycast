import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { join, posix, relative } from 'node:path'

import { build } from 'esbuild'
import { JSDOM } from 'jsdom'
import ts from 'typescript'
import { beforeAll, describe, expect, it } from 'vitest'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

type AuditedTarget = 'react' | 'next' | 'lakebed'
type BrowserTarget = 'next' | 'react'
type LocalizedTarget = 'html' | 'lakebed' | 'next' | 'react'
type ArtifactFiles = Record<string, string>
type ArtifactEntry<Target extends string> = {
  files: ArtifactFiles
  target: Target
}

const fixtureSource = readFileSync(
  posix.join(
    process.cwd(),
    '__fixtures__/openui-sources/pizza-ecommerce.openui',
  ),
  'utf8',
)
const bakerySource = `home_navbar = BakeryNavbar({"brand":"Sweet Crumb Bakery","nav":["Home","Menu"],"cartCount":"0"})
home_navbar_anchor = SectionAnchor("home_navbar", home_navbar)
home_menu = BakeryMenu({"heading":"Our Daily Menu","addLabel":"Add to Cart","breads":[],"pastries":[{"name":"Chocolate Chip Cookie","description":"Brown butter and dark chocolate","price":"$4"}],"cakes":[]})
home_menu_anchor = SectionAnchor("home_menu", home_menu, "scroll-mt-28")
home = Stack([home_navbar_anchor, home_menu_anchor])
root = PageSwitch(["Home"], [home], "", {"Home":"Home","Menu":"Home#home_menu"})`
const hindiHome = '\u0939\u094b\u092e'
const hindiMenu = '\u092e\u0947\u0928\u0942'
const localizedSource = `home_text = Text("${hindiHome}")
home = Stack([home_text])
menu_text = Text("${hindiMenu}")
menu = Stack([menu_text])
root = PageSwitch(["${hindiHome}","${hindiMenu}"], [home,menu], "", {"${hindiHome}":"Home#home_text","${hindiMenu}":"Menu#menu_text"})`
const hindiNameKey = '\u0928\u093e\u092e'
const hindiPriceKey = '\u092e\u0942\u0932\u094d\u092f'
const translatedStructuralSource = `menu = BakeryMenu({"heading":"${hindiMenu}","pastries":[{"${hindiNameKey}":"Chocolate Chip Cookie","description":"Brown butter and dark chocolate","${hindiPriceKey}":"$4"}]})
home = Stack([menu])
root = PageSwitch(["${hindiHome}"], [home], "", {"${hindiHome}":"Home"})`

const hindiShop = '\u0926\u0941\u0915\u093e\u0928'
const hindiBrowseMenu =
  '\u092e\u0947\u0928\u0942 \u0926\u0947\u0916\u0947\u0902'
const hindiBuyNow = '\u0905\u092d\u0940 \u0916\u0930\u0940\u0926\u0947\u0902'
const hindiAddToCart =
  '\u0915\u093e\u0930\u094d\u091f \u092e\u0947\u0902 \u091c\u094b\u0921\u093c\u0947\u0902'
const hindiCart = '\u0915\u093e\u0930\u094d\u091f'
const hindiSignIn = '\u0938\u093e\u0907\u0928 \u0907\u0928'
const hindiSubscribe =
  '\u0938\u0926\u0938\u094d\u092f\u0924\u093e \u0932\u0947\u0902'
const hindiCookie =
  '\u091a\u0949\u0915\u0932\u0947\u091f \u091a\u093f\u092a \u0915\u0941\u0915\u0940'

type InteractiveLabels = {
  addToCart: string
  browseMenu: string
  buyNow: string
  cart: string
  home: string
  item: string
  shop: string
  signIn: string
  subscribe: string
}

const englishInteractiveLabels: InteractiveLabels = {
  addToCart: 'Add to cart',
  browseMenu: 'Browse menu',
  buyNow: 'Buy now',
  cart: 'Cart',
  home: 'Home',
  item: 'Chocolate Chip Cookie',
  shop: 'Shop',
  signIn: 'Sign in',
  subscribe: 'Subscribe',
}

const hindiInteractiveLabels: InteractiveLabels = {
  addToCart: hindiAddToCart,
  browseMenu: hindiBrowseMenu,
  buyNow: hindiBuyNow,
  cart: hindiCart,
  home: hindiHome,
  item: hindiCookie,
  shop: hindiShop,
  signIn: hindiSignIn,
  subscribe: hindiSubscribe,
}

const shinyAccountButtonClass =
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group/shiny relative overflow-hidden bg-primary text-primary-foreground shadow-lg transition-shadow duration-300 hover:shadow-xl h-9 px-3 gap-2'
const shinySweepClass =
  'absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/10 to-transparent transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/shiny:translate-x-full'

function createInteractiveSource(labels: InteractiveLabels): string {
  const targetMap = {
    [labels.browseMenu]: labels.shop,
    [labels.buyNow]: labels.shop,
    [labels.home]: labels.home,
    [labels.shop]: labels.shop,
  }
  return `home_text = Text(${JSON.stringify(labels.home)})
home = Stack([home_text])
shop_text = Text(${JSON.stringify(labels.shop)})
shop = Stack([shop_text])
root = PageSwitch(${JSON.stringify([labels.home, labels.shop])}, [home, shop], "", ${JSON.stringify(targetMap)})`
}

function createInteractivePreviewHtml(
  labels: InteractiveLabels,
  isDark: boolean,
): string {
  return `<!doctype html>
<html lang="${labels === hindiInteractiveLabels ? 'hi' : 'en'}">
<head><title>Interactive export parity fixture</title></head>
<body>
  <div id="openui-root" data-preview-contract="interactive-v1" class="genui-preview size-full bg-background${isDark ? ' dark' : ''}" style="color-scheme: ${isDark ? 'dark' : 'light'}">
    <section data-sf-export-page="${labels.home}" data-preview-key="page-home">
      <header data-preview-key="header" data-tsd-source="/packages/ship-fast-blocks/src/registry/sections/gov-portal/GovPortalNavbar.tsx:229:5">
        <button id="nav-home" data-contract="nav-home" type="button">${labels.home}</button>
        <button id="nav-shop" data-contract="nav-shop" type="button">${labels.shop}</button>
        <button id="sign-in" data-contract="sign-in" data-slot="account-dropdown-unauthenticated" class="${shinyAccountButtonClass}" type="button">
          <span aria-hidden="true" class="${shinySweepClass}"></span>
          <span class="relative">${labels.signIn}</span>
        </button>
        <button id="cart-open" data-contract="cart-open" type="button" aria-label="${labels.cart}" aria-haspopup="dialog" aria-expanded="false">
          ${labels.cart} <span data-cart-count="true">0</span>
        </button>
      </header>
      <main data-preview-key="home-main">
        <button id="browse-menu" data-contract="browse-menu" type="button">${labels.browseMenu}</button>
        <button id="buy-now" data-contract="buy-now" type="button">${labels.buyNow}</button>
        <article data-item-key="cookie">
          <h2>${labels.item}</h2>
          <button id="add-cookie-home" data-contract="add-cart" data-item-key="cookie" data-item-label="${labels.item}" data-item-price="$4" type="button">${labels.addToCart}</button>
        </article>
        <form id="newsletter" data-contract="newsletter">
          <label>Email <input name="email" type="email" value="release@example.com"></label>
          <button id="subscribe" data-contract="subscribe" type="submit">${labels.subscribe}</button>
          <output aria-live="polite"></output>
        </form>
      </main>
    </section>
    <section data-sf-export-page="${labels.shop}" data-preview-key="page-shop" hidden>
      <button id="shop-nav-home" data-contract="shop-nav-home" type="button">${labels.home}</button>
      <article data-item-key="cookie-shop">
        <h2>${labels.item}</h2>
        <button id="add-cookie-shop" data-contract="add-cart-shop" data-item-key="cookie" data-item-label="${labels.item}" data-item-price="$4" type="button">${labels.addToCart}</button>
      </article>
    </section>
    <aside id="cart-dialog" data-contract="cart-dialog" role="dialog" aria-label="${labels.cart}" hidden>
      <h2>${labels.cart}</h2>
      <div data-cart-items="true"></div>
    </aside>
  </div>
</body>
</html>`
}

const medusaBackendUrl = 'https://medusa.release-gate.example'
const medusaStorefrontUrl = 'https://storefront.release-gate.example'
const syncSecret = 'release-gate-sync-secret-9b31f58d'
const seededProductLabel = 'Release Gate Sourdough'

const siteSpecJson = JSON.stringify({
  projectName: 'Release Gate Commerce Export',
  commerce: {
    adminUrl: 'https://admin.release-gate.example',
    backendUrl: medusaBackendUrl,
    configId: 'release-gate-medusa',
    configJson: '{}',
    productCount: 1,
    status: 'ready',
    storefrontUrl: medusaStorefrontUrl,
  },
})

const targets: readonly AuditedTarget[] = ['react', 'next', 'lakebed']
const browserTargets: readonly BrowserTarget[] = ['react', 'next']
const localizedTargets: readonly LocalizedTarget[] = [
  'react',
  'next',
  'html',
  'lakebed',
]
const targetLabel: Record<AuditedTarget, string> = {
  lakebed: 'Lakebed',
  next: 'Next.js',
  react: 'React',
}

let artifacts: Record<AuditedTarget, ArtifactFiles>
let derivedBakeryLakebedFiles: ArtifactFiles
let localizedArtifacts: Record<
  'html' | 'lakebed' | 'next' | 'react',
  ArtifactFiles
>
let localizedLightHtmlFiles: ArtifactFiles
let translatedStructuralArtifacts: Record<'next' | 'react', ArtifactFiles>
let lakebedAdapterHarness = ''
let reactMutationHarness = ''

type InteractiveHtmlCase = {
  files: ArtifactFiles
  isDark: boolean
  labels: InteractiveLabels
  name: 'dark-en' | 'dark-hi' | 'light-en'
  previewHtml: string
}

type InteractiveConfiguration = {
  isDark: boolean
  labels: InteractiveLabels
  locale: 'en' | 'hi'
  name: InteractiveHtmlCase['name']
}

let interactiveHtmlCases: InteractiveHtmlCase[] = []

const interactiveCaseNames: readonly InteractiveHtmlCase['name'][] = [
  'dark-en',
  'light-en',
  'dark-hi',
]

function interactiveCaseByName(
  name: InteractiveHtmlCase['name'],
): InteractiveHtmlCase {
  const match = interactiveHtmlCases.find(
    (candidate) => candidate.name === name,
  )
  if (!match) throw new Error(`Missing interactive HTML case: ${name}`)
  return match
}

function artifactFilesFor<Target extends string>(
  entries: readonly ArtifactEntry<Target>[],
  target: Target,
): ArtifactFiles {
  const match = entries.find((entry) => entry.target === target)
  if (!match) throw new Error(`Missing generated artifact: ${target}`)
  return match.files
}

function lineHits(
  files: ArtifactFiles,
  pattern: RegExp,
  includePaths = true,
): string[] {
  const hits: string[] = []
  for (const [path, content] of Object.entries(files).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (includePaths && pattern.test(path)) hits.push(`${path}:<path>`)
    pattern.lastIndex = 0
    for (const [index, line] of content.split('\n').entries()) {
      if (!pattern.test(line)) continue
      hits.push(`${path}:${index + 1}:${line.trim().slice(0, 240)}`)
      pattern.lastIndex = 0
    }
  }
  return hits
}

function expectNoHits(
  files: ArtifactFiles,
  pattern: RegExp,
  gate: string,
  includePaths = true,
): void {
  const hits = lineHits(files, pattern, includePaths)
  expect(hits, `${gate}\n${hits.join('\n')}`).toEqual([])
}

function packageName(specifier: string): string {
  return specifier.startsWith('@')
    ? specifier.split('/').slice(0, 2).join('/')
    : (specifier.split('/')[0] ?? specifier)
}

function scriptKindForPath(path: string): ts.ScriptKind {
  if (path.endsWith('.tsx')) return ts.ScriptKind.TSX
  if (path.endsWith('.jsx')) return ts.ScriptKind.JSX
  if (path.endsWith('.js') || path.endsWith('.mjs')) return ts.ScriptKind.JS
  return ts.ScriptKind.TS
}

function sourceFileFor(path: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    path,
    content,
    ts.ScriptTarget.Latest,
    true,
    scriptKindForPath(path),
  )
}

function sourcePaths(files: ArtifactFiles): string[] {
  return Object.keys(files).filter((path) => /\.(?:[cm]?[jt]sx?)$/.test(path))
}

function ownedSourcePaths(files: ArtifactFiles): string[] {
  return sourcePaths(files).filter(
    (path) => !path.includes('/vendor/') && !path.endsWith('.d.ts'),
  )
}

function moduleSpecifiers(path: string, content: string): string[] {
  const sourceFile = sourceFileFor(path, content)
  const specifiers: string[] = []
  function visit(node: ts.Node): void {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      specifiers.push(node.moduleSpecifier.text)
    }
    if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return specifiers
}

function relativeCandidates(from: string, specifier: string): string[] {
  const base = posix.normalize(posix.join(posix.dirname(from), specifier))
  const withoutJsExtension = base.replace(/\.(?:m?js|jsx)$/, '')
  return [
    base,
    withoutJsExtension,
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css'].map(
      (extension) => `${withoutJsExtension}${extension}`,
    ),
    ...['.ts', '.tsx', '.js', '.jsx', '.mjs'].map((extension) =>
      posix.join(withoutJsExtension, `index${extension}`),
    ),
  ]
}

function resolveRelativeImport(
  files: ArtifactFiles,
  from: string,
  specifier: string,
): string | null {
  return (
    relativeCandidates(from, specifier).find(
      (candidate) => candidate in files,
    ) ?? null
  )
}

function unresolvedRelativeImports(files: ArtifactFiles): string[] {
  return sourcePaths(files).flatMap((path) =>
    moduleSpecifiers(path, files[path] ?? '')
      .filter((specifier) => specifier.startsWith('.'))
      .filter(
        (specifier) => resolveRelativeImport(files, path, specifier) === null,
      )
      .map((specifier) => `${path} -> ${specifier}`),
  )
}

function isUnknownRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function isDefinedString(value: string | undefined): value is string {
  return value !== undefined
}

function parseJsonRecord(source: string | undefined): Record<string, unknown> {
  if (!source) return {}
  const parsed: unknown = JSON.parse(source)
  return isUnknownRecord(parsed) ? parsed : {}
}

function readStringRecord(value: unknown): Record<string, string> {
  if (!isUnknownRecord(value)) return {}
  const result: Record<string, string> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') result[key] = entry
  }
  return result
}

function unmanifestedBareImports(
  files: ArtifactFiles,
  allowedPlatformPackages: ReadonlySet<string> = new Set(),
): string[] {
  const manifest = parseJsonRecord(files['package.json'])
  const dependencies = readStringRecord(manifest.dependencies)
  const devDependencies = readStringRecord(manifest.devDependencies)
  const declared = new Set([
    ...Object.keys(dependencies),
    ...Object.keys(devDependencies),
  ])
  return sourcePaths(files).flatMap((path) =>
    moduleSpecifiers(path, files[path] ?? '')
      .filter(
        (specifier) =>
          !specifier.startsWith('.') &&
          !specifier.startsWith('node:') &&
          !declared.has(packageName(specifier)) &&
          !allowedPlatformPackages.has(packageName(specifier)),
      )
      .map((specifier) => `${path} -> ${specifier}`),
  )
}

function forbiddenTypeSyntaxLocations(files: ArtifactFiles): string[] {
  const locations: string[] = []
  for (const path of ownedSourcePaths(files)) {
    const sourceFile = sourceFileFor(path, files[path] ?? '')

    function isDirectUseCallbackArgument(
      node: ts.ArrowFunction | ts.FunctionExpression,
    ): boolean {
      const parent = node.parent
      if (!ts.isCallExpression(parent) || parent.arguments[0] !== node) {
        return false
      }

      const callee = parent.expression
      if (ts.isIdentifier(callee)) return callee.text === 'useCallback'

      return (
        ts.isPropertyAccessExpression(callee) &&
        ts.isIdentifier(callee.expression) &&
        callee.expression.text === 'React' &&
        callee.name.text === 'useCallback'
      )
    }

    function visit(node: ts.Node): void {
      let violation: string | null = null
      if (node.kind === ts.SyntaxKind.AnyKeyword) violation = 'explicit-any'
      if (ts.isAsExpression(node)) violation = 'as-expression'
      if (ts.isTypeAssertionExpression(node)) violation = 'type-assertion'
      if (ts.isNonNullExpression(node)) violation = 'non-null-expression'
      if (
        (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) &&
        !isDirectUseCallbackArgument(node) &&
        (node.type !== undefined ||
          node.parameters.some((parameter) => parameter.type !== undefined))
      ) {
        violation = 'typed-anonymous-function'
      }
      if (violation) {
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(),
        )
        locations.push(
          `${path}:${position.line + 1}:${position.character + 1}:${violation}`,
        )
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return locations
}

function nonAsciiStructuralNames(files: ArtifactFiles): string[] {
  const locations: string[] = []
  for (const path of ownedSourcePaths(files)) {
    const sourceFile = sourceFileFor(path, files[path] ?? '')
    function visit(node: ts.Node): void {
      let value: string | null = null
      if (ts.isIdentifier(node)) value = node.text
      if (
        (ts.isPropertyAssignment(node) ||
          ts.isPropertyDeclaration(node) ||
          ts.isMethodDeclaration(node)) &&
        (ts.isIdentifier(node.name) || ts.isStringLiteralLike(node.name))
      ) {
        value = node.name.text
      }
      if (
        value &&
        [...value].some((character) => (character.codePointAt(0) ?? 0) > 127)
      ) {
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(),
        )
        locations.push(
          `${path}:${position.line + 1}:${position.character + 1}:${value}`,
        )
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return [...new Set(locations)]
}

function parseFailures(files: ArtifactFiles): string[] {
  return ownedSourcePaths(files).flatMap((path) => {
    const result = ts.transpileModule(files[path] ?? '', {
      compilerOptions: {
        jsx: ts.JsxEmit.ReactJSX,
        module: ts.ModuleKind.ESNext,
        target: ts.ScriptTarget.ES2022,
      },
      fileName: path,
      reportDiagnostics: true,
    })
    return (result.diagnostics ?? [])
      .filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      )
      .map(
        (diagnostic) =>
          `${path}: ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`,
      )
  })
}

function typecheckGeneratedProject(
  target: 'next' | 'react',
  files: ArtifactFiles,
): string[] {
  const directory = mkdtempSync(join(tmpdir(), `${target}-typecheck-gate-`))
  try {
    writeArtifactFiles(files, directory)
    symlinkSync(
      join(process.cwd(), 'node_modules'),
      join(directory, 'node_modules'),
      'dir',
    )
    const configPath = join(directory, 'tsconfig.json')
    const config = ts.readConfigFile(configPath, ts.sys.readFile)
    if (config.error) {
      return [ts.flattenDiagnosticMessageText(config.error.messageText, '\n')]
    }
    const parsed = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      directory,
      { noEmit: true, skipLibCheck: true },
      configPath,
    )
    const program = ts.createProgram({
      options: parsed.options,
      rootNames: parsed.fileNames,
    })
    return ts
      .getPreEmitDiagnostics(program)
      .filter(
        (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
      )
      .map((diagnostic) => {
        const message = ts.flattenDiagnosticMessageText(
          diagnostic.messageText,
          '\n',
        )
        if (!diagnostic.file) return message
        const position = diagnostic.file.getLineAndCharacterOfPosition(
          diagnostic.start ?? 0,
        )
        return `${relative(directory, diagnostic.file.fileName)}:${position.line + 1}:${position.character + 1} ${message}`
      })
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

function htmlCssCoverage(html: string) {
  const dom = new JSDOM(html)
  try {
    const css = [...domDocument(dom).querySelectorAll('style')]
      .map((style) => style.textContent ?? '')
      .join('\n')
    const classes = [
      ...new Set(
        [...domDocument(dom).querySelectorAll('[class]')].flatMap((element) =>
          (element.getAttribute('class') ?? '').split(/\s+/).filter(Boolean),
        ),
      ),
    ].sort()
    const missingClasses = classes.filter((className) => {
      const escaped = className.replace(/([^A-Za-z0-9_-])/g, '\\$1')
      return !css.includes(`.${escaped}`) && !css.includes(`.${className}`)
    })
    return {
      classes,
      css,
      missingClasses,
      ruleCount: css.match(/{/g)?.length ?? 0,
    }
  } finally {
    dom.window.close()
  }
}

type RouteManifestEntry = {
  component: string
  label: string
  path: string
}

function routeManifest(
  target: AuditedTarget,
  files: ArtifactFiles,
): RouteManifestEntry[] {
  const path = target === 'lakebed' ? 'client/routes.ts' : 'src/data/pages.ts'
  const sourceFile = sourceFileFor(path, files[path] ?? '')
  const entries: RouteManifestEntry[] = []
  function visit(node: ts.Node): void {
    if (ts.isArrayLiteralExpression(node)) {
      for (const element of node.elements) {
        if (!ts.isObjectLiteralExpression(element)) continue
        const values = new Map<string, string>()
        for (const property of element.properties) {
          if (
            !ts.isPropertyAssignment(property) ||
            !ts.isStringLiteralLike(property.initializer)
          ) {
            continue
          }
          const name = propertyName(property.name)
          if (name) values.set(name, property.initializer.text)
        }
        const label = values.get('label')
        const routePath = values.get('path')
        const component = values.get('component') ?? values.get('componentName')
        if (label && routePath && component) {
          entries.push({ component, label, path: routePath })
        }
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return entries.sort((left, right) => left.path.localeCompare(right.path))
}

function routeComponentNames(
  target: AuditedTarget,
  files: ArtifactFiles,
): string[] {
  const prefix = target === 'lakebed' ? 'client/components/' : 'src/components/'
  return Object.keys(files)
    .filter((path) => path.startsWith(prefix))
    .map((path) => path.slice(prefix.length))
    .filter((path) => !path.includes('/') && path.endsWith('.tsx'))
    .sort()
}

function cssVariableValues(source: string, variable: string): string[] {
  return [
    ...new Set(
      [
        ...source.matchAll(new RegExp(`--${variable}:\\s*([^;}\\n]+)`, 'g')),
      ].map((match) => (match[1] ?? '').trim()),
    ),
  ]
}

function isNamedPropertyAssignment(
  property: ts.ObjectLiteralElementLike,
  expectedName: string,
): property is ts.PropertyAssignment {
  return (
    ts.isPropertyAssignment(property) &&
    propertyName(property.name) === expectedName
  )
}

function tanstackQueryContractViolations(files: ArtifactFiles): string[] {
  const violations: string[] = []
  for (const path of sourcePaths(files)) {
    const content = files[path] ?? ''
    if (
      !content.includes('@tanstack/react-query') &&
      !content.includes('useKeyedMutation')
    ) {
      continue
    }
    const sourceFile = sourceFileFor(path, content)
    function visit(node: ts.Node): void {
      if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
        const callName = node.expression.text
        if (callName === 'useQuery') {
          const options = node.arguments[0]
          const queryKey =
            options && ts.isObjectLiteralExpression(options)
              ? options.properties.find((property) =>
                  isNamedPropertyAssignment(property, 'queryKey'),
                )
              : undefined
          const key = queryKey?.initializer
          if (
            !key ||
            !ts.isArrayLiteralExpression(key) ||
            key.elements.length === 0 ||
            key.elements.some((element) => !ts.isStringLiteralLike(element))
          ) {
            violations.push(`${path}: useQuery lacks a stable literal queryKey`)
          }
        }
        if (callName === 'useMutation') {
          const options = node.arguments[0]
          const hasOnSuccess =
            options &&
            ts.isObjectLiteralExpression(options) &&
            options.properties.some(
              (property) =>
                ts.isPropertyAssignment(property) &&
                propertyName(property.name) === 'onSuccess',
            )
          if (!hasOnSuccess) {
            violations.push(`${path}: useMutation lacks invalidation onSuccess`)
          }
        }
        if (callName === 'useKeyedMutation' && node.arguments.length < 2) {
          violations.push(
            `${path}: useKeyedMutation omits exact invalidation keys`,
          )
        }
      }
      if (
        ts.isCallExpression(node) &&
        ts.isPropertyAccessExpression(node.expression) &&
        node.expression.name.text === 'invalidateQueries'
      ) {
        const filters = node.arguments[0]
        const queryKey =
          filters && ts.isObjectLiteralExpression(filters)
            ? filters.properties.find((property) =>
                isNamedPropertyAssignment(property, 'queryKey'),
              )
            : undefined
        if (!queryKey || !ts.isArrayLiteralExpression(queryKey.initializer)) {
          violations.push(`${path}: invalidateQueries is blanket or keyless`)
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(sourceFile)
  }
  return [...new Set(violations)].sort()
}

function deadOwnedSourceFiles(
  target: AuditedTarget,
  files: ArtifactFiles,
): string[] {
  const owned = new Set(ownedSourcePaths(files))
  const entries =
    target === 'react'
      ? ['src/main.tsx', 'vite.config.ts']
      : target === 'next'
        ? [...owned].filter(
            (path) =>
              path.startsWith('app/') ||
              path === 'next.config.mjs' ||
              path === 'postcss.config.mjs',
          )
        : ['client/index.tsx', 'server/index.ts']
  const reachable = new Set<string>()
  const pending = entries.filter((entry) => owned.has(entry))
  while (pending.length > 0) {
    const path = pending.pop()
    if (!path || reachable.has(path)) continue
    reachable.add(path)
    for (const specifier of moduleSpecifiers(path, files[path] ?? '')) {
      if (!specifier.startsWith('.')) continue
      const resolved = resolveRelativeImport(files, path, specifier)
      if (resolved && owned.has(resolved) && !reachable.has(resolved)) {
        pending.push(resolved)
      }
    }
  }
  return [...owned].filter((path) => !reachable.has(path)).sort()
}

function writeArtifactFiles(files: ArtifactFiles, directory: string): void {
  for (const [path, content] of Object.entries(files)) {
    const absolutePath = join(directory, path)
    mkdirSync(join(absolutePath, '..'), { recursive: true })
    writeFileSync(absolutePath, content)
  }
}

async function buildReactMutationHarness(
  files: ArtifactFiles,
): Promise<string> {
  const directory = mkdtempSync(join(tmpdir(), 'react-mutation-gate-'))
  try {
    writeArtifactFiles(files, directory)
    const harnessPath = join(directory, 'mutation-harness.tsx')
    writeFileSync(
      harnessPath,
      `import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
import { addItemAction, getCartSummary } from './src/lib/store.ts'
import { useKeyedMutation } from './src/lib/use-keyed-mutation.ts'

const runtime = globalThis
const queryClient = new QueryClient()
Reflect.set(queryClient, 'invalidateQueries', async (filters) => {
  ;(runtime.__invalidatedQueryKeys ??= []).push(filters?.queryKey ?? null)
})

function Harness() {
  const mutation = useKeyedMutation(
    async (...args) => {
      runtime.__receivedMutationArgs = args
      const result = await addItemAction(...args)
      runtime.__cartSummary = await getCartSummary()
      return result
    },
    [['cartSummary'], ['productCatalog']],
  )
  return (
    <button
      id="add-cookie-react"
      onClick={() =>
        void mutation.run('cookie', {
          itemKey: 'cookie',
          label: 'Chocolate Chip Cookie',
          price: '$4',
        })
      }
      type="button"
    >
      Add to Cart Chocolate Chip Cookie
    </button>
  )
}

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <Harness />
  </QueryClientProvider>,
)
`,
    )
    const result = await build({
      bundle: true,
      entryPoints: [harnessPath],
      format: 'iife',
      jsx: 'automatic',
      jsxImportSource: 'react',
      logLevel: 'silent',
      nodePaths: [join(process.cwd(), 'node_modules')],
      platform: 'browser',
      target: 'es2022',
      write: false,
    })
    const output = result.outputFiles[0]
    if (!output)
      throw new Error('React mutation harness did not produce output')
    return output.text
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

async function runReactMutationHarness() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    pretendToBeVisual: true,
    runScripts: 'outside-only',
    url: 'https://release-gate.example/',
  })
  Reflect.set(dom.window, '__invalidatedQueryKeys', [])
  dom.window.eval(reactMutationHarness)
  await new Promise((resolve) => setTimeout(resolve, 0))
  await new Promise((resolve) => setTimeout(resolve, 0))
  return dom
}

function unresolvedLakebedServerNames(files: ArtifactFiles): string[] {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-server-gate-'))
  const serverPath = join(directory, 'server', 'index.ts')
  const platformTypesPath = join(directory, 'lakebed-server.d.ts')
  try {
    writeArtifactFiles(
      { 'server/index.ts': files['server/index.ts'] ?? '' },
      directory,
    )
    writeFileSync(
      platformTypesPath,
      `declare module 'lakebed/server' {
  interface SchemaBuilder { default(value: unknown): SchemaBuilder }
  export function capsule(value: unknown): unknown
  export function endpoint(value: unknown): unknown
  export function mutation(callback: Function): unknown
  export function number(): SchemaBuilder
  export function query(callback: Function): unknown
  export function string(): SchemaBuilder
  export function table(value: unknown): SchemaBuilder
}
`,
    )
    const program = ts.createProgram({
      options: {
        lib: ['lib.es2022.d.ts', 'lib.dom.d.ts'],
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        noEmit: true,
        noImplicitAny: false,
        skipLibCheck: true,
        target: ts.ScriptTarget.ES2022,
      },
      rootNames: [serverPath, platformTypesPath],
    })
    return ts
      .getPreEmitDiagnostics(program)
      .filter(
        (diagnostic) =>
          diagnostic.code === 2304 && diagnostic.file?.fileName === serverPath,
      )
      .map((diagnostic) => {
        const start = diagnostic.start ?? 0
        const position = diagnostic.file?.getLineAndCharacterOfPosition(start)
        return `${position ? `${position.line + 1}:${position.character + 1}` : '?:?'} ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
      })
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

function propertyName(name: ts.PropertyName | undefined): string | null {
  if (!name) return null
  if (ts.isIdentifier(name) || ts.isStringLiteralLike(name)) return name.text
  return null
}

function schemaBuilderName(expression: ts.Expression): string | null {
  let current = expression
  while (
    ts.isCallExpression(current) &&
    ts.isPropertyAccessExpression(current.expression) &&
    current.expression.name.text === 'default'
  ) {
    current = current.expression.expression
  }
  return ts.isCallExpression(current) && ts.isIdentifier(current.expression)
    ? current.expression.text
    : null
}

function expressionDomain(
  expression: ts.Expression,
): 'number' | 'string' | null {
  if (ts.isNumericLiteral(expression)) return 'number'
  if (ts.isStringLiteralLike(expression)) return 'string'
  if (
    ts.isPrefixUnaryExpression(expression) &&
    (expression.operator === ts.SyntaxKind.MinusToken ||
      expression.operator === ts.SyntaxKind.PlusToken)
  ) {
    return 'number'
  }
  if (ts.isCallExpression(expression)) {
    if (
      ts.isIdentifier(expression.expression) &&
      expression.expression.text === 'Number'
    ) {
      return 'number'
    }
    if (
      ts.isPropertyAccessExpression(expression.expression) &&
      ts.isIdentifier(expression.expression.expression) &&
      expression.expression.expression.text === 'Math'
    ) {
      return 'number'
    }
  }
  if (ts.isBinaryExpression(expression)) {
    const numericOperators = new Set([
      ts.SyntaxKind.AsteriskToken,
      ts.SyntaxKind.AsteriskAsteriskToken,
      ts.SyntaxKind.MinusToken,
      ts.SyntaxKind.PercentToken,
      ts.SyntaxKind.PlusToken,
      ts.SyntaxKind.SlashToken,
    ])
    if (numericOperators.has(expression.operatorToken.kind)) return 'number'
  }
  return null
}

function lakebedSchemaTypeMismatches(files: ArtifactFiles): string[] {
  const path = 'server/index.ts'
  const sourceFile = sourceFileFor(path, files[path] ?? '')
  const schemas = new Map<string, Map<string, string>>()
  const mismatches: string[] = []

  function collectSchemas(node: ts.Node): void {
    if (
      ts.isPropertyAssignment(node) &&
      propertyName(node.name) === 'schema' &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const tableProperty of node.initializer.properties) {
        if (!ts.isPropertyAssignment(tableProperty)) continue
        const tableName = propertyName(tableProperty.name)
        if (
          !tableName ||
          !ts.isCallExpression(tableProperty.initializer) ||
          !ts.isIdentifier(tableProperty.initializer.expression) ||
          tableProperty.initializer.expression.text !== 'table'
        ) {
          continue
        }
        const shape = tableProperty.initializer.arguments[0]
        if (!shape || !ts.isObjectLiteralExpression(shape)) continue
        const fields = new Map<string, string>()
        for (const fieldProperty of shape.properties) {
          if (!ts.isPropertyAssignment(fieldProperty)) continue
          const fieldName = propertyName(fieldProperty.name)
          const typeName = schemaBuilderName(fieldProperty.initializer)
          if (fieldName && typeName) fields.set(fieldName, typeName)
        }
        schemas.set(tableName, fields)
      }
    }
    ts.forEachChild(node, collectSchemas)
  }
  collectSchemas(sourceFile)

  function inspectWrites(node: ts.Node): void {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      (node.expression.name.text === 'insert' ||
        node.expression.name.text === 'update')
    ) {
      const receiver = node.expression.expression
      const tableName = ts.isPropertyAccessExpression(receiver)
        ? receiver.name.text
        : null
      const valueArgument =
        node.expression.name.text === 'insert'
          ? node.arguments[0]
          : node.arguments[1]
      const fields = tableName ? schemas.get(tableName) : undefined
      if (
        fields &&
        valueArgument &&
        ts.isObjectLiteralExpression(valueArgument)
      ) {
        for (const property of valueArgument.properties) {
          if (!ts.isPropertyAssignment(property)) continue
          const fieldName = propertyName(property.name)
          if (!fieldName) continue
          const expected = fields.get(fieldName)
          const actual = expressionDomain(property.initializer)
          if (expected && actual && expected !== actual) {
            const position = sourceFile.getLineAndCharacterOfPosition(
              property.getStart(sourceFile),
            )
            mismatches.push(
              `${tableName}.${fieldName} is ${expected} but line ${position.line + 1} writes ${actual}`,
            )
          }
        }
      }
    }
    if (
      ts.isBinaryExpression(node) &&
      (node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsEqualsToken ||
        node.operatorToken.kind === ts.SyntaxKind.EqualsEqualsToken) &&
      ts.isTypeOfExpression(node.left) &&
      ts.isPropertyAccessExpression(node.left.expression) &&
      ts.isStringLiteralLike(node.right)
    ) {
      const fieldName = node.left.expression.name.text
      const declaredTypes = [...schemas.values()]
        .map((fields) => fields.get(fieldName))
        .filter(isDefinedString)
      if (
        declaredTypes.length > 0 &&
        !declaredTypes.includes(node.right.text)
      ) {
        const position = sourceFile.getLineAndCharacterOfPosition(
          node.getStart(),
        )
        mismatches.push(
          `${fieldName} is declared ${[...new Set(declaredTypes)].join('/')} but line ${position.line + 1} checks ${node.right.text}`,
        )
      }
    }
    ts.forEachChild(node, inspectWrites)
  }
  inspectWrites(sourceFile)

  return [...new Set(mismatches)]
}

async function buildLakebedAdapterHarness(
  files: ArtifactFiles,
): Promise<string> {
  const directory = mkdtempSync(join(tmpdir(), 'lakebed-adapter-gate-'))
  try {
    writeArtifactFiles(files, directory)
    const harnessPath = join(directory, 'adapter-harness.tsx')
    writeFileSync(
      harnessPath,
      `import { render } from 'preact'
import { useLakebedAdapter } from './client/lib/lakebed.ts'

function Harness() {
  const lakebed = useLakebedAdapter()
  const catalog = lakebed.useQuery<Array<{ label?: string }>>('productCatalog')
  const addItem = lakebed.useMutation<[Record<string, string>], unknown>('addItem')
  return (
    <button
      id="add-cookie"
      data-catalog={catalog.map((item) => item.label ?? '').join('|')}
      onClick={() => void addItem({ label: 'Chocolate Chip Cookie', price: '$4' })}
      type="button"
    >
      Add to Cart Chocolate Chip Cookie
    </button>
  )
}

render(<Harness />, document.getElementById('root')!)
`,
    )
    const result = await build({
      bundle: true,
      entryPoints: [harnessPath],
      format: 'iife',
      jsx: 'automatic',
      jsxImportSource: 'preact',
      logLevel: 'silent',
      nodePaths: [join(process.cwd(), 'node_modules')],
      platform: 'browser',
      plugins: [
        {
          name: 'lakebed-production-hook-stub',
          setup(pluginBuild) {
            pluginBuild.onResolve({ filter: /^lakebed\/client$/ }, () => ({
              namespace: 'lakebed-platform',
              path: 'lakebed/client',
            }))
            pluginBuild.onLoad(
              { filter: /.*/, namespace: 'lakebed-platform' },
              () => ({
                contents: `const runtime = globalThis
export const signInWithGoogle = async () => ({})
export const signOut = () => {}
export const useAuth = () => ({ isAuthenticated: false, user: null })
export function useQuery(name) {
  const query = { subscribe: true }
  return query.subscribe ? runtime.__platformQueryValues?.[name] : undefined
}
export function useMutation(name) {
  const mutation = {
    run: async (...args) => {
      ;(runtime.__platformMutationCalls ??= []).push({ args, name })
      return []
    },
  }
  return mutation.run
}
`,
                loader: 'js',
              }),
            )
          },
        },
      ],
      target: 'es2022',
      write: false,
    })
    const output = result.outputFiles[0]
    if (!output)
      throw new Error('Lakebed adapter harness did not produce output')
    return output.text
  } finally {
    rmSync(directory, { force: true, recursive: true })
  }
}

async function runLakebedAdapterHarness() {
  const dom = new JSDOM('<!doctype html><div id="root"></div>', {
    runScripts: 'outside-only',
    url: 'https://release-gate.example/',
  })
  Reflect.set(dom.window, '__platformQueryValues', {
    productCatalog: [
      { id: 'cookie', label: 'Chocolate Chip Cookie', price: '$4' },
    ],
  })
  Reflect.set(dom.window, '__platformMutationCalls', [])
  dom.window.eval(lakebedAdapterHarness)
  await new Promise((resolve) => setTimeout(resolve, 0))
  return dom
}

function createMemoryStorage(values: Map<string, string>): Storage {
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key)
    },
    setItem: (key, value) => {
      values.set(String(key), String(value))
    },
  }
}

type BrowserWindow = Window & typeof globalThis
type BeforeParseHandler = (window: BrowserWindow) => void

function domWindow(dom: JSDOM): BrowserWindow {
  return dom.window
}

function domDocument(dom: JSDOM): Document {
  return domWindow(dom).document
}

function openInteractiveHtml(
  html: string,
  storage = new Map<string, string>(),
) {
  const beforeParse: BeforeParseHandler = (window) => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: createMemoryStorage(storage),
    })
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: () => undefined,
    })
  }
  const dom = new JSDOM(html, {
    beforeParse,
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://standalone-export.release-gate.test/',
  })
  return { dom, storage }
}

async function clickControl(dom: JSDOM, selector: string): Promise<void> {
  const control = domDocument(dom).querySelector<HTMLElement>(selector)
  expect(control, `Missing interactive control: ${selector}`).not.toBeNull()
  control?.click()
  await new Promise((resolve) => domWindow(dom).setTimeout(resolve, 0))
  await new Promise((resolve) => domWindow(dom).setTimeout(resolve, 0))
}

function visiblePageLabel(dom: JSDOM): string | null {
  return (
    domDocument(dom)
      .querySelector<HTMLElement>('[data-sf-export-page]:not([hidden])')
      ?.getAttribute('data-sf-export-page') ?? null
  )
}

function rootOuterHtml(html: string): string {
  const dom = new JSDOM(html)
  try {
    const root = domDocument(dom).querySelector('#openui-root')
    root?.removeAttribute('data-tsd-source')
    root
      ?.querySelectorAll('[data-tsd-source]')
      .forEach((node) => node.removeAttribute('data-tsd-source'))
    return root?.outerHTML.trim() ?? ''
  } finally {
    dom.window.close()
  }
}

type MutableColorSchemeMediaQuery = {
  addEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void
  addListener: (listener: EventListenerOrEventListenerObject) => void
  dispatchEvent: (event: Event) => boolean
  matches: boolean
  media: string
  onchange: EventListener | null
  removeEventListener: (
    type: string,
    listener: EventListenerOrEventListenerObject,
  ) => void
  removeListener: (listener: EventListenerOrEventListenerObject) => void
}

function openThemeResponsiveHtml(html: string, initialDark: boolean) {
  const listeners = new Set<EventListenerOrEventListenerObject>()
  const mediaQuery: MutableColorSchemeMediaQuery = {
    addEventListener: (type, listener) => {
      if (type === 'change') listeners.add(listener)
    },
    addListener: (listener) => listeners.add(listener),
    dispatchEvent: (event) => {
      for (const listener of listeners) {
        if (typeof listener === 'function') listener(event)
        else listener.handleEvent(event)
      }
      mediaQuery.onchange?.(event)
      return true
    },
    matches: initialDark,
    media: '(prefers-color-scheme: dark)',
    onchange: null,
    removeEventListener: (type, listener) => {
      if (type === 'change') listeners.delete(listener)
    },
    removeListener: (listener) => listeners.delete(listener),
  }
  const beforeParse: BeforeParseHandler = (window) => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: () => mediaQuery,
    })
    Object.defineProperty(window, 'scrollTo', {
      configurable: true,
      value: () => undefined,
    })
    Object.defineProperty(window.Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: () => undefined,
    })
  }
  const dom = new JSDOM(html, {
    beforeParse,
    pretendToBeVisual: true,
    runScripts: 'dangerously',
    url: 'https://standalone-theme.release-gate.test/',
  })
  function setDark(isDark: boolean): void {
    mediaQuery.matches = isDark
    const event = new (domWindow(dom).Event)('change')
    Object.defineProperty(event, 'matches', { value: isDark })
    mediaQuery.dispatchEvent(event)
  }
  return { dom, setDark }
}

function interactionState(dom: JSDOM, storage: Map<string, string>): string {
  return JSON.stringify({
    body: domDocument(dom).body.innerHTML,
    href: dom.window.location.href,
    storage: [...storage.entries()].sort(([a], [b]) => a.localeCompare(b)),
  })
}

const interactiveButtonIds: readonly string[] = [
  'add-cookie-home',
  'add-cookie-shop',
  'browse-menu',
  'buy-now',
  'cart-open',
  'nav-home',
  'nav-shop',
  'shop-nav-home',
  'sign-in',
  'subscribe',
]

// Heavy beforeAll: builds 9+ export artifacts (react/next/lakebed/html ×
// dark/light/localized) in parallel via esbuild + Tailwind compilation.
// Under full-suite parallel load (maxWorkers=2) this can exceed the default
// 120s hookTimeout, which causes vitest to mark all 135 tests as "skipped".
// 300s gives enough headroom for cold-cache builds under load.
beforeAll(async () => {
  const [
    built,
    derivedBakeryLakebed,
    localizedBuilt,
    translatedStructuralBuilt,
    localizedLightHtml,
  ] = await Promise.all([
    Promise.all(
      targets.map(async (target) => {
        const result = await buildOpenUIArtifactFiles({
          lakebedSeedData: {
            products: [
              {
                imageAlt: 'Release gate product',
                itemKey: 'release-gate-sourdough',
                label: seededProductLabel,
                price: '$9.00',
                subtitle: 'Baked into the deploy artifact',
              },
            ],
          },
          selectedBrandLogo: {
            logo: 'https://cdn.release-gate.example/logo.svg',
            name: 'Release Gate Bakery',
          },
          sessionId: `release-gate-${target}`,
          siteSpecJson,
          source: fixtureSource,
          syncSecret,
          target,
        })
        return { files: result.files, target }
      }),
    ),
    buildOpenUIArtifactFiles({
      selectedBrandLogo: {
        logo: 'https://cdn.release-gate.example/logo.svg',
        name: 'Release Gate Bakery',
      },
      sessionId: 'release-gate-derived-bakery-lakebed',
      siteSpecJson: JSON.stringify({ projectName: 'Release Gate Bakery' }),
      source: bakerySource,
      target: 'lakebed',
    }),
    Promise.all(
      localizedTargets.map(async (target) => {
        const result = await buildOpenUIArtifactFiles({
          isDark: true,
          locale: 'hi',
          selectedBrandLogo: {
            logo: 'https://cdn.release-gate.example/logo.svg',
            name: 'Release Gate Bakery',
          },
          sessionId: `release-gate-localized-${target}`,
          siteSpecJson: JSON.stringify({
            locale: 'hi',
            projectName: 'Release Gate Localized Export',
          }),
          source: localizedSource,
          target,
          themeName: 'modern-minimal',
        })
        return { files: result.files, target }
      }),
    ),
    Promise.all(
      browserTargets.map(async (target) => {
        const result = await buildOpenUIArtifactFiles({
          locale: 'hi',
          sessionId: `release-gate-translated-keys-${target}`,
          siteSpecJson: JSON.stringify({
            locale: 'hi',
            projectName: 'Release Gate Translated Keys',
          }),
          source: translatedStructuralSource,
          target,
        })
        return { files: result.files, target }
      }),
    ),
    buildOpenUIArtifactFiles({
      isDark: false,
      locale: 'hi',
      sessionId: 'release-gate-localized-html-light',
      siteSpecJson: JSON.stringify({
        locale: 'hi',
        projectName: 'Release Gate Localized Export',
      }),
      source: localizedSource,
      target: 'html',
      themeName: 'modern-minimal',
    }),
  ])
  artifacts = {
    lakebed: artifactFilesFor(built, 'lakebed'),
    next: artifactFilesFor(built, 'next'),
    react: artifactFilesFor(built, 'react'),
  }
  derivedBakeryLakebedFiles = derivedBakeryLakebed.files
  localizedArtifacts = {
    html: artifactFilesFor(localizedBuilt, 'html'),
    lakebed: artifactFilesFor(localizedBuilt, 'lakebed'),
    next: artifactFilesFor(localizedBuilt, 'next'),
    react: artifactFilesFor(localizedBuilt, 'react'),
  }
  translatedStructuralArtifacts = {
    next: artifactFilesFor(translatedStructuralBuilt, 'next'),
    react: artifactFilesFor(translatedStructuralBuilt, 'react'),
  }
  localizedLightHtmlFiles = localizedLightHtml.files

  const interactiveConfigurations: readonly InteractiveConfiguration[] = [
    {
      isDark: true,
      labels: englishInteractiveLabels,
      locale: 'en',
      name: 'dark-en',
    },
    {
      isDark: false,
      labels: englishInteractiveLabels,
      locale: 'en',
      name: 'light-en',
    },
    {
      isDark: true,
      labels: hindiInteractiveLabels,
      locale: 'hi',
      name: 'dark-hi',
    },
  ]

  interactiveHtmlCases = await Promise.all(
    interactiveConfigurations.map(async (configuration) => {
      const previewHtml = createInteractivePreviewHtml(
        configuration.labels,
        configuration.isDark,
      )
      const interactive = await buildOpenUIArtifactFiles({
        includeBadge: false,
        isDark: configuration.isDark,
        locale: configuration.locale,
        previewHtml,
        sessionId: `release-gate-interactive-${configuration.name}`,
        siteSpecJson: JSON.stringify({
          locale: configuration.locale,
          projectName: 'Interactive Release Gate',
        }),
        source: createInteractiveSource(configuration.labels),
        target: 'html',
        themeName: 'modern-minimal',
      })
      return {
        files: interactive.files,
        isDark: configuration.isDark,
        labels: configuration.labels,
        name: configuration.name,
        previewHtml,
      }
    }),
  )
  ;[lakebedAdapterHarness, reactMutationHarness] = await Promise.all([
    buildLakebedAdapterHarness(derivedBakeryLakebedFiles),
    buildReactMutationHarness(artifacts.react),
  ])
}, 300_000)

describe('generated export release hard gates', () => {
  describe('generated type-syntax classifier controls', () => {
    it('allows typed direct useCallback declarations', () => {
      const files = {
        'src/control.tsx': `
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const stable = useCallback((value: string): number => value.length, [])
const destructured = useCallback(({ id }: { id: string }): string => id, [])
const expression = useCallback(function stableValue(value: string): number { return value.length }, [])
void [stable, destructured, expression]
`,
      }

      expect(forbiddenTypeSyntaxLocations(files)).toEqual([])
    })

    it('allows typed direct React.useCallback declarations', () => {
      const files = {
        'src/control.tsx': `
declare const React: { useCallback<Value>(callback: Value, dependencies: unknown[]): Value }
const stable = React.useCallback(async (value: string): Promise<string> => value, [])
void stable
`,
      }

      expect(forbiddenTypeSyntaxLocations(files)).toEqual([])
    })

    it('still rejects typed ordinary arrow functions and function expressions', () => {
      const files = {
        'src/control.ts': `
const arrow = (value: string): number => value.length
const expression = function (value: string): number { return value.length }
void [arrow, expression]
`,
      }

      expect(forbiddenTypeSyntaxLocations(files)).toHaveLength(2)
    })

    it('still rejects typed nested callbacks inside useCallback', () => {
      const files = {
        'src/control.tsx': `
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
const stable = useCallback((values: string[]): string[] => {
  return values.map((value: string): string => value.trim())
}, [])
void stable
`,
      }

      expect(forbiddenTypeSyntaxLocations(files)).toHaveLength(1)
    })

    it('does not exempt aliases, useMemo, or other member calls', () => {
      const files = {
        'src/control.tsx': `
declare function useCallback<Value>(callback: Value, dependencies: unknown[]): Value
declare function useMemo<Value>(callback: Value, dependencies: unknown[]): Value
declare const Hooks: { useCallback<Value>(callback: Value, dependencies: unknown[]): Value }
const alias = useCallback
const fromAlias = alias((value: string): number => value.length, [])
const fromMemo = useMemo((): string => 'ready', [])
const fromMember = Hooks.useCallback((value: string): number => value.length, [])
void [fromAlias, fromMemo, fromMember]
`,
      }

      expect(forbiddenTypeSyntaxLocations(files)).toHaveLength(3)
    })
  })

  describe.each(browserTargets)('%s reproducibility', (target) => {
    it('ships the Bun lockfile used to validate the exported project', () => {
      expect(Object.keys(artifacts[target])).toContain('bun.lock')
    })

    it('pins every dependency to an exact immutable version', () => {
      const manifest = parseJsonRecord(artifacts[target]['package.json'])
      const mutableVersions = Object.entries({
        ...readStringRecord(manifest.dependencies),
        ...readStringRecord(manifest.devDependencies),
      })
        .filter(
          ([, version]) => !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version),
        )
        .map(([name, version]) => `${name}@${version}`)

      expect(mutableVersions).toEqual([])
    })

    it('uses Bun-only commands in exported scripts and documentation', () => {
      expectNoHits(
        artifacts[target],
        /\b(?:npm|npx|pnpm|yarn)(?:\s|$)/i,
        `${targetLabel[target]} contains a non-Bun command`,
        false,
      )
    })
  })

  it('uses Turbopack for the exported Next.js development command', () => {
    const manifest = parseJsonRecord(artifacts.next['package.json'])
    const scripts = readStringRecord(manifest.scripts)
    expect(scripts.dev).toMatch(/^next dev .*--turbopack/)
  })

  it('uses Bun-only commands in the exported Lakebed documentation', () => {
    expectNoHits(
      artifacts.lakebed,
      /\b(?:npm|npx|pnpm|yarn)(?:\s|$)/i,
      'Lakebed contains a non-Bun command',
      false,
    )
  })

  describe.each(targets)('%s isolation', (target) => {
    it('contains no Ship Fast, OpenUI, or private infrastructure identity', () => {
      expectNoHits(
        artifacts[target],
        /ship[\s_-]*fast|shipfast|open[\s_-]*ui|@openuidev|devliv\.io|liviogama\.com/i,
        `${targetLabel[target]} leaks generator or infrastructure identity`,
      )
    })

    it('contains no internal pseudo-domain, credential, or service URL', () => {
      expectNoHits(
        artifacts[target],
        /ship-fast\.(?:io|local)|localhost:\d+|127\.0\.0\.1:\d+|\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{12,}|AIza[0-9A-Za-z_-]{20,}/i,
        `${targetLabel[target]} leaks an internal endpoint or credential`,
      )
    })

    it('contains no runtime AI SDK, model provider, or generation endpoint', () => {
      expectNoHits(
        artifacts[target],
        /@ai-sdk|api\.openai\.com|generativelanguage\.googleapis\.com|\b(?:openai|anthropic|groq)\b|\b(?:generateText|streamText|useChat)\b|\/api\/(?:generate|chat)\b/i,
        `${targetLabel[target]} contains runtime AI behavior`,
      )
    })

    it('contains no runtime source inspection, eval, or generated-code compiler', () => {
      expectNoHits(
        artifacts[target],
        /Function\.prototype\.toString|\.toString\.call\(|\bnew Function\b|\beval\s*\(|react-jsx-parser|@babel\/standalone/i,
        `${targetLabel[target]} performs runtime source inspection or compilation`,
      )
    })

    it('contains no export-time schema or operation inference at runtime', () => {
      expectNoHits(
        artifacts[target],
        /\b(?:applyMutation|affectedQueryNames|emptyQueryValue|fallbackLakebedQueryValue|normalizeQueryValue|normalizeDbShapedQueryResult|canUseLakebedRuntimeHooks)\b|\.(?:test|match)\(name\)/,
        `${targetLabel[target]} retains generic runtime inference that export can specialize`,
      )
    })

    it('has parseable project-owned JavaScript and TypeScript', () => {
      expect(parseFailures(artifacts[target])).toEqual([])
    })

    it('uses no type assertions, non-null assertions, explicit any, or typed anonymous functions', () => {
      const violations = forbiddenTypeSyntaxLocations(artifacts[target])
      expect(
        violations,
        `${targetLabel[target]} contains forbidden type syntax:\n${violations.join('\n')}`,
      ).toEqual([])
    })

    it('resolves every relative import inside the artifact', () => {
      expect(unresolvedRelativeImports(artifacts[target])).toEqual([])
    })

    it('ships no unreachable project-owned source modules', () => {
      expect(deadOwnedSourceFiles(target, artifacts[target])).toEqual([])
    })
  })

  describe.each(browserTargets)('%s Lakebed isolation', (target) => {
    it('contains zero Lakebed text in paths, imports, identifiers, adapters, or comments', () => {
      expectNoHits(
        artifacts[target],
        /lakebed/i,
        `${targetLabel[target]} contains Lakebed-specific implementation detail`,
      )
    })

    it('declares every bare import in its package manifest', () => {
      expect(unmanifestedBareImports(artifacts[target])).toEqual([])
    })
  })

  describe.each(browserTargets)('%s standalone TypeScript', (target) => {
    it('typechecks the generated project with its exported tsconfig', () => {
      expect(typecheckGeneratedProject(target, artifacts[target])).toEqual([])
    })
  })

  it('uses ordinary React/Vite routing without Next.js or server-only modules', () => {
    const files = artifacts.react
    expect(files['src/main.tsx']).toContain("from 'react-dom/client'")
    expect(files['src/App.tsx']).toContain("from 'react-router-dom'")
    expect(Object.keys(files).some((path) => path.startsWith('app/'))).toBe(
      false,
    )
    expectNoHits(
      files,
      /from ['"]next(?:\/|['"])|['"]use server['"]|process\.env/,
      'React export contains Next.js or server-only code',
      false,
    )
  })

  it('precomputes React route/component wiring instead of dispatching from metadata', () => {
    const app = artifacts.react['src/App.tsx'] ?? ''
    expect(app).not.toMatch(/components\s*\[\s*route\.component\s*\]/)
    expect(app).not.toContain('routes.map(')
  })

  describe.each(browserTargets)('%s TanStack Query behavior', (target) => {
    it('uses stable query keys and exact mutation invalidation keys', () => {
      expect(tanstackQueryContractViolations(artifacts[target])).toEqual([])
    })
  })

  describe('React generated commerce behavior', () => {
    it('preserves mutation arguments instead of nesting the rest tuple', async () => {
      const dom = await runReactMutationHarness()
      try {
        const button =
          domDocument(dom).querySelector<HTMLButtonElement>('#add-cookie-react')
        button?.click()
        await new Promise((resolve) => setTimeout(resolve, 0))
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(Reflect.get(dom.window, '__receivedMutationArgs')).toEqual([
          {
            itemKey: 'cookie',
            label: 'Chocolate Chip Cookie',
            price: '$4',
          },
        ])
      } finally {
        dom.window.close()
      }
    })

    it('updates the cart query after Add to Cart', async () => {
      const dom = await runReactMutationHarness()
      try {
        const button =
          domDocument(dom).querySelector<HTMLButtonElement>('#add-cookie-react')
        button?.click()
        await new Promise((resolve) => setTimeout(resolve, 0))
        await new Promise((resolve) => setTimeout(resolve, 0))
        const summary = Reflect.get(dom.window, '__cartSummary')
        expect(JSON.stringify(summary)).toContain('Chocolate Chip Cookie')
        expect(summary).toMatchObject({ count: 1 })
      } finally {
        dom.window.close()
      }
    })

    it('invalidates only cart and product query keys after mutation', async () => {
      const dom = await runReactMutationHarness()
      try {
        const button =
          domDocument(dom).querySelector<HTMLButtonElement>('#add-cookie-react')
        button?.click()
        await new Promise((resolve) => setTimeout(resolve, 0))
        await new Promise((resolve) => setTimeout(resolve, 0))
        expect(Reflect.get(dom.window, '__invalidatedQueryKeys')).toEqual([
          ['cartSummary'],
          ['productCatalog'],
        ])
      } finally {
        dom.window.close()
      }
    })
  })

  it('uses native Next.js App Router server components and server actions', () => {
    const files = artifacts.next
    expect(files['app/layout.tsx']).toBeDefined()
    expect(files['app/page.tsx']).toBeDefined()
    expect(files['app/actions/server-actions.ts']?.trimStart()).toMatch(
      /^['"]use server['"]/,
    )
    for (const [path, content] of Object.entries(files)) {
      if (!/^app\/(?:.+\/)?page\.tsx$/.test(path)) continue
      expect(content, `${path} must remain a server component`).not.toMatch(
        /^['"]use client['"]/,
      )
      expect(content, `${path} must export route metadata`).toContain(
        'export const metadata',
      )
    }
    expectNoHits(
      files,
      /react-router-dom|BrowserRouter|createBrowserRouter/,
      'Next.js export contains client-router infrastructure',
      false,
    )
  })

  it('precomputes Next.js JSON-LD strings instead of serializing them during render', () => {
    const runtimeSerialization = Object.entries(artifacts.next)
      .filter(([path]) => /^app\/(?:.+\/)?page\.tsx$/.test(path))
      .filter(([, content]) => /JSON\.stringify\(jsonLd\)/.test(content))
      .map(([path]) => path)
    expect(runtimeSerialization).toEqual([])
  })

  describe('localized export specialization', () => {
    it.each(browserTargets)(
      '%s preserves schema keys and identifiers while translating values',
      (target) => {
        expect(
          nonAsciiStructuralNames(translatedStructuralArtifacts[target]),
        ).toEqual([])
      },
    )

    it('keeps React component identifiers stable when route labels are translated', () => {
      const files = localizedArtifacts.react
      expect(files['src/components/HomePage.tsx']).toBeDefined()
      expect(files['src/components/MenuPage.tsx']).toBeDefined()
      expect(
        Object.keys(files).filter((path) => /\/{2,}|_+Page\.tsx$/.test(path)),
      ).toEqual([])
      const routes = files['src/data/pages.ts'] ?? ''
      expect(routes).toContain(`label: '${hindiHome}'`)
      expect(routes).toContain(`label: '${hindiMenu}'`)
      expect(routes).toContain("path: '/menu'")
    })

    it('keeps Next.js App Router paths semantic when route labels are translated', () => {
      const files = localizedArtifacts.next
      expect(files['src/components/HomePage.tsx']).toBeDefined()
      expect(files['src/components/MenuPage.tsx']).toBeDefined()
      expect(files['app/page.tsx']).toBeDefined()
      expect(files['app/menu/page.tsx']).toBeDefined()
      expect(files['app/page/page.tsx']).toBeUndefined()
      expect(
        Object.keys(files).filter((path) => /_+Page\.tsx$/.test(path)),
      ).toEqual([])
    })

    it('rewrites translated standalone HTML targets without stale English routes', () => {
      const html = localizedArtifacts.html['index.html'] ?? ''
      expect(html).toContain(hindiHome)
      expect(html).toContain(hindiMenu)
      expect(html).not.toMatch(/(?:Home|Menu)#(?:home|menu)/)
    })
  })

  describe('standalone HTML isolation', () => {
    it('contains no Ship Fast, OpenUI, or Lakebed runtime markers', () => {
      expectNoHits(
        localizedArtifacts.html,
        /__SHIP_FAST_EXPORT__|data-openui|data-sf-export-page|ship[\s_-]*fast|open[\s_-]*ui|lakebed/i,
        'Standalone HTML leaks generator or storage runtime internals',
      )
    })

    it('strips generator source maps and internal package or filesystem paths', () => {
      const htmlDocuments = {
        'localized-dark.html': localizedArtifacts.html['index.html'] ?? '',
        'localized-light.html': localizedLightHtmlFiles['index.html'] ?? '',
        ...Object.fromEntries(
          interactiveHtmlCases.map((testCase) => [
            `interactive-${testCase.name}.html`,
            testCase.files['index.html'] ?? '',
          ]),
        ),
      }
      expectNoHits(
        htmlDocuments,
        /data-tsd-source|@ship-fast\/|(?:^|["'(=:])\/?packages\/ship-fast-(?:blocks|engine)\/src\/|\/Users\/[^/\s"']+\/[^\s"']*ship-fast[^\s"']*/i,
        'Standalone HTML exposes generator source locations or internal package paths',
        false,
      )
    })

    it('contains no runtime AI or generated asset API calls', () => {
      expectNoHits(
        localizedArtifacts.html,
        /@ai-sdk|api\.openai\.com|generativelanguage\.googleapis\.com|\b(?:openai|anthropic|groq)\b|\/api\/(?:generate|chat|pexels|unsplash|image-search)\b/i,
        'Standalone HTML contains a runtime AI or generated-asset API call',
      )
    })

    it('ships a meaningful compiled stylesheet for emitted utility classes', () => {
      const html = localizedArtifacts.html['index.html'] ?? ''
      const coverage = htmlCssCoverage(html)
      expect(coverage.css.length).toBeGreaterThan(10_000)
      expect(coverage.ruleCount).toBeGreaterThan(50)
      expect(
        coverage.missingClasses,
        `Missing CSS for ${coverage.missingClasses.length}/${coverage.classes.length} classes`,
      ).toEqual([])
    })

    it('ships the same complete CSS coverage in light mode', () => {
      const html = localizedLightHtmlFiles['index.html'] ?? ''
      const coverage = htmlCssCoverage(html)
      expect(coverage.css.length).toBeGreaterThan(10_000)
      expect(coverage.ruleCount).toBeGreaterThan(50)
      expect(
        coverage.missingClasses,
        `Missing CSS for ${coverage.missingClasses.length}/${coverage.classes.length} light-mode classes`,
      ).toEqual([])
    })

    it('bakes the exact selected theme with light and dark activation rules', () => {
      const html = localizedArtifacts.html['index.html'] ?? ''
      const { css } = htmlCssCoverage(html)
      expect(css).toContain('#171717')
      expect(css).toContain('#e5e5e5')
      expect(css).toContain('#3b82f6')
      expect(css).toMatch(/:root|\[data-theme=['"]?light/)
      expect(css).toMatch(/\.dark|\[data-theme=['"]?dark/)
      expect(html).toMatch(/class=['"][^'"]*\bdark\b/)
    })

    it('activates the exact selected light theme without stale dark output', () => {
      const html = localizedLightHtmlFiles['index.html'] ?? ''
      const { css } = htmlCssCoverage(html)
      expect(css).toContain('#ffffff')
      expect(css).toContain('#333333')
      expect(css).toContain('#3b82f6')
      expect(html).not.toMatch(/class=['"][^'"]*\bdark\b/)
    })

    it('invalidates cached HTML and CSS when the selected color mode changes', () => {
      const darkHtml = localizedArtifacts.html['index.html'] ?? ''
      const lightHtml = localizedLightHtmlFiles['index.html'] ?? ''
      expect(darkHtml).not.toBe(lightHtml)
      expect(htmlCssCoverage(darkHtml).css).not.toBe(
        htmlCssCoverage(lightHtml).css,
      )
    })

    it('renders offline without a Tailwind runtime compiler or external stylesheet', () => {
      const html = localizedArtifacts.html['index.html'] ?? ''
      expect(html).not.toMatch(
        /cdn\.tailwindcss\.com|@tailwindcss\/browser|type=['"]text\/tailwindcss['"]|tailwind\.config/i,
      )
      expect(html).not.toMatch(
        /<link[^>]+rel=['"]stylesheet['"][^>]+href=['"]https?:\/\//i,
      )
      expect(html).not.toMatch(/ship-fast[^'"\s]*\.css|dashboard[^'"\s]*\.css/i)
    })
  })

  describe.each(interactiveCaseNames)(
    'standalone HTML preview and interaction parity (%s)',
    (caseName) => {
      it('preserves the preview root byte-for-byte instead of reconstructing it', () => {
        const testCase = interactiveCaseByName(caseName)
        expect(rootOuterHtml(testCase.files['index.html'] ?? '')).toBe(
          rootOuterHtml(testCase.previewHtml),
        )
      })

      it('preserves every preview node and inventories every button contract', () => {
        const testCase = interactiveCaseByName(caseName)
        const preview = new JSDOM(testCase.previewHtml)
        const exported = new JSDOM(testCase.files['index.html'] ?? '')
        try {
          const mismatches = [
            ...domDocument(preview).querySelectorAll<HTMLElement>(
              '[data-preview-key]',
            ),
          ].flatMap((node) => {
            const key = node.dataset.previewKey
            const counterpart = domDocument(exported).querySelector(
              `[data-preview-key="${key}"]`,
            )
            node.removeAttribute('data-tsd-source')
            node
              .querySelectorAll('[data-tsd-source]')
              .forEach((child) => child.removeAttribute('data-tsd-source'))
            counterpart?.removeAttribute('data-tsd-source')
            counterpart
              ?.querySelectorAll('[data-tsd-source]')
              .forEach((child) => child.removeAttribute('data-tsd-source'))
            return counterpart?.outerHTML === node.outerHTML
              ? []
              : [`${key}: preview/export markup differs`]
          })
          expect(mismatches).toEqual([])

          const buttonIds = [
            ...domDocument(exported).querySelectorAll<HTMLButtonElement>(
              '#openui-root button',
            ),
          ]
            .map((button) => button.id)
            .sort()
          expect(buttonIds).toEqual([...interactiveButtonIds].sort())
        } finally {
          preview.window.close()
          exported.window.close()
        }
      })

      it('activates the exact requested color mode and document language', () => {
        const testCase = interactiveCaseByName(caseName)
        const dom = new JSDOM(testCase.files['index.html'] ?? '')
        try {
          const document = domDocument(dom)
          const root = document.querySelector('#openui-root')
          expect(root?.classList.contains('dark')).toBe(testCase.isDark)
          expect(document.documentElement.lang).toBe(
            caseName.endsWith('-hi') ? 'hi' : 'en',
          )
        } finally {
          dom.window.close()
        }
      })

      it('responds to live color-scheme changes with exact opposite theme tokens', async () => {
        const testCase = interactiveCaseByName(caseName)
        const { dom, setDark } = openThemeResponsiveHtml(
          testCase.files['index.html'] ?? '',
          testCase.isDark,
        )
        try {
          const nextDark = !testCase.isDark
          setDark(nextDark)
          await new Promise((resolve) => dom.window.setTimeout(resolve, 0))
          const document = domDocument(dom)
          const root = document.querySelector<HTMLElement>('#openui-root')
          const activeDark =
            document.documentElement.classList.contains('dark') ||
            root?.classList.contains('dark') === true ||
            document.documentElement.dataset.theme === 'dark' ||
            root?.dataset.theme === 'dark'
          expect(activeDark).toBe(nextDark)
          expect(root?.style.colorScheme).toBe(nextDark ? 'dark' : 'light')
          expect(root?.style.getPropertyValue('--background').trim()).toBe(
            nextDark ? '#171717' : '#ffffff',
          )
        } finally {
          dom.window.close()
        }
      })

      it('executes every navigation and routing CTA in the exported file', async () => {
        const testCase = interactiveCaseByName(caseName)
        const { dom } = openInteractiveHtml(testCase.files['index.html'] ?? '')
        try {
          expect(visiblePageLabel(dom)).toBe(testCase.labels.home)
          await clickControl(dom, '#nav-shop')
          expect(visiblePageLabel(dom)).toBe(testCase.labels.shop)
          await clickControl(dom, '#shop-nav-home')
          expect(visiblePageLabel(dom)).toBe(testCase.labels.home)
          await clickControl(dom, '#browse-menu')
          expect(visiblePageLabel(dom)).toBe(testCase.labels.shop)
          await clickControl(dom, '#shop-nav-home')
          await clickControl(dom, '#buy-now')
          expect(visiblePageLabel(dom)).toBe(testCase.labels.shop)
        } finally {
          dom.window.close()
        }
      })

      it('leaves no CTA, cart, auth, or form control inert', async () => {
        const testCase = interactiveCaseByName(caseName)
        const controls = [
          '#add-cookie-home',
          '#browse-menu',
          '#buy-now',
          '#cart-open',
          '#sign-in',
          '#subscribe',
        ]
        const inertControls: string[] = []
        for (const selector of controls) {
          const { dom, storage } = openInteractiveHtml(
            testCase.files['index.html'] ?? '',
          )
          try {
            const before = interactionState(dom, storage)
            await clickControl(dom, selector)
            if (interactionState(dom, storage) === before) {
              inertControls.push(selector)
            }
          } finally {
            dom.window.close()
          }
        }
        expect(inertControls).toEqual([])
      })

      it('adds every selected product and updates the visible cart count', async () => {
        const testCase = interactiveCaseByName(caseName)
        const { dom } = openInteractiveHtml(testCase.files['index.html'] ?? '')
        try {
          const count = domDocument(dom).querySelector('[data-cart-count]')
          expect(count?.textContent?.trim()).toBe('0')
          await clickControl(dom, '#add-cookie-home')
          expect(count?.textContent?.trim()).toBe('1')
          await clickControl(dom, '#nav-shop')
          await clickControl(dom, '#add-cookie-shop')
          expect(count?.textContent?.trim()).toBe('2')
        } finally {
          dom.window.close()
        }
      })

      it('opens an accessible cart containing the selected product', async () => {
        const testCase = interactiveCaseByName(caseName)
        const { dom } = openInteractiveHtml(testCase.files['index.html'] ?? '')
        try {
          await clickControl(dom, '#add-cookie-home')
          await clickControl(dom, '#cart-open')
          const document = domDocument(dom)
          const trigger = document.querySelector('#cart-open')
          const dialog = document.querySelector<HTMLElement>('#cart-dialog')
          expect(trigger?.getAttribute('aria-expanded')).toBe('true')
          expect(dialog?.hidden).toBe(false)
          expect(dialog?.textContent).toContain(testCase.labels.item)
        } finally {
          dom.window.close()
        }
      })

      it('persists cart contents across a full document reload', async () => {
        const testCase = interactiveCaseByName(caseName)
        const storage = new Map<string, string>()
        const first = openInteractiveHtml(
          testCase.files['index.html'] ?? '',
          storage,
        )
        try {
          await clickControl(first.dom, '#add-cookie-home')
          expect(
            [...storage.values()].some((value) =>
              value.includes(testCase.labels.item),
            ),
          ).toBe(true)
        } finally {
          first.dom.window.close()
        }

        const reloaded = openInteractiveHtml(
          testCase.files['index.html'] ?? '',
          storage,
        )
        try {
          expect(
            domDocument(reloaded.dom)
              .querySelector('[data-cart-count]')
              ?.textContent?.trim(),
          ).toBe('1')
          await clickControl(reloaded.dom, '#cart-open')
          expect(
            domDocument(reloaded.dom).querySelector('#cart-dialog')
              ?.textContent,
          ).toContain(testCase.labels.item)
        } finally {
          reloaded.dom.window.close()
        }
      })

      it('preserves the exact shiny account Capsule markup from the preview', () => {
        const testCase = interactiveCaseByName(caseName)
        const dom = new JSDOM(testCase.files['index.html'] ?? '')
        try {
          const button = domDocument(dom).querySelector<HTMLButtonElement>(
            'button[data-slot="account-dropdown-unauthenticated"]',
          )
          expect(button).not.toBeNull()
          expect(button?.className).toBe(shinyAccountButtonClass)
          const sweep = button?.querySelector<HTMLSpanElement>(
            'span[aria-hidden="true"]',
          )
          expect(sweep?.className).toBe(shinySweepClass)
          expect(button?.textContent).toContain(testCase.labels.signIn)
        } finally {
          dom.window.close()
        }
      })

      it('compiles the named shiny group hover into an executable sweep rule', () => {
        const testCase = interactiveCaseByName(caseName)
        const { css } = htmlCssCoverage(testCase.files['index.html'] ?? '')
        const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
        const namedGroupRules = rules.filter(
          (rule) =>
            /group-hover\\+\/shiny\\+:translate-x-full/.test(rule) &&
            /group\\+\/shiny/.test(rule),
        )
        expect(namedGroupRules.length).toBeGreaterThan(0)
        expect(namedGroupRules.join('\n')).toMatch(
          /(?:--tw-translate-x|translate|transform)\s*:[^;}]*100%/,
        )

        const baseSweepRules = rules.filter((rule) =>
          /-translate-x-full/.test(rule),
        )
        expect(baseSweepRules.join('\n')).toMatch(
          /(?:--tw-translate-x|translate|transform)\s*:[^;}]*-100%/,
        )
        expect(css).toMatch(/\.duration-700\s*\{[^}]*700ms/)
        expect(css).toMatch(
          /\.transition-transform\s*\{[^}]*(?:transform|translate)/,
        )
        expect(css).toMatch(
          /transition-timing-function\s*:\s*cubic-bezier\(0\.22,\s*1,\s*0\.36,\s*1\)/,
        )
      })

      it('makes the shiny sign-in control behaviorally actionable', async () => {
        const testCase = interactiveCaseByName(caseName)
        const { dom, storage } = openInteractiveHtml(
          testCase.files['index.html'] ?? '',
        )
        try {
          const before = interactionState(dom, storage)
          await clickControl(
            dom,
            'button[data-slot="account-dropdown-unauthenticated"]',
          )
          expect(interactionState(dom, storage)).not.toBe(before)
        } finally {
          dom.window.close()
        }
      })
    },
  )

  it('uses only native Lakebed and Preact platform imports', () => {
    const files = artifacts.lakebed
    expect(files['client/index.tsx']).toContain("from 'lakebed/client'")
    expect(files['server/index.ts']).toContain("from 'lakebed/server'")
    expectNoHits(
      files,
      /from ['"](?:react|react-dom|next)(?:\/|['"])/,
      'Lakebed export contains React or Next.js imports',
      false,
    )
    expect(
      unmanifestedBareImports(files, new Set(['lakebed', 'preact'])),
    ).toEqual([])
  })

  it('propagates dashboard locale, content, theme, and selected logo to Lakebed', () => {
    const content = Object.values(localizedArtifacts.lakebed).join('\n')
    expect(content).toContain(hindiHome)
    expect(content).toContain(hindiMenu)
    expect(content).toContain('https://cdn.release-gate.example/logo.svg')
    expect(content).toContain('Release Gate Bakery')
    expect(content).toContain('#171717')
  })

  it('precompiles Lakebed CSS without the Tailwind browser runtime', () => {
    expectNoHits(
      localizedArtifacts.lakebed,
      /@tailwindcss\/browser|cdn\.jsdelivr\.net\/npm\/@tailwindcss|text\/tailwindcss/i,
      'Lakebed compiles Tailwind in the browser instead of at export time',
    )
  })

  describe('cross-target generated parity', () => {
    it('keeps route labels, paths, and page components identical', () => {
      const reactManifest = routeManifest('react', artifacts.react)
      expect(routeManifest('next', artifacts.next)).toEqual(reactManifest)
      expect(routeManifest('lakebed', artifacts.lakebed)).toEqual(reactManifest)
    })

    it('emits the same route component inventory for every code target', () => {
      const reactComponents = routeComponentNames('react', artifacts.react)
      expect(routeComponentNames('next', artifacts.next)).toEqual(
        reactComponents,
      )
      expect(routeComponentNames('lakebed', artifacts.lakebed)).toEqual(
        reactComponents,
      )
    })

    it('preserves visible commerce content across every target', () => {
      const requiredContent = [
        'Triple-Cheese Supreme',
        'Margherita Mozzarella',
        'Four-Cheese Blast',
        'Cheesy Garlic Bread',
        'Cheese-Stuffed Calzones',
      ]
      for (const target of targets) {
        const content = Object.values(artifacts[target]).join('\n')
        const missing = requiredContent.filter(
          (value) => !content.includes(value),
        )
        expect(
          missing,
          `${targetLabel[target]} dropped visible content`,
        ).toEqual([])
      }
    })

    it('preserves theme tokens across every target', () => {
      const themeSources = {
        lakebed: artifacts.lakebed['client/lib/theme.tsx'] ?? '',
        next: artifacts.next['app/globals.css'] ?? '',
        react: artifacts.react['src/styles.css'] ?? '',
      }
      for (const variable of [
        'background',
        'foreground',
        'primary',
        'primary-foreground',
        'border',
        'radius',
      ]) {
        const expected = cssVariableValues(themeSources.react, variable)
        expect(
          cssVariableValues(themeSources.next, variable),
          variable,
        ).toEqual(expected)
        expect(
          cssVariableValues(themeSources.lakebed, variable),
          variable,
        ).toEqual(expected)
      }
    })

    it('preserves every commerce query and mutation workflow', () => {
      const operations = [
        'getCommerceSearchState',
        'getCartSummary',
        'getProductCatalog',
        'syncCatalog',
        'setCommerceSearch',
        'addItem',
        'incrementItem',
        'decrementItem',
        'deleteItem',
        'clearCart',
      ]
      for (const target of targets) {
        const content = Object.values(artifacts[target]).join('\n')
        const missing = operations.filter(
          (operation) => !content.includes(operation),
        )
        expect(missing, `${targetLabel[target]} dropped workflows`).toEqual([])
      }
    })
  })

  it('does not ship generator-agent instructions or internal admin modules', () => {
    const paths = Object.keys(artifacts.lakebed)
    expect(paths).not.toContain('AGENTS.md')
    expect(paths).not.toContain('CLAUDE.md')
    expect(paths.filter((path) => /ship-fast-admin/i.test(path))).toEqual([])
  })

  describe.each(targets)('%s brand specialization', (target) => {
    it('bakes one final logo without runtime fallback or selection branches', () => {
      const logoPath =
        target === 'lakebed'
          ? 'client/section-kit/Logo.tsx'
          : 'src/section-kit/Logo.tsx'
      const logo = artifacts[target][logoPath] ?? ''
      expect(logo).toContain('https://cdn.release-gate.example/logo.svg')
      expect(logo).toContain('Release Gate Bakery')
      expect(logo).not.toMatch(
        /brandLogoSrc\s*\?|\bfallback\b|\bshowLabel\b|data-brand-logo-selected|selectedBrandLogo/,
      )
    })
  })

  it('materializes the selected logo identically across React, Next.js, and Lakebed', () => {
    const logoByTarget = {
      lakebed: artifacts.lakebed['client/section-kit/Logo.tsx'] ?? '',
      next: artifacts.next['src/section-kit/Logo.tsx'] ?? '',
      react: artifacts.react['src/section-kit/Logo.tsx'] ?? '',
    }
    const missingSelection = Object.entries(logoByTarget)
      .filter(
        ([, logo]) =>
          !logo.includes('https://cdn.release-gate.example/logo.svg') ||
          !logo.includes('Release Gate Bakery'),
      )
      .map(([target]) => target)
    expect(missingSelection).toEqual([])
  })

  describe.each(targets)('%s Medusa detachment', (target) => {
    it('preserves direct storefront configuration without a Ship Fast proxy', () => {
      const allContent = Object.values(artifacts[target]).join('\n')
      expect(allContent).toContain(medusaBackendUrl)
      expect(allContent).toContain(medusaStorefrontUrl)
      expect(allContent).not.toMatch(
        /\/api\/(?:sessions|deployments)\/.+\/medusa-config|provisionMedusaIntegration/,
      )
    })
  })

  it('bakes Lakebed seed data and protects the deploy sync endpoint', () => {
    const server = artifacts.lakebed['server/index.ts'] ?? ''
    expect(server).toContain(seededProductLabel)
    expect(server).toContain('/__lakebed/sync')
    expect(server).toContain('authorization')
    expect(server).toContain(syncSecret)
    expect(server).toContain("method: 'POST'")

    const publicClientContent = Object.entries(artifacts.lakebed)
      .filter(
        ([path]) =>
          path.startsWith('client/') ||
          path.startsWith('public/') ||
          path === 'README.md',
      )
      .map(([, content]) => content)
      .join('\n')
    expect(publicClientContent).not.toContain(syncSecret)
  })

  describe('Lakebed generated runtime behavior', () => {
    it('derives server product seeds from every visible exported catalog item', () => {
      const server = derivedBakeryLakebedFiles['server/index.ts'] ?? ''
      expect(server).toContain('Chocolate Chip Cookie')
      expect(server).not.toMatch(/const seedRows[^=]*=\s*\{\s*\}/)
    })

    it('resolves every generated Lakebed server identifier before deployment', () => {
      expect(unresolvedLakebedServerNames(derivedBakeryLakebedFiles)).toEqual(
        [],
      )
    })

    it('keeps Lakebed schema field types coherent with writes and query checks', () => {
      expect(lakebedSchemaTypeMismatches(derivedBakeryLakebedFiles)).toEqual([])
    })

    it('passes production Lakebed query results through to product search', async () => {
      const dom = await runLakebedAdapterHarness()
      try {
        const button =
          domDocument(dom).querySelector<HTMLButtonElement>('#add-cookie')
        expect(button?.dataset.catalog).toContain('Chocolate Chip Cookie')
      } finally {
        dom.window.close()
      }
    })

    it('routes Add to Cart through the production Lakebed mutation hook', async () => {
      const dom = await runLakebedAdapterHarness()
      try {
        const button =
          domDocument(dom).querySelector<HTMLButtonElement>('#add-cookie')
        button?.click()
        await new Promise((resolve) => setTimeout(resolve, 0))
        const calls = Reflect.get(dom.window, '__platformMutationCalls')
        expect(calls).toEqual([
          {
            args: [{ label: 'Chocolate Chip Cookie', price: '$4' }],
            name: 'addItem',
          },
        ])
      } finally {
        dom.window.close()
      }
    })

    it('deduplicates Home before rendering generated commerce mobile navigation', () => {
      const interactionsPath = Object.keys(derivedBakeryLakebedFiles).find(
        (path) => path.endsWith('/commerce/commerce-interactions.tsx'),
      )
      const interactions = interactionsPath
        ? (derivedBakeryLakebedFiles[interactionsPath] ?? '')
        : ''
      const rendersDedicatedHome = />\s*Home\s*<\/button>/.test(interactions)
      const alsoMapsRawNavigation = /\{nav\.map\(/.test(interactions)
      expect(
        rendersDedicatedHome && alsoMapsRawNavigation,
        'CommerceMobileMenu renders a dedicated Home button and maps Home again from nav',
      ).toBe(false)
    })

    it('ships a favicon asset instead of issuing a browser 404', () => {
      expect(
        Object.keys(derivedBakeryLakebedFiles).some((path) =>
          /(?:^|\/)favicon\.(?:ico|png|svg)$/i.test(path),
        ),
      ).toBe(true)
    })
  })

  describe('Lakebed bidirectional sync contract', () => {
    it('generates an authenticated sync endpoint even without caller-supplied seed rows', () => {
      const server = derivedBakeryLakebedFiles['server/index.ts'] ?? ''
      expect(server).toContain('/__lakebed/sync')
      expect(server).toContain('authorization')
      expect(server).not.toMatch(/endpoints:\s*\{\s*\}/)
    })

    it('makes sync requests idempotent and version ordered', () => {
      const server = artifacts.lakebed['server/index.ts'] ?? ''
      expect(server).toMatch(/idempotency/i)
      expect(server).toMatch(/\bversion\b/i)
      expect(server).toMatch(/stale|already processed|duplicate/i)
    })

    it('propagates deletions with tombstones instead of resurrecting stale rows', () => {
      const server = artifacts.lakebed['server/index.ts'] ?? ''
      expect(server).toMatch(/tombstone|deletedAt|deletedVersion/i)
    })

    it('records mutation origin to prevent Lakebed and dashboard sync loops', () => {
      const server = artifacts.lakebed['server/index.ts'] ?? ''
      expect(server).toMatch(/origin|sourceDeployment|sourceDatabase/i)
      expect(server).toMatch(/loop|echo|fanout/i)
    })

    it('emits a versioned change envelope from Lakebed-originated mutations', () => {
      const server = artifacts.lakebed['server/index.ts'] ?? ''
      const mutations =
        server.split('mutations:')[1]?.split('endpoints:')[0] ?? ''
      expect(mutations).toMatch(/changeEvent|outbox|syncEvent/i)
      expect(mutations).toMatch(/idempotencyKey|version/i)
      expect(mutations).toMatch(/create|update|delete/i)
    })

    it('synchronizes locale, theme, logo, and edited content revisions', () => {
      const server = artifacts.lakebed['server/index.ts'] ?? ''
      expect(server).toMatch(/\blocale\b/i)
      expect(server).toMatch(/\btheme\b/i)
      expect(server).toMatch(/\blogo\b/i)
      expect(server).toMatch(/contentRevision|contentVersion|editedContent/i)
    })
  })
})
