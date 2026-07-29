import { describe, expect, it } from 'vitest'

import { runtimeComponentNames } from './generated/runtime-component-names'
import provenanceJson from './generated/react-export-sources.provenance.json'

const generatorPath =
  'packages/ship-fast-blocks/scripts/generate-react-export-sources.mjs'

type GeneratedProvenance = {
  componentCount: number
  sectionComponentCount?: number
  components: Array<{ name: string; sourceFile: string }>
  generatedBy: string
  generatorVersion: number
  outputs: string[]
  sourceRoots: string[]
}

const provenance = provenanceJson as GeneratedProvenance

describe('generated OpenUI artifact provenance', () => {
  it('records the generator, source roots, output files, and input component files', () => {
    expect(provenance.generatorVersion).toBe(1)
    expect(provenance.generatedBy).toBe(generatorPath)
    expect(provenance.sourceRoots).toEqual([
      'src/registry',
      'src/capsules',
      'src/motifs',
      'src/primitives',
    ])
    expect(provenance.outputs).toEqual([
      'src/generated/react-export-sources.json',
      'src/generated/react-export-sources.compressed.ts',
      'src/generated/block-source-files.compressed.ts',
      'src/generated/vendor-source-files.compressed.ts',
      'src/generated/runtime-component-loaders.ts',
      'src/generated/runtime-component-names.ts',
      'src/generated/runtime-section-component-names.ts',
      'src/generated/capsule-categories.ts',
      'src/generated/react-export-sources.provenance.json',
    ])
    expect(provenance.componentCount).toBe(provenance.components.length)
    expect(provenance.componentCount).toBeGreaterThan(100)
    // The exported runtime names (direct module import) must match the
    // provenance manifest exactly — no regex extraction from source text.
    expect(provenance.components.map(({ name }) => name)).toEqual([
      ...runtimeComponentNames,
    ])
    expect(provenance.components).toContainEqual({
      name: 'Stack',
      sourceFile: 'src/registry/primitives/layout.tsx',
    })

    for (const { sourceFile } of provenance.components) {
      expect(sourceFile).toMatch(
        /^src\/(?:registry|capsules|motifs|primitives)\/.+\.tsx$/,
      )
    }
  })
})
