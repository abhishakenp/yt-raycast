#!/usr/bin/env node
import { chmodSync, existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const HOOKS_PATH = '.githooks'
const PRETTIER_EXTENSIONS = new Set([
  '.css',
  '.html',
  '.js',
  '.jsx',
  '.json',
  '.md',
  '.mjs',
  '.mts',
  '.ts',
  '.tsx',
  '.yaml',
  '.yml',
])

const CODE_FILE_PATTERN =
  /^(?:src|convex|scripts)\/.+\.[cm]?[jt]sx?$|^packages\/[^/]+\/(?:src|scripts)\/.+\.[cm]?[jt]sx?$/
const TEST_FILE_PATTERN = /\.(?:test|spec)\.[cm]?[jt]sx?$/
const QUALITY_CONFIG_FILES = new Set([
  '.github/workflows/ci.yml',
  'bun.lock',
  'eslint.config.js',
  'package.json',
  'prettier.config.js',
  'tsconfig.json',
  'vite.config.ts',
  'vitest.config.ts',
])

function extname(file) {
  const match = file.match(/(\.[^.]+)$/)
  return match?.[1] ?? ''
}

function uniqueSorted(files) {
  return [...new Set(files)].sort((a, b) => a.localeCompare(b))
}

function hasQualityImpact(file) {
  return CODE_FILE_PATTERN.test(file) || QUALITY_CONFIG_FILES.has(file)
}

export function buildPreCommitPlan(stagedFiles) {
  const files = uniqueSorted(stagedFiles.filter(Boolean))
  if (files.length === 0) {
    return []
  }

  const prettierFiles = files.filter((file) =>
    PRETTIER_EXTENSIONS.has(extname(file)),
  )
  const qualityFiles = files.filter(hasQualityImpact)
  const testFiles = files.filter(
    (file) => hasQualityImpact(file) && TEST_FILE_PATTERN.test(file),
  )

  const commands = []
  if (prettierFiles.length > 0) {
    commands.push({
      name: 'Prettier changed files',
      command: 'bunx',
      args: ['prettier', '--check', ...prettierFiles],
    })
  }

  if (qualityFiles.length > 0) {
    commands.push({ name: 'ESLint', command: 'bun', args: ['run', 'lint'] })
    commands.push({
      name: 'TypeScript',
      command: 'bun',
      args: ['run', 'typecheck'],
    })
  }

  if (testFiles.length > 0) {
    commands.push({
      name: 'Vitest changed tests',
      command: 'bun',
      args: ['run', 'test', '--', ...testFiles],
    })
  }

  return commands
}

export function buildPrePushPlan() {
  return [{ name: 'Full QA', command: 'bun', args: ['run', 'verify:qa'] }]
}

export function readStagedFiles() {
  const result = spawnSync(
    'git',
    ['diff', '--cached', '--name-only', '--diff-filter=ACMR'],
    {
      encoding: 'utf8',
    },
  )

  if (result.status !== 0) {
    throw new Error(result.stderr || 'Unable to read staged files')
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
}

function runCommand(step) {
  console.log(`\n[quality-gate] ${step.name}`)
  const result = spawnSync(step.command, step.args, { stdio: 'inherit' })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function runPlan(plan) {
  if (plan.length === 0) {
    console.log('[quality-gate] No staged files require checks.')
    return
  }

  for (const step of plan) {
    runCommand(step)
  }
}

function installHooks() {
  const gitCheck = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
    encoding: 'utf8',
  })

  if (gitCheck.status !== 0 || gitCheck.stdout.trim() !== 'true') {
    console.log(
      '[quality-gate] Not inside a git worktree; skipping hook install.',
    )
    return
  }

  const configResult = spawnSync(
    'git',
    ['config', 'core.hooksPath', HOOKS_PATH],
    {
      stdio: 'inherit',
    },
  )

  if (configResult.status !== 0) {
    process.exit(configResult.status ?? 1)
  }

  for (const hook of [`${HOOKS_PATH}/pre-commit`, `${HOOKS_PATH}/pre-push`]) {
    if (existsSync(hook)) {
      chmodSync(hook, 0o755)
    }
  }

  console.log(`[quality-gate] Installed git hooks from ${HOOKS_PATH}.`)
}

function main(argv) {
  const mode = argv[2]

  if (mode === 'install') {
    installHooks()
    return
  }

  if (mode === 'pre-push') {
    runPlan(buildPrePushPlan())
    return
  }

  if (mode === 'pre-commit') {
    runPlan(buildPreCommitPlan(readStagedFiles()))
    return
  }

  console.error(
    'Usage: node scripts/git-hook-quality-gate.mjs <install|pre-commit|pre-push>',
  )
  process.exit(2)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main(process.argv)
}
