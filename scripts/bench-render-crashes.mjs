#!/usr/bin/env bun
/**
 * Render-crash bench. Loads real generated OpenUI programs (session fixtures)
 * plus adversarial multilingual / missing-section mutations and renders each
 * page through the production SSR path, flagging any parse/render crash.
 *
 * A "crash" is any output containing the openui-error sentinel or a swallowed
 * runtime error string (Cannot read properties / is not a function / etc.).
 *
 * Usage: bun scripts/bench-render-crashes.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const { renderOpenUIToHTML } =
  await import('../packages/ship-fast-engine/src/openui-ssr.js')
const { library } = await import('../packages/ship-fast-blocks/src/index.ts')

const ROOT = join(import.meta.dir ?? process.cwd(), '..')
const SESSIONS = join(ROOT, 'sessions')

// Failure sentinels that mean a page failed to compile/render.
const CRASH_NEEDLES = [
  'openui-error',
  'failed to render',
  'cannot read properties',
  'is not a function',
  'is not iterable',
  'undefined is not an object',
  'typeerror:',
  'referenceerror:',
]

function crashReason(html) {
  const lower = (html || '').toLowerCase()
  for (const needle of CRASH_NEEDLES) {
    if (lower.includes(needle)) return needle
  }
  if (!html || !html.trim()) return 'empty-output'
  return null
}

/** Collect every saved page program from sessions/<id>/*.openui */
function loadFixtures() {
  const out = []
  if (!existsSync(SESSIONS)) return out
  for (const id of readdirSync(SESSIONS)) {
    const dir = join(SESSIONS, id)
    let files = []
    try {
      files = readdirSync(dir).filter((f) => f.endsWith('.openui'))
    } catch {
      continue
    }
    for (const file of files) {
      const source = readFileSync(join(dir, file), 'utf8')
      if (source.trim()) out.push({ name: `${id}/${file}`, source })
    }
  }
  return out
}

/**
 * Mutations that emulate the messy ways models emit per-language output:
 * - translate visible strings into non-Latin / RTL scripts
 * - null/empty out array fields (the #1 cause of `.map` crashes)
 * - replace string fields with numbers (charAt/trim crashes)
 */
// Replace only string VALUES (text after `: ` or inside `[...]`/`(...)`), never
// object keys (`key:` or `"key":`), so we emulate translated copy without
// corrupting the program structure the way a real model never would.
function translateValues(source, replacement) {
  return source.replace(/"((?:\\.|[^"\\])*)"/g, (match, inner, offset) => {
    // Skip if this string is an object key: next non-space char is ':' AND it
    // is not already a value (preceded by ':' '[' '(' ',').
    const after = source.slice(offset + match.length).match(/^\s*([:,)\]}])/)
    const isKey = after && after[1] === ':'
    if (isKey) return match
    if (!/[A-Za-z]/.test(inner)) return match
    return JSON.stringify(replacement)
  })
}

const MUTATIONS = {
  // identity (the program as generated)
  'en (as-is)': (s) => s,
  // CJK — wide glyphs, no spaces
  'zh (cjk strings)': (s) => translateValues(s, '测试内容标题示例文字说明'),
  // Arabic — RTL script
  'ar (rtl strings)': (s) => translateValues(s, 'مرحبا بكم في موقعنا الرسمي'),
  // Hindi (Devanagari)
  'hi (devanagari)': (s) =>
    translateValues(s, 'हमारी वेबसाइट पर आपका स्वागत है'),
  // empty arrays everywhere (model returned no items)
  'empty arrays': (s) => s.replace(/\[\s*\{[\s\S]*?\}\s*\]/g, '[]'),
  // null array fields (model emitted `field: null` where an array was expected)
  'null arrays': (s) => s.replace(/:\s*\[[^\]]*\]/g, ': null'),
}

const LOCALES = ['en', 'zh', 'ar', 'hi', 'ta-en']

function run() {
  const fixtures = loadFixtures()
  if (fixtures.length === 0) {
    console.error('No session fixtures found under', SESSIONS)
    process.exit(2)
  }

  const failures = []
  let total = 0

  for (const fixture of fixtures) {
    for (const [label, mutate] of Object.entries(MUTATIONS)) {
      let source
      try {
        source = mutate(fixture.source)
      } catch (err) {
        failures.push({
          fixture: fixture.name,
          mutation: label,
          locale: '-',
          reason: `mutation-threw: ${err.message}`,
        })
        continue
      }
      for (const locale of LOCALES) {
        total++
        let html = ''
        try {
          html = renderOpenUIToHTML(source, null, locale)
        } catch (err) {
          failures.push({
            fixture: fixture.name,
            mutation: label,
            locale,
            reason: `threw: ${err.message}`,
          })
          continue
        }
        const reason = crashReason(html)
        if (reason) {
          failures.push({
            fixture: fixture.name,
            mutation: label,
            locale,
            reason,
          })
        }
      }
    }
  }

  // Sweep 2: render EVERY registered component with no props. Capsules are
  // documented to "render great with no props at all"; any crash here is a real
  // defect in a component's default path (covers saas, ecommerce, every
  // vertical — not just the verticals present in the saved fixtures).
  const componentNames = [
    ...new Set(Object.values(library.components).map((c) => c.name)),
  ].sort()
  let sweepTotal = 0
  for (const name of componentNames) {
    if (!/^[A-Z][A-Za-z0-9_]*$/.test(name)) continue
    for (const locale of ['en', 'ar']) {
      sweepTotal++
      total++
      let html = ''
      try {
        html = renderOpenUIToHTML(`root = ${name}()`, null, locale)
      } catch (err) {
        failures.push({
          fixture: `<no-props>`,
          mutation: name,
          locale,
          reason: `threw: ${err.message}`,
        })
        continue
      }
      // Primitives (Button, Text, Badge, Tabs, …) legitimately render nothing
      // without children, so empty output is only a real defect for full page
      // capsules. Always flag hard crashes (openui-error / thrown).
      const reason = crashReason(html)
      const isPageCapsule = /Page$/.test(name)
      if (reason && (reason !== 'empty-output' || isPageCapsule)) {
        failures.push({
          fixture: `<no-props>`,
          mutation: name,
          locale,
          reason,
        })
      }
    }
  }

  console.log(
    `\nRendered ${total} variants:` +
      `\n  • ${total - sweepTotal} fixture variants (${fixtures.length} fixtures × ${Object.keys(MUTATIONS).length} mutations × ${LOCALES.length} locales)` +
      `\n  • ${sweepTotal} no-props component renders (${componentNames.length} components × 2 locales)`,
  )
  if (failures.length === 0) {
    console.log('✅ No render crashes detected.')
    process.exit(0)
  }

  console.log(`\n❌ ${failures.length} crashing variants:\n`)
  for (const f of failures) {
    console.log(`  - ${f.fixture} | ${f.mutation} | ${f.locale} -> ${f.reason}`)
  }
  process.exit(1)
}

run()
