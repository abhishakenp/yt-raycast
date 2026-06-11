import { describe, expect, it } from 'vitest'
import { createZipBuffer } from './zip-builder'

describe('createZipBuffer', () => {
  it('creates a zip archive containing named files', () => {
    const zip = createZipBuffer({
      'index.html': '<h1>Hello</h1>',
      'README.md': 'Exported by Ship Fast',
    })

    expect(zip.readUInt32LE(0)).toBe(0x04034b50)
    expect(zip.includes(Buffer.from('index.html'))).toBe(true)
    expect(zip.includes(Buffer.from('README.md'))).toBe(true)
    expect(zip.includes(Buffer.from('<h1>Hello</h1>'))).toBe(true)
    expect(zip.readUInt32LE(zip.length - 22)).toBe(0x06054b50)
  })
})
