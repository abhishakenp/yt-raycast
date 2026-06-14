import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('dashboard launch handoff', () => {
  it('only plays the intro loader for fresh non-cached generations', () => {
    const homeSource = readProjectFile('src/features/home/hooks/usePromptHomeController.ts')
    const dashboardSource = readProjectFile('src/features/dashboard/components/Dashboard.tsx')
    const introSource = readProjectFile('src/components/GenUI/IntroLoader.tsx')

    expect(homeSource).toContain('generationLaunchStoragePrefix')
    expect(homeSource).toContain('result.cached !== true')
    expect(homeSource).toContain('window.sessionStorage.setItem')
    expect(dashboardSource).toContain('takeGenerationLaunchHandoff')
    expect(dashboardSource).toContain('startedFromGenerationFlow && !isPreviewReady')
    expect(dashboardSource).toContain('playSound={startedFromGenerationFlow}')
    expect(dashboardSource).toContain('PreviewLoadingState')
    expect(dashboardSource).toContain('cockpit-fade-up')
    expect(dashboardSource).toContain('id="dashboard-cockpit"')
    expect(introSource).toContain('playSound?: boolean')
  })
})
