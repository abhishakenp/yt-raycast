import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

const readProjectFile = (path: string): string =>
  readFileSync(join(process.cwd(), path), 'utf8')

describe('dashboard session lookup', () => {
  it('passes route params as lookup strings instead of casting them to session ids', () => {
    const dashboardSource = readProjectFile('src/features/dashboard/components/Dashboard.tsx')

    expect(dashboardSource).toContain('api.sessions.getGenerationView')
    expect(dashboardSource).toContain('lookup: sessionId')
    expect(dashboardSource).not.toContain("sessionId: sessionId as Id<'sessions'>")
  })

  it('resolves export ids to their owning session before querying dashboard data', () => {
    const sessionsSource = readProjectFile('convex/sessions.ts')

    expect(sessionsSource).toContain('lookup: v.string()')
    expect(sessionsSource).toContain("ctx.db.normalizeId('exports', args.lookup)")
    expect(sessionsSource).toContain("await ctx.db.get(exportId)")
  })
})
