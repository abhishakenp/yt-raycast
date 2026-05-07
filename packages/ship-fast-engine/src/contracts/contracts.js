import { SITE_SPEC_VERSION, SUPPORTED_EXPORT_TARGETS } from '../spec/defaults.js'
import { normalizeSiteSpec } from '../spec/normalize.js'
import { validateSiteSpec } from '../spec/validate.js'

const CURRENT_SITE_SPEC_VERSION = SITE_SPEC_VERSION
const CURRENT_TASK_STATUS = ['PENDING', 'DONE', 'FAILED']

function toString(value, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function toBoolean(value) {
  return Boolean(value)
}

function toNumber(value, fallback = null) {
  return Number.isFinite(Number(value)) ? Number(value) : fallback
}

function toSet(value = []) {
  return new Set(Array.isArray(value) ? value : [])
}

function toStringArray(value = []) {
  return Array.isArray(value) ? value.map((entry) => String(entry)).filter(Boolean) : []
}

function parseVersion(value) {
  if (!value || typeof value !== 'string') return [1, 0, 0]
  const normalized = String(value).trim()
  const [major, minor, patch] = normalized.split('.').map((value) => Number.parseInt(value, 10))
  return [
    Number.isInteger(major) ? major : 1,
    Number.isInteger(minor) ? minor : 0,
    Number.isInteger(patch) ? patch : 0,
  ]
}

function compareVersions(left = [1, 0, 0], right = [1, 0, 0]) {
  for (let i = 0; i < 3; i++) {
    if (left[i] < right[i]) return -1
    if (left[i] > right[i]) return 1
  }
  return 0
}

export function normalizeExportTarget(value = '') {
  const target = toString(value).trim().toLowerCase()
  return SUPPORTED_EXPORT_TARGETS.includes(target) ? target : 'html'
}

export function getSiteSpecVersion(raw = {}) {
  return toString(raw.version, CURRENT_SITE_SPEC_VERSION)
}

export function needsSiteSpecMigration(raw = {}) {
  const current = parseVersion(getSiteSpecVersion(raw))
  const target = parseVersion(CURRENT_SITE_SPEC_VERSION)
  return compareVersions(current, target) < 0
}

function applySiteSpecMigration(raw = {}, _context = {}) {
  const migrated = normalizeSiteSpec(raw, _context)
  if (!needsSiteSpecMigration(raw)) return migrated
  return {
    ...migrated,
    version: CURRENT_SITE_SPEC_VERSION,
  }
}

export function sanitizeSiteSpec(raw = {}, context = {}, options = {}) {
  const base = applySiteSpecMigration(raw, context)
  const normalized = normalizeSiteSpec(base, context)
  normalized.version = CURRENT_SITE_SPEC_VERSION

  if (!normalized.version) normalized.version = CURRENT_SITE_SPEC_VERSION
  const validation = validateSiteSpec(normalized)

  if (validation.valid) {
    return {
      valid: true,
      spec: normalized,
      errors: [],
      migrated: needsSiteSpecMigration(raw),
    }
  }

  if (options.fallbackOnInvalid && typeof options.fallback === 'object' && options.fallback) {
    const fallback = normalizeSiteSpec(options.fallback, context)
    fallback.version = CURRENT_SITE_SPEC_VERSION
    return {
      valid: false,
      spec: fallback,
      errors: validation.errors,
      migrated: needsSiteSpecMigration(raw),
      fallbackApplied: true,
    }
  }

  return {
    valid: false,
    spec: null,
    errors: validation.errors,
    migrated: needsSiteSpecMigration(raw),
  }
}

export function normalizeSession(input = {}, options = {}) {
  const tasks = Array.isArray(input.tasks)
    ? input.tasks.map((task = {}, index) => ({
        id: toString(task.id, `task-${index + 1}`),
        title: toString(task.title, ''),
        status: CURRENT_TASK_STATUS.includes(toString(task.status, 'PENDING'))
          ? task.status
          : 'PENDING',
        filename: task.filename === undefined ? undefined : toString(task.filename, ''),
        description: toString(task.description, ''),
        dependsOn: toStringArray(task.dependsOn),
        files: toStringArray(task.files),
        actions: toStringArray(task.actions),
      }))
    : []

  return {
    id: toString(input.id, ''),
    workspace: toString(input.workspace, ''),
    prompt: toString(input.prompt, '').trim(),
    userId: input.userId ?? null,
    createdAt: toNumber(input.createdAt, options.now || Date.now()) ?? Date.now(),
    tasks,
    homepageReady: toBoolean(input.homepageReady),
    siteSpecReady: toBoolean(input.siteSpecReady),
    elapsed: toNumber(input.elapsed, null),
    cost: toNumber(input.cost, null),
    alternativeDesign: input.alternativeDesign ?? null,
    preferredExportTarget: normalizeExportTarget(
      input.preferredExportTarget ?? options.preferredExportTarget,
    ),
    preferredLanguage: toString(input.preferredLanguage, 'en'),
    isPrivate: toBoolean(input.isPrivate),
    themeOverride: input.themeOverride ?? null,
    lastStatus: input.lastStatus ?? null,
    wsClients: toSet(input.wsClients),
    deployment: input.deployment ?? null,
    sanityConfig: input.sanityConfig || null,
    medusaConfig: input.medusaConfig || null,
  }
}

export function validateSession(session) {
  const errors = []
  if (!session?.id) errors.push('id is required.')
  if (!session?.workspace) errors.push('workspace is required.')
  if (typeof session?.prompt !== 'string') errors.push('prompt must be a string.')
  return { valid: errors.length === 0, errors }
}
