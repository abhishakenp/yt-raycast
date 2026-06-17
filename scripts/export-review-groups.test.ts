import { describe, expect, it } from 'vitest'

import {
  groupStatusEntries,
  renderGroupPatch,
  renderReviewBundleReadme,
} from './export-review-groups'

describe('review group bundle export', () => {
  it('groups git status entries by review group', () => {
    const bundles = groupStatusEntries([
      { path: 'convex/sessions.ts', status: ' M' },
      { path: 'scripts/export-review-groups.ts', status: '??' },
      { path: 'specs/architecture/quality_change_groups.md', status: ' M' },
    ])

    expect(
      bundles.map((bundle) => [bundle.group.id, bundle.entries.length]),
    ).toEqual([
      ['convex-session-decomposition', 1],
      ['quality-gates-local-enforcement', 1],
      ['quality-documentation', 1],
    ])
  })

  it('fails when an entry is outside the documented review groups', () => {
    expect(() =>
      groupStatusEntries([{ path: 'scratch/output.txt', status: '??' }]),
    ).toThrow(/unclassified files/)
  })

  it('renders readme links for each generated review bundle', () => {
    const bundles = groupStatusEntries([
      { path: 'convex/sessions.ts', status: ' M' },
      { path: 'scripts/export-review-groups.ts', status: '??' },
    ])

    expect(renderReviewBundleReadme(bundles)).toContain(
      '- Convex session decomposition: 1 file(s)',
    )
    expect(renderReviewBundleReadme(bundles)).toContain(
      'quality-gates-local-enforcement.patch',
    )
  })

  it('renders tracked and untracked patches for a review group', () => {
    const [bundle] = groupStatusEntries([
      { path: 'scripts/export-review-groups.ts', status: '??' },
      { path: 'scripts/verify-change-groups.ts', status: ' M' },
    ])
    const calls: string[][] = []
    const patch = renderGroupPatch(bundle, (args) => {
      calls.push(args)
      return `diff ${args.join(' ')}`
    })

    expect(calls).toEqual([
      ['diff', '--binary', '--', 'scripts/verify-change-groups.ts'],
      [
        'diff',
        '--no-index',
        '--binary',
        '--',
        '/dev/null',
        'scripts/export-review-groups.ts',
      ],
    ])
    expect(patch).toContain('# Quality gates and local enforcement')
  })
})
