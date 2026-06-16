import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('rewrite API route loading', () => {
  it('keeps the engine text-generation runtime behind the POST handler', () => {
    const source = readFileSync(
      join(process.cwd(), 'src/routes/api/rewrite.ts'),
      'utf8',
    )
    const imports = source.slice(0, source.indexOf('const json'))

    expect(imports).not.toContain('@ship-fast/engine')
    expect(source).toContain("import('@ship-fast/engine')")
    expect(source).toContain("import('@ship-fast/engine/model-list.js')")
  })
})
