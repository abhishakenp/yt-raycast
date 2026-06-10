import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  resolvePipelineLanguage,
  withLanguageEnforcementBlock,
} from './prompt-language.js'

const makeWorkspace = (preferredLanguage) => {
  const workspace = mkdtempSync(join(tmpdir(), 'ship-fast-language-'))
  writeFileSync(
    join(workspace, '.session.json'),
    JSON.stringify({ preferredLanguage }, null, 2),
  )
  return workspace
}

describe('pipeline prompt language enforcement', () => {
  const romanizedMalayalamBrief =
    'oru marketing compny de website undaakuka, athil services list, client success stories, blog section okke include cheyyuka; target audience small business owners aanu, design sleek, colors brandine reflect cheyyunna professional tone with clear CTA buttons.'

  it('uses workspace preferred language when runAll does not receive one', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a landing page for a school',
      workspace: makeWorkspace('hi-latn'),
    })

    expect(mode.code).toBe('hi-latn')
    expect(mode.script).toBe('Latin')
    expect(mode.prompt).toContain('server language code `hi-latn`')
    expect(mode.prompt).toContain('Romanized Hindi')
    expect(mode.prompt).toContain('Latin script')
  })

  it('preserves code-mixed language variants instead of collapsing them to the base code', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a food truck website',
      preferredLanguage: 'ta-en',
    })

    expect(mode.code).toBe('ta-en')
    expect(mode.prompt).toContain('server language code `ta-en`')
    expect(mode.prompt).toContain('natural Tamil + English mix')
  })

  it('detects romanized requests from the prompt when no explicit preference exists', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: 'Build a roman hindi site for a travel agency',
      workspace: makeWorkspace('en'),
    })

    expect(mode.code).toBe('hi-latn')
    expect(mode.prompt).toContain('Romanized Hindi')
  })

  it('detects romanized Malayalam prompts even when the default dropdown submits English', async () => {
    const mode = await resolvePipelineLanguage({
      prompt: romanizedMalayalamBrief,
      preferredLanguage: 'en',
    })

    expect(mode.code).toBe('ml')
    expect(mode.name).toBe('Malayalam')
    expect(mode.prompt).toContain('server language code `ml`')
  })

  it('keeps English prompts explicitly constrained to English', () => {
    const prompt = withLanguageEnforcementBlock('Build a SaaS homepage', {
      code: 'en',
      name: 'English',
    })

    expect(prompt).toContain('server language code `en`')
    expect(prompt).toContain('English only')
  })
})
