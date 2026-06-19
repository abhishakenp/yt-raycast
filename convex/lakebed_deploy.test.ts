import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

describe('lakebed_deploy action logging', () => {
  it('emits searchable Convex console logs for every publish phase', () => {
    const source = readFileSync(
      new URL('./lakebed_deploy.ts', import.meta.url),
      'utf8',
    )

    expect(source).toContain('console.log(')
    expect(source).toContain('[lakebed_deploy:deploy] ${message}')
    expect(source).toContain("logLakebedDeploy(args.sessionId, 'action:start'")
    expect(source).toContain("logLakebedDeploy(args.sessionId, 'prepare:start'")
    expect(source).toContain("sourceKind === 'html'")
    expect(source).toContain('buildStaticLakebedProjectFiles')
    expect(source).toContain('buildOpenUILakebedProjectFiles')
    expect(source).not.toContain('staticBuilder, openUIBuilder')
    expect(source).not.toContain(
      "import('../src/features/exports/services/openui-lakebed-export-builder'),",
    )
    expect(
      source.indexOf(
        "'../src/features/exports/services/openui-lakebed-export-builder'",
      ),
    ).toBeGreaterThan(source.indexOf("if (sourceKind === 'html')"))
    expect(source).toContain("'project-build:start'")
    expect(source).toContain('sourceKind')
    expect(source).toContain("logLakebedDeploy(prepared.sessionId, 'record:start')")
    expect(source).toContain(
      "logLakebedDeploy(prepared?.sessionId ?? args.sessionId, 'failed'",
    )
    expect(source).toContain('stack: error instanceof Error ? error.stack')
  })
})
