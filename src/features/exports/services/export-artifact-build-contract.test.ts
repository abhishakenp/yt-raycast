import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  buildOpenUIArtifactFiles,
  buildDownloadFromArtifactFiles,
} from './openui-artifact-files'

/**
 * Contract test: the export artifact build pipeline (used by the Convex
 * `export_artifacts.build` action) must produce valid files from real engine
 * fixtures.
 *
 * The existing `session_export_helpers.test.ts` tests the scheduling and
 * queueing of export artifact builds but never tests the actual build
 * function with real engine output. This test fills that gap by calling
 * `buildOpenUIArtifactFiles` (the same function the Convex action calls)
 * with real fixture sources.
 */

const fixtureDir = join(process.cwd(), '__fixtures__', 'openui-sources')

const loadFixture = (name: string): string =>
  readFileSync(join(fixtureDir, `${name}.openui`), 'utf-8')

const cleanFixtures = [
  'food-blog',
  'tech-blog',
  'wellness-blog',
  'dog-blog',
  'sneaker-ecommerce',
  'pizza-ecommerce',
  'coffee-saas-hindi',
  'travel-booking',
  'travel-booking-marathi',
  'movie-fans-hinglish',
  'popcorn-mania',
]

describe('export artifact build contract (real engine fixtures)', () => {
  it.each(cleanFixtures)('builds artifact files for %s', async (name) => {
    const source = loadFixture(name)
    const siteSpecJson = JSON.stringify({ projectName: name })

    const result = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml: '<html><body>preview</body></html>',
      sessionId: `fixture-${name}`,
      target: 'react',
      includeBadge: false,
    })

    // Must produce a non-empty files map
    expect(Object.keys(result.files).length).toBeGreaterThan(0)

    // Must produce a download (zip or html)
    expect(result.download).toBeTruthy()
    expect(result.download?.contentType).toBeTruthy()
    expect(result.download?.body).toBeTruthy()
  })

  it.each(['food-blog', 'popcorn-mania'])(
    'builds HTML artifact files for %s',
    async (name) => {
      const source = loadFixture(name)
      const siteSpecJson = JSON.stringify({ projectName: name })

      const result = await buildOpenUIArtifactFiles({
        source,
        siteSpecJson,
        previewHtml: '<html><body>preview</body></html>',
        sessionId: `fixture-${name}`,
        target: 'html',
        includeBadge: false,
      })

      expect(Object.keys(result.files).length).toBeGreaterThan(0)
      expect(result.download).toBeTruthy()
    },
  )

  it('artifact files for food-blog include expected project structure', async () => {
    const source = loadFixture('food-blog')
    const siteSpecJson = JSON.stringify({ projectName: 'food-blog' })

    const result = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml: '<html><body>preview</body></html>',
      sessionId: 'fixture-food-blog',
      target: 'react',
      includeBadge: false,
    })

    const fileNames = Object.keys(result.files)
    // React export should have package.json and source files
    expect(fileNames.some((f) => f.includes('package.json'))).toBe(true)
    expect(fileNames.some((f) => f.endsWith('.tsx') || f.endsWith('.ts'))).toBe(
      true,
    )
  })

  it('buildDownloadFromArtifactFiles produces a download from built files', async () => {
    const source = loadFixture('food-blog')
    const siteSpecJson = JSON.stringify({ projectName: 'food-blog' })

    const artifact = await buildOpenUIArtifactFiles({
      source,
      siteSpecJson,
      previewHtml: '<html><body>preview</body></html>',
      sessionId: 'fixture-food-blog',
      target: 'react',
      includeBadge: false,
    })

    const download = await buildDownloadFromArtifactFiles(
      {
        source,
        siteSpecJson,
        previewHtml: '<html><body>preview</body></html>',
        sessionId: 'fixture-food-blog',
        target: 'react',
        includeBadge: false,
      },
      artifact.files,
      artifact.download,
    )

    expect(download).toBeTruthy()
    expect(download.contentType).toBeTruthy()
    expect(download.body).toBeTruthy()
  })
})
