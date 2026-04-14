import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

loadEnvFile(resolve(projectRoot, '.env'), false)
loadEnvFile(resolve(projectRoot, '.env.local'), true)

function loadEnvFile(filePath, override) {
  if (!existsSync(filePath)) return

  const contents = readFileSync(filePath, 'utf8')

  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue

    const normalized = line.startsWith('export ') ? line.slice(7).trim() : line
    const separatorIndex = normalized.indexOf('=')
    if (separatorIndex === -1) continue

    const key = normalized.slice(0, separatorIndex).trim()
    if (!key) continue
    if (!override && Object.prototype.hasOwnProperty.call(process.env, key)) continue

    let value = normalized.slice(separatorIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith('\'') && value.endsWith('\''))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value
  }
}
