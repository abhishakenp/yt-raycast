import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('dashboard session lookup', () => {
  it('passes route params as lookup strings instead of casting them to session ids', () => {
    const dashboardSource = readProjectFile(
      'src/features/dashboard/components/Dashboard.tsx',
    )

    expect(dashboardSource).toContain('api.sessions.getGenerationView')
    expect(dashboardSource).toContain('lookup: sessionId')
    expect(dashboardSource).not.toContain(
      "sessionId: sessionId as Id<'sessions'>",
    )
  })

  it('polls the session API as a fallback while live Convex data is unavailable', () => {
    const dashboardSource = readProjectFile(
      'src/features/dashboard/components/Dashboard.tsx',
    )

    expect(dashboardSource).toContain('fallbackGenerationView')
    expect(dashboardSource).toContain('liveGenerationView === undefined')
    expect(dashboardSource).toContain(
      '/api/sessions/${encodeURIComponent(sessionId)}',
    )
    expect(dashboardSource).toContain("data?.status !== 'preview_ready'")
  })

  it('resolves export ids to their owning session before querying dashboard data', () => {
    const sessionsSource = readProjectFile('convex/sessions.ts')
    const validatorsSource = readProjectFile('convex/lib/session_validators.ts')
    const generationViewSource = readProjectFile(
      'convex/lib/session_generation_view_helpers.ts',
    )

    expect(sessionsSource).toContain('args: lookupArgs')
    expect(validatorsSource).toContain('lookup: v.string()')
    expect(sessionsSource).toContain('loadGenerationView(ctx, args)')
    expect(generationViewSource).toContain(
      "ctx.db.normalizeId('exports', lookup)",
    )
    expect(generationViewSource).toContain('await ctx.db.get(exportId)')
  })
})
