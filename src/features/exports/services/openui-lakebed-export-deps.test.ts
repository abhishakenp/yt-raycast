import { Buffer } from 'node:buffer'
import { brotliDecompressSync } from 'node:zlib'

import { describe, expect, it } from 'vitest'

import {
  lakebedExportDepsBase64,
  lakebedExportDepsEncoding,
} from '@ship-fast/blocks/generated'

import {
  buildOpenUILakebedProjectFiles,
  buildLakebedExportDependencyManifestForGenerator,
  resolveLakebedExportDependenciesForTest,
} from './openui-lakebed-export-builder'

const benchmarkComponentNames = ['Navbar', 'CenteredHero', 'FeatureList']

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readGeneratedLakebedExportDeps() {
  expect(lakebedExportDepsEncoding).toBe('br+base64')
  const parsed: unknown = JSON.parse(
    brotliDecompressSync(
      Buffer.from(lakebedExportDepsBase64, 'base64'),
    ).toString('utf8'),
  )
  expect(isRecord(parsed)).toBe(true)
  if (!isRecord(parsed)) throw new Error('Invalid generated manifest')
  return parsed
}

describe('generated Lakebed export dependencies', () => {
  it('ships a precomputed dependency closure for Lakebed export components', () => {
    const generated = readGeneratedLakebedExportDeps()
    expect(isRecord(generated.components)).toBe(true)
    expect(isRecord(generated.files)).toBe(true)
    if (!isRecord(generated.components) || !isRecord(generated.files)) {
      throw new Error('Invalid generated manifest shape')
    }

    const navbar = generated.components.Navbar
    expect(isRecord(navbar)).toBe(true)
    if (!isRecord(navbar)) {
      throw new Error('Missing Navbar generated dependency entry')
    }
    expect(navbar.clientComponent).not.toBeNull()
    const filePaths = navbar.filePaths
    expect(Array.isArray(filePaths)).toBe(true)
    if (!Array.isArray(filePaths)) {
      throw new Error('Invalid Navbar dependency file paths')
    }
    expect(filePaths.length).toBeGreaterThan(100)
    expect(Object.keys(generated.files).length).toBeGreaterThan(500)
  })

  it('matches dynamic dependency resolution for generated components', () => {
    const dynamic = resolveLakebedExportDependenciesForTest(
      benchmarkComponentNames,
      'dynamic',
    )
    const generated = resolveLakebedExportDependenciesForTest(
      benchmarkComponentNames,
      'generated',
    )

    expect(
      generated.clientComponents.map((component) => component.name),
    ).toEqual(dynamic.clientComponents.map((component) => component.name))
    expect(Object.keys(generated.files).sort()).toEqual(
      Object.keys(dynamic.files).sort(),
    )
    expect(generated.vendorFiles).toEqual(dynamic.vendorFiles)
    expect(generated.blockFiles).toEqual(dynamic.blockFiles)
  })

  it('can rebuild the same dependency manifest subset at prebuild time', () => {
    const manifest = buildLakebedExportDependencyManifestForGenerator(
      benchmarkComponentNames,
    )

    expect(Object.keys(manifest.components).sort()).toEqual(
      [...benchmarkComponentNames].sort(),
    )
    expect(Object.keys(manifest.files).length).toBeGreaterThan(100)
  })

  it('does not leak OpenUI names into exported Lakebed files', async () => {
    const built = await buildOpenUILakebedProjectFiles({
      source: `root = PageSwitch(["Home"], [home])
home = Stack([Navbar("Neutral Export", ["Home"]), CenteredHero(), FeatureList()])`,
      siteSpecJson: JSON.stringify({ projectName: 'Neutral Export' }),
      sessionId: 'neutral-export',
      target: 'lakebed',
    })

    const leaked = Object.entries(built.files).filter(([path, source]) =>
      `${path}\n${source}`.toLowerCase().includes('openui'),
    )
    expect(leaked).toEqual([])
  })
})
