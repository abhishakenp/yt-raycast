import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))

describe('convex generation action', () => {
  it('passes the session preferred language to the homepage orchestrator', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')
    const orchestratorSource = readFileSync(
      join(here, '../packages/ship-fast-engine/src/genui/run.ts'),
      'utf8',
    )

    expect(source).toContain('preferredLanguage: session.preferredLanguage')
    expect(source).toContain('buildPreviewSeoHead')
    expect(source).toContain('renderStaticPreviewHtml(')
    expect(orchestratorSource).toContain('detectLanguage(p.prompt')
    expect(orchestratorSource).toContain('withLanguageEnforcementBlock')
    expect(orchestratorSource).toContain('generateUI(generationPrompt')
    expect(orchestratorSource).toContain('forcedLocale')
  })

  it('threads design reference context into generation artifacts', () => {
    const source = readFileSync(join(here, 'generation.ts'), 'utf8')

    expect(source).toContain('const buildGenerationPrompt =')
    expect(source).toContain('Design reference URLs:')
    expect(source).toContain('Clone/reference URL:')
    expect(source).toContain('prompt: buildGenerationPrompt(session)')
    expect(source).toContain('designReferenceFingerprint: session.designReferenceFingerprint')
  })
})
