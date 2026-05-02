#!/usr/bin/env bun
/**
 * Delete session workspaces under ./sessions/ by age (filesystem only).
 *
 * Default: --older-than-days 2 (retention: drop stale workspaces).
 *
 * To remove recent sessions only: --newer-than-days N
 *   → removes folders whose createdAt is AFTER (now - N days).
 *
 * Usage:
 *   bun scripts/prune-sessions-folder.mjs --dry-run
 *   bun scripts/prune-sessions-folder.mjs
 *   bun scripts/prune-sessions-folder.mjs --older-than-days 7
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const SESSION_ID_RE = /^[a-f0-9]{12}$/i

function getCreatedAtMs(workspace) {
  try {
    const createdAtPath = join(workspace, 'createdAt.txt')
    if (existsSync(createdAtPath)) {
      const n = parseInt(readFileSync(createdAtPath, 'utf8').trim(), 10)
      if (Number.isFinite(n)) return n
    }
    const promptPath = join(workspace, 'prompt.txt')
    if (existsSync(promptPath)) return statSync(promptPath).mtimeMs
  } catch {
    /* ignore */
  }
  try {
    return statSync(workspace).mtimeMs
  } catch {
    return 0
  }
}

const argv = process.argv.slice(2)
const dryRun = argv.includes('--dry-run')
let mode = 'older'
let days = 2

for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--older-than-days' && argv[i + 1]) {
    mode = 'older'
    days = Math.max(0, Number(argv[++i]) || 0)
  }
  if (a === '--newer-than-days' && argv[i + 1]) {
    mode = 'newer'
    days = Math.max(0, Number(argv[++i]) || 0)
  }
}

const sessionsDir = resolve(process.cwd(), 'sessions')
if (!existsSync(sessionsDir)) {
  console.error('No sessions/ directory at', sessionsDir)
  process.exit(1)
}

const ms = days * 24 * 60 * 60 * 1000
const cutoff = Date.now() - ms

const names = readdirSync(sessionsDir).filter(
  (n) => SESSION_ID_RE.test(n) && !n.startsWith('.'),
)

const targets = []
for (const name of names) {
  const ws = join(sessionsDir, name)
  let st
  try {
    st = statSync(ws)
  } catch {
    continue
  }
  if (!st.isDirectory()) continue
  const created = getCreatedAtMs(ws)
  const match = mode === 'newer' ? created > cutoff : created < cutoff
  if (match) targets.push({ id: name, created })
}

targets.sort((a, b) => b.created - a.created)

console.log(
  JSON.stringify(
    {
      sessionsDir,
      mode,
      days,
      cutoffIso: new Date(cutoff).toISOString(),
      matchCount: targets.length,
      dryRun,
    },
    null,
    2,
  ),
)
for (const t of targets) {
  console.log(t.id, new Date(t.created).toISOString())
}

if (dryRun) {
  console.log('Dry run — no folders removed.')
  process.exit(0)
}

if (targets.length === 0) {
  process.exit(0)
}

for (const t of targets) {
  try {
    rmSync(join(sessionsDir, t.id), { recursive: true, force: true })
    console.log('removed', t.id)
  } catch (e) {
    console.error('failed', t.id, e?.message ?? e)
  }
}
