import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile } from '../pipeline/workspace'

const REFS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'content-refs')
const WORKSPACE_FILE = 'content-plan-ref.txt'

interface LoadedRef {
  name: string
  content: string
}

export function loadContentPlanRef(name: string): LoadedRef | null {
  if (!name) return null
  const path = join(REFS_DIR, `${name}.md`)
  if (!existsSync(path)) return null
  return { name, content: readFileSync(path, 'utf-8') }
}

export function stashContentPlanRefName(workspace: string, name: string): void {
  if (!workspace || !name) return
  writeFile(workspace, WORKSPACE_FILE, name)
}

export function readContentPlanRefFromWorkspace(
  workspace: string,
): LoadedRef | null {
  if (!workspace) return null
  const name = (readFile(workspace, WORKSPACE_FILE) || '').trim()
  if (!name) return null
  return loadContentPlanRef(name)
}

export function contentPlanPromptAppendix(
  contentPlanRef: LoadedRef | null,
): string {
  if (!contentPlanRef?.content) return ''
  return `

--- CONTENT PLAN / IA REFERENCE: ${contentPlanRef.name.toUpperCase()} ---
The following defines information architecture, required or recommended pages, section depth, and quality expectations. Obey it when choosing routes, section types, and copy density. The user prompt and brand block override when they explicitly conflict.

${contentPlanRef.content}
--- END CONTENT PLAN / IA REFERENCE ---`
}

function fencedRefAppendix(label: string, loaded: LoadedRef | null): string {
  if (!loaded?.content) return ''
  return `

--- ${label} ---
${loaded.content}
--- END ${label} ---`
}

export function globalSpecRulesAppendix() {
  return fencedRefAppendix(
    'GLOBAL SITE SPEC RULES',
    loadContentPlanRef('global-spec-rules'),
  )
}

export function editSpecRulesAppendix() {
  return fencedRefAppendix(
    'EDIT MODE SPEC RULES',
    loadContentPlanRef('edit-mode-spec-rules'),
  )
}

export function siteSpecOutputContractAppendix(
  schemaVersion: string | null,
): string {
  const loaded = loadContentPlanRef('site-spec-output-contract')
  if (!loaded?.content) return ''
  const ver = schemaVersion ?? ''
  const content = loaded.content.replaceAll('{{SITE_SPEC_VERSION}}', ver)
  return fencedRefAppendix('SITE SPEC OUTPUT CONTRACT', {
    name: loaded.name,
    content,
  })
}

export function thinSiteSpecOutputAppendix(
  schemaVersion: string | null,
): string {
  const loaded = loadContentPlanRef('site-spec-thin-contract')
  if (!loaded?.content) return ''
  const ver = schemaVersion ?? ''
  const content = loaded.content.replaceAll('{{SITE_SPEC_VERSION}}', ver)
  return fencedRefAppendix('THIN SITE SPEC CONTRACT (PASS A)', {
    name: loaded.name,
    content,
  })
}
