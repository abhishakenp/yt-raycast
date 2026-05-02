#!/usr/bin/env bun
import { runAll } from '@ship-fast/engine'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'

const prompt =
  process.argv.slice(2).join(' ') ||
  'A minimalist coffee subscription landing page with monthly plans and a hero CTA'

const workspace = join(process.cwd(), 'sessions', `cli-${Date.now().toString(36)}`)
mkdirSync(workspace, { recursive: true })

const sessionCtx = {
  broadcast: (msg) => {
    if (msg?.type === 'log' || msg?.type === 'status') process.stdout.write(`${msg.message}\n`)
  },
  setPrompt: () => {},
  setSiteSpec: () => {},
  setTasks: () => {},
  setElapsed: () => {},
  setCost: () => {},
  setAlternativeDesign: () => {},
  signalHomepageReady: () => {},
  updateTask: () => {},
}

const t0 = Date.now()
console.log(`workspace: ${workspace}`)
console.log(`prompt: ${prompt}\n`)

await runAll({ prompt, workspace, sessionCtx })

const elapsed = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`\n✓ done in ${elapsed}s — output: ${workspace}/index.html`)
