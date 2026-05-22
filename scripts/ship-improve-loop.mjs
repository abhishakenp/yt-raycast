#!/usr/bin/env bun
/** Repo-root shortcut → ship improve loop */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const script = join(import.meta.dir, '../playground-engine-ui-ship/scripts/ship-improve-loop.mjs')
const r = spawnSync('bun', [script, ...process.argv.slice(2)], { stdio: 'inherit', cwd: join(import.meta.dir, '..') })
process.exit(r.status ?? 1)
