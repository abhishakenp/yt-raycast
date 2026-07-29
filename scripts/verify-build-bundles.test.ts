import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'

import { verifyBuildBundles } from './verify-build-bundles'

const roots: string[] = []

const createBuildRoot = () => {
  const root = mkdtempSync(join(tmpdir(), 'ship-fast-bundles-'))
  roots.push(root)
  mkdirSync(join(root, '.output/public/assets'), { recursive: true })
  mkdirSync(join(root, '.output/server/_ssr'), { recursive: true })

  return root
}

function writeAsset(root: string, relativePath: string, source: string) {
  writeFileSync(join(root, relativePath), source)
}

function writePassingAssets(root: string) {
  writeAsset(
    root,
    '.output/public/assets/-generate-dashboard-route-test.js',
    'export const dashboard = true',
  )
  writeAsset(
    root,
    '.output/public/assets/index-test.js',
    'export const app = true',
  )
  writeAsset(
    root,
    '.output/public/assets/OpenUIViewer-test.js',
    'export const openui = true',
  )
  writeAsset(
    root,
    '.output/public/assets/openui-runtime-core-test.js',
    'export const runtimeCore = true',
  )
  writeAsset(
    root,
    '.output/public/assets/openui-primitive-layout-test.js',
    'export const layout = true',
  )
  writeAsset(
    root,
    '.output/public/assets/openui-capsule-saas-test.js',
    'export const capsule = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/-generate-dashboard-route-test.mjs',
    'export const dashboard = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/router-test.mjs',
    'export const router = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-export-builder-test.mjs',
    'export const exportBuilder = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-html-export-builder-test.mjs',
    'export const htmlExportBuilder = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-runtime-core-test.mjs',
    'export const runtimeCore = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-capsule-index-test.mjs',
    'export const eagerCapsuleIndex = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-generated-metadata-test.mjs',
    'export const metadata = true',
  )
  writeAsset(
    root,
    '.output/server/_ssr/openui-prompt-spec-test.mjs',
    'export const promptSpec = true',
  )
}

describe('verifyBuildBundles', () => {
  afterEach(() => {
    for (const root of roots.splice(0)) {
      rmSync(root, { force: true, recursive: true })
    }
  })

  it('accepts a build where heavy features are isolated', () => {
    const root = createBuildRoot()
    writePassingAssets(root)

    expect(() => verifyBuildBundles(root)).not.toThrow()
  })

  it('rejects generated dashboard route chunks that contain OpenUI registry internals', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/public/assets/-generate-dashboard-route-test.js',
      'defineComponent({})',
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /forbidden token defineComponent/,
    )
  })

  it('rejects router chunks that absorb export-builder weight', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(root, '.output/server/_ssr/router-test.mjs', 'x'.repeat(500_000))

    expect(() => verifyBuildBundles(root)).toThrow(/router-test\.mjs/)
  })

  it('rejects standalone HTML export chunks with full-catalog package internals', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/server/_ssr/openui-html-export-builder-test.mjs',
      'const reactExportSourcesBase64 = "full catalog"',
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /forbidden token reactExportSourcesBase64/,
    )
  })

  it('rejects large anonymous source chunks', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(root, '.output/server/_ssr/src-heavy.mjs', 'x'.repeat(3_000_000))

    expect(() => verifyBuildBundles(root)).toThrow(/src-heavy\.mjs/)
  })

  it('rejects OpenUI runtime chunks that exceed their split budget', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/server/_ssr/openui-runtime-core-test.mjs',
      'x'.repeat(10_000_000),
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /openui-runtime-core-test\.mjs/,
    )
  })

  it('accepts the measured browser runtime and lazy fallback catalog budgets', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/public/assets/openui-runtime-core-test.js',
      'x'.repeat(400_000),
    )
    writeAsset(
      root,
      '.output/public/assets/openui-capsule-index-test.js',
      'x'.repeat(17 * 1024 * 1024),
    )

    expect(() => verifyBuildBundles(root)).not.toThrow()
  })

  it('keeps server generated OpenUI catalogs budgeted', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/server/_ssr/openui-capsule-index-test.mjs',
      'x'.repeat(19 * 1024 * 1024),
    )
    writeAsset(
      root,
      '.output/server/_ssr/openui-generated-metadata-test.mjs',
      'x'.repeat(6 * 1024 * 1024),
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /openui-capsule-index-test\.mjs/,
    )
    expect(() => verifyBuildBundles(root)).toThrow(
      /openui-generated-metadata-test\.mjs/,
    )
  })

  it('keeps browser lazy fallback capsule catalogs budgeted', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/public/assets/openui-capsule-index-test.js',
      'x'.repeat(19 * 1024 * 1024),
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /openui-capsule-index-test\.js/,
    )
  })

  it('rejects test-file chunks bundled into production browser assets', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/public/assets/openui-primitive-freeform-test-BhiLfsmD.js',
      'export const vitestLeak = true',
    )

    expect(() => verifyBuildBundles(root)).toThrow(
      /openui-primitive-freeform-test/,
    )
  })

  it('rejects test-file chunks bundled into production server assets', () => {
    const root = createBuildRoot()
    writePassingAssets(root)
    writeAsset(
      root,
      '.output/server/_ssr/openui-section-blog-test-AbCd123.mjs',
      'export const vitestLeak = true',
    )

    expect(() => verifyBuildBundles(root)).toThrow(/openui-section-blog-test/)
  })
})
