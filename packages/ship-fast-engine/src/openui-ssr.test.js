import { describe, expect, it } from 'vitest'

import { renderOpenUIToHTML } from './openui-ssr.js'

describe('renderOpenUIToHTML', () => {
  it('renders fitness pages when generated schedule rows omit slots', () => {
    const html = renderOpenUIToHTML(`$page = "Home"
home = FitnessKimiPage("FitLocal", ["Home"], {}, {}, {}, {heading: "Schedule", days: ["Mon", "Tue"], rows: [{time: "6 AM"}]})`)

    expect(html).not.toContain('openui-error')
    expect(html).toContain('FitLocal')
    expect(html).toContain('6 AM')
  })
})
