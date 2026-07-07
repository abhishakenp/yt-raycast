import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFile, writeFile } from '../pipeline/workspace.js'

const REFS_DIR = join(dirname(fileURLToPath(import.meta.url)), 'design-refs')
const WORKSPACE_FILE = 'design-ref.txt'

interface LoadedDesignRef {
  name: string
  content: string
}

export function loadDesignRef(name: string): LoadedDesignRef | null {
  if (!name) return null
  const path = join(REFS_DIR, `${name}.md`)
  if (!existsSync(path)) return null
  return { name, content: readFileSync(path, 'utf-8') }
}

export const getAuroraDesignRef = (): LoadedDesignRef | null =>
  loadDesignRef('aurora')

export function stashDesignRefName(workspace: string, name: string): void {
  if (!workspace || !name) return
  writeFile(workspace, WORKSPACE_FILE, name)
}

export function readDesignRefFromWorkspace(
  workspace: string,
): LoadedDesignRef | null {
  if (!workspace) return null
  const name = (readFile(workspace, WORKSPACE_FILE) || '').trim()
  if (!name) return null
  return loadDesignRef(name)
}

export function designRefSystemAppendix(
  designRef: LoadedDesignRef | null,
): string {
  if (!designRef?.content) return ''
  return `

--- REFERENCE DESIGN SYSTEM: ${designRef.name.toUpperCase()} ---
Use the following brand's design system as aesthetic inspiration for this project. ADAPT the principles — typography scale, color philosophy, spacing rhythm, surface treatment, component craft, motion character — to fit THIS project's domain and tone. Do NOT copy literally, do NOT use this brand's name or copy, and the user's project description takes precedence over this reference whenever they conflict.

${designRef.content}
--- END REFERENCE DESIGN SYSTEM ---`
}
