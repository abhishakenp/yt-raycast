// "Real dev" — runs the optimized prod bundle and rebuilds it on save.
// On startup: bun run build  →  next start.
// On any change in src/ public/ packages/ (or next.config.ts / package.json):
// debounce, kill `next start`, rebuild, restart. The user always sees the
// minified/optimized output, never `next dev`.
import { spawn, type ChildProcess } from 'node:child_process'
import { watch, existsSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const WATCH_TARGETS = [
  'src',
  'public',
  'packages',
  'next.config.ts',
  'tailwind.config.js',
  'postcss.config.js',
  'package.json',
]
const IGNORE =
  /(^|\/)(\.next|node_modules|\.git|sessions|\.codex|\.worktrees|\.DS_Store|tsconfig\.tsbuildinfo)(\/|$)/
const DEBOUNCE_MS = 400
const PORT = process.env.PORT ?? '3000'

let serverProc: ChildProcess | null = null
let buildProc: ChildProcess | null = null
let buildRunning = false
let buildPending = false
let debounceTimer: ReturnType<typeof setTimeout> | null = null

const log = (msg: string) => {
  process.stdout.write(`\x1b[35m[real-dev]\x1b[0m ${msg}\n`)
}

const killServer = () =>
  new Promise<void>((resolve) => {
    const proc = serverProc
    if (!proc || proc.killed || proc.exitCode != null) {
      serverProc = null
      return resolve()
    }
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      serverProc = null
      resolve()
    }
    proc.once('exit', finish)
    proc.kill('SIGTERM')
    setTimeout(() => {
      if (!settled && proc.exitCode == null) proc.kill('SIGKILL')
    }, 3000)
  })

const startServer = () => {
  log(`next start :${PORT}`)
  serverProc = spawn('bunx', ['next', 'start', '-p', PORT], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'production' },
  })
  serverProc.on('exit', (code, signal) => {
    if (signal !== 'SIGTERM' && signal !== 'SIGKILL') {
      log(`next start exited (code=${code} signal=${signal})`)
    }
  })
}

const runBuild = async (): Promise<boolean> => {
  if (buildRunning) {
    buildPending = true
    return false
  }
  buildRunning = true
  await killServer()
  log('building (bun run build)…')
  const start = Date.now()
  const ok = await new Promise<boolean>((resolve) => {
    buildProc = spawn('bun', ['run', 'build'], {
      stdio: 'inherit',
      env: { ...process.env, NODE_ENV: 'production' },
    })
    buildProc.on('exit', (code) => {
      buildProc = null
      resolve(code === 0)
    })
  })
  buildRunning = false
  const ms = Date.now() - start
  if (ok) {
    log(`build OK in ${(ms / 1000).toFixed(1)}s`)
    startServer()
  } else {
    log(`build FAILED in ${(ms / 1000).toFixed(1)}s — fix the error and save again`)
  }
  if (buildPending) {
    buildPending = false
    setImmediate(() => {
      runBuild()
    })
  }
  return ok
}

const triggerRebuild = (relPath: string) => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    log(`change: ${relPath} → rebuilding`)
    runBuild()
  }, DEBOUNCE_MS)
}

const startWatcher = () => {
  for (const target of WATCH_TARGETS) {
    const abs = path.join(ROOT, target)
    if (!existsSync(abs)) continue
    try {
      watch(abs, { recursive: true }, (_event, filename) => {
        if (!filename) return
        const full = path.join(abs, filename.toString())
        if (IGNORE.test(full)) return
        triggerRebuild(path.relative(ROOT, full))
      })
      log(`watching ${target}`)
    } catch (err) {
      log(`watch failed for ${target}: ${(err as Error).message}`)
    }
  }
}

const shutdown = async (signal: NodeJS.Signals) => {
  log(`received ${signal}, shutting down`)
  if (buildProc) buildProc.kill('SIGTERM')
  await killServer()
  process.exit(0)
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

const main = async () => {
  log('first build (cold) — subsequent builds use .next/cache and are much faster')
  const ok = await runBuild()
  if (!ok) log('starting watcher anyway — save a file to retry the build')
  startWatcher()
}

main()
