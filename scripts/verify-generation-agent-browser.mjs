#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const DEFAULT_PROMPT =
  'A polished website for a neighborhood bakery with pastry collections, custom cake ordering, baking classes, customer reviews, local delivery, and a cozy contact section'
const DEFAULT_BRAVE =
  '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://127.0.0.1:3000'
).replace(/\/$/, '')
const prompt = args.get('--prompt') ?? process.env.SHIP_FAST_VERIFY_PROMPT ?? DEFAULT_PROMPT
const timeoutMs = Number(
  args.get('--timeout-ms') ?? process.env.SHIP_FAST_VERIFY_TIMEOUT_MS ?? 180000,
)
const pollMs = Number(args.get('--poll-ms') ?? process.env.SHIP_FAST_VERIFY_POLL_MS ?? 5000)
const sessionName =
  args.get('--browser-session') ??
  process.env.AGENT_BROWSER_SESSION ??
  `ship-fast-generation-${Date.now()}`
const screenshotPath =
  args.get('--screenshot') ??
  process.env.SHIP_FAST_VERIFY_SCREENSHOT ??
  `/tmp/ship-fast-generation-${Date.now()}.png`
const browserExecutable =
  args.get('--executable-path') ??
  process.env.AGENT_BROWSER_EXECUTABLE_PATH ??
  process.env.AGENT_BROWSER_EXECUTABLE ??
  DEFAULT_BRAVE

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

if (!Number.isFinite(pollMs) || pollMs < 250) {
  throw new Error('--poll-ms must be at least 250')
}

const agentBrowser = (command, options = {}) => {
  const fullCommand = ['--session', sessionName]
  if (options.headed !== false) {
    fullCommand.push('--headed', '--executable-path', browserExecutable)
  }
  fullCommand.push(...command)
  return execFileSync('agent-browser', fullCommand, {
    encoding: 'utf8',
    stdio: options.stdio ?? ['ignore', 'pipe', 'pipe'],
    timeout: options.timeoutMs ?? Math.min(timeoutMs, 30000),
  }).trim()
}

const sleep = (ms) => {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

const readState = () => {
  const raw = agentBrowser([
    'eval',
    `(() => {
      const stage = document.querySelector('#preview-stage');
      const loading = document.querySelector('#preview-loading');
      const statusText = document.querySelector('#status-text')?.textContent?.trim() || '';
      const urlText = document.querySelector('#url-text')?.textContent?.trim() || '';
      const promptError = document.querySelector('#prompt-policy-block:not([hidden])')?.textContent?.trim() || '';
      const bodyText = document.body.innerText || '';
      const stageText = stage?.innerText || '';
      const loadingHidden =
        !loading ||
        loading.hidden ||
        loading.className.includes('hidden') ||
        getComputedStyle(loading).display === 'none';
      const waiting = /Waiting for generated module/i.test(stageText);
      const failed = /Generation failed|error|failed/i.test(stageText + ' ' + statusText);
      const onSessionRoute = /\\/generate\\/[^/?#]+/.test(location.pathname);
      const hasPreviewText = stageText.replace(/\\s+/g, ' ').trim().length > 80;
      return {
        url: location.href,
        title: document.title,
        onSessionRoute,
        loadingHidden,
        waiting,
        failed,
        promptError,
        statusText,
        urlText,
        stageText: stageText.slice(0, 800),
        bodyText: bodyText.slice(0, 1200),
        ready: onSessionRoute && loadingHidden && hasPreviewText && !waiting && !failed,
      };
    })()`,
  ])
  return JSON.parse(raw)
}

const submitPrompt = () => {
  const raw = agentBrowser([
    'eval',
    `(() => {
      const prompt = ${JSON.stringify(prompt)};
      const input = document.querySelector('#prompt-input');
      const form = document.querySelector('#prompt-form');
      const button = document.querySelector('#submit-btn');
      if (!(input instanceof HTMLTextAreaElement)) {
        return { ok: false, reason: 'prompt input not found' };
      }
      if (!(form instanceof HTMLFormElement)) {
        return { ok: false, reason: 'prompt form not found' };
      }
      const descriptor = Object.getOwnPropertyDescriptor(
        HTMLTextAreaElement.prototype,
        'value',
      );
      descriptor?.set?.call(input, prompt);
      input.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: prompt }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
      if (button instanceof HTMLButtonElement && button.disabled) {
        return { ok: false, reason: 'submit button stayed disabled', value: input.value };
      }
      form.requestSubmit();
      return { ok: true, value: input.value, buttonDisabled: button instanceof HTMLButtonElement ? button.disabled : null };
    })()`,
  ])
  const result = JSON.parse(raw)
  if (!result.ok) {
    throw new Error(`Unable to submit prompt: ${result.reason}`)
  }
  return result
}

let lastState = null

try {
  agentBrowser(['close', '--all'], {
    headed: false,
    stdio: ['ignore', 'ignore', 'ignore'],
  })
} catch {
  // Ignore stale browser sessions.
}

try {
  agentBrowser(['open', baseUrl])
  agentBrowser(['wait', '#prompt-input'])
  submitPrompt()
  agentBrowser(['wait', '1000'])

  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    sleep(pollMs)
    lastState = readState()

    if (lastState.promptError) {
      agentBrowser(['screenshot', screenshotPath])
      throw new Error(`Session creation failed: ${lastState.promptError}`)
    }

    if (lastState.failed) {
      agentBrowser(['screenshot', screenshotPath])
      throw new Error(`Generation failed: ${lastState.stageText || lastState.statusText}`)
    }

    if (lastState.ready) {
      agentBrowser(['screenshot', screenshotPath])
      console.log(
        JSON.stringify(
          {
            ok: true,
            prompt,
            baseUrl,
            sessionName,
            screenshotPath,
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
  throw new Error('Timed out waiting for a generated preview.')
} catch (error) {
  console.error(
    JSON.stringify(
      {
        ok: false,
        reason: error instanceof Error ? error.message : String(error),
        prompt,
        baseUrl,
        sessionName,
        screenshotPath,
        state: lastState,
      },
      null,
      2,
    ),
  )
  process.exit(1)
}
