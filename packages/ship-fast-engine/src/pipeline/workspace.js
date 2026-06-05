import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export function slug(title) {
  return String(title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function parseJson(text) {
  if (!text || typeof text !== 'string') return null
  const startIdx = text.indexOf('{')
  if (startIdx === -1) return null

  for (let endIdx = startIdx + 1; endIdx <= text.length; endIdx += 1) {
    const candidate = text.substring(startIdx, endIdx)
    if (candidate.endsWith('}')) {
      try {
        return JSON.parse(candidate)
      } catch {
        // Continue scanning for a complete JSON object.
      }
    }
  }

  const match = text.match(/\{[\s\S]*?\}/)
  try {
    return match ? JSON.parse(match[0]) : null
  } catch {
    return null
  }
}

export function readFile(workspace, file) {
  const filePath = join(workspace, file)
  return existsSync(filePath) ? readFileSync(filePath, 'utf-8') : null
}

export function writeFile(workspace, file, content) {
  writeFileSync(join(workspace, file), content)
}
