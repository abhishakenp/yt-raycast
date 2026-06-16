import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('/api/share-bonus route', () => {
  it('registers the GET and POST handlers through TanStack route metadata', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/routes/api/share-bonus.ts'),
      'utf8',
    )

    expect(source).toContain("createFileRoute('/api/share-bonus')")
    expect(source).toContain('server:')
    expect(source).toContain('GET:')
    expect(source).toContain('POST:')
  })
})
