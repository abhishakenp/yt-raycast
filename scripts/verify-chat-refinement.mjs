#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const baseUrl = (
  args.get('--base-url') ??
  process.env.SHIP_FAST_BASE_URL ??
  'http://localhost:3000'
).replace(/\/$/, '')
const timeoutMs = Number(args.get('--timeout-ms') ?? 90000)
const expectAiPlan = args.has('--expect-ai-plan')
const stamp = Date.now()
const ownerSecret = `owner-chat-${stamp}`
const prompt = `Chat verifier bakery site ${stamp}`
const requestedHeadline = 'Launch pastries faster'

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const session = convexRun('sessions:create', {
  prompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_verify_chat_${stamp}`,
  anonymousOwnerSecret: ownerSecret,
  anonymousClientId: `anon-verify-chat-${stamp}`,
})
const sessionId = session.sessionId
assert(typeof sessionId === 'string', 'sessions:create did not return sessionId')

convexRun('internal.sessions.completeGeneration', {
  sessionId,
  html: `<html><body><main><h1>Old headline</h1><a href="/start">Start now</a></main></body></html>`,
  openUiSource: '$page = "Home"\nroot = Text("Old headline")\ncta = Button("Start now")',
  siteSpecJson: JSON.stringify({
    brand: 'Chat verifier',
    hero: { headline: 'Old headline', ctaLabel: 'Start now' },
    sections: [],
  }),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 1000,
})

const response = await requestJson(`/api/sessions/${sessionId}/chat`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'x-ship-fast-owner-secret': ownerSecret,
  },
  body: JSON.stringify({
    content: `Change headline to "${requestedHeadline}"`,
    anonymousOwnerSecret: ownerSecret,
  }),
})
assert(response.status === 200, `chat route returned ${response.status}`)
assert(response.json.previewVersion === 2, 'chat route did not create preview version 2')
if (expectAiPlan) {
  assert(response.json.usedAiPlan === true, 'chat route did not use an AI plan')
} else {
  assert(
    typeof response.json.usedAiPlan === 'boolean',
    'chat route did not report whether an AI plan was used',
  )
}

const preview = convexRun('sessions:getPublicPreview', { lookup: sessionId })
assert(preview.previewVersion === 2, 'public preview did not advance to version 2')
assert(preview.html.includes(requestedHeadline), 'public preview did not include refined headline')
assert(!preview.html.includes('Old headline'), 'public preview still included old headline')

const view = convexRun('sessions:getGenerationView', { lookup: sessionId })
assert(
  view.homeModule?.source?.includes(requestedHeadline),
  'OpenUI source did not include refined headline',
)
assert(
  view.siteSpec?.specJson?.includes(requestedHeadline),
  'site spec did not include refined headline',
)
assert(
  view.events.some((event) => event.eventType === 'chat_refinement_completed'),
  'event stream did not include chat_refinement_completed',
)

const messages = convexRun('sessions:listChatMessages', { sessionId })
assert(Array.isArray(messages), 'chat messages response was not an array')
assert(messages.length >= 2, 'chat route did not persist user and assistant messages')
assert(messages.some((message) => message.role === 'user'), 'chat messages missing user row')
assert(messages.some((message) => message.role === 'assistant'), 'chat messages missing assistant row')

console.log(
  JSON.stringify(
    {
      ok: true,
      baseUrl,
      sessionId,
      previewVersion: response.json.previewVersion,
      usedAiPlan: response.json.usedAiPlan,
      plannerError: response.json.plannerError,
      chatMessages: messages.length,
      refinedHeadline: requestedHeadline,
    },
    null,
    2,
  ),
)

function convexRun(functionName, payload) {
  const output = execFileSync('bunx', ['convex', 'run', functionName, JSON.stringify(payload)], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    timeout: timeoutMs,
  }).trim()
  return parseJson(output || 'null', `Convex ${functionName}`)
}

async function requestJson(path, init) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { accept: 'application/json', ...init?.headers },
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  }).catch((error) => {
    throw new Error(
      `Unable to reach ${baseUrl}${path}: ${error instanceof Error ? error.message : String(error)}`,
    )
  })
  const body = await response.text()
  return {
    status: response.status,
    headers: response.headers,
    body,
    json: parseJson(body, path),
  }
}

function parseJson(value, label) {
  try {
    return JSON.parse(value)
  } catch (error) {
    throw new Error(
      `${label} did not return valid JSON: ${error instanceof Error ? error.message : String(error)}\n${String(value).slice(0, 500)}`,
    )
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
