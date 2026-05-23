import { describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  looksLikeLlmTailwindHomepage,
  looksLikeRendererShell,
  restoreLlmHomepageIfNeeded,
  writeLlmHomepageBackup,
} from './llm-homepage-guard.js'

const LLM = `<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script><script>tailwind.config={theme:{extend:{}}}</script></head><body><section class="w-full py-24"><h1 class="text-7xl">Brand</h1><p>${'Craft homepage with Mobbin DNA. '.repeat(12)}</p></section><section class="w-full py-16"><div class="grid grid-cols-3 gap-6">${'<div class="rounded-xl border p-6">tile</div>'.repeat(6)}</div></section></body></html>`
const RENDERER = `<!doctype html><html><head><link rel="stylesheet" href="./site.css"></head><body><div class="site-shell">generic</div></body></html>`

describe('llm-homepage-guard', () => {
  it('detects tailwind LLM vs renderer shell', () => {
    expect(looksLikeLlmTailwindHomepage(LLM)).toBe(true)
    expect(looksLikeRendererShell(RENDERER)).toBe(true)
    expect(looksLikeRendererShell(LLM)).toBe(false)
  })

  it('restores index.html from backup when renderer replaced it', () => {
    const dir = mkdtempSync(join(tmpdir(), 'ship-guard-'))
    writeLlmHomepageBackup(dir, LLM)
    writeFileSync(join(dir, 'index.html'), RENDERER, 'utf8')
    const restored = restoreLlmHomepageIfNeeded(dir)
    expect(restored).toContain('cdn.tailwindcss.com')
    expect(readFileSync(join(dir, 'index.html'), 'utf8')).toContain('cdn.tailwindcss.com')
  })
})
