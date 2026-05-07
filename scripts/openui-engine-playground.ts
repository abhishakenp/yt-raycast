#!/usr/bin/env bun
/**
 * OpenUI engine playground: preprocess (pipeline/viewer parity) + validate OpenUI Lang sources.
 *
 * Usage:
 *   bun run openui:playground -- --file path/to/home.openui
 *   bun run openui:playground -- --file a.openui --no-preprocess
 *   bun run openui:playground -- --file a.openui --dump-ast
 *   bun run openui:playground -- --dir ./sessions --glob "*.openui"
 *   bun run openui:playground -- --file a.openui --quality
 *   bun run openui:playground -- --variation-demo "My SaaS landing"
 *   bun run openui:playground -- --golden-variation "Same brief" --count 48
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createParser } from '@openuidev/lang-core'
import { preprocessOpenUIResponse } from '@ship-fast/engine/lib/openui-preprocess.js'
import { validateOpenUISource } from '@ship-fast/engine/pipeline/openui-validate.js'
import { buildOpenUIVariationBlock } from '@ship-fast/engine/lib/openui-variation.js'
import { openUIDevQualityHints } from '@ship-fast/engine/lib/openui-dev-quality.js'
import { shipFastOpenUIContractLibrary } from '../src/openui/library/contract.ts'

function argValue(argv: string[], name: string): string | undefined {
  const i = argv.indexOf(name)
  if (i === -1) return undefined
  return argv[i + 1]
}

function hasFlag(argv: string[], name: string): boolean {
  return argv.includes(name)
}

const argv = process.argv.slice(2)
const file = argValue(argv, '--file')
const dir = argValue(argv, '--dir')
const globPat = argValue(argv, '--glob') || '*.openui'
const variationDemo = argValue(argv, '--variation-demo')
const goldenPrompt = argValue(argv, '--golden-variation')
const goldenCount = Math.min(256, Math.max(4, Number(argValue(argv, '--count') || '32')))
const preprocess = !hasFlag(argv, '--no-preprocess')
const dumpAst = hasFlag(argv, '--dump-ast')
const quality = hasFlag(argv, '--quality')

if (variationDemo !== undefined) {
  const prompt = variationDemo || 'A modern analytics dashboard for SMBs.'
  console.log('── seed: session-a ──')
  console.log(buildOpenUIVariationBlock('session-a', prompt))
  console.log('── seed: session-b ──')
  console.log(buildOpenUIVariationBlock('session-b', prompt))
  process.exit(0)
}

if (goldenPrompt !== undefined) {
  const prompt = goldenPrompt || 'A B2B SaaS dashboard with metrics and campaigns.'
  const blocks = new Set<string>()
  for (let i = 0; i < goldenCount; i++) {
    blocks.add(buildOpenUIVariationBlock(`golden-seed-${i}`, prompt))
  }
  console.log(
    JSON.stringify(
      {
        prompt,
        seeds: goldenCount,
        uniqueVariationBlocks: blocks.size,
        diversityRatio: Number((blocks.size / goldenCount).toFixed(3)),
      },
      null,
      2,
    ),
  )
  process.exit(0)
}

function globToRegex(pattern: string): RegExp {
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp(`^${escaped}$`, 'i')
}

if (dir) {
  const rx = globToRegex(globPat)
  const entries = readdirSync(dir)
  let failed = 0
  const results: { file: string; ok: boolean }[] = []
  for (const name of entries) {
    if (!rx.test(name)) continue
    const path = join(dir, name)
    if (!statSync(path).isFile()) continue
    let raw = readFileSync(path, 'utf8')
    if (preprocess) raw = preprocessOpenUIResponse(raw)
    const validation = validateOpenUISource(raw)
    if (!validation.ok) failed++
    results.push({ file: path, ok: validation.ok })
    const line = JSON.stringify({ file: path, ...validation })
    if (quality) {
      const hints = openUIDevQualityHints(raw)
      console.log(line.slice(0, 2000) + (line.length > 2000 ? '…' : ''))
      if (hints.length) console.log(JSON.stringify({ hints }, null, 2))
    } else {
      console.log(line)
    }
  }
  console.log(JSON.stringify({ batch: true, files: results.length, failed }, null, 2))
  process.exit(failed > 0 ? 1 : 0)
}

if (!file) {
  console.error(
    'Provide --file <path> or --dir <path>. Optional: --no-preprocess, --dump-ast, --quality, --glob, --variation-demo, --golden-variation, --count',
  )
  process.exit(1)
}

let raw = readFileSync(file, 'utf8')
const beforeLen = raw.length
if (preprocess) {
  raw = preprocessOpenUIResponse(raw)
}
const validation = validateOpenUISource(raw)
const payload: Record<string, unknown> = { file, preprocess, beforeLen, afterLen: raw.length, ...validation }
if (quality) {
  payload.hints = openUIDevQualityHints(raw)
}
console.log(JSON.stringify(payload, null, 2))

if (dumpAst && raw.trim().length >= 32) {
  const parser = createParser(shipFastOpenUIContractLibrary.toJSONSchema())
  const result = parser.parse(raw)
  console.log(
    JSON.stringify(
      {
        rootKind: result.root ? typeof result.root : null,
        errorCount: (result.meta?.errors || []).length,
        errors: result.meta?.errors,
      },
      null,
      2,
    ),
  )
}

process.exit(validation.ok ? 0 : 1)
