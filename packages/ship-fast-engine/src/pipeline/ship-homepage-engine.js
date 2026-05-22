import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const REPO_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

let shipEnginePromise = null

export function isShipHomepageEngineEnabled() {
  return String(process.env.SHIPFAST_HOMEPAGE_ENGINE || '').toLowerCase() === 'ship'
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
