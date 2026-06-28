import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

export const changeGroupReportPath =
  'specs/architecture/quality_change_groups.md'

export type ChangeGroupId =
  | 'convex-session-decomposition'
  | 'quality-gates-local-enforcement'
  | 'openui-runtime-bundle-boundary'
  | 'engine-regression-coverage'
  | 'frontend-workflow-preview'
  | 'commerce-external-integration'
  | 'quality-documentation'

type ChangeGroup = {
  id: ChangeGroupId
  title: string
  patterns: RegExp[]
}

export type ChangeGroupAssignment = {
  group: ChangeGroup
  path: string
}

export type GitStatusEntry = {
  path: string
  status: string
}

export type ChangeScope = {
  baseRef: string | null
  entries: GitStatusEntry[]
}

export const changeGroups: ChangeGroup[] = [
  {
    id: 'convex-session-decomposition',
    title: 'Convex session decomposition',
    patterns: [
      /^convex\/_generated\/api\.d\.ts$/,
      /^convex\/generation\.test\.ts$/,
      /^convex\/generation\.ts$/,
      /^convex\/schema\.ts$/,
      /^convex\/session_completion\.ts$/,
      /^convex\/session_readiness\.test\.ts$/,
      /^convex\/sessions\.ts$/,
      /^convex\/(?:authenticated_admission|billing|chat_refinement|cms|deployment|export_entitlement|generation_budget|generation_view|github|lakebed|lakebed_deploy|medusa|usage_metrics)\.test\.ts$/,
      /^convex\/(?:export_artifacts|lakebed_deploy)\.ts$/,
      /^convex\/lib\/(?:chat_refinement|session_|inline_edit_br_persistence_contract|cms_helpers).*\.(?:test\.)?ts$/,
      /^convex\/_generated\/ai\//,
    ],
  },
  {
    id: 'quality-gates-local-enforcement',
    title: 'Quality gates and local enforcement',
    patterns: [
      /^\.claude\/skills\//,
      /^skills-lock\.json$/,
      /^\.github\/workflows\/ci\.yml$/,
      /^\.githooks\//,
      /^\.gitignore$/,
      /^\.a5c\//,
      /^bun\.lock$/,
      /^eslint\.config\.js$/,
      /^package\.json$/,
      /^scripts\/(?:export-review-groups\.ts|export-review-groups\.test\.ts|git-hook-quality-gate\.mjs|git-hook-quality-gate\.test\.ts|quality-gates-config\.test\.ts|verify-build-bundles\.ts|verify-build-bundles\.test\.ts|verify-change-groups\.ts|verify-change-groups\.test\.ts|verify-quality-exit\.ts|verify-quality-exit\.test\.ts|verify-review-readiness\.ts|verify-review-readiness\.test\.ts)$/,
      /^src\/lib\/(?:dev-flags|vite-config)\.test\.ts$/,
      /^src\/routes\/api\/-?(?:payments-webhook-alias|prompt-suggestions-logic|rewrite-route|route-test-files|share-bonus-route)\.test\.ts$/,
      /^tsconfig\.json$/,
      /^tsconfig\.typecheck\.json$/,
      /^types\/typecheck\//,
      /^vitest\.config\.ts$/,
    ],
  },
  {
    id: 'openui-runtime-bundle-boundary',
    title: 'OpenUI runtime and bundle boundary',
    patterns: [
      /^packages\/ship-fast-blocks\//,
      /^packages\/ship-fast-engine\/src\/openui-/,
      /^scripts\/vite-openui-boundaries\.test\.ts$/,
      /^src\/features\/exports\/services\/openui-export-types\.ts$/,
      /^src\/features\/exports\/services\/openui-export-builder\.ts$/,
      /^src\/features\/exports\/services\/openui-export-builder\.test\.ts$/,
      /^src\/features\/exports\/services\/openui-artifact-files\.(?:test\.)?ts$/,
      /^src\/features\/exports\/services\/html-export-files\.(?:test\.)?ts$/,
      /^src\/features\/exports\/services\/openui-html-export-builder\.ts$/,
      /^src\/features\/exports\/services\/openui-(?:capsule-invariants|static-fragment-export)\.test\.ts$/,
      /^src\/features\/exports\/services\/openui-lakebed-export-builder\.(?:test\.)?ts$/,
      /^src\/features\/exports\/services\/(?:export-engine-contract|export-library-manifest-sync|export-artifact-build-contract|export-fixture-contract|export-localization-cms-commerce-contract|export-session-corpus)\.test\.ts$/,
      /^src\/features\/exports\/services\/section-kit-render\.(?:test\.)?ts$/,
      /^src\/features\/generation\/components\/GeneratedModulePreview\.(?:test\.)?tsx$/,
      /^src\/island\/openui\//,
      /^public\/scripts\/tailwind-browser\.js$/,
      /^public\/styles\/openui-preview-tailwind\.css$/,
      /^sessions\/[^/]+\/scripts\/tailwind-browser\.js$/,
      /^vite\.config\.ts$/,
    ],
  },
  {
    id: 'engine-regression-coverage',
    title: 'Engine regression coverage',
    patterns: [
      /^__fixtures__\//,
      /^packages\/ship-fast-engine\//,
      /^scripts\/bench-render-crashes\.mjs$/,
    ],
  },
  {
    id: 'frontend-workflow-preview',
    title: 'Frontend workflow and preview behavior',
    patterns: [
      /^packages\/ship-fast-lakebed\//,
      /^scripts\/verify-(?:browser-helpers|generation-agent-browser)\.mjs$/,
      /^src\/app\/providers\//,
      /^src\/components\//,
      /^src\/features\/(?:admin|agentation|brand|chat|cms|clone|dashboard|editing|exports\/server|gallery|home|localization|referrals|session)\//,
      /^src\/features\/billing\/components\//,
      /^src\/features\/deployments\//,
      /^src\/features\/session\/services\/generation-launch-handoff\.(?:test\.)?ts$/,
      /^src\/hooks\//,
      /^src\/lib\/home\//,
      /^src\/lib\/edit-helpers(?:\.test)?\.ts$/,
      /^src\/routeTree\.gen\.ts$/,
      /^src\/root-document\.test\.tsx?$/,
      /^src\/routes\/(?:terms|privacy|pricing)\//,
      /^src\/routes\/api\/sessions\.\$sessionId\.section-edit\.ts$/,
      /^src\/shared\/auth\//,
      /^src\/shared\/env\/convex-runtime(?:\.test)?\.ts$/,
      /^src\/styles\.css$/,
      /^src\/styles\/index\.css$/,
    ],
  },
  {
    id: 'commerce-external-integration',
    title: 'Commerce and external integration hardening',
    patterns: [
      /^src\/billing\//,
      /^src\/features\/exports\/server\//,
      /^src\/features\/github\//,
      /^src\/lib\/(?:image-context|stock-image)\.ts$/,
      /^src\/lib\/(?:pexels-route|stock-image)\.test\.ts$/,
      /^src\/routes\/api\/-?medusa-/,
    ],
  },
  {
    id: 'quality-documentation',
    title: 'Quality documentation and assessment',
    patterns: [/^AGENTS\.md$/, /^CLAUDE\.md$/, /^codemap\.md$/, /^specs\//],
  },
]

export function parseGitStatusPorcelainEntries(
  output: string,
): GitStatusEntry[] {
  return output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const rawPath = line.slice(3)
      return {
        path: rawPath.split(' -> ').at(-1) ?? rawPath,
        status: line.slice(0, 2),
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

export function parseGitStatusPorcelain(output: string): string[] {
  return parseGitStatusPorcelainEntries(output).map((entry) => entry.path)
}

export function parseGitNameStatusEntries(output: string): GitStatusEntry[] {
  return output
    .split('\n')
    .map((line) => line.trimEnd())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split('\t')
      const rawPath = parts.at(-1) ?? ''
      return {
        path: rawPath,
        status: parts[0] ?? '',
      }
    })
    .sort((a, b) => a.path.localeCompare(b.path))
}

function mergeChangeEntries(
  branchEntries: GitStatusEntry[],
  worktreeEntries: GitStatusEntry[],
) {
  const entriesByPath = new Map<string, GitStatusEntry>()

  for (const entry of branchEntries) {
    entriesByPath.set(entry.path, entry)
  }

  for (const entry of worktreeEntries) {
    entriesByPath.set(entry.path, entry)
  }

  return [...entriesByPath.values()].sort((a, b) =>
    a.path.localeCompare(b.path),
  )
}

export function classifyChangedPath(path: string): ChangeGroup | null {
  return (
    changeGroups.find((group) =>
      group.patterns.some((pattern) => pattern.test(path)),
    ) ?? null
  )
}

export function classifyChangedPaths(paths: string[]) {
  const assignments: ChangeGroupAssignment[] = []
  const unclassified: string[] = []

  for (const path of paths) {
    const group = classifyChangedPath(path)
    if (group) {
      assignments.push({ group, path })
    } else {
      unclassified.push(path)
    }
  }

  return { assignments, unclassified }
}

export function summarizeAssignments(assignments: ChangeGroupAssignment[]) {
  return changeGroups
    .map((group) => ({
      count: assignments.filter(
        (assignment) => assignment.group.id === group.id,
      ).length,
      group,
    }))
    .filter(({ count }) => count > 0)
}

const withReportPath = (paths: string[]) =>
  paths.includes(changeGroupReportPath)
    ? paths
    : [...paths, changeGroupReportPath].sort((a, b) => a.localeCompare(b))

export function renderChangeGroupReport(paths: string[]) {
  const { assignments, unclassified } = classifyChangedPaths(paths)
  if (unclassified.length > 0) {
    throw new Error(
      `Cannot render change-group report with unclassified files:\n- ${unclassified.join('\n- ')}`,
    )
  }

  const lines = [
    '# Quality Change Groups',
    '',
    'Generated by `bun scripts/verify-change-groups.ts --write-report`.',
    'Do not edit this file by hand; update `scripts/verify-change-groups.ts` or the changed files, then regenerate it.',
    '',
    `Total changed paths: ${paths.length}`,
    '',
  ]

  for (const group of changeGroups) {
    const groupPaths = assignments
      .filter((assignment) => assignment.group.id === group.id)
      .map((assignment) => assignment.path)

    lines.push(`## ${group.title} (${groupPaths.length})`, '')
    if (groupPaths.length === 0) {
      lines.push('_No changed paths._', '')
      continue
    }

    for (const path of groupPaths) {
      lines.push(`- \`${path}\``)
    }
    lines.push('')
  }

  return `${lines.join('\n').trimEnd()}\n`
}

export function readChangedPaths() {
  return readChangeScope().entries.map((entry) => entry.path)
}

function runGit(args: string[]) {
  return execFileSync('git', args, { encoding: 'utf8' }).trimEnd()
}

function readWorktreeEntries() {
  return parseGitStatusPorcelainEntries(
    execFileSync('git', ['status', '--porcelain=v1', '--untracked-files=all'], {
      encoding: 'utf8',
    }),
  )
}

function readUpstreamBaseRef() {
  try {
    return runGit(['merge-base', '--fork-point', '@{upstream}', 'HEAD'])
  } catch {
    try {
      return runGit(['merge-base', '@{upstream}', 'HEAD'])
    } catch {
      return null
    }
  }
}

function readBranchEntries(baseRef: string | null) {
  if (!baseRef) {
    return []
  }

  return parseGitNameStatusEntries(
    execFileSync('git', ['diff', '--name-status', `${baseRef}...HEAD`], {
      encoding: 'utf8',
    }),
  )
}

export function readChangeScope(): ChangeScope {
  const baseRef = readUpstreamBaseRef()
  const branchEntries = readBranchEntries(baseRef)
  const worktreeEntries = readWorktreeEntries()

  return {
    baseRef,
    entries: mergeChangeEntries(branchEntries, worktreeEntries),
  }
}

export function verifyChangeGroups(paths = readChangedPaths()) {
  const { assignments, unclassified } = classifyChangedPaths(paths)
  if (unclassified.length > 0) {
    throw new Error(
      `Unclassified changed files:\n- ${unclassified.join('\n- ')}\n\nAdd them to a documented quality consolidation group in scripts/verify-change-groups.ts.`,
    )
  }

  return summarizeAssignments(assignments)
}

if (process.argv[1]?.endsWith('verify-change-groups.ts')) {
  const paths = readChangedPaths()
  if (process.argv.includes('--write-report')) {
    const report = renderChangeGroupReport(withReportPath(paths))
    writeFileSync(changeGroupReportPath, report)
    console.log(`Wrote ${changeGroupReportPath}`)
    process.exit(0)
  }

  if (process.argv.includes('--check-report')) {
    if (!existsSync(changeGroupReportPath)) {
      throw new Error(`Missing ${changeGroupReportPath}`)
    }
    const expected = renderChangeGroupReport(withReportPath(paths))
    const actual = readFileSync(changeGroupReportPath, 'utf8')
    if (actual !== expected) {
      throw new Error(
        `${changeGroupReportPath} is out of date. Run bun scripts/verify-change-groups.ts --write-report.`,
      )
    }
    console.log(`${changeGroupReportPath} is current`)
    process.exit(0)
  }

  const summary = verifyChangeGroups(paths)
  if (summary.length === 0) {
    console.log('No changed files to classify.')
  } else {
    console.log('Changed files are covered by quality consolidation groups:')
    for (const { group, count } of summary) {
      console.log(`- ${group.title}: ${count}`)
    }
  }
}
