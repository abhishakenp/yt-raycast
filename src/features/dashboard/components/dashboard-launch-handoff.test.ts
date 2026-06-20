import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('dashboard launch handoff', () => {
  it('only plays the intro loader for fresh non-cached generations', () => {
    const homeSource = readProjectFile(
      'src/features/home/hooks/usePromptHomeController.ts',
    )
    const dashboardSource = readProjectFile(
      'src/features/dashboard/components/Dashboard.tsx',
    )
    const handoffSource = readProjectFile(
      'src/features/session/services/generation-launch-handoff.ts',
    )
    const introSource = readProjectFile('src/components/GenUI/IntroLoader.tsx')

    expect(handoffSource).toContain('generationLaunchStoragePrefix')
    expect(homeSource).toContain('rememberGenerationLaunchHandoff')
    expect(homeSource).toContain('isOwnedCachedClone')
    expect(homeSource).toContain('result.cached !== true || isOwnedCachedClone')
    expect(homeSource).toContain('result.cached !== true')
    expect(dashboardSource).toContain('takeGenerationLaunchHandoff')
    expect(dashboardSource).toContain('window.sessionStorage')
    expect(dashboardSource).toContain(
      'startedFromGenerationFlow && !isPreviewReady',
    )
    expect(dashboardSource).toContain('playSound={startedFromGenerationFlow}')
    expect(dashboardSource).toContain('cockpit-fade-up')
    expect(dashboardSource).toContain('id="dashboard-cockpit"')
    expect(introSource).toContain('playSound?: boolean')
  })

  it('does not render a duplicate dashboard preview loading screen', () => {
    const dashboardSource = readProjectFile(
      'src/features/dashboard/components/Dashboard.tsx',
    )
    const stylesSource = readProjectFile('src/styles/index.css')

    expect(dashboardSource).not.toContain('PreviewLoadingState')
    expect(dashboardSource).not.toContain('Composing the first screen')
    expect(dashboardSource).not.toContain('Building your site')
    expect(stylesSource).not.toContain('preview-loading-state')
  })

  it('keeps non-critical dashboard panels out of the initial generation bundle', () => {
    const dashboardSource = readProjectFile(
      'src/features/dashboard/components/Dashboard.tsx',
    )

    expect(dashboardSource).toContain('import { lazy, Suspense')
    expect(dashboardSource).toContain('const CommercePanel = lazy(')
    expect(dashboardSource).toContain('const LakebedAdminPanel = lazy(')
    expect(dashboardSource).toContain('const DeploymentPanel = lazy(')
    expect(dashboardSource).toContain('const ExportPanel = lazy(')
    expect(dashboardSource).toContain('const GitHubPanel = lazy(')
    expect(dashboardSource).toContain(
      '<Suspense fallback={<ToolPopoverFallback />}>',
    )
    expect(dashboardSource).not.toContain('import { CommercePanel }')
    expect(dashboardSource).not.toContain('import { CmsPanel }')
    expect(dashboardSource).not.toContain('import { LakebedAdminPanel }')
  })

  it('keeps the heavy dashboard behind lazy generate route components', () => {
    const generateRouteSource = readProjectFile(
      'src/routes/generate.$sessionId.tsx',
    )
    const generateAdminRouteSource = readProjectFile(
      'src/routes/generate.$sessionId.admin.tsx',
    )
    const lazyRouteSource = readProjectFile(
      'src/routes/-generate-dashboard-route.tsx',
    )

    expect(generateRouteSource).toContain('lazyRouteComponent')
    expect(generateRouteSource).toContain(
      "import('./-generate-dashboard-route')",
    )
    expect(generateRouteSource).not.toContain(
      '@/features/dashboard/components/Dashboard',
    )
    expect(generateAdminRouteSource).toContain('lazyRouteComponent')
    expect(generateAdminRouteSource).toContain(
      "import('./-generate-dashboard-route')",
    )
    expect(generateAdminRouteSource).not.toContain(
      '@/features/dashboard/components/Dashboard',
    )
    expect(lazyRouteSource).toContain("getRouteApi('/generate/$sessionId')")
    expect(lazyRouteSource).toContain(
      '@/features/dashboard/components/Dashboard',
    )
  })
})
