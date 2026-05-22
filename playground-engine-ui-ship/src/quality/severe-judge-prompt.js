/**
 * Severe publication homepage judge rubric — Kimi K2.5 quality bar.
 * Scoring MUST use Kimi (OpenRouter moonshotai/kimi-k2* or cursor-agent kimi-k2.5).
 */

export const SEVERE_JUDGE_PASS_SCORE = 85

export function buildSevereJudgePrompt({
  brief,
  htmlExcerpt,
  screenshotPath,
  preflight = {},
  previousFeedback = '',
  briefFidelity = null,
} = {}) {
  const preflightBlock = preflight.ok === false
    ? `\nAutomated preflight FAILED (${preflight.score ?? '?'} heuristic — NOT your score):\n${(preflight.issues || []).map((i) => `- ${i}`).join('\n')}\n`
    : preflight.score != null
      ? `\nAutomated preflight (ignore as score — heuristic only): publicationOk=${preflight.publicationOk}, photos=${preflight.photoCount ?? '?'}, heuristic=${preflight.score}\n`
      : ''

  const fidelityBlock = briefFidelity?.issues?.length
    ? `\nBrief/title fidelity audit (hard signals — penalize heavily):\n${briefFidelity.issues.map((i) => `- ${i}`).join('\n')}\n`
    : briefFidelity
      ? `\nBrief/title fidelity: title="${briefFidelity.titleTag || '?'}", brand="${briefFidelity.visibleBrand || '?'}", h1="${briefFidelity.pageH1 || '(none)'}"\n`
      : ''

  const retryBlock = previousFeedback
    ? `\nPrevious attempt failed. Address this feedback:\n${previousFeedback}\n`
    : ''

  const shotLine = screenshotPath
    ? `Screenshot (visual ground truth): ${screenshotPath}\nOpen or imagine this PNG when scoring layout, density, and photo fill.\n`
    : ''

  return `You are Kimi K2 acting as a SEVERE design QA judge for Ship-Fast publication homepages.

Your job is NOT to be encouraging. Reject generic templates even when they have photos and cards. The automated heuristic score is NOT authoritative — you must score from the HTML and brief yourself.

Brief (source of truth for substance):
${brief}
${retryBlock}${preflightBlock}${fidelityBlock}${shotLine}
HTML excerpt (truncated single-file page):
\`\`\`html
${htmlExcerpt}
\`\`\`

## PASS criteria (ALL required for verdict "pass")
1. **Publication index, not SaaS hero** — featured post opener + dense latest-posts grid. NO min-h-screen marketing hero, NO id="hero", NO centered billboard featured block, NO Features/Pricing/Testimonials nav.
2. **Real editorial photos** — 4+ visible photo thumbnails (img src=http...), not empty gray art-surface boxes or data-img-only placeholders.
3. **Block rhythm** — compact featured split (cover + title/byline/excerpt) → 6+ card grid with read links → topics/newsletter/footer band. Matches production blog index structure.
4. **Brief & title fidelity** — visible brand, H1/masthead, and hero copy must reflect the brief's substance (not just a generic noun + "Blog"). If \`<title>\` promises training/breeds/adoption/reviews but the page only shows a lazy "Dog Blog" logo with no scoped masthead, cap score ≤ 55.
5. **Specific copy** — on-brief editorial content with bylines, dates, or read times; not lorem or generic "platform" language.
6. **Visual craft at Kimi K2.5 bar** — distinctive typography (Google Fonts), warm/editorial palette, intentional spacing. Not template blur-orbs and rotated cards noise.
7. **Score ≥ ${SEVERE_JUDGE_PASS_SCORE}/100** on your subjective Kimi K2.5 parity scale.

## Automatic FAIL triggers (any one → verdict "fail")
- Generic publication naming ("Dog Blog", "Pet Blog") when brief asks for a substantive multi-topic publication
- \`<title>\` scope not reflected in visible H1/masthead/hero (title says one thing, page shows another)
- Viewport-scale marketing hero (min-h-screen / min-h-[60vh+] without publication grid)
- SaaS nav or copy drift (Features, Pricing, Get started free, platform overview)
- 3+ empty placeholder / art-surface blocks where photos should be
- Missing latest-posts band or fewer than 4 article/card entries with read affordances
- Reads as wireframe/schematic, not a finished publication front page

Reply with ONLY a JSON object (no markdown fences):
{
  "verdict": "pass" | "fail",
  "score": <integer 0-100>,
  "production_distance": "close" | "moderate" | "far",
  "critical_defects": ["..."],
  "issues": ["..."],
  "feedback": "<actionable fixes for the generator, 2-5 sentences>"
}`
}

export function truncateHtml(html, maxChars = 28000) {
  const source = String(html ?? '')
  if (source.length <= maxChars) return source
  const head = source.slice(0, Math.floor(maxChars * 0.65))
  const tail = source.slice(-Math.floor(maxChars * 0.25))
  return `${head}\n<!-- … truncated … -->\n${tail}`
}
