/**
 * Kimi judge — scores MUST come from Kimi models only.
 * Default: OpenRouter moonshotai/kimi-k2 (or SHIP_KIMI_JUDGE_MODEL).
 * Opt-in: cursor-agent --model kimi-k2.5 (SHIP_JUDGE_BACKEND=cursor).
 * Groq/gpt-oss is NOT used for scoring.
 */
import { readFileSync, existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import {
  buildSevereJudgePrompt,
  truncateHtml,
  SEVERE_JUDGE_PASS_SCORE,
} from './severe-judge-prompt.js'
import { analyzeBriefFidelity, formatBriefFidelityBlock } from './brief-fidelity.js'

export { SEVERE_JUDGE_PASS_SCORE, truncateHtml, buildSevereJudgePrompt }

const OPENROUTER_HOST = (process.env.OPENROUTER_HOST || 'https://openrouter.ai/api').replace(/\/$/, '')
const DEFAULT_KIMI_MODEL = process.env.SHIP_KIMI_JUDGE_MODEL || 'moonshotai/kimi-k2'

export function buildGeneralJudgePrompt({
  brief,
  htmlExcerpt,
  screenshotPath,
  engineId = 'unknown',
  briefFidelity = null,
} = {}) {
  const fidelityBlock = formatBriefFidelityBlock(briefFidelity)
  const shotLine = screenshotPath
    ? `Screenshot available at: ${screenshotPath}\n`
    : ''

  return `You are Kimi K2 acting as a SEVERE design QA judge.

Score this homepage against what Kimi K2.5 would produce for the same brief. Be harsh — generic AI slop, lazy "Noun Blog" branding, title/brief mismatch, and template noise score below 60.

Engine: ${engineId}
Brief (source of truth):
${brief}
${fidelityBlock}${shotLine}
HTML excerpt:
\`\`\`html
${htmlExcerpt}
\`\`\`

Score 0–100:
- 90–100: Kimi K2.5 parity — distinctive, complete, on-brief, shippable
- 75–89: Good craft but below Kimi (template feel, weak brief fidelity)
- 50–74: Mediocre generated HTML; generic brand or title mismatch
- 0–49: Broken, wireframe-quality, or ignores brief substance

If <title> promises topics the visible page never establishes (no H1/masthead/hero scope), cap score ≤ 55.

Reply with ONLY JSON:
{
  "verdict": "pass" | "fail",
  "score": <integer 0-100>,
  "production_distance": "close" | "moderate" | "far",
  "critical_defects": ["..."],
  "issues": ["..."],
  "feedback": "<2-4 sentences toward Kimi K2.5 quality>"
}`
}

export function extractJudgeText(apiMessage) {
  if (!apiMessage) return ''
  if (apiMessage.content) return String(apiMessage.content)
  if (apiMessage.reasoning) {
    const m = String(apiMessage.reasoning).match(/\{[\s\S]*\}/)
    if (m) return m[0]
  }
  const details = apiMessage.reasoning_details
  if (Array.isArray(details)) {
    for (const d of details) {
      const text = d?.text || d?.summary
      if (text) {
        const m = String(text).match(/\{[\s\S]*\}/)
        if (m) return m[0]
      }
    }
  }
  return ''
}

export function parseJudgeVerdict(text, { passThreshold = SEVERE_JUDGE_PASS_SCORE } = {}) {
  let trimmed = String(text ?? '').trim()
  trimmed = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('judge did not return JSON')
  const parsed = JSON.parse(jsonMatch[0])
  if (parsed.score == null) throw new Error('judge JSON missing score')
  const score = Math.max(0, Math.min(100, Math.round(Number(parsed.score))))
  const verdict = parsed.verdict === 'pass' ? 'pass' : 'fail'
  const critical = Array.isArray(parsed.critical_defects) ? parsed.critical_defects : []
  const pass = verdict === 'pass' && score >= passThreshold && critical.length === 0
  return {
    ...parsed,
    verdict,
    score,
    critical_defects: critical,
    issues: Array.isArray(parsed.issues) ? parsed.issues : [],
    pass,
    raw: trimmed,
  }
}

async function completeOpenRouter({ model, system, prompt, maxTokens = 1200, temperature = 0.1 }) {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set — Kimi judge requires OpenRouter')
  const t0 = Date.now()
  const res = await fetch(`${OPENROUTER_HOST}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://ship-fast.io',
      'X-Title': 'Ship Fast Kimi Judge',
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(system ? [{ role: 'system', content: system }] : []),
        { role: 'user', content: prompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  })
  const ms = Date.now() - t0
  const raw = await res.text()
  if (!res.ok) throw new Error(`openrouter ${res.status}: ${raw.slice(0, 240)}`)
  const data = JSON.parse(raw)
  const msg = data.choices?.[0]?.message
  const content = extractJudgeText(msg)
  if (!content) throw new Error(`Kimi model ${model} returned empty content — try moonshotai/kimi-k2`)
  return {
    content,
    model: data.model || model,
    ms,
  }
}

async function runCursorJudge(prompt, cwd, timeoutMs) {
  return new Promise((resolve, reject) => {
    const proc = spawn(
      'cursor-agent',
      ['--print', '--model', 'kimi-k2.5', '--output-format', 'text', '--trust', prompt],
      { cwd, stdio: ['ignore', 'pipe', 'pipe'] },
    )
    const chunks = []
    proc.stdout.on('data', (d) => chunks.push(d))
    const timer = setTimeout(() => {
      proc.kill('SIGTERM')
      reject(new Error(`cursor judge timeout ${timeoutMs}ms`))
    }, timeoutMs)
    proc.on('exit', (code) => {
      clearTimeout(timer)
      if (code !== 0) reject(new Error(`cursor-agent exited ${code}`))
      else resolve(Buffer.concat(chunks).toString('utf8'))
    })
  })
}

async function runTextJudge(prompt, { backend }) {
  const timeoutMs = Number(process.env.SHIP_JUDGE_TIMEOUT_MS || 120000)
  const forced = backend || process.env.SHIP_JUDGE_BACKEND || 'openrouter'

  if (forced === 'cursor') {
    const raw = await runCursorJudge(prompt, process.cwd(), timeoutMs)
    return { raw, judgeModel: 'cursor-agent/kimi-k2.5', judgeMs: null, judgeBackend: 'cursor' }
  }

  if (forced === 'groq') {
    throw new Error(
      'SHIP_JUDGE_BACKEND=groq is disabled — scores must come from Kimi. Use openrouter or cursor.',
    )
  }

  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      'OPENROUTER_API_KEY required for Kimi judge (moonshotai/kimi-k2). Or set SHIP_JUDGE_BACKEND=cursor.',
    )
  }

  const r = await completeOpenRouter({
    model: DEFAULT_KIMI_MODEL,
    system:
      'You are Kimi K2, a severe design judge calibrated to Kimi K2.5 output quality. Reply with a single JSON object only — no markdown fences.',
    prompt,
  })
  return { raw: r.content, judgeModel: r.model, judgeMs: r.ms, judgeBackend: 'openrouter' }
}

export function resolveJudgeBackend(backend) {
  return backend || process.env.SHIP_JUDGE_BACKEND || 'openrouter'
}

export async function judgeHomepage({
  brief,
  html,
  engineId = 'unknown',
  screenshotPath = null,
  mode = 'general',
  preflight = {},
  previousFeedback = '',
  heuristicScore = null,
  passThreshold = SEVERE_JUDGE_PASS_SCORE,
  backend = null,
} = {}) {
  const htmlExcerpt = truncateHtml(html)
  const briefFidelity = analyzeBriefFidelity(html, brief)
  const prompt =
    mode === 'publication'
      ? buildSevereJudgePrompt({
          brief,
          htmlExcerpt,
          screenshotPath,
          preflight,
          previousFeedback,
          briefFidelity,
        })
      : buildGeneralJudgePrompt({ brief, htmlExcerpt, screenshotPath, engineId, briefFidelity })

  try {
    const textResult = await runTextJudge(prompt, { backend: resolveJudgeBackend(backend) })
    const parsed = parseJudgeVerdict(textResult.raw, { passThreshold })

    return {
      ...parsed,
      score: parsed.score,
      pass: parsed.pass,
      prompt,
      judgeModel: textResult.judgeModel,
      judgeBackend: textResult.judgeBackend,
      judgeMs: textResult.judgeMs,
      briefFidelity,
      heuristicScore,
      raw: textResult.raw,
      error: null,
    }
  } catch (err) {
    return {
      verdict: 'fail',
      score: 0,
      production_distance: 'far',
      critical_defects: ['judge invocation failed'],
      issues: [String(err.message || err)],
      feedback: 'Set OPENROUTER_API_KEY for Kimi (moonshotai/kimi-k2) or SHIP_JUDGE_BACKEND=cursor.',
      pass: false,
      prompt,
      briefFidelity,
      error: String(err.message || err),
      raw: '',
    }
  }
}
