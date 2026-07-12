import { describe, expect, it } from 'vitest'

import {
  buildPreCommitPlan,
  buildPrePushPlan,
} from './git-hook-quality-gate.mjs'

function commandNames(files: string[]) {
  return buildPreCommitPlan(files).map((step) => step.name)
}

describe('git hook quality gate planning', () => {
  it('skips checks when no files are staged', () => {
    expect(buildPreCommitPlan([])).toEqual([])
  })

  it('runs formatting only for staged application code', () => {
    expect(commandNames(['src/features/home/components/HomePage.tsx'])).toEqual(
      ['Prettier changed files'],
    )
  })

  it('runs the changed test file in addition to formatting checks', () => {
    const plan = buildPreCommitPlan(['convex/billing.test.ts'])

    expect(plan.map((step) => step.name)).toEqual([
      'Prettier changed files',
      'Vitest changed tests',
    ])
    expect(plan.at(-1)?.args).toContain('convex/billing.test.ts')
  })

  it('runs formatting only for quality configuration changes', () => {
    expect(commandNames(['package.json'])).toEqual(['Prettier changed files'])
  })

  it('does not run Prettier on Convex generated files', () => {
    expect(commandNames(['convex/_generated/api.d.ts'])).toEqual([])
  })

  it('delegates pre-push quality gates to GitHub Actions', () => {
    expect(buildPrePushPlan()).toEqual([])
  })
})
