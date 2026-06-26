#!/usr/bin/env node
import { existsSync, readFileSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { validateSiteSpec } from '../packages/ship-fast-engine/src/spec/validate.js'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const workspaceArg =
  args.get('--workspace') ?? process.env.SHIP_FAST_VERIFY_WORKSPACE
const requireOpenUi = parseBoolean(args.get('--require-openui') ?? '1')
const requireManifest = parseBoolean(args.get('--require-manifest') ?? '0')
const allowFailedTasks = parseBoolean(args.get('--allow-failed-tasks') ?? '0')
const minHtmlBytes = Number(args.get('--min-html-bytes') ?? 500)

if (!workspaceArg) {
  fail('Missing --workspace. Pass a generated Ship Fast workspace directory.')
}

if (!Number.isFinite(minHtmlBytes) || minHtmlBytes < 1) {
  fail('--min-html-bytes must be a positive number')
}

const workspace = resolve(workspaceArg)

if (!existsSync(workspace) || !statSync(workspace).isDirectory()) {
  fail(`Workspace does not exist or is not a directory: ${workspace}`)
}

const siteSpec = readJsonFile('site-spec.json')
const html = readRequiredFile('index.html')
const openUiSource = readOptionalFile('home.openui')
const manifest = readOptionalJsonFile('openui-manifest.json')
const tasks = readOptionalTasks()
const errors = []

if (html.length < minHtmlBytes) {
  errors.push(
    `index.html is too small: ${html.length} bytes, expected at least ${minHtmlBytes}`,
  )
}

if (!/<(main|body|html|section)\b/i.test(html)) {
  errors.push('index.html does not look like a rendered HTML page')
}

if (
  /Waiting for generated module|Generation failed|FunctionPathNotFound|fetch failed/i.test(
    html,
  )
) {
  errors.push('index.html contains runtime placeholder or failure text')
}

errors.push(...validateSiteSpecShape(siteSpec))

if (requireOpenUi) {
  if (!openUiSource) {
    errors.push('home.openui is required but missing')
  } else if (openUiSource.trim().length < 20) {
    errors.push(
      'home.openui is too small to represent a generated OpenUI source',
    )
  }
}

if (requireManifest && !manifest) {
  errors.push('openui-manifest.json is required but missing')
}

if (manifest) {
  errors.push(...validateOpenUiManifest(manifest))
}

if (tasks) {
  const failedTasks = tasks.filter((task) => task.status === 'FAILED')
  if (!allowFailedTasks && failedTasks.length > 0) {
    errors.push(
      `tasks.json contains failed tasks: ${failedTasks.map((task) => task.id).join(', ')}`,
    )
  }
}

if (errors.length > 0) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        workspace,
        errors,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}

console.log(
  JSON.stringify(
    {
      ok: true,
      workspace,
      files: {
        htmlBytes: html.length,
        siteSpec: 'site-spec.json',
        openUi: openUiSource ? 'home.openui' : null,
        manifest: manifest ? 'openui-manifest.json' : null,
        tasks: tasks ? tasks.length : null,
      },
      siteSpec: summarizeSiteSpec(siteSpec),
    },
    null,
    2,
  ),
)

function parseBoolean(value) {
  return /^(1|true|yes|on)$/i.test(String(value))
}

function fail(message) {
  console.error(JSON.stringify({ ok: false, errors: [message] }, null, 2))
  process.exit(1)
}

function readRequiredFile(fileName) {
  const path = join(workspace, fileName)
  if (!existsSync(path)) {
    errorsOrThrow(`${fileName} is required but missing`)
  }
  return readFileSync(path, 'utf8')
}

function readOptionalFile(fileName) {
  const path = join(workspace, fileName)
  return existsSync(path) ? readFileSync(path, 'utf8') : null
}

function readJsonFile(fileName) {
  const raw = readRequiredFile(fileName)
  try {
    return JSON.parse(raw)
  } catch (error) {
    errorsOrThrow(
      `${fileName} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function readOptionalJsonFile(fileName) {
  const raw = readOptionalFile(fileName)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch (error) {
    errorsOrThrow(
      `${fileName} is not valid JSON: ${error instanceof Error ? error.message : String(error)}`,
    )
  }
}

function readOptionalTasks() {
  const parsed = readOptionalJsonFile('tasks.json')
  if (!parsed) return null
  if (!Array.isArray(parsed.tasks)) {
    errorsOrThrow('tasks.json must contain a tasks array')
  }
  return parsed.tasks.map((task, index) => ({
    id: typeof task.id === 'string' && task.id ? task.id : `task-${index}`,
    status: typeof task.status === 'string' ? task.status : 'UNKNOWN',
  }))
}

function errorsOrThrow(message) {
  console.error(
    JSON.stringify({ ok: false, workspace, errors: [message] }, null, 2),
  )
  process.exit(1)
}

function validateSiteSpecShape(spec) {
  const siteSpecErrors = []
  if (!spec || typeof spec !== 'object' || Array.isArray(spec)) {
    return ['site-spec.json must contain an object']
  }

  const richSpec =
    'projectName' in spec || 'pages' in spec || 'exportableFrameworks' in spec
  if (richSpec) {
    const result = validateSiteSpec(spec)
    return result.valid ? [] : result.errors
  }

  if (typeof spec.brand !== 'string' || spec.brand.trim().length === 0) {
    siteSpecErrors.push('legacy site spec requires a non-empty brand')
  }
  if (
    'modules' in spec &&
    (typeof spec.modules !== 'object' || Array.isArray(spec.modules))
  ) {
    siteSpecErrors.push(
      'legacy site spec modules must be an object when present',
    )
  }
  if (
    'theme' in spec &&
    typeof spec.theme !== 'string' &&
    typeof spec.theme !== 'object'
  ) {
    siteSpecErrors.push(
      'legacy site spec theme must be a string or object when present',
    )
  }

  return siteSpecErrors
}

function validateOpenUiManifest(manifest) {
  if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) {
    return ['openui-manifest.json must contain an object']
  }

  const entries = Array.isArray(manifest.entries)
    ? manifest.entries
    : Array.isArray(manifest.pages)
      ? manifest.pages
      : []

  if (entries.length === 0) {
    return ['openui-manifest.json must contain entries or pages']
  }

  return entries.flatMap((entry, index) => {
    const entryErrors = []
    const file = typeof entry.file === 'string' ? entry.file : null
    if (!file) {
      entryErrors.push(`openui manifest entry ${index} is missing file`)
    } else if (!existsSync(join(workspace, file))) {
      entryErrors.push(
        `openui manifest entry ${index} points to missing file ${file}`,
      )
    }
    return entryErrors
  })
}

function summarizeSiteSpec(spec) {
  return {
    name: spec.projectName ?? spec.brand ?? basename(workspace),
    siteType: spec.siteType ?? null,
    pages: Array.isArray(spec.pages) ? spec.pages.length : null,
    exportableFrameworks: Array.isArray(spec.exportableFrameworks)
      ? spec.exportableFrameworks
      : null,
  }
}
