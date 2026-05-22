#!/usr/bin/env bun
/** Repo-root shortcut → engine quad judge */
import { spawnSync } from 'node:child_process'
import { join } from 'node:path'

const script = join(import.meta.dir, '../playground-engine-ui-ship/scripts/engine-quad-judge.mjs')
const r = spawnSync('bun', [script, ...process.argv.slice(2)], { stdio: 'inherit', cwd: join(import.meta.dir, '..') })
process.exit(r.status ?? 1)
