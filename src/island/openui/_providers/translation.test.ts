import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('translation provider', () => {
  it('updates DOM even when translation equals original text (translated: false)', () => {
    // This is a source-level invariant test to ensure the bug doesn't regress
    // The bug was: when data === text, the DOM update was skipped, showing nothing
    const source = readFileSync(
      join(process.cwd(), 'src/island/openui/_providers/translation.tsx'),
      'utf8',
    )
    
    // The fixed version should NOT have the "data !== text" check in the DOM update condition
    // It should be "else if (data)" not "else if (data && data !== text)"
    const domUpdateSection = source.slice(source.indexOf('} else if (data'))
    expect(domUpdateSection).not.toContain('data !== text')
    expect(domUpdateSection).toContain('node.textContent = data')
  })
})
