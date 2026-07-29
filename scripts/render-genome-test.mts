/**
 * render-genome-test.mts — renders the genome test outputs to static HTML
 * and serves them on a local port for visual inspection.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { renderHtmlProject } from '../packages/ship-fast-engine/src/renderers/html/index.ts'

const TEST_DIR = resolve(process.cwd(), '.forge', 'genome-test')
const OUTPUT_DIR = resolve(TEST_DIR, 'html')

const TEST_IDS = [
  'detailed-spec',
  'vague-dog-1',
  'vague-dog-2',
  'vague-cat-1',
  'vague-cat-2',
]

import { mkdirSync } from 'node:fs'
mkdirSync(OUTPUT_DIR, { recursive: true })

for (const testId of TEST_IDS) {
  const specPath = join(TEST_DIR, testId, 'site-spec.json')
  if (!existsSync(specPath)) {
    console.log(`Skipping ${testId} — no site-spec.json`)
    continue
  }

  const siteSpec = JSON.parse(readFileSync(specPath, 'utf-8'))
  const result = renderHtmlProject(siteSpec)

  // result is { files: Record<string, string> }
  const testOutputDir = join(OUTPUT_DIR, testId)
  mkdirSync(testOutputDir, { recursive: true })
  for (const [filename, content] of Object.entries(result.files)) {
    writeFileSync(join(testOutputDir, filename), content)
  }
  console.log(
    `Rendered: ${testOutputDir} (${Object.keys(result.files).length} files)`,
  )
}

console.log(`\nAll HTML files in: ${OUTPUT_DIR}`)
console.log('Serve with: npx serve .forge/genome-test/html')
