import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

export function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseJson(text: string): any {
  if (!text || typeof text !== 'string') return null
  const startIdx = text.indexOf('{')
  if (startIdx === -1) return null

  for (let endIdx = startIdx + 1; endIdx <= text.length; endIdx++) {
    const candidate = text.substring(startIdx, endIdx)
    if (candidate.endsWith('}')) {
      try {
        return JSON.parse(candidate)
      } catch {
        // Continue
      }
    }
  }
  const m = text.match(/\{[\s\S]*?\}/)
  try {
    return m ? JSON.parse(m[0]) : null
  } catch {
    return null
  }
}

export function readFile(workspace: string, file: string): string | null {
  const p = join(workspace, file)
  return existsSync(p) ? readFileSync(p, 'utf-8') : null
}

export function writeFile(
  workspace: string,
  file: string,
  content: string | Buffer,
): void {
  writeFileSync(join(workspace, file), content)
}
