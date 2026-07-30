#!/usr/bin/env node
/**
 * Quality comparison — saves full raw LLM output + compiled source for each
 * model so we can compare creative copy quality side by side.
 *
 * Usage:
 *   bun scripts/bench-quality-comparison.mjs "your prompt here"
 */
import { mkdtempSync, rmSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const prompt =
  process.argv[2] ??
  'A cozy neighborhood coffee shop called Brew & Bloom with online ordering, a blog about brewing techniques, and a photo gallery'

const MODELS = [
  'cerebras/gpt-oss-120b',
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
]

const { runComposition } = await import('@ship-fast/engine')

const outDir = join(process.cwd(), '.forge', 'model-comparison')
try { mkdirSync(outDir, { recursive: true }) } catch {}

function makeSessionCtx(id) {
  return {
    id,
    broadcast: () => {},
    setPrompt: () => {},
    setTasks: () => {},
    updateTask: () => {},
    signalHomepageReady: () => {},
    signalOpenuiReady: () => {},
    setElapsed: () => {},
    setCost: () => {},
  }
}

console.log(`\nQuality comparison — saving full outputs to ${outDir}\n`)

for (const model of MODELS) {
  const slug = model.replace(/[^a-z0-9]/g, '-')
  const workspace = mkdtempSync(join(tmpdir(), `ship-fast-qc-${slug}-`))
  const sessionCtx = makeSessionCtx(`qc-${slug}-${Date.now()}`)

  const t0 = Date.now()
  let result, error
  try {
    result = await runComposition({ prompt, workspace, sessionCtx, model })
  } catch (err) {
    error = err
  }
  const wallMs = Date.now() - t0

  if (error) {
    console.log(`  ${model}: FAIL (${wallMs}ms) — ${error.message}`)
    try { rmSync(workspace, { recursive: true, force: true }) } catch {}
    continue
  }

  // Save raw + source
  const modelDir = join(outDir, slug)
  try { mkdirSync(modelDir, { recursive: true }) } catch {}
  writeFileSync(join(modelDir, 'raw.txt'), result.raw || '')
  writeFileSync(join(modelDir, 'home.openui'), result.source || '')
  writeFileSync(join(modelDir, 'meta.json'), JSON.stringify({
    model, wallMs, prompt,
    sectionCount: (result.raw || '').match(/@section/g)?.length || 0,
    pageCount: ((result.raw || '').match(/@page/g)?.length || 0) + 1,
    sourceChars: result.source?.length || 0,
    hasReasoningBlock: (result.raw || '').includes('<reasoning>'),
  }, null, 2))

  console.log(`  ${model}: ${wallMs}ms — saved to ${modelDir}`)
  try { rmSync(workspace, { recursive: true, force: true }) } catch {}
}

console.log(`\nDone. Compare outputs in ${outDir}/`)
