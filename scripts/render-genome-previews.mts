/**
 * render-genome-previews.mts — renders OpenUI source to full HTML
 * using the same buildOpenUIHtmlExport the live preview uses.
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { buildOpenUIHtmlExport } from '../src/features/exports/services/openui-html-export-builder.ts'

const TEST_DIR = resolve(process.cwd(), '.forge', 'genome-test')
const OUTPUT_DIR = resolve(TEST_DIR, 'previews')

const TEST_IDS = [
  'detailed-spec',
  'vague-dog-1',
  'vague-dog-2',
  'vague-cat-1',
  'vague-cat-2',
]

mkdirSync(OUTPUT_DIR, { recursive: true })

async function main() {
  for (const testId of TEST_IDS) {
    const openuiPath = join(TEST_DIR, testId, 'home.openui')
    const specPath = join(TEST_DIR, testId, 'site-spec.json')
    if (!existsSync(openuiPath)) {
      console.log(`Skipping ${testId} — no home.openui`)
      continue
    }

    const source = readFileSync(openuiPath, 'utf-8')
    let siteSpecJson: string | undefined
    let themeName: string | undefined
    if (existsSync(specPath)) {
      const spec = JSON.parse(readFileSync(specPath, 'utf-8'))
      siteSpecJson = JSON.stringify(spec)
      themeName = spec.theme
    }

    try {
      const rendered = await buildOpenUIHtmlExport({
        source,
        previewHtml: undefined,
        prompt: testId,
        siteSpecJson,
        sessionId: testId,
        target: 'html',
        themeName,
        isDark: false,
        locale: 'en',
        includeBadge: false,
        selectedBrandLogo: null,
      })

      const html =
        typeof rendered.body === 'string'
          ? rendered.body
          : new TextDecoder().decode(rendered.body)

      const outPath = join(OUTPUT_DIR, `${testId}.html`)
      writeFileSync(outPath, html)
      console.log(
        `✓ Rendered: ${outPath} (${(html.length / 1024).toFixed(0)}KB)`,
      )
    } catch (err) {
      console.log(`✗ Failed ${testId}: ${String(err).slice(0, 200)}`)
    }
  }

  console.log(`\nAll previews in: ${OUTPUT_DIR}`)
  console.log('Serve with: npx serve .forge/genome-test/previews -l 7430')
}

main().catch(console.error)
