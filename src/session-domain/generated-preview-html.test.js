import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { readGeneratedPreviewHtml } from './generated-preview-html.js'

describe('readGeneratedPreviewHtml', () => {
  it('reads completed session index html', () => {
    const sessionsDir = mkdtempSync(join(tmpdir(), 'ship-fast-preview-'))
    const sessionDir = join(sessionsDir, 'abc123')
    mkdirSync(sessionDir, { recursive: true })
    writeFileSync(join(sessionDir, 'index.html'), '<main>Generated preview</main>')

    expect(readGeneratedPreviewHtml('abc123', { sessionsDir })).toContain('Generated preview')
  })

  it('returns null for missing previews', () => {
    const sessionsDir = mkdtempSync(join(tmpdir(), 'ship-fast-preview-'))

    expect(readGeneratedPreviewHtml('missing', { sessionsDir })).toBeNull()
  })

  it('rejects traversal-like session ids', () => {
    const sessionsDir = mkdtempSync(join(tmpdir(), 'ship-fast-preview-'))

    expect(readGeneratedPreviewHtml('../abc123', { sessionsDir })).toBeNull()
  })
})
