import { mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { runAll } from '../src/pipeline/runner.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const outBase = join(root, '.ab-compare', 'browser-gen')

const PROMPTS = [
  { id: '01-fashion-shop', text: 'Fashion boutique. Online checkout. Ships in 24h.' },
  { id: '02-fintech-saas', text: 'B2B payments for growing companies. SOC2-ready.' },
  { id: '03-gov-portal', text: 'Municipal citizen portal. Tenders and services.' },
  { id: '04-api-docs', text: 'REST API docs. OpenAPI. Quickstart for developers.' },
  { id: '05-landing-minimal', text: 'Simple landing: product name + waitlist.' },
  { id: '06-ecom-electronics', text: 'Electronics store. Free shipping over $50.' },
]

const sessionCtx = {
  broadcast: () => {},
  setPrompt: () => {},
  setTasks: () => {},
  setSiteSpec: () => {},
  updateTask: () => {},
  signalHomepageReady: () => {},
  setElapsed: () => {},
  setCost: () => {},
  setAlternativeDesign: () => {},
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error('GROQ_API_KEY required')
    process.exit(1)
  }
  mkdirSync(outBase, { recursive: true })
  writeFileSync(
    join(outBase, 'manifest.json'),
    JSON.stringify({ generatedAt: new Date().toISOString(), runs: [] }, null, 2),
  )
  const manifest = { generatedAt: new Date().toISOString(), runs: [] }
  for (const p of PROMPTS) {
    const workspace = join(outBase, p.id)
    mkdirSync(workspace, { recursive: true })
    writeFileSync(join(workspace, 'prompt.txt'), p.text, 'utf8')
    console.error(`\n── ${p.id} ──\n${p.text}\n`)
    try {
      await runAll({
        prompt: p.text,
        workspace,
        sessionCtx,
        preferredLanguage: 'en',
      })
      const indexPath = join(workspace, 'index.html')
      manifest.runs.push({
        id: p.id,
        prompt: p.text,
        ok: existsSync(indexPath),
        indexHtml: existsSync(indexPath) ? join(workspace, 'index.html') : null,
      })
    } catch (err) {
      console.error(`FAILED ${p.id}:`, err?.message || err)
      manifest.runs.push({ id: p.id, prompt: p.text, ok: false, error: String(err?.message || err) })
    }
  }
  writeFileSync(join(outBase, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.error('\nDone. manifest:', join(outBase, 'manifest.json'))
}

main()
