#!/usr/bin/env node
import { execSync } from 'node:child_process'

try {
  execSync('kill $(lsof -t -i:7420 -i:3001) 2>/dev/null', { stdio: 'ignore' })
} catch {
  /* port cleanup is best-effort */
}

process.on('unhandledRejection', (err) =>
  console.error('  unhandled rejection:', err?.message ?? err),
)

import { existsSync, readFileSync, mkdirSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { startServer } from './server/index.js'
import { runAll, runEdit } from './pipeline/runner.js'

if (!process.env.GROQ_API_KEY) {
  console.error('Error: GROQ_API_KEY not set')
  process.exit(1)
}

const args = process.argv.slice(2)
let promptArg
let workspaceArg

for (const arg of args) {
  if (arg.startsWith('/') || arg.startsWith('.')) workspaceArg = arg
  else promptArg = arg
}

const workspace = resolve(workspaceArg ?? process.cwd())

if (!existsSync(workspace)) {
  mkdirSync(workspace, { recursive: true })
  console.log(`  Created workspace: ${workspace}`)
}

const promptFile = `${workspace}/prompt.txt`

const prompt =
  promptArg ?? (existsSync(promptFile) ? readFileSync(promptFile, 'utf-8').trim() : null)
if (!prompt) {
  console.error('Usage: node src/index.js "your prompt" [/path/to/workspace]')
  console.error('       node src/index.js /path/to/workspace  (uses prompt.txt)')
  process.exit(1)
}

console.log(`\n  ship-fast \u2500 ${prompt.slice(0, 80)}${prompt.length > 80 ? '\u2026' : ''}`)
console.log(`  workspace: ${workspace}\n`)

let editMode = false
try {
  const tasksFile = join(workspace, 'tasks.json')
  const hasIndex = existsSync(join(workspace, 'index.html'))
  if (hasIndex && existsSync(tasksFile)) {
    const data = JSON.parse(readFileSync(tasksFile, 'utf-8'))
    const tasks = data.tasks ?? []
    editMode = tasks.length > 0 && tasks.every((t) => ['DONE', 'FAILED'].includes(t.status))
  }
} catch {
  /* tasks.json may not exist or be invalid */
}

console.log(
  `  MODE: ${editMode ? 'edit (applying changes to existing site)' : 'generate (fresh build)'}\n`,
)

const serverReady = startServer(workspace)
const generation = editMode ? runEdit({ prompt, workspace }) : runAll({ prompt, workspace })

serverReady.then(async () => {
  const { default: open } = await import('open')
  open('http://localhost:7420')
})

await generation
