import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('generated preview responsive safeguards', () => {
  it('exposes the simulated device mode to scoped preview CSS', () => {
    const dashboardSource = readProjectFile('src/features/dashboard/components/Dashboard.tsx')
    const stylesSource = readProjectFile('src/styles.css')

    expect(dashboardSource).toContain('data-preview-device={currentDevice}')
    expect(dashboardSource).toContain('previewDeviceWidth')
    expect(stylesSource).toContain(".genui-preview[data-preview-device='mobile']")
    expect(stylesSource).toContain(".genui-preview[data-preview-device='tablet']")
    expect(stylesSource).toContain('overflow-wrap: anywhere')
    expect(stylesSource).toContain('grid-template-columns: minmax(0, 1fr)')
  })
})
