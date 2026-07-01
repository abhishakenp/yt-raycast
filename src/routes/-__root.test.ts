import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

const source = readFileSync(
  join(process.cwd(), 'src/routes/__root.tsx'),
  'utf8',
)

describe('root route Plausible analytics', () => {
  it('loads Plausible from the custom analytics domain in the document head', () => {
    expect(source).toContain("const PLAUSIBLE_TRACKED_DOMAIN = 'ship-fast.ai'")
    expect(source).toContain(
      "const PLAUSIBLE_SCRIPT_SRC = 'https://plausible.ship-fast.ai/js/script.js'",
    )
    expect(source).toContain('scripts: [')
    expect(source).toContain('defer: true')
    expect(source).toContain("'data-domain': PLAUSIBLE_TRACKED_DOMAIN")
    expect(source).toContain('src: PLAUSIBLE_SCRIPT_SRC')
    expect(source).not.toContain('attrs: {')
  })
})
