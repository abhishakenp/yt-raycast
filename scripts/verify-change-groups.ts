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
      /^convex\/session_completion\.ts$/,
      /^convex\/session-readiness\.test\.ts$/,
      /^convex\/sessions\.ts$/,
      /^convex\/(?:authenticated-admission|billing|chat-refinement|cms|deployment|export-entitlement|generation-view|lakebed|medusa|usage-metrics)\.test\.ts$/,
      /^convex\/lib\/(?:chat_refinement|session_).+\.(?:test\.)?ts$/,
    ],
  },
  {
    id: 'quality-gates-local-enforcement',
    title: 'Quality gates and local enforcement',
    patterns: [
      /^\.github\/workflows\/ci\.yml$/,
      /^\.githooks\//,
      /^\.gitignore$/,
      /^bun\.lock$/,
      /^eslint\.config\.js$/,
      /^package\.json$/,
      /^scripts\/(?:export-review-groups\.ts|export-review-groups\.test\.ts|git-hook-quality-gate\.mjs|git-hook-quality-gate\.test\.ts|quality-gates-config\.test\.ts|verify-build-bundles\.ts|verify-build-bundles\.test\.ts|verify-change-groups\.ts|verify-change-groups\.test\.ts|verify-quality-exit\.ts|verify-quality-exit\.test\.ts|verify-review-readiness\.ts|verify-review-readiness\.test\.ts)$/,
      /^tsconfig\.json$/,
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
      /^src\/features\/exports\/services\/openui-html-export-builder\.ts$/,
      /^src\/features\/generation\/components\/GeneratedModulePreview\.(?:test\.)?tsx$/,
      /^src\/island\/openui\//,
      /^vite\.config\.ts$/,
    ],
  },
  {
    id: 'engine-regression-coverage',
    title: 'Engine regression coverage',
    patterns: [
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
      /^src\/features\/(?:admin|agentation|brand|chat|dashboard|editing|exports\/server|gallery|home|session)\//,
      /^src\/features\/session\/services\/generation-launch-handoff\.(?:test\.)?ts$/,
      /^src\/hooks\//,
      /^src\/lib\/home\//,
      /^src\/shared\/auth\//,
    ],
  },
  {
    id: 'commerce-external-integration',
    title: 'Commerce and external integration hardening',
    patterns: [
      /^src\/billing\//,
      /^src\/features\/exports\/server\//,
      /^src\/lib\/(?:image-context|stock-image)\.ts$/,
      /^src\/lib\/stock-image\.test\.ts$/,
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

    if (groupPaths.length === 0) continue

    lines.push(`## ${group.title} (${groupPaths.length})`, '')
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
