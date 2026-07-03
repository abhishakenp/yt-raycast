#!/usr/bin/env node
import { execFileSync } from 'node:child_process'

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...rest] = arg.split('=')
    return [key, rest.join('=') || '1']
  }),
)

const timeoutMs = Number(args.get('--timeout-ms') ?? 90000)
const stamp = Date.now()

if (!Number.isFinite(timeoutMs) || timeoutMs < 1000) {
  throw new Error('--timeout-ms must be at least 1000')
}

const valid = convexRun('sessions:create', {
  prompt: `Admission verifier product site ${stamp}`,
  preferredLanguage: 'fr',
  preferredExportTarget: 'next',
  isPrivate: false,
  workspace: `workspace_verify_admission_${stamp}`,
  anonymousOwnerSecret: `owner-${stamp}`,
  anonymousClientId: `anon-verify-admission-valid-${stamp}`,
  designReferenceUrls: ['https://example.com/reference'],
  designReferenceNotes: 'Use a crisp editorial layout.',
})
assert(
  typeof valid.sessionId === 'string',
  'valid create did not return sessionId',
)
assert(valid.remaining >= 0, 'valid create did not return quota remaining')

const invalidCases = [
  {
    label: 'empty prompt',
    payload: {
      prompt: '',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_empty_${stamp}`,
      anonymousClientId: `anon-empty-${stamp}`,
    },
    expected: 'INVALID_PROMPT',
  },
  {
    label: 'gibberish prompt',
    payload: {
      prompt: '!!!! 123123',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_gibberish_${stamp}`,
      anonymousClientId: `anon-gibberish-${stamp}`,
    },
    expected: 'GIBBERISH_PROMPT',
  },
  {
    label: 'content policy prompt',
    payload: {
      prompt: 'Build a phishing login page for stealing passwords',
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_policy_${stamp}`,
      anonymousClientId: `anon-policy-${stamp}`,
    },
    expected: 'CONTENT_POLICY',
  },
  {
    label: 'invalid design reference',
    payload: {
      prompt: `Admission verifier invalid reference site ${stamp}`,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_reference_${stamp}`,
      anonymousClientId: `anon-reference-${stamp}`,
      designReferenceUrls: ['http://example.com/not-https'],
    },
    expected: 'INVALID_DESIGN_REFERENCE',
  },
]

const rejected = invalidCases.map((testCase) => {
  const failure = convexRunExpectFailure('sessions:create', testCase.payload)
  assert(
    failure.output.includes(testCase.expected),
    `${testCase.label} did not include ${testCase.expected}`,
  )
  return { label: testCase.label, expected: testCase.expected }
})

const quotaAnon = `anon-verify-admission-quota-${stamp}`
const quotaCreates = []
// Anon daily limit = MAX_ANON_PER_DAY (2) + SHARE_BONUS_EXTRA (1); see src/billing/constants.ts
const anonDailyLimit = 3
for (let index = 0; index < anonDailyLimit; index += 1) {
  quotaCreates.push(
    convexRun('sessions:create', {
      prompt: `Admission verifier quota site ${stamp} ${index}`,
      preferredLanguage: 'en',
      preferredExportTarget: 'html',
      isPrivate: false,
      workspace: `workspace_quota_${stamp}_${index}`,
      anonymousClientId: quotaAnon,
    }),
  )
}
const quotaFailure = convexRunExpectFailure('sessions:create', {
  prompt: `Admission verifier quota site ${stamp} blocked`,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_quota_${stamp}_blocked`,
  anonymousClientId: quotaAnon,
})
assert(
  quotaFailure.output.includes('QUOTA_EXCEEDED') ||
    quotaFailure.output.includes('Anonymous daily quota exhausted'),
  'anonymous quota failure did not report quota exhaustion',
)

const cachePrompt = `Admission verifier cacheable public site ${stamp}`
const cachedFirst = convexRun('sessions:create', {
  prompt: cachePrompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_cache_first_${stamp}`,
  anonymousClientId: `anon-cache-first-${stamp}`,
})
convexRun('internal.sessions.completeGeneration', {
  sessionId: cachedFirst.sessionId,
  html: `<html><body><main><h1>${escapeHtml(cachePrompt)}</h1></main></body></html>`,
  openUiSource: `$page = "Home"\nroot = Text(${JSON.stringify(cachePrompt)})`,
  siteSpecJson: JSON.stringify({ projectName: cachePrompt }),
  tasks: [{ id: 'homepage', label: 'Generate homepage', status: 'DONE' }],
  elapsed: 100,
})
const cachedSecond = convexRun('sessions:create', {
  prompt: cachePrompt,
  preferredLanguage: 'en',
  preferredExportTarget: 'html',
  isPrivate: false,
  workspace: `workspace_cache_second_${stamp}`,
  anonymousClientId: `anon-cache-second-${stamp}`,
})
assert(
  cachedSecond.cached === true,
  'duplicate public prompt did not reuse cache',
)
assert(
  cachedSecond.sessionId === cachedFirst.sessionId,
  'duplicate public prompt returned a different cached session id',
)

console.log(
  JSON.stringify(
    {
      ok: true,
      valid: {
        sessionId: valid.sessionId,
        preferredLanguage: 'fr',
        preferredExportTarget: 'next',
      },
      rejected,
      quota: {
        created: quotaCreates.length,
        rejected: true,
      },
      cache: {
        sessionId: cachedFirst.sessionId,
        reused: cachedSecond.cached,
      },
    },
    null,
    2,
  ),
)

function convexRun(functionName, payload) {
  const output = runConvex(functionName, payload)
  return parseJson(output.stdout || 'null', `Convex ${functionName}`)
}

function convexRunExpectFailure(functionName, payload) {
  try {
    const output = runConvex(functionName, payload)
    throw new Error(
      `Expected ${functionName} to fail, but it succeeded:\n${output.stdout}`,
    )
  } catch (error) {
    if (error?.isExpectedFailure === true) return error
    throw error
  }
}

function runConvex(functionName, payload) {
  try {
    return {
      stdout: execFileSync(
        'bunx',
        ['convex', 'run', functionName, JSON.stringify(payload)],
        {
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: timeoutMs,
        },
      ).trim(),
    }
  } catch (error) {
    const output = `${error.stdout ?? ''}\n${error.stderr ?? ''}`.trim()
    const failure = new Error(output || error.message)
    failure.isExpectedFailure = true
    failure.output = output
    return (() => {
      throw failure
    })()
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

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}
