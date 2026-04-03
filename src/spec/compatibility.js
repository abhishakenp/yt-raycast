import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { promptSnippet } from '../prompt.js'
import { buildFallbackSiteSpec } from './defaults.js'
import { enrichSiteSpecWithWorkspaceBlueprints } from './blueprints.js'
import { normalizeSiteSpec } from './normalize.js'
import { sanitizeSiteSpec } from '../contracts/contracts.js'

const SITE_SPEC_FILE = 'site-spec.json'

function readTextFileIfPresent(workspace, filename) {
  const filePath = join(workspace, filename)
  if (!existsSync(filePath)) return ''
  try {
    return readFileSync(filePath, 'utf-8').trim()
  } catch {
    return ''
  }
}

function readJsonFileIfPresent(workspace, filename) {
  const filePath = join(workspace, filename)
  if (!existsSync(filePath)) return null
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'))
  } catch {
    return null
  }
}

function toTitleCase(value = '') {
  return String(value)
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function inferPagesFromWorkspace(workspace) {
  try {
    const htmlFiles = readdirSync(workspace)
      .filter((name) => name.endsWith('.html'))
      .sort((left, right) => {
        if (left === 'index.html') return -1
        if (right === 'index.html') return 1
        return left.localeCompare(right)
      })

    const pages = htmlFiles.map((filename) => {
      if (filename === 'index.html') return 'Home'
      return toTitleCase(filename.replace(/\.html$/i, '')) || 'Page'
    })

    return pages.length ? pages : ['Home']
  } catch {
    return ['Home']
  }
}

function buildCompatibilityContext(workspace) {
  const prompt = readTextFileIfPresent(workspace, 'prompt.txt') || 'Generated Project'
  const designBrief = readTextFileIfPresent(workspace, 'design.md')
  const projectContext = readJsonFileIfPresent(workspace, 'project-context.json') || {}
  const inferredPages =
    Array.isArray(projectContext.pages) && projectContext.pages.length
      ? projectContext.pages
      : inferPagesFromWorkspace(workspace)

  const ctx = {
    ...projectContext,
    project_name: projectContext.project_name || promptSnippet(prompt, 40, 'Generated Project'),
    pages: inferredPages,
  }

  return {
    prompt,
    ctx,
    designBrief,
    siteType: projectContext.site_type || projectContext.siteType || 'landing',
  }
}

function saveCompatibleSiteSpec(workspace, siteSpec) {
  writeFileSync(join(workspace, SITE_SPEC_FILE), JSON.stringify(siteSpec, null, 2))
}

function loadRawSiteSpec(workspace) {
  return readJsonFileIfPresent(workspace, SITE_SPEC_FILE)
}

function siteSpecNeedsBlueprints(siteSpec) {
  return (siteSpec?.pages || []).some(
    (page) => !page?.renderBlueprint?.bodyHtml || !page?.renderBlueprint?.originalHtmlDocument,
  )
}

// Compatibility path for sessions that were generated before site-spec.json existed.
// This keeps legacy migration separate from the canonical renderer pipeline.
export function ensureCompatibleSiteSpec(workspace) {
  const context = buildCompatibilityContext(workspace)
  const existingSiteSpec = loadRawSiteSpec(workspace)
  const fallback = sanitizeSiteSpec(buildFallbackSiteSpec(context), context, {
    fallbackOnInvalid: false,
  }).spec
  const existingSanitized = existingSiteSpec
    ? sanitizeSiteSpec(existingSiteSpec, context, {
        fallbackOnInvalid: true,
        fallback: fallback,
      })
    : null
  const baseSiteSpec = existingSanitized?.spec || fallback

  const hydratedSiteSpec = siteSpecNeedsBlueprints(baseSiteSpec)
    ? enrichSiteSpecWithWorkspaceBlueprints(baseSiteSpec, workspace)
    : baseSiteSpec

  saveCompatibleSiteSpec(workspace, hydratedSiteSpec)
  return hydratedSiteSpec
}
