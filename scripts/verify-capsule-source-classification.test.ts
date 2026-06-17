import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildCapsuleSourceClassification,
  classifyCapsuleSourceOrigin,
  countSourceLines,
  extractCapsuleExports,
  renderCapsuleSourceClassification,
} from './verify-capsule-source-classification'

const capsuleRoot = 'packages/ship-fast-blocks/src/capsules'

async function withCapsules(
  files: Record<string, string>,
  callback: (root: string) => void | Promise<void>,
) {
  const root = mkdtempSync(join(tmpdir(), 'capsule-classification-'))
  const capsulesDir = join(root, capsuleRoot)
  mkdirSync(capsulesDir, { recursive: true })

  try {
    for (const [file, source] of Object.entries(files)) {
      writeFileSync(join(capsulesDir, file), source)
    }
    await callback(root)
  } finally {
    rmSync(root, { force: true, recursive: true })
  }
}

describe('capsule source classification verifier', () => {
  it('classifies Kimi ports separately from hand-authored source', () => {
    expect(
      classifyCapsuleSourceOrigin(
        '/* A faithful Tailwind port of a Kimi-generated design. */',
      ),
    ).toBe('generated-kimi-port')
    expect(
      classifyCapsuleSourceOrigin(
        '/* converted from generated Kimi HTML into a responsive page block */',
      ),
    ).toBe('generated-kimi-port')
    expect(classifyCapsuleSourceOrigin('export const Unmarked = {}')).toBe(
      'unmarked-source',
    )
  })

  it('extracts capsule exports and counts source lines deterministically', () => {
    const source = [
      'export const Alpha = defineCapsule({})',
      'export const Beta = defineCapsule({})',
      'const ignored = defineCapsule({})',
      '',
    ].join('\n')

    expect(extractCapsuleExports(source)).toEqual(['Alpha', 'Beta'])
    expect(countSourceLines(source)).toBe(3)
  })

  it('builds a sorted manifest with summary counts and large-file flags', async () => {
    await withCapsules(
      {
        'b.tsx':
          '/* converted from generated Kimi HTML */\nexport const B = defineCapsule({})\n',
        'a.tsx': `${Array.from({ length: 1_001 }, (_, index) =>
          index === 0 ? 'export const A = defineCapsule({})' : '// line',
        ).join('\n')}\n`,
      },
      async (root) => {
        const classification = buildCapsuleSourceClassification(root)

        expect(classification.generatedBy).toBe(
          'scripts/verify-capsule-source-classification.ts',
        )
        expect(classification.summary).toEqual({
          generatedKimiPortFiles: 1,
          largeFiles: 1,
          maxLines: 1_001,
          totalFiles: 2,
          totalLines: 1_003,
          unmarkedSourceFiles: 1,
        })
        expect(classification.files.map(({ file }) => file)).toEqual([
          'packages/ship-fast-blocks/src/capsules/a.tsx',
          'packages/ship-fast-blocks/src/capsules/b.tsx',
        ])
        expect(classification.files[0]).toMatchObject({
          exports: ['A'],
          large: true,
          origin: 'unmarked-source',
        })
        expect(classification.files[1]).toMatchObject({
          exports: ['B'],
          large: false,
          origin: 'generated-kimi-port',
        })
        await expect(
          renderCapsuleSourceClassification(classification),
        ).resolves.toContain('"totalFiles": 2')
      },
    )
  })
})
