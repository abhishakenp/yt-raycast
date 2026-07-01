import { describe, expect, it } from 'vitest'
import {
  getBlockSourceFile,
  getBlockSourceFileIndex,
  normalizeBlockSourceRelPath,
  resolveBlockSourceManifestPath,
  resolveRelativeBlockSourcePath,
  sourcePathCandidates,
  toPosixPath,
} from './block-source-manifest'

describe('block source manifest helpers', () => {
  it('normalizes platform paths and source extensions to manifest-relative module ids', () => {
    expect(toPosixPath('src\\components\\ui\\button.tsx')).toBe(
      'src/components/ui/button.tsx',
    )
    expect(
      normalizeBlockSourceRelPath(
        'packages/ship-fast-blocks/src/components/ui/button.tsx',
      ),
    ).toBe('components/ui/button')
    expect(normalizeBlockSourceRelPath('src/section-kit/SiteNav.tsx')).toBe(
      'section-kit/SiteNav',
    )
  })

  it('tries file and package entrypoint candidates in runtime resolution order', () => {
    expect(sourcePathCandidates('src/components/ui/button')).toEqual([
      'src/components/ui/button',
      'src/components/ui/button.ts',
      'src/components/ui/button.tsx',
      'src/components/ui/button.js',
      'src/components/ui/button.jsx',
      'src/components/ui/button.mjs',
      'src/components/ui/button.cjs',
      'src/components/ui/button.json',
      'src/components/ui/button.css',
      'src/components/ui/button/index.ts',
      'src/components/ui/button/index.tsx',
      'src/components/ui/button/index.js',
      'src/components/ui/button/index.jsx',
      'src/components/ui/button/index.mjs',
      'src/components/ui/button/index.cjs',
      'src/components/ui/button/package.json',
    ])
  })

  it('resolves real generated manifest entries from package-prefixed and src-relative imports', () => {
    expect(
      resolveBlockSourceManifestPath(
        'packages/ship-fast-blocks/src/components/ui/button.tsx',
      ),
    ).toBe('src/components/ui/button.tsx')
    expect(resolveBlockSourceManifestPath('src/section-kit/SiteNav.tsx')).toBe(
      'src/section-kit/SiteNav.tsx',
    )
  })

  it('resolves relative dependencies against the importing block source path', () => {
    expect(
      resolveRelativeBlockSourcePath(
        'src/section-kit/SiteNav.tsx',
        '../components/ui/button',
      ),
    ).toBe('src/components/ui/button.tsx')
  })

  it('returns source content for present entries and throws a useful error for missing dependencies', () => {
    const index = getBlockSourceFileIndex()
    expect(Object.keys(index).length).toBeGreaterThan(50)
    expect(getBlockSourceFile('src/components/ui/button.tsx')).toContain(
      'buttonVariants',
    )
    expect(() =>
      getBlockSourceFile('src/components/ui/not-a-real-block.tsx'),
    ).toThrow(/Cannot find block dependency source/)
  })
})
