import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('ExportPanel', () => {
  it('keeps the sidebar export popover layout aligned with the original rail panel', () => {
    const source = readFileSync(
      'src/features/exports/components/ExportPanel.tsx',
      'utf8',
    )

    expect(source).toContain('Project Export')
    expect(source).toContain('Ship this exact UI in the stack you need')
    expect(source).toContain('export-target-glyph')
    expect(source).toContain('export-target-state')
    expect(source).toContain('grid-cols-[42px_minmax(0,1fr)_auto]')
    expect(source).toContain('Ready To Download')
    expect(source).toContain('Building Downloads...')
    expect(source).toContain('onClick={() => void runTargetAction(item)}')
    expect(source).toContain('const result = await createExport(item.target)')
    expect(source).toContain('await downloadExport(item)')
    expect(source).toContain(
      'await downloadFromUrl(result.downloadUrl, item.target)',
    )
    expect(source).toContain("typeof result.downloadUrl === 'string'")
    expect(source).toContain("await getToken({ template: 'convex' })")
    expect(source).toContain('Lakebed project bundle')
    expect(source).toContain("'html', 'react', 'next', 'lakebed'")
    expect(source).not.toContain('runSelectedAction')
    expect(source).not.toContain('rounded-2xl border border-white/10')
    expect(source).not.toContain('Refresh export targets')
  })
})
