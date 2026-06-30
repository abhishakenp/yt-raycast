import { describe, expect, it } from 'vitest'

import {
  buildPreCommitPlan,
  buildPrePushPlan,
} from './git-hook-quality-gate.mjs'

const commandNames = (files: string[]) =>
  buildPreCommitPlan(files).map((step) => step.name)

describe('git hook quality gate planning', () => {
  it('skips checks when no files are staged', () => {
    expect(buildPreCommitPlan([])).toEqual([])
  })

  it('runs formatting, lint, and typecheck for application code', () => {
    expect(commandNames(['src/features/home/components/HomePage.tsx'])).toEqual(
      ['Prettier changed files', 'ESLint', 'TypeScript'],
    )
  })

  it('runs the changed test file in addition to static checks', () => {
    const plan = buildPreCommitPlan(['convex/billing.test.ts'])

    expect(plan.map((step) => step.name)).toEqual([
      'Prettier changed files',
      'ESLint',
      'TypeScript',
      'Vitest changed tests',
    ])
    expect(plan.at(-1)?.args).toContain('convex/billing.test.ts')
  })

  it('treats quality configuration changes as type-aware changes', () => {
    expect(commandNames(['package.json'])).toEqual([
      'Prettier changed files',
      'ESLint',
      'TypeScript',
    ])
  })

  it('does not run Prettier on Convex generated files', () => {
    expect(commandNames(['convex/_generated/api.d.ts'])).toEqual([
      'ESLint',
      'TypeScript',
    ])
  })

  it('reserves full QA for pre-push', () => {
    expect(buildPrePushPlan().map((step) => step.name)).toEqual([
      'ESLint',
      'TypeScript',
      'Coverage tests',
      'Change groups',
      'Review readiness',
      'Generated artifacts',
      'Production build',
      'Bundle boundaries',
    ])
  })
})
