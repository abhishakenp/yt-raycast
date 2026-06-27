import { parseHTML } from 'linkedom'
import { describe, expect, it } from 'vitest'
import { strFromU8, unzipSync } from 'fflate'
import ts from 'typescript'

import {
  buildOpenUIExport,
  decodeExportBody,
  parseOpenUIForExport,
  renderNextEndpointRouteFiles,
} from './openui-export-builder'
import { resolveBlockSourceManifestPath } from './block-source-manifest'
import {
  buildOpenUIHtmlExport,
  parseOpenUIForHtmlExport,
} from './openui-html-export-builder'

const source = `root = SaasHero("Export Demo", ["Home"], {"heading": "Hello export", "highlight": "export"})`
const routedSource = `root = PageSwitch(["Home", "Pricing"], [home, pricing], "", {"Get Started":"Pricing#pricing_pricing","get started":"Pricing#pricing_pricing","Pricing":"Pricing"})
homeText = Text("Home")
pricingText = Text("Pricing")
home = Stack([homeText])
pricing = Stack([pricingText])`

const siteSpecJson = JSON.stringify({ projectName: 'Export Demo' })
const rawHtmlSource = `<!DOCTYPE html>
<html lang="en">
<head><title>Raw Export Demo</title><script src="https://cdn.tailwindcss.com"></script></head>
<body><main><h1>Raw SFF export</h1></main></body>
</html>`

const unzipTextFiles = (body: Uint8Array): Record<string, string> =>
  Object.fromEntries(
    Object.entries(unzipSync(body)).map(([name, value]) => [
      name,
      strFromU8(value),
    ]),
  )

const unzipBuiltExportTextFiles = (body: string | Uint8Array) => {
  if (typeof body === 'string') {
    throw new Error('Expected ZIP body')
  }
  return unzipTextFiles(body)
}

const parseTsx = (fileName: string, moduleSource: string): ts.SourceFile =>
  ts.createSourceFile(
    fileName,
    moduleSource,
    ts.ScriptTarget.Latest,
    true,
    fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )

const importSpecifiers = (sourceFile: ts.SourceFile): string[] =>
  sourceFile.statements
    .filter(ts.isImportDeclaration)
    .flatMap((statement) =>
      ts.isStringLiteral(statement.moduleSpecifier)
        ? [statement.moduleSpecifier.text]
        : [],
    )

const namedImportsFromModule = (
  sourceFile: ts.SourceFile,
  moduleName: string,
): string[] =>
  sourceFile.statements
    .filter(ts.isImportDeclaration)
    .filter(
      (statement) =>
        ts.isStringLiteral(statement.moduleSpecifier) &&
        statement.moduleSpecifier.text === moduleName,
    )
    .flatMap((statement) => {
      const bindings = statement.importClause?.namedBindings
      if (!bindings || !ts.isNamedImports(bindings)) return []
      return bindings.elements.map((element) => element.name.text)
    })

const hasExportedFunction = (
  sourceFile: ts.SourceFile,
  functionName: string,
): boolean =>
  sourceFile.statements.some(
    (statement) =>
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === functionName &&
      statement.modifiers?.some(
        (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
      ),
  )

const hasVariableInitializedByCall = (
  sourceFile: ts.SourceFile,
  variableName: string,
  callName: string,
): boolean => {
  let found = false

  const visit = (node: ts.Node) => {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName &&
      node.initializer &&
      ts.isCallExpression(node.initializer) &&
      ts.isIdentifier(node.initializer.expression) &&
      node.initializer.expression.text === callName
    ) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

const useMemoObjectPropertyNamesInFunction = (
  sourceFile: ts.SourceFile,
  functionName: string,
): string[] => {
  const names = new Set<string>()

  const propertyNameText = (name: ts.PropertyName): string | null => {
    if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text
    return null
  }

  const collectObjectProperties = (
    objectLiteral: ts.ObjectLiteralExpression,
  ) => {
    for (const property of objectLiteral.properties) {
      if (ts.isShorthandPropertyAssignment(property)) {
        names.add(property.name.text)
      } else if (
        ts.isPropertyAssignment(property) ||
        ts.isMethodDeclaration(property)
      ) {
        const name = propertyNameText(property.name)
        if (name) names.add(name)
      }
    }
  }

  const visitFunctionBody = (node: ts.Node) => {
    if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'useMemo'
    ) {
      const firstArg = node.arguments[0]
      if (firstArg && ts.isArrowFunction(firstArg)) {
        const body = firstArg.body
        if (ts.isObjectLiteralExpression(body)) collectObjectProperties(body)
        if (
          ts.isParenthesizedExpression(body) &&
          ts.isObjectLiteralExpression(body.expression)
        ) {
          collectObjectProperties(body.expression)
        }
      }
    }
    ts.forEachChild(node, visitFunctionBody)
  }

  for (const statement of sourceFile.statements) {
    if (
      ts.isFunctionDeclaration(statement) &&
      statement.name?.text === functionName &&
      statement.body
    ) {
      visitFunctionBody(statement.body)
    }
  }

  return [...names].sort()
}

const hasJsxElementNamed = (
  sourceFile: ts.SourceFile,
  elementName: string,
): boolean => {
  let found = false

  const visit = (node: ts.Node) => {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      ts.isIdentifier(node.tagName) &&
      node.tagName.text === elementName
    ) {
      found = true
      return
    }
    ts.forEachChild(node, visit)
  }

  visit(sourceFile)
  return found
}

const exportedFilesLeakPackageImport = (
  files: Record<string, string>,
  packagePrefix: string,
): boolean =>
  Object.entries(files).some(([fileName, moduleSource]) =>
    importSpecifiers(parseTsx(fileName, moduleSource)).some((specifier) =>
      specifier.startsWith(packagePrefix),
    ),
  )

const parseHtmlDocument = (html: string) => parseHTML(html).document

const extractRouteScriptText = (html: string): string => {
  const document = parseHtmlDocument(html)
  for (const script of document.querySelectorAll('script')) {
    const text = script.textContent ?? ''
    if (text.includes('targetMap') || text.includes('__SHIP_FAST_EXPORT__')) {
      return text
    }
  }
  return ''
}

const extractTargetMap = (scriptText: string): Record<string, string> => {
  const match = scriptText.match(/var targetMap = (\{[\s\S]*?\});/)
  if (!match?.[1]) return {}
  return JSON.parse(match[1]) as Record<string, string>
}

const v2ComposedExportSource = `root = PageSwitch(["Home"], [home])
homeHero = EcommerceHero()
homeHeroAnchor = SectionAnchor("home_hero", homeHero, "scroll-mt-28")
homeDetail = ProductDetailHero({"title":"Aurora Pro"})
home = Stack([homeHeroAnchor, homeDetail])`

describe('openui-export-builder', () => {
  it('parses OpenUI source into export metadata', () => {
    const parsed = parseOpenUIForExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
  })

  it('parses PageSwitch target maps for route and section navigation', () => {
    const parsed = parseOpenUIForExport(routedSource, siteSpecJson)

    expect(parsed.routes).toEqual(['Home', 'Pricing'])
    expect(parsed.targetMap['Get Started']).toBe('Pricing#pricing_pricing')
    expect(parsed.targetMap['get started']).toBe('Pricing#pricing_pricing')
  })

  it('parses generated source with malformed quoted object keys', () => {
    const parsed = parseOpenUIForExport(
      'root = SaasHero("StrideFit", ["Home"], {heading:"Shoes", items:[{"name":"Darius K.", tag:"Verified Buyer"},{"name:"Maya S.", tag:"Verified Buyer"}]})',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
  })

  it('parses generated source with object-boundary null arguments', () => {
    const parsed = parseOpenUIForExport(
      'root = ProductDetailHero("StrideFit", ["Home"], ["Home"], {}, {}, {items:[{"name:"Maya S.", tag:"Verified Buyer"}]}, {}, {footer:{note:"Done"}, null)',
      JSON.stringify({ projectName: 'StrideFit' }),
    )

    expect(parsed.projectName).toBe('StrideFit')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('ProductDetailHero')
  })

  it('parses OpenUI source into HTML export metadata with a response-scoped library', async () => {
    const parsed = await parseOpenUIForHtmlExport(source, siteSpecJson)

    expect(parsed.projectName).toBe('Export Demo')
    expect(parsed.routes).toEqual(['Home'])
    expect(parsed.root.typeName).toBe('SaasHero')
    expect(JSON.stringify(parsed.library.toJSONSchema())).toContain('SaasHero')
  })

  it('carries PageSwitch target maps into standalone HTML routing', async () => {
    const result = await buildOpenUIHtmlExport({
      source: routedSource,
      siteSpecJson,
      sessionId: 'routed-html',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const scriptText = extractRouteScriptText(html)
    const targetMap = extractTargetMap(scriptText)

    // targetMap is embedded as JSON in the route script
    expect(targetMap['Get Started']).toBe('Pricing#pricing_pricing')
    expect(targetMap['get started']).toBe('Pricing#pricing_pricing')

    // client-side routing helpers are defined in the route script
    expect(scriptText).toContain('function fixedHeaderOffset()')
    expect(scriptText).toContain('function scrollToSection(id)')
    expect(scriptText).toContain('window.scrollTo({ top: top, behavior:')
    expect(scriptText).toContain(
      "window.scrollTo({ top: 0, behavior: 'smooth' })",
    )

    // routes render as data-sf-export-page sections (first visible, rest hidden)
    const pages = document.querySelectorAll('[data-sf-export-page]')
    expect(pages).toHaveLength(2)
    expect(pages[0]?.getAttribute('hidden')).toBeNull()
    expect(pages[1]?.getAttribute('hidden')).not.toBeNull()
  })

  it('builds standalone HTML with a dark shell and baked theme variables', async () => {
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')

    // root container + dark shell
    const root = document.querySelector('#openui-root')
    expect(root).not.toBeNull()
    expect(root?.getAttribute('class')).toContain('dark')

    // theme variables are baked into the :root style rule
    const style = document.querySelector('style')
    expect(style?.textContent).toContain('--background:')

    // color-scheme is set on the root container style
    expect(root?.getAttribute('style')).toContain('color-scheme: dark')
  })

  it('preserves edited preview markup in standalone HTML exports', async () => {
    const previewHtml =
      '<main><h1 class="hero-title" style="color: rgb(255, 0, 0); text-align: center;">Edited headline</h1><img alt="Edited hero image" src="https://cdn.example.test/edited-hero.jpg" /></main>'
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'edited-html',
      target: 'html',
      previewHtml,
      isDark: false,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const root = document.querySelector('#openui-root')
    const headline = root?.querySelector('h1.hero-title')
    const image = root?.querySelector('img')

    expect(headline?.textContent).toBe('Edited headline')
    expect(headline?.getAttribute('style')).toBe(
      'color: rgb(255, 0, 0); text-align: center;',
    )
    expect(image?.getAttribute('src')).toBe(
      'https://cdn.example.test/edited-hero.jpg',
    )
    expect(image?.getAttribute('alt')).toBe('Edited hero image')

    // light shell: no dark class, color-scheme set to light
    expect(root?.getAttribute('class')).not.toContain('dark')
    expect(root?.getAttribute('style')).toContain('color-scheme: light')
  })

  it('extracts body markup before wrapping full preview documents in standalone HTML exports', async () => {
    const previewHtml =
      '<!doctype html><html lang="en"><head><title>Edited</title></head><body><div id="openui-root" class="genui-preview"><main><h1>Edited document headline</h1></main></div></body></html>'
    const result = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'edited-html-document',
      target: 'html',
      previewHtml,
      isDark: false,
    })
    const html = decodeExportBody(result.body)
    const document = parseHtmlDocument(html)
    const roots = document.querySelectorAll('#openui-root')

    // only one openui-root container in the wrapped output
    expect(roots).toHaveLength(1)
    const root = roots[0]
    // body markup is extracted: the headline survives, no document wrappers
    expect(root?.querySelector('main h1')?.textContent).toBe(
      'Edited document headline',
    )
    expect(root?.querySelector('html')).toBeNull()
    expect(root?.querySelector('head')).toBeNull()
    expect(root?.querySelector('body')).toBeNull()
  })

  it('returns raw SFF HTML directly for HTML exports', async () => {
    const result = await buildOpenUIHtmlExport({
      source: rawHtmlSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
    })

    expect(result.contentType).toBe('text/html; charset=utf-8')
    expect(result.filename).toBe('index.html')
    expect(decodeExportBody(result.body)).toBe(rawHtmlSource)
  })

  it('packages raw SFF HTML as a static ZIP for app export targets', async () => {
    const result = await buildOpenUIExport({
      source: rawHtmlSource,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(result.contentType).toBe('application/zip')
    expect(files['index.html']).toBe(rawHtmlSource)
    expect(files['README.md']).toContain('Export Demo')
    expect(files['README.md']).toContain(
      'Generated with [ShipFast](https://ship-fast.io) 🚀.',
    )
    expect(files['README.md']).not.toContain('Session:')
    expect(files['README.md']).not.toContain('Target:')
    const pkg = JSON.parse(files['package.json']) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts.dev).toBe('vite --host 0.0.0.0')
  })

  it('builds a React ZIP without OpenUI internals', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(result.contentType).toBe('application/zip')
    const files = unzipBuiltExportTextFiles(result.body)

    expect(Object.keys(files).sort()).toEqual(
      expect.arrayContaining([
        '.env.local',
        'README.md',
        'index.html',
        'package.json',
        'src/App.tsx',
        'src/components/SaasHero.tsx',
        'src/data/pages.ts',
        'src/lib/cn.ts',
        'src/lib/image.tsx',
        'src/main.tsx',
        'src/styles.css',
        'src/vite-env.d.ts',
        'tsconfig.json',
      ]),
    )
    expect(files['src/vite-env.d.ts']).toContain(
      '/// <reference types="vite/client" />',
    )
    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['README.md']).toContain(
      'Generated with [ShipFast](https://ship-fast.io) 🚀.',
    )
  })

  // DELETED: 'packages UI primitive dependencies for FitnessKimiPage React exports'
  // and 'copies maintained block dependencies from the generated manifest when the
  // source tree is unavailable'. Both asserted deleted-capsule-specific bundling of
  // src/components/ui/* primitives (sheet/popover/avatar/portal-container) and radix
  // deps that only the old monolithic *KimiPage page-blocks emitted. No current
  // registry/sections/** family emits src/components/ui/* files, so there is no
  // section-family equivalent to migrate these assertions to.

  it('builds a Next.js ZIP without OpenUI internals', async () => {
    const result = await buildOpenUIExport({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    expect(files['src/data/pages.ts']).toContain('Hello export')
    expect(files['app/layout.tsx']).toContain('Export Demo')
  })

  // Single explicit guard: exported artifacts (standalone HTML + React/Next
  // ZIPs) must never leak OpenUI internals (@openuidev imports, Vue
  // defineComponent, or raw OpenUI source like "root = Stack").
  it('does not leak OpenUI internals into exported artifacts', async () => {
    const forbiddenTokens = ['@openuidev', 'defineComponent', 'root = Stack']

    const htmlResult = await buildOpenUIHtmlExport({
      source,
      siteSpecJson,
      sessionId: 'leak-html',
      target: 'html',
    })
    const html = decodeExportBody(htmlResult.body)
    for (const token of forbiddenTokens) {
      expect(html).not.toContain(token)
    }

    for (const target of ['react', 'next'] as const) {
      const result = await buildOpenUIExport({
        source,
        siteSpecJson,
        sessionId: `leak-${target}`,
        target,
      })
      const files = unzipBuiltExportTextFiles(result.body)
      const joined = Object.values(files).join('\n')
      for (const token of forbiddenTokens) {
        expect(joined).not.toContain(token)
      }
    }
  })

  // DELETED: two commerce tests ("translates Lakebed-backed commerce pages to
  // native React app state" and "... to Next API routes with in-memory data").
  // Both asserted the deleted EcommerceKimiPage capsule lakebed data-binding path:
  // /react-query imports in the component, src/lib/site-data*.ts query/
  // mutation scaffolding, formatCurrency, commerce store seeds, etc. EcommerceHero
  // is a static section that does NOT trigger the commerce/site-data path, so there
  // is no section-family equivalent to migrate these assertions to.

  it('packages fullstack capsule helpers for React exports without Lakebed package leaks', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson,
      sessionId: 'react-commerce-fullstack',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const component = parseTsx(
      'src/components/EcommerceHero.tsx',
      files['src/components/EcommerceHero.tsx'] ?? '',
    )
    const siteData = parseTsx(
      'src/lib/site-data.ts',
      files['src/lib/site-data.ts'] ?? '',
    )

    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/lib/site-data.ts']).toBeDefined()
    expect(
      hasVariableInitializedByCall(component, 'lakebed', 'useLakebedAdapter'),
    ).toBe(true)
    expect(namedImportsFromModule(siteData, 'react')).toEqual(
      expect.arrayContaining(['useRef']),
    )
    expect(hasExportedFunction(siteData, 'useLakebedAdapter')).toBe(true)
    expect(hasExportedFunction(siteData, 'useKeyedLakebedMutation')).toBe(true)
    expect(
      useMemoObjectPropertyNamesInFunction(siteData, 'useKeyedLakebedMutation'),
    ).toEqual(
      expect.arrayContaining([
        'hasPending',
        'isPending',
        'lastError',
        'pendingKey',
        'pendingKeys',
        'reset',
        'run',
      ]),
    )
    expect(exportedFilesLeakPackageImport(files, '@ship-fast/lakebed')).toBe(
      false,
    )
  })

  it('exports nested composed route sections in React ZIPs without exporting Stack', async () => {
    const result = await buildOpenUIExport({
      source: v2ComposedExportSource,
      siteSpecJson: JSON.stringify({ projectName: 'Nested React Export' }),
      sessionId: 'react-nested-composed',
      target: 'react',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const routeComponent = parseTsx(
      'src/components/RoutePage1Home.tsx',
      files['src/components/RoutePage1Home.tsx'] ?? '',
    )

    expect(files['src/components/RoutePage1Home.tsx']).toBeDefined()
    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/components/ProductDetailHero.tsx']).toBeDefined()
    expect(files['src/components/Stack.tsx']).toBeUndefined()
    expect(importSpecifiers(routeComponent)).toEqual(
      expect.arrayContaining(['./EcommerceHero', './ProductDetailHero']),
    )
    expect(hasJsxElementNamed(routeComponent, 'EcommerceHero')).toBe(true)
    expect(hasJsxElementNamed(routeComponent, 'ProductDetailHero')).toBe(true)
    expect(exportedFilesLeakPackageImport(files, '@ship-fast/')).toBe(false)
  })

  it('packages shared section-kit dependencies for React exports', async () => {
    expect(resolveBlockSourceManifestPath('src/section-kit/SiteNav.tsx')).toBe(
      'src/section-kit/SiteNav.tsx',
    )
    expect(
      resolveBlockSourceManifestPath('src/section-kit/MobileNavDrawer.tsx'),
    ).toBe('src/section-kit/MobileNavDrawer.tsx')

    for (const [componentName, exportSource] of [
      ['LinkInBioNavbar', 'root = LinkInBioNavbar()'],
      ['ChurchNavbar', 'root = ChurchNavbar()'],
    ]) {
      const result = await buildOpenUIExport({
        source: exportSource,
        siteSpecJson,
        sessionId: `react-section-kit-${componentName}`,
        target: 'react',
      })
      const files = unzipBuiltExportTextFiles(result.body)

      expect(files[`src/components/${componentName}.tsx`]).toBeDefined()
      expect(exportedFilesLeakPackageImport(files, '#/')).toBe(false)
      expect(exportedFilesLeakPackageImport(files, '@ship-fast/')).toBe(false)
    }
  })

  it('packages fullstack capsule helpers for Next exports with the site data provider', async () => {
    const result = await buildOpenUIExport({
      source: 'root = EcommerceHero()',
      siteSpecJson,
      sessionId: 'next-commerce-fullstack',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const component = parseTsx(
      'src/components/EcommerceHero.tsx',
      files['src/components/EcommerceHero.tsx'] ?? '',
    )
    const layout = parseTsx('app/layout.tsx', files['app/layout.tsx'] ?? '')
    const siteData = parseTsx(
      'src/lib/site-data.ts',
      files['src/lib/site-data.ts'] ?? '',
    )

    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['app/layout.tsx']).toBeDefined()
    expect(files['src/lib/site-data.ts']).toBeDefined()
    expect(
      hasVariableInitializedByCall(component, 'lakebed', 'useLakebedAdapter'),
    ).toBe(true)
    expect(importSpecifiers(layout)).toContain('../src/lib/site-data-provider')
    expect(namedImportsFromModule(siteData, 'react')).toEqual(
      expect.arrayContaining(['useRef']),
    )
    expect(hasExportedFunction(siteData, 'useLakebedAdapter')).toBe(true)
    expect(hasExportedFunction(siteData, 'useKeyedLakebedMutation')).toBe(true)
    expect(
      useMemoObjectPropertyNamesInFunction(siteData, 'useKeyedLakebedMutation'),
    ).toEqual(
      expect.arrayContaining([
        'hasPending',
        'isPending',
        'lastError',
        'pendingKey',
        'pendingKeys',
        'reset',
        'run',
      ]),
    )
    expect(exportedFilesLeakPackageImport(files, '@ship-fast/lakebed')).toBe(
      false,
    )
  })

  it('exports nested composed route sections in Next ZIPs without exporting Stack', async () => {
    const result = await buildOpenUIExport({
      source: v2ComposedExportSource,
      siteSpecJson: JSON.stringify({ projectName: 'Nested Next Export' }),
      sessionId: 'next-nested-composed',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const routeComponent = parseTsx(
      'src/components/RoutePage1Home.tsx',
      files['src/components/RoutePage1Home.tsx'] ?? '',
    )
    const nextPage = parseTsx('app/page.tsx', files['app/page.tsx'] ?? '')

    expect(files['src/components/RoutePage1Home.tsx']).toBeDefined()
    expect(files['src/components/EcommerceHero.tsx']).toBeDefined()
    expect(files['src/components/ProductDetailHero.tsx']).toBeDefined()
    expect(files['src/components/Stack.tsx']).toBeUndefined()
    expect(importSpecifiers(routeComponent)).toEqual(
      expect.arrayContaining(['./EcommerceHero', './ProductDetailHero']),
    )
    expect(hasJsxElementNamed(routeComponent, 'EcommerceHero')).toBe(true)
    expect(hasJsxElementNamed(routeComponent, 'ProductDetailHero')).toBe(true)
    expect(hasJsxElementNamed(nextPage, 'RoutePage1Home')).toBe(true)
    expect(exportedFilesLeakPackageImport(files, '@ship-fast/')).toBe(false)
  })

  it('translates source Lakebed endpoints to Next route handlers', () => {
    const files = renderNextEndpointRouteFiles([
      {
        componentName: 'WebhookHero',
        method: 'POST',
        name: 'incoming',
        path: '/api/webhooks/incoming',
        source:
          'endpoint({ method: "POST", path: "/api/webhooks/incoming" }, async (ctx, req) => { const payload = await req.json(); ctx.db.messages.insert({ body: payload.body, ownerId: ctx.auth.userId }); return json({ ok: true }); })',
      },
    ])
    const route = files['app/api/webhooks/incoming/route.ts']

    expect(route).toContain('export async function POST(request: Request)')
    expect(route).toContain('path: "/api/webhooks/incoming"')
    expect(route).toContain('ctx.db.messages.insert')
    expect(route).toContain('return json({ ok: true });')
    expect(route).not.toContain('/api/status')
    expect(route).not.toContain('StatusPage')
  })

  it('translates endpoint calls from full OpenUI source to Next route handlers', async () => {
    const result = await buildOpenUIExport({
      source: `${source}
endpoint({ method: "POST", path: "/api/webhooks/incoming" }, async (ctx, req) => { const payload = await req.json(); ctx.db.messages.insert({ body: payload.body, ownerId: ctx.auth.userId }); return json({ ok: true }); })`,
      siteSpecJson,
      sessionId: 'source-endpoint-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)
    const route = files['app/api/webhooks/incoming/route.ts']

    expect(route).toContain('export async function POST(request: Request)')
    expect(route).toContain('path: "/api/webhooks/incoming"')
    expect(route).toContain('ctx.db.messages.insert')
    expect(route).toContain('return json({ ok: true });')
    expect(route).not.toContain('/api/status')
    expect(route).not.toContain('StatusPage')
    expect(files['src/lib/site-data-store.ts']).toContain(
      'type SiteEndpointHandler =',
    )
    expect(files['src/lib/site-data-store.ts']).toContain('json: <T = any>()')
    expect(files['src/lib/site-data-store.ts']).not.toContain(
      'handler: Function',
    )
  })

  it('embeds preview image swaps in React and Next image helpers', async () => {
    const previewHtml =
      '<main><img alt="Edited hero image" src="https://cdn.example.test/edited-hero.jpg" /></main>'

    const react = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-image-react',
          target: 'react',
          previewHtml,
        })
      ).body,
    )
    const next = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-image-next',
          target: 'next',
          previewHtml,
        })
      ).body,
    )

    for (const files of [react, next]) {
      expect(files['src/lib/image.tsx']).toContain('previewImageSources')
      expect(files['src/lib/image.tsx']).toContain('Edited hero image')
      expect(files['src/lib/image.tsx']).toContain(
        'https://cdn.example.test/edited-hero.jpg',
      )
      expect(files['src/lib/image.tsx']).toContain(
        'const previewSrc = previewImageSourceByAlt.get(normalizedAlt)',
      )
      expect(files['src/lib/image.tsx']).toContain(
        'const imageSrc = previewSrc ||',
      )
    }
  })

  it('embeds preview style edits in React and Next client runtimes', async () => {
    const previewHtml =
      '<main><h1 class="hero-title text-4xl" style="color: rgb(255, 0, 0); text-align: center;">Hello export</h1></main>'

    const react = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-style-react',
          target: 'react',
          previewHtml,
        })
      ).body,
    )
    const next = unzipBuiltExportTextFiles(
      (
        await buildOpenUIExport({
          source,
          siteSpecJson,
          sessionId: 'edited-style-next',
          target: 'next',
          previewHtml,
        })
      ).body,
    )

    expect(react['src/main.tsx']).toContain(
      "import { StyleOverrides } from './lib/style-overrides'",
    )
    expect(react['src/main.tsx']).toContain('<StyleOverrides />')
    expect(next['app/layout.tsx']).toContain(
      "import { StyleOverrides } from '../src/lib/style-overrides'",
    )
    expect(next['app/layout.tsx']).toContain('<StyleOverrides />')

    for (const files of [react, next]) {
      expect(files['src/lib/style-overrides.tsx']).toContain('use client')
      expect(files['src/lib/style-overrides.tsx']).toContain('styleOverrides')
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'hero-title text-4xl',
      )
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'color: rgb(255, 0, 0); text-align: center;',
      )
      expect(files['src/lib/style-overrides.tsx']).toContain(
        'new MutationObserver',
      )
    }
  })

  it('preserves ReactNode type imports required by extracted component helpers', async () => {
    const result = await buildOpenUIExport({
      source:
        'root = AboutHero("Native Store", ["Home"], {"heading":"About Native Store"})',
      siteSpecJson: JSON.stringify({ projectName: 'Native Store' }),
      sessionId: 'about-demo',
      target: 'next',
    })
    const files = unzipBuiltExportTextFiles(result.body)

    // AboutHero emits a ReactNode type import consumed by an extracted helper
    // (e.g. the `Eyebrow` subcomponent typing `icon: ReactNode`). This is the
    // type-import-preservation contract; quote style belongs to the formatter.
    expect(files['src/components/AboutHero.tsx']).toMatch(
      /import type \{ ReactNode \} from ['"]react['"]/,
    )
    expect(files['src/components/AboutHero.tsx']).toContain('icon: ReactNode')
    expect(files['src/components/AboutHero.tsx']).toContain(
      'export type AboutHeroProps = {',
    )
    expect(files['src/components/AboutHero.tsx']).toContain('heading?: string')
    expect(files['src/components/AboutHero.tsx']).not.toContain(
      'AboutHeroPropsSchema',
    )
    expect(files['src/components/AboutHero.tsx']).not.toContain('z.infer')
  })
})
