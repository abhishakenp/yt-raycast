import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from '../openui-ssr'

/**
 * Contract test: every motif-based fixture must render through SSR without
 * crashing, producing valid HTML with no error panels.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

function loadFixture(name: string): string {
  return readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')
}

async function expectRenders(source: string, locale = 'en'): Promise<string> {
  const html = await renderOpenUIToHTML(source, undefined, locale)
  expect(html.toLowerCase()).not.toContain('openui-error')
  expect(html.toLowerCase()).not.toContain('failed to render')
  expect(html.length).toBeGreaterThan(100)
  return html
}

describe('SSR render contract (motif fixtures)', () => {
  it('renders coffee-shop fixture', async () => {
    const html = await expectRenders(loadFixture('coffee-shop'))
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders saas-landing fixture', async () => {
    const html = await expectRenders(loadFixture('saas-landing'))
    expect(html.length).toBeGreaterThan(500)
  })

  it('renders portfolio fixture', async () => {
    const html = await expectRenders(loadFixture('portfolio'))
    expect(html.length).toBeGreaterThan(500)
  })
})
