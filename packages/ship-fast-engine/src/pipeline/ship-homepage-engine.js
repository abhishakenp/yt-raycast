import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import '../env.js'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

let shipEnginePromise = null

export function isShipHomepageEngineEnabled() {
  const setting = String(process.env.SHIPFAST_HOMEPAGE_ENGINE || '').trim().toLowerCase()
  if (['0', 'false', 'off', 'legacy'].includes(setting)) return false
  if (['1', 'true', 'on', 'ship'].includes(setting)) return true
  const hasGroq = Boolean(process.env.GROQ_API_KEY)
  const hasGemini = Boolean(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY)
  return hasGroq && hasGemini
}

async function loadShipEngine() {
  if (!shipEnginePromise) {
    const entry = pathToFileURL(join(REPO_ROOT, 'playground-engine-ui-ship/src/index.js')).href
    shipEnginePromise = import(entry)
  }
  return shipEnginePromise
}

export async function generateShipEngineHomepage(prompt, opts = {}) {
  const { generateShipHomepage } = await loadShipEngine()
  return generateShipHomepage(prompt, opts)
}
