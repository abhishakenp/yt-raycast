#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const DEFAULT_PROMPT =
  'A bright website for a neighborhood bakery with pastry collections, custom cake ordering, baking classes, customer reviews, local delivery, and a cozy contact section'

const baseUrl = process.env.SHIP_FAST_BASE_URL || 'http://127.0.0.1:7420/'
const prompt = process.env.SHIP_FAST_VERIFY_PROMPT || DEFAULT_PROMPT
const sessionName = process.env.AGENT_BROWSER_SESSION || `ship-fast-generation-${Date.now()}`
const timeoutMs = Number(process.env.SHIP_FAST_VERIFY_TIMEOUT_MS || 180000)
const screenshotPath =
  process.env.SHIP_FAST_VERIFY_SCREENSHOT || `/tmp/ship-fast-generation-${Date.now()}.png`
const braveExecutable =
  process.env.AGENT_BROWSER_EXECUTABLE ||
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

function agentBrowser(args, options = {}) {
  const fullArgs = ['--session', sessionName]
  if (options.headed !== false) {
    fullArgs.push('--headed', '--executable-path', braveExecutable)
  }
  fullArgs.push(...args)
  return execFileSync('agent-browser', fullArgs, {
    encoding: 'utf8',
    stdio: options.stdio || ['ignore', 'pipe', 'pipe'],
  }).trim()
}

function readState() {
  const raw = agentBrowser([
    'eval',
    `(() => {
      const iframe = document.getElementById("preview-iframe");
      const iframeText = iframe?.contentDocument?.body?.innerText || "";
      const phase = document.getElementById("phase-text")?.textContent || "";
      const timing = document.getElementById("gen-timing")?.textContent || "";
      return {
        url: location.href,
        bodyClasses: document.body.className,
        phase,
        timing,
        iframeSrc: iframe?.src || "",
        iframeText: iframeText.slice(0, 600),
        hasPreview: iframeText.length > 100 && /\\/preview\\//.test(iframe?.src || ""),
        generated: /Project generated|Generated in|Generated ·/.test(phase + " " + timing)
      };
    })()`,
  ])
  return JSON.parse(raw)
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

function closeQuietly() {
  try {
    agentBrowser(['close'], { headed: false })
  } catch {
    // Ignore stale browser sessions.
  }
}

let lastState = null

try {
  closeQuietly()
  agentBrowser(['open', baseUrl])
  agentBrowser(['wait', '--load', 'networkidle'])
  agentBrowser(['fill', '#prompt-input', prompt])
  agentBrowser(['wait', '500'])
  agentBrowser(['click', '#prompt-form button[type="submit"]'])

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    sleep(5000)
    lastState = readState()
    if (lastState.hasPreview && lastState.generated) {
      agentBrowser(['screenshot', screenshotPath])
      console.log(
        JSON.stringify(
          {
            ok: true,
            sessionName,
            screenshotPath,
            prompt,
            state: lastState,
          },
          null,
          2,
        ),
      )
      process.exit(0)
    }
  }

  agentBrowser(['screenshot', screenshotPath])
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: 'Timed out waiting for generated preview.',
        sessionName,
        screenshotPath,
        prompt,
        state: lastState,
      },
      null,
      2,
    ),
  )
  process.exit(1)
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: error?.message || String(error),
        sessionName,
        screenshotPath,
        prompt,
        state: lastState,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}
