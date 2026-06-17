import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from './openui-ssr.js'

describe('renderOpenUIToHTML', () => {
  it('renders simple text OpenUI source without an error shell', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
root = Text("Dashboard browser verifier")`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('Dashboard browser verifier')
  })

  it('renders fitness pages when generated schedule rows omit slots', async () => {
    const html = await renderOpenUIToHTML(`$page = "Home"
home = FitnessKimiPage("FitLocal", ["Home"], {}, {}, {}, {heading: "Schedule", days: ["Mon", "Tue"], rows: [{time: "6 AM"}]})`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('FitLocal')
    expect(html).toContain('6:00 AM')
  })

  it('uses the response-scoped runtime entry instead of the eager blocks barrel', () => {
    const source = readFileSync(
      new URL('./openui-ssr.js', import.meta.url),
      'utf8',
    )

    expect(source).toContain('@ship-fast/blocks/runtime')
    expect(source).not.toContain("from '@ship-fast/blocks'")
    expect(source).toContain('loadOpenUIRuntimeLibrary(preprocessed)')
  })
})
