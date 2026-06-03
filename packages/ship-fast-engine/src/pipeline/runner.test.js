import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { buildOpenUIPrompt } from './runner.js'

let tmpRoot = null

afterEach(() => {
  if (tmpRoot) rmSync(tmpRoot, { recursive: true, force: true })
  tmpRoot = null
})

const workspaceWithLanguage = (preferredLanguage) => {
  tmpRoot = mkdtempSync(join(tmpdir(), 'ship-fast-lang-'))
  mkdirSync(tmpRoot, { recursive: true })
  writeFileSync(join(tmpRoot, '.session.json'), JSON.stringify({ preferredLanguage }))
  return tmpRoot
}

describe('buildOpenUIPrompt', () => {
  it('adds server language enforcement for explicit Hindi preference', async () => {
    const workspace = workspaceWithLanguage('hi')

    const prompt = await buildOpenUIPrompt({
      prompt: 'Build a gym website with pricing',
      workspace,
    })

    expect(prompt).toContain('Build a gym website with pricing')
    expect(prompt).toContain('server language code `hi`')
    expect(prompt).toContain('single primary language')
  })

  it('adds server language enforcement for non-Indian languages', async () => {
    const workspace = workspaceWithLanguage('fr')

    const prompt = await buildOpenUIPrompt({
      prompt: 'Build a bakery website',
      workspace,
    })

    expect(prompt).toContain('server language code `fr`')
    expect(prompt).toContain('do not switch')
  })

  it('keeps English generations explicitly English', async () => {
    const workspace = workspaceWithLanguage('en')

    const prompt = await buildOpenUIPrompt({
      prompt: 'Build a SaaS homepage',
      workspace,
    })

    expect(prompt).toContain('server language code `en`')
    expect(prompt).toContain('English only')
  })

  it('prefers an explicit language argument over workspace metadata', async () => {
    const workspace = workspaceWithLanguage('en')

    const prompt = await buildOpenUIPrompt({
      prompt: 'Build a yoga website',
      workspace,
      preferredLanguage: 'ta',
    })

    expect(prompt).toContain('server language code `ta`')
  })
})
