#!/usr/bin/env node
import { execSync } from 'node:child_process'

try {
  execSync('kill $(lsof -t -i:7420) 2>/dev/null', { stdio: 'ignore' })
} catch {
  /* port cleanup is best-effort */
}

process.on('unhandledRejection', (err) =>
  console.error('  unhandled rejection:', err?.message ?? err),
)

import { existsSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { startServer, startCLISession } from './server/index.js'

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

// Sessions directory for multi-session mode
const sessionsDir = resolve(workspaceArg ?? process.cwd(), 'sessions')
if (!existsSync(sessionsDir)) mkdirSync(sessionsDir, { recursive: true })

if (promptArg) {
  // ─── CLI mode: single session with explicit prompt ─────────
  const workspace = resolve(workspaceArg ?? process.cwd())
  if (!existsSync(workspace)) {
    mkdirSync(workspace, { recursive: true })
    console.log(`  Created workspace: ${workspace}`)
  }

  console.log(
    `\n  ship-fast \u2500 ${promptArg.slice(0, 80)}${promptArg.length > 80 ? '\u2026' : ''}`,
  )
  console.log(`  workspace: ${workspace}\n`)

  await startServer(sessionsDir)

  const { generation } = await startCLISession(workspace, promptArg)

  await generation
} else {
  // ─── Server-only mode: prompt page, multi-session ──────────
  console.log('\n  ship-fast \u2500 server mode (multi-session)')
  console.log(`  sessions: ${sessionsDir}\n`)

  await startServer(sessionsDir)

  console.log('  Waiting for prompts at http://localhost:7420\n')
}
