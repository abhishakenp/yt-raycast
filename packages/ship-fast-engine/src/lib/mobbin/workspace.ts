/**
 * Workspace helpers for the Mobbin Pro DNA layer. Reads/writes the per-session
 * `mobbin-anchor.json` artifact that downstream phases (site-spec, homepage)
 * pick up. Mirrors the readDesignRefFromWorkspace pattern.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { resolveAnchor } from './prompt-blocks.js'
import type { MobbinAnchor } from './types.js'

const ANCHOR_FILE = 'mobbin-anchor.json'

export function writeMobbinAnchorToWorkspace(
  workspace: string,
  anchor: MobbinAnchor,
): void {
  if (!workspace || !anchor) return
  try {
    const path = join(workspace, ANCHOR_FILE)
    writeFileSync(path, JSON.stringify(anchor, null, 2))
  } catch {
    /* ignore — anchor is fail-soft */
  }
}

/**
 * Returns a resolved anchor object (with .dna and .copyExamples re-resolved
 * from the bank) or null. Re-resolving avoids relying on stale JSON shape if
 * the bank evolves.
 */
export function readMobbinAnchorFromWorkspace(
  workspace: string,
): MobbinAnchor | null {
  if (!workspace) return null
  try {
    const path = join(workspace, ANCHOR_FILE)
    if (!existsSync(path)) return null
    const raw = JSON.parse(readFileSync(path, 'utf8')) as {
      app?: string
      category?: string
      palette?: string[]
      reason?: string
      accents?: string[]
    }
    if (!raw?.app) return null
    const anchor: MobbinAnchor | null = resolveAnchor({
      app: raw.app,
      category: raw.category,
      palette: raw.palette,
    })
    if (anchor) {
      anchor.reason = raw.reason || ''
      anchor.accents = raw.accents || anchor.palette || []
    }
    return anchor
  } catch {
    return null
  }
}
