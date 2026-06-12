import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('dashboard preview tool wiring', () => {
  it('passes topbar tool state and Agentation activation into the generated preview', () => {
    const dashboardSource = readProjectFile('src/features/dashboard/components/Dashboard.tsx')
    const previewSource = readProjectFile('src/features/generation/components/GeneratedModulePreview.tsx')

    expect(dashboardSource).toContain("useState<'select' | 'annotate' | null>(null)")
    expect(dashboardSource).toContain('previewToolMode={inspectMode}')
    expect(dashboardSource).toContain('onPreviewSelect={handlePreviewSelect}')
    expect(dashboardSource).toContain('selection={previewSelection}')
    expect(dashboardSource).toContain(
      "agentationEnabled={inspectMode === 'annotate' || railMode === 'annotations'}",
    )
    expect(dashboardSource).toContain(
      "railMode === 'tools' ? 'hidden' : 'flex'",
    )
    expect(previewSource).toContain('AgentationSessionBridge')
    expect(previewSource).toContain('previewToolMode={previewToolMode}')
    expect(previewSource).toContain('enabled={agentationEnabled}')
  })
})
