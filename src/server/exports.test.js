import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildFallbackSiteSpec } from '../spec/defaults.js'
import { decorateExportFiles, generateSessionExport, getSessionExportBundle } from './exports.js'

let tmpRoot = null

function writeHtmlExportSession() {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-html-export-'))
  const workspace = join(tmpRoot, 'session-html')
  mkdirSync(workspace, { recursive: true })

  const siteSpec = buildFallbackSiteSpec({
    prompt: 'A product website for Atlas Notes',
    ctx: {
      project_name: 'Atlas Notes',
      site_type: 'saas',
      tagline: 'Shared launch docs for small teams',
    },
    siteType: 'saas',
  })
  siteSpec.brand = 'Atlas Notes'
  siteSpec.slug = 'atlas-notes'
  writeFileSync(join(workspace, 'site-spec.json'), JSON.stringify(siteSpec, null, 2))

  return { id: 'session-html', workspace }
}

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

describe('export badge decoration', () => {
  it('injects the Ship Fast badge into free HTML exports', () => {
    const files = decorateExportFiles({
      'index.html': '<!doctype html><html><body><main>Demo</main></body></html>',
    })

    expect(files['index.html']).toContain('data-ship-fast-export-badge="1"')
    expect(files['index.html']).toContain('<svg viewBox="0 0 52 52"')
    expect(files['index.html']).toContain('Built with Ship Fast')
    expect(files['index.html']).toMatch(/Built with Ship Fast[\s\S]*<\/a><\/body>/)
  })

  it('does not inject the badge when paid exports request a clean bundle', () => {
    const files = decorateExportFiles(
      {
        'index.html': '<!doctype html><html><body><main>Demo</main></body></html>',
      },
      { includeBadge: false },
    )

    expect(files['index.html']).not.toContain('data-ship-fast-export-badge="1"')
    expect(files['index.html']).not.toContain('<svg viewBox="0 0 52 52"')
  })

  it('builds a downloadable HTML bundle from a session site spec', () => {
    const session = writeHtmlExportSession()

    const result = generateSessionExport(session, 'html')
    const bundle = getSessionExportBundle(session, 'html')

    expect(result).toMatchObject({
      target: 'html',
      downloadPath: '/api/sessions/session-html/download/html',
      siteSpecReady: true,
    })
    expect(result.fileCount).toBeGreaterThan(4)
    expect(bundle?.path).toBe(join(session.workspace, 'exports', 'html.zip'))
    expect(existsSync(join(session.workspace, 'exports', 'html', 'index.html'))).toBe(true)
    expect(existsSync(join(session.workspace, 'exports', 'html', 'site.css'))).toBe(true)
    expect(existsSync(join(session.workspace, 'exports', 'html', 'README.md'))).toBe(true)

    const html = readFileSync(join(session.workspace, 'exports', 'html', 'index.html'), 'utf-8')
    expect(html).toContain('Atlas Notes')
    expect(html).toContain('data-ship-fast-export-badge="1"')

    const zip = readFileSync(bundle.path)
    expect(zip.subarray(0, 2).toString('utf-8')).toBe('PK')
    expect(zip.toString('latin1')).toContain('index.html')
    expect(zip.toString('latin1')).toContain('README.md')

    const metadata = JSON.parse(readFileSync(join(session.workspace, '.exports.json'), 'utf-8'))
    expect(metadata.targets.html).toMatchObject({
      bundlePath: join('exports', 'html.zip'),
      fileCount: result.fileCount,
      badgeMode: 'free',
    })
  })
})
