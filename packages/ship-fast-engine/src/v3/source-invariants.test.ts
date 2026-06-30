import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = resolve(__dirname, '../../../..')
const engineSelectorPath = resolve(
  repoRoot,
  'src/features/generation/server/engine-selector.ts',
)
const engineIndexPath = resolve(
  repoRoot,
  'packages/ship-fast-engine/src/index.ts',
)
const convexGenerationPath = resolve(repoRoot, 'convex/generation.ts')

const read = (p: string): string => {
  try {
    return readFileSync(p, 'utf-8')
  } catch {
    return ''
  }
}

describe('v3 source-level invariants', () => {
  it('engine-selector.ts wires runAllV3 and handles v3', () => {
    const src = read(engineSelectorPath)
    expect(src).toContain('runAllV3')
    expect(src).toContain("'v3'")
    expect(src).toContain("version === 'v3'")
    expect(src).toContain("engineFlag === 'v3'")
  })

  it('ship-fast-engine index exports runAllV3', () => {
    const src = read(engineIndexPath)
    expect(src).toContain('runAllV3')
    expect(src).toMatch(/export\s*\{[^}]*runAllV3[^}]*\}/)
  })

  it('convex/generation.ts routes v3 with ship-fast-engine-v3 provider', () => {
    const src = read(convexGenerationPath)
    expect(src).toContain("engineVersion === 'v3'")
    expect(src).toContain('ship-fast-engine-v3')
    expect(src).toContain("getSelectedEngine('v3')")
  })
})
