import { describe, it, expect } from 'vitest'
import { readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = dirname(fileURLToPath(import.meta.url))

describe('windsurf provider', () => {
  it('template binary exists', () => {
    expect(existsSync(join(srcDir, 'windsurf-template.bin'))).toBe(true)
  })

  it('template is a valid Connect-RPC envelope (5-byte header + payload)', () => {
    const buf = readFileSync(join(srcDir, 'windsurf-template.bin'))
    expect(buf.length).toBeGreaterThan(1000)
    // flags byte (0) + 4-byte big-endian length
    const flags = buf[0]
    const len = buf.readUInt32BE(1)
    expect(flags).toBe(0)
    expect(5 + len).toBe(buf.length)
  })

  it('template contains the GetChatMessageRequest model field (field 21)', () => {
    const buf = readFileSync(join(srcDir, 'windsurf-template.bin'))
    // The model name should appear as a string in the template
    expect(buf.toString('utf8')).toContain('glm-5-2')
  })

  it('template contains a session token', () => {
    const buf = readFileSync(join(srcDir, 'windsurf-template.bin'))
    expect(buf.toString('utf8')).toContain('devin-session-token$')
  })
})
