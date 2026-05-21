import { completeGemini } from '../llm/gemini.js'
import { completeGroq } from '../llm/groq.js'
import { BUILDER_SYSTEM, buildSharedContract } from '../utils/contracts.js'
import { composeAppShellHtml, parseIslandJson } from './app-shell-frame.js'
import { applyGenomeMerge } from '../utils/genome-merge.js'
import { sanitizeHtml, sanitizeIslandFragment } from '../utils/postprocess.js'

export async function composeAppShell({ brief, plan, route, variety, grammar, mode = 'hybrid' }) {
  const contract = buildSharedContract(brief, plan, route, variety, grammar)

  if (mode === 'gemini-full') {
    const regions = (plan.sections || plan.appIslands || [])
      .map((s) => `- ${s.role || s.slot}: ${s.contains}`)
      .join('\n')
    const result = await completeGemini({
      prompt: `${contract}

Build the COMPLETE coherent 2D operational interface as ONE document.
True sidebar + top bar + main canvas + data panels. Regions:
${regions}
Use lg:grid lg:grid-cols-[17rem_1fr] for sidebar layout. Realistic live data. </body></html> required.`,
      maxOutputTokens: 4200,
      temperature: 0.55,
    })
    let html = result.content.replace(/^```[a-z]*\n?/i, '').replace(/```\s*$/i, '').trim()
    if (!/<\/html>/i.test(html)) html += '\n</body></html>'
    html = applyGenomeMerge(html, plan)
    return {
      html: sanitizeHtml(html, plan, route),
      metrics: { buildMode: 'app-shell-gemini-full', geminiMs: result.ms },
    }
  }

  const islandPrompt = `${contract}

Deterministic shell owns sidebar + top bar. Return ONLY JSON with small INNER panel fragments (no <!DOCTYPE>, <html>, <body>, <nav>, sticky <header>, hero sections, or min-h-screen).

Each value is ONE dashboard widget cluster (metrics row, chart placeholder, table, control group) — max ~120 lines of HTML total across all keys.

{
  "identity": "<div>compact status strip</div>",
  "primary": "<div>main chart/metrics surface</div>",
  "secondary": "<div>data table</div>",
  "tertiary": "<div>filters and actions</div>"
}

Islands:
${(plan.appIslands || []).map((i) => `- ${i.slot}: ${i.contains}`).join('\n')}`

  const [islandResult, identityGemini] = await Promise.all([
    completeGroq({
      system: BUILDER_SYSTEM,
      prompt: islandPrompt,
      temperature: 0.62,
      maxTokens: 3600,
      reasoningEffort: 'low',
      responseFormat: { type: 'json_object' },
    }).catch(() => completeGroq({
      system: BUILDER_SYSTEM,
      prompt: `${islandPrompt}\n\nReturn valid JSON only.`,
      temperature: 0.48,
      maxTokens: 3600,
      reasoningEffort: 'low',
    })),
    completeGemini({
      prompt: `${contract}\n\nOutput ONLY a tiny identity/status strip fragment (no html/head/body). Brand: ${brief}.`,
      maxOutputTokens: 700,
      temperature: 0.45,
    }).catch(() => ({ content: '', ms: 0 })),
  ])

  const islands = parseIslandJson(islandResult.content) || {}
  if (identityGemini.content) {
    const frag = sanitizeIslandFragment(identityGemini.content)
    if (frag.length > 40) islands.identity = frag
  }

  let html = composeAppShellHtml({ brief, plan, route, islands })
  html = applyGenomeMerge(html, plan)
  return {
    html: sanitizeHtml(html, plan, route),
    metrics: {
      buildMode: 'app-shell-deterministic-hybrid',
      islandMs: islandResult.ms,
      geminiIdentityMs: identityGemini.ms,
    },
  }
}
