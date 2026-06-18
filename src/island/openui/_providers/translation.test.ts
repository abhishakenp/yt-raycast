import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

describe('translation provider', () => {
  it('removes shimmer even when translation equals original text (translated: false)', () => {
    // This is a source-level invariant test to ensure the bug doesn't regress
    // The bug was: when data === text, shimmer stayed active (making text invisible)
    // because the entire shimmer removal was inside the "data !== text" condition
    const source = readFileSync(
      join(process.cwd(), 'src/island/openui/_providers/translation.tsx'),
      'utf8',
    )

    // The shimmer removal should happen when we have data, regardless of whether it changed
    const shimmerRemovalSection = source.slice(
      source.indexOf('} else if (data'),
    )
    expect(shimmerRemovalSection).toMatch(
      /parent\.classList\.remove\(['"]sf-shimmer-loading['"]\)/,
    )

    // Text content update should still only happen when data actually changed
    expect(shimmerRemovalSection).toContain('if (data !== text)')
    expect(shimmerRemovalSection).toContain('node.textContent = data')
  })
})
