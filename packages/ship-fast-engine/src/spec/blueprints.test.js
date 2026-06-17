import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, describe, expect, it } from 'vitest'

import {
  enrichSiteSpecWithWorkspaceBlueprints,
  extractRenderBlueprintFromHtml,
  stripSiteSpecBlueprints,
} from './blueprints.js'

const htmlDocument = `<!doctype html>
<html lang="en" data-theme="night">
  <head>
    <title>Launch Page</title>
    <meta name="description" content="Fast launch">
    <link rel="canonical" href="https://example.test/">
    <style>body { color: black; }</style>
    <script type="module">window.booted = true</script>
    <script>window.__SF_PREVIEW_SESSION_ID__="abc"</script>
  </head>
  <body class="home" data-editable="true" data-sf-edit-id="hero">
    <main><h1>Launch</h1></main>
    <script data-sf-editor-runtime="1">window.editor = true</script>
    <script src="/app.js"></script>
  </body>
</html>`

describe('extractRenderBlueprintFromHtml', () => {
  it('extracts renderable document state and strips editor-only artifacts', () => {
    const blueprint = extractRenderBlueprintFromHtml(htmlDocument)

    expect(blueprint).toMatchObject({
      version: 1,
      exactClone: true,
      title: 'Launch Page',
      htmlAttributes: { lang: 'en', 'data-theme': 'night' },
      bodyAttributes: { class: 'home' },
    })
    expect(blueprint.meta).toEqual([
      { name: 'description', content: 'Fast launch' },
    ])
    expect(blueprint.links).toEqual([
      { rel: 'canonical', href: 'https://example.test/' },
    ])
    expect(blueprint.styles).toEqual(['body { color: black; }'])
    expect(blueprint.scripts).toEqual([
      { type: 'module', content: 'window.booted = true', location: 'head' },
      { src: '/app.js', content: '', location: 'body' },
    ])
    expect(blueprint.bodyHtml).toContain('<main><h1>Launch</h1></main>')
    expect(blueprint.bodyHtml).not.toContain('data-editable')
    expect(blueprint.originalHtmlDocument).not.toContain(
      '__SF_PREVIEW_SESSION_ID__',
    )
    expect(blueprint.originalHtmlDocument).not.toContain(
      'data-sf-editor-runtime',
    )
  })

  it('treats body-only fragments as blueprint body HTML', () => {
    const blueprint = extractRenderBlueprintFromHtml(
      '<section><h2>Fragment</h2></section>',
      {
        title: 'Fallback Title',
      },
    )

    expect(blueprint.title).toBe('Fallback Title')
    expect(blueprint.bodyHtml).toBe('<section><h2>Fragment</h2></section>')
    expect(blueprint.headHtml).toBe('')
    expect(blueprint.scripts).toEqual([])
  })
})

describe('workspace render blueprints', () => {
  let workspace = ''

  afterEach(() => {
    if (workspace) rmSync(workspace, { recursive: true, force: true })
    workspace = ''
  })

  it('adds a blueprint for pages with matching HTML files and nulls missing pages', () => {
    workspace = mkdtempSync(join(tmpdir(), 'ship-fast-blueprints-'))
    writeFileSync(join(workspace, 'index.html'), htmlDocument)
    writeFileSync(
      join(workspace, 'about.html'),
      '<html><head><title>About</title></head><body><p>About us</p></body></html>',
    )

    const enriched = enrichSiteSpecWithWorkspaceBlueprints(
      {
        pages: [
          { id: 'home', route: '/', title: 'Home', seo: { title: 'Home SEO' } },
          { id: 'about', route: '/about', title: 'About' },
          { id: 'missing', route: '/missing', title: 'Missing' },
        ],
      },
      workspace,
    )

    expect(enriched.pages[0].renderBlueprint.title).toBe('Launch Page')
    expect(enriched.pages[1].renderBlueprint.bodyHtml).toContain('About us')
    expect(enriched.pages[2].renderBlueprint).toBeNull()
  })

  it('removes render blueprints without changing page identity', () => {
    const siteSpec = {
      pages: [
        {
          id: 'home',
          route: '/',
          renderBlueprint: { version: 1, bodyHtml: '<main />' },
        },
      ],
    }

    expect(stripSiteSpecBlueprints(siteSpec)).toEqual({
      pages: [{ id: 'home', route: '/', renderBlueprint: null }],
    })
  })
})
