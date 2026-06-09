import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { applyPreviewTextEdit, writePreviewTextEdit } from './preview-text-edits.js'

describe('applyPreviewTextEdit', () => {
  it('replaces the first matching visible text node', () => {
    const result = applyPreviewTextEdit(
      '<html><body><h1>Hello world</h1><p>Hello world</p></body></html>',
      { oldText: 'Hello world', newText: 'Bonjour studio' },
    )

    expect(result.replaced).toBe(true)
    expect(result.html).toContain('<h1>Bonjour studio</h1>')
    expect(result.html).toContain('<p>Hello world</p>')
  })

  it('does not edit script contents', () => {
    const result = applyPreviewTextEdit(
      '<html><body><script>var x = "Hello world"</script><p>Hello world</p></body></html>',
      { oldText: 'Hello world', newText: 'Visible only' },
    )

    expect(result.html).toContain('var x = "Hello world"')
    expect(result.html).toContain('<p>Visible only</p>')
  })
})

describe('writePreviewTextEdit', () => {
  it('persists edited preview html and keeps a backup ledger', () => {
    const sessionsDir = mkdtempSync(join(tmpdir(), 'ship-fast-edit-'))
    const sessionDir = join(sessionsDir, 'abc123')
    mkdirSync(sessionDir, { recursive: true })
    writeFileSync(join(sessionDir, 'index.html'), '<main><h1>Old headline</h1></main>')

    const result = writePreviewTextEdit(
      'abc123',
      { oldText: 'Old headline', newText: 'New headline' },
      { sessionsDir, now: () => 12345 },
    )

    expect(result.saved).toBe(true)
    expect(readFileSync(join(sessionDir, 'index.html'), 'utf8')).toContain('New headline')
    expect(existsSync(join(sessionDir, '.preview-edits', '12345.html'))).toBe(true)
    expect(readFileSync(join(sessionDir, '.preview-edits', 'edits.jsonl'), 'utf8')).toContain(
      'Old headline',
    )
  })

  it('rejects invalid session ids', () => {
    expect(() =>
      writePreviewTextEdit('../abc', { oldText: 'Old', newText: 'New' }),
    ).toThrow('Invalid session id')
  })
})
