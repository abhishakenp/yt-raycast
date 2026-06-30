import { describe, expect, it } from 'vitest'
import ts from 'typescript'

import { buildOpenUIArtifactFiles } from './openui-artifact-files'

// Section-family components take flat positional string args (signature order),
// not the old (brand, nav, props) KimiPage shape. Required text is placed in the
// heading/title slot so it renders into the DOM and serializes into pages.ts.
const source =
  'root = SaasHero("Artifact Demo", "Hello artifact", "artifact", "Launch faster", "Start now")'

const v1PublicationSource = `root = PageSwitch(["Home", "Admin"], [home, admin])
home = BlogHero("Cover", "Newsroom", "Featured", "Artifact Gazette", "Audit ready story", "Maya", "5 min", "Today", "Read", "/posts")
admin = DashboardHeader("Newsroom Admin", "Manage Artifact Gazette", "Search posts", "New post")`

const v1CommerceSource = `root = PageSwitch(["Home", "Shop", "Admin"], [home, shop, admin])
home = EcommerceHero("New season", "Artifact Store Home", "Launch-ready commerce with owner-gated operations", "Shop now", "Browse", "Storefront", "Artifact Store")
shop = ShopOverview("Artifact Store", "Catalog", "Artifact Store Catalog", "Browse products and bundles", "Shop now", "Filter", "Catalog grid", ["New arrivals", "Bestsellers"], "stats")
admin = DashboardHeader("Store Admin", "Manage products, orders, inventory, and customers", "Search orders", "New product")`

const v1SoftwareSource = `root = PageSwitch(["Home", "Docs", "Contact", "Admin"], [home, docs, contact, admin])
home = SaasHero("Artifact SaaS", "Artifact SaaS Home", "launch", "Software launch with docs, leads, and admin operations", "Start now", "Book demo", "Trusted by product teams")
docs = DocsHero("Documentation", "Artifact SaaS Docs", "Guides and setup notes", "Search docs", "/search", "Quickstart", "/quickstart", "API", "/api")
contact = ContactHero("Contact", "Talk to Artifact SaaS", "Request guidance for your workspace")
admin = DashboardHeader("Workspace Admin", "Manage users, leads, docs, billing signals, and audit events", "Search users", "Invite user")`

const siteSpecJson = JSON.stringify({ projectName: 'Artifact Demo' })
const siteSpecJsonWithGenUI = JSON.stringify({
  projectName: 'Artifact Demo',
  genui: {
    version: 1,
    category: 'publication',
    ownerEmail: 'founder@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'founder@example.com',
    },
    fullstackManifest: { schema: 'publication-newsroom-v1' },
  },
})

const siteSpecJsonWithCommerceGenUI = JSON.stringify({
  projectName: 'Artifact Store',
  genui: {
    version: 1,
    category: 'commerce',
    ownerEmail: 'store@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'store@example.com',
      adminEmails: ['store@example.com'],
    },
    fullstackManifest: {
      schema: 'commerce-fullstack-v1',
      tables: ['products', 'orders', 'customers', 'adminUsers'],
    },
    openuiManifest: {
      pages: [
        { id: 'home', label: 'Home', component: 'EcommerceHero' },
        { id: 'shop', label: 'Shop', component: 'ShopOverview' },
        { id: 'admin', label: 'Admin', component: 'DashboardHeader' },
      ],
    },
  },
})

const siteSpecJsonWithSoftwareGenUI = JSON.stringify({
  projectName: 'Artifact SaaS',
  genui: {
    version: 1,
    category: 'software',
    ownerEmail: 'saas@example.com',
    adminPolicy: {
      mode: 'baked-owner',
      authProvider: 'shoo',
      ownerEmail: 'saas@example.com',
      adminEmails: ['saas@example.com'],
    },
    fullstackManifest: {
      schema: 'software-fullstack-v1',
      tables: ['users', 'leads', 'docs', 'auditEvents', 'adminUsers'],
    },
    openuiManifest: {
      pages: [
        { id: 'home', label: 'Home', component: 'SaasHero' },
        { id: 'docs', label: 'Docs', component: 'DocsHero' },
        { id: 'contact', label: 'Contact', component: 'ContactHero' },
        { id: 'admin', label: 'Admin', component: 'DashboardHeader' },
      ],
    },
  },
})

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

const expectRouteWrapperRenders = (
  files: Record<string, string>,
  routeComponent: string,
  sectionComponent: string,
) => {
  const sourceFile = parseTsx(
    `src/components/${routeComponent}.tsx`,
    files[`src/components/${routeComponent}.tsx`] ?? '',
  )

  expect(importSpecifiers(sourceFile)).toContain(`./${sectionComponent}`)
  expect(hasJsxElementNamed(sourceFile, sectionComponent)).toBe(true)
}

describe('openui artifact files', () => {
  it('builds React artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'react',
    })

    expect(download?.filename).toBe('artifact-demo-react.zip')
    expect(files['src/components/SaasHero.tsx']).toContain('SaasHero')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    expectRouteWrapperRenders(files, 'RoutePage1Home', 'SaasHero')
    expect(files['vite.config.js']).toBeUndefined()
  })

  it('includes generated admin/fullstack metadata files in exported artifacts', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'react',
    })

    const metadata = JSON.parse(files['ship-fast-genui.json'])
    expect(metadata).toMatchObject({
      generatedBy: 'ship-fast',
      sessionId: 'demo',
      target: 'react',
      genui: {
        category: 'publication',
        ownerEmail: 'founder@example.com',
        adminPolicy: {
          mode: 'baked-owner',
          authProvider: 'shoo',
          ownerEmail: 'founder@example.com',
        },
      },
    })
    expect(files['public/ship-fast-genui.json']).toBe(
      files['ship-fast-genui.json'],
    )
    expect(files['ship-fast-admin.js']).toContain(
      'window.assertShipFastAdminAccess',
    )
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
    expect(files['public/ship-fast-admin.js']).toBe(files['ship-fast-admin.js'])
    expect(files['src/ship-fast-admin.ts']).toContain(
      'export function assertShipFastAdminAccess',
    )
    expect(files['src/ship-fast-admin.ts']).toContain(
      'shipFastAdminEmails = [\n  "founder@example.com"\n]',
    )
  })

  it('builds Next artifact files from OpenUI components instead of static preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      sessionId: 'demo',
      target: 'next',
    })

    expect(download?.filename).toBe('artifact-demo-next.zip')
    expect(files['src/components/SaasHero.tsx']).toContain('SaasHero')
    expect(files['src/data/pages.ts']).toContain('Hello artifact')
    expectRouteWrapperRenders(files, 'RoutePage1Home', 'SaasHero')
    expect(files['next.config.js']).toBeUndefined()
  })

  it('builds HTML artifact files from OpenUI source instead of debug fallback preview HTML', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      previewHtml:
        '<!doctype html><html><body><p>Generated OpenUI source is ready.</p><script type="application/json" id="ship-fast-openui-source">"root = Debug()"</script></body></html>',
      siteSpecJson,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('Hello artifact')
    expect(files['index.html']).not.toContain(
      'Generated OpenUI source is ready',
    )
    expect(files['index.html']).not.toContain('ship-fast-openui-source')
    expect(files['index.html']).not.toContain('root = Debug')
  })

  it('embeds admin bootstrap in single-file HTML exports when genui policy exists', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(files['index.html']).toContain('window.assertShipFastAdminAccess')
    expect(files['index.html']).toContain('founder@example.com')
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
  })

  it('exports v1 PageSwitch publication/admin source as HTML with baked admin metadata', async () => {
    const { files, download } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'html',
      includeBadge: false,
    })

    expect(download?.filename).toBe('index.html')
    expect(files['index.html']).toContain('Artifact Gazette')
    expect(files['index.html']).toContain('Newsroom Admin')
    expect(files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(files['index.html']).toContain('founder@example.com')
    expect(files['ship-fast-genui.json']).toContain('publication-newsroom-v1')
  })

  it('wires baked admin access into React artifact routes', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'react',
    })

    expect(files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(files['src/App.tsx']).toContain('isShipFastAdminRoute')
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'assertShipFastAdminAccess',
    )
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'shipFastAdminEmail',
    )
    expect(files['src/ship-fast-admin.ts']).toContain('founder@example.com')
  })

  it('wires baked admin access into Next admin route files', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'next',
    })

    expect(files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    expect(files['app/admin/page.tsx']).toContain('routeLabel={route.label}')
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain(
      'assertShipFastAdminAccess',
    )
    expect(files['src/lib/ship-fast-admin-gate.tsx']).toContain("'use client'")
    expect(files['src/ship-fast-admin.ts']).toContain('founder@example.com')
  })

  it('includes generated admin metadata in Lakebed artifact files', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'lakebed',
    })

    const metadata = JSON.parse(files['ship-fast-genui.json'])
    expect(metadata.target).toBe('lakebed')
    expect(metadata.genui.adminPolicy.ownerEmail).toBe('founder@example.com')
    expect(files['public/ship-fast-genui.json']).toBe(
      files['ship-fast-genui.json'],
    )
    expect(files['ship-fast-admin.js']).toContain(
      'window.assertShipFastAdminAccess',
    )
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
    expect(files['src/ship-fast-admin.ts']).toContain(
      'shipFastAdminEmails = [\n  "founder@example.com"\n]',
    )
  })

  it('wires baked admin access into Lakebed generated client routes', async () => {
    const { files } = await buildOpenUIArtifactFiles({
      source: v1PublicationSource,
      siteSpecJson: siteSpecJsonWithGenUI,
      sessionId: 'demo',
      target: 'lakebed',
    })

    expect(files['client/index.tsx']).toContain('ShipFastAdminGate')
    expect(files['client/index.tsx']).toContain('shipFastAdminEmails')
    expect(files['client/index.tsx']).toContain('founder@example.com')
    expect(files['client/index.tsx']).toContain('isShipFastAdminRoute(page)')
    expect(files['ship-fast-admin.js']).toContain('founder@example.com')
  })

  it('exports generic v1 commerce source across targets with baked admin access', async () => {
    const html = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'html',
      includeBadge: false,
    })
    expect(html.files['index.html']).toContain('Artifact Store')
    expect(html.files['index.html']).toContain('Store Admin')
    expect(html.files['index.html']).toContain('window.__SHIP_FAST_ADMIN__')
    expect(html.files['ship-fast-genui.json']).toContain(
      'commerce-fullstack-v1',
    )
    expect(html.files['ship-fast-admin.js']).toContain('store@example.com')

    const react = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'react',
    })
    expect(react.files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(react.files['src/App.tsx']).toContain('isShipFastAdminRoute')
    expect(react.files['src/data/pages.ts']).toContain('Artifact Store Catalog')
    expect(react.files['src/ship-fast-admin.ts']).toContain('store@example.com')

    const next = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'next',
    })
    expect(next.files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    expectRouteWrapperRenders(next.files, 'RoutePage2Shop', 'ShopOverview')
    expect(next.files['src/ship-fast-admin.ts']).toContain('store@example.com')

    const lakebed = await buildOpenUIArtifactFiles({
      source: v1CommerceSource,
      siteSpecJson: siteSpecJsonWithCommerceGenUI,
      sessionId: 'commerce-demo',
      target: 'lakebed',
    })
    expect(lakebed.files['client/index.tsx']).toContain('ShipFastAdminGate')
    expect(lakebed.files['client/index.tsx']).toContain(
      'isShipFastAdminRoute(page)',
    )
    expect(lakebed.files['ship-fast-admin.js']).toContain('store@example.com')
  })

  it('exports generic v1 software source with docs, contact, and admin routes', async () => {
    const react = await buildOpenUIArtifactFiles({
      source: v1SoftwareSource,
      siteSpecJson: siteSpecJsonWithSoftwareGenUI,
      sessionId: 'software-demo',
      target: 'react',
    })
    expect(react.files['src/App.tsx']).toContain('ShipFastAdminGate')
    expect(react.files['src/data/pages.ts']).toContain('Artifact SaaS Docs')
    expect(react.files['src/data/pages.ts']).toContain('Talk to Artifact SaaS')
    expect(react.files['ship-fast-genui.json']).toContain(
      'software-fullstack-v1',
    )
    expect(react.files['src/ship-fast-admin.ts']).toContain('saas@example.com')

    const next = await buildOpenUIArtifactFiles({
      source: v1SoftwareSource,
      siteSpecJson: siteSpecJsonWithSoftwareGenUI,
      sessionId: 'software-demo',
      target: 'next',
    })
    expectRouteWrapperRenders(next.files, 'RoutePage2Docs', 'DocsHero')
    expectRouteWrapperRenders(next.files, 'RoutePage3Contact', 'ContactHero')
    expect(next.files['app/admin/page.tsx']).toContain('ShipFastAdminGate')
    expect(next.files['src/ship-fast-admin.ts']).toContain('saas@example.com')
  })

  it('fails HTML artifacts when source rendering fails instead of packaging preview fallback', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><body><p>Generated OpenUI source is ready.</p><script id="ship-fast-openui-source">"root = Debug()"</script></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'html',
      }),
    ).rejects.toThrow()
  })

  it('fails React artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'react',
      }),
    ).rejects.toThrow()
  })

  it('fails Next artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'next',
      }),
    ).rejects.toThrow()
  })

  it('fails Lakebed artifacts when native OpenUI translation fails', async () => {
    await expect(
      buildOpenUIArtifactFiles({
        source: 'root = MissingBlock("Fallback Demo", UnknownReference)',
        previewHtml:
          '<!doctype html><html><head><title>Fallback Demo</title></head><body><main>Rendered fallback</main></body></html>',
        siteSpecJson,
        sessionId: 'demo',
        target: 'lakebed',
      }),
    ).rejects.toThrow()
  })
})
