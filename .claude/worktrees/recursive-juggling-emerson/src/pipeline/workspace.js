import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  rmSync,
  unlinkSync,
  lstatSync,
} from 'node:fs'
import { join } from 'node:path'

export function slug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseJson(text) {
  if (!text || typeof text !== 'string') return null

  // Try to find and parse JSON object
  // First, try to find the first { and parse from there
  const startIdx = text.indexOf('{')
  if (startIdx === -1) return null

  // Try parsing from start position, expanding until we find valid JSON
  for (let endIdx = startIdx + 1; endIdx <= text.length; endIdx++) {
    const candidate = text.substring(startIdx, endIdx)
    // Only try to parse if it looks complete (ends with })
    if (candidate.endsWith('}')) {
      try {
        return JSON.parse(candidate)
      } catch {
        // Continue trying longer substrings
      }
    }
  }

  // Fallback: try the greedy approach as before
  const m = text.match(/\{[\s\S]*?\}/)
  try {
    return m ? JSON.parse(m[0]) : null
  } catch {
    return null
  }
}

export function readFile(workspace, file) {
  const p = join(workspace, file)
  return existsSync(p) ? readFileSync(p, 'utf-8') : null
}

export function writeFile(workspace, file, content) {
  writeFileSync(join(workspace, file), content)
}

export function detectResumePhase(workspace) {
  const hasContext = existsSync(join(workspace, 'project-context.json'))
  const hasHomepage = existsSync(join(workspace, 'index.html'))
  const hasTasks = existsSync(join(workspace, 'tasks.json'))

  if (hasTasks) {
    try {
      const data = JSON.parse(readFileSync(join(workspace, 'tasks.json'), 'utf-8'))
      const tasks = data.tasks ?? []
      const allDone = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
      if (allDone) return 6
    } catch {
      /* tasks.json may be malformed */
    }
    return 4
  }

  if (!hasContext || !hasHomepage) return 1
  return 3
}

export function resetWorkspace(workspace, variant = 'reset') {
  const keep =
    variant === 'reset-hard'
      ? new Set(['prompt.txt'])
      : new Set(['prompt.txt', 'project-context.json', 'index.html', 'references', 'ship.log'])

  try {
    const items = readdirSync(workspace)
    for (const item of items) {
      if (keep.has(item) || item.startsWith('.')) continue
      const itemPath = join(workspace, item)
      const stat = lstatSync(itemPath)
      if (stat.isDirectory()) {
        rmSync(itemPath, { recursive: true, force: true })
      } else {
        unlinkSync(itemPath)
      }
    }
    console.log(`  Reset (${variant}): wiped workspace, kept ${Array.from(keep).join(', ')}`)
  } catch (err) {
    console.log(`  Reset failed: ${err.message}`)
  }
}
