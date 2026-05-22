import { BUILDER_SYSTEM, buildVerticalDocPrompt } from '../contracts.js'
import { completeGroq } from '../llm/groq.js'
import { applyGenomeMerge } from '../utils/genome-merge.js'
import { ensureMinimumVerticalSections, ensureBlogPublicationIndex, looksLikeBadLeg, sanitizeHtml } from '../utils/postprocess.js'

export async function composeFastVerticalDoc({ brief, plan, route, variety, grammar, llm = completeGroq }) {
  const prompt = buildVerticalDocPrompt(brief, plan, route, variety, grammar)
  let result = await llm({
    system: BUILDER_SYSTEM,
    prompt,
    temperature: 0.72,
    maxTokens: 7600,
    reasoningEffort: 'low',
  })
  let retryMs = 0
  if (looksLikeBadLeg(result.content)) {
    const retry = await llm({
      system: BUILDER_SYSTEM,
      prompt: `${prompt}\n\nPrevious attempt was empty/refusal/stub. Return a complete HTML document only.`,
      temperature: 0.58,
      maxTokens: 7600,
      reasoningEffort: 'low',
    })
    retryMs = retry.ms || 0
    if (!looksLikeBadLeg(retry.content)) result = retry
  }
  let html = sanitizeHtml(result.content, plan, route, brief)
  const minSections = route?.siteHint === 'blog' ? 5 : 6
  const sectionCount = (html.match(/<section\b/gi) || []).length
  if (sectionCount < minSections) {
    const retry = await llm({
      system: BUILDER_SYSTEM,
      prompt: `${prompt}\n\nPrevious attempt had only ${sectionCount} top-level content sections. Rebuild the full document with ${minSections}-9 substantial full-width <section class="w-full ..."> bands. Return HTML only.`,
      temperature: 0.54,
      maxTokens: 7600,
      reasoningEffort: 'low',
    })
    retryMs += retry.ms || 0
    const retryHtml = sanitizeHtml(retry.content, plan, route, brief)
    if (!looksLikeBadLeg(retry.content) && (retryHtml.match(/<section\b/gi) || []).length >= sectionCount) {
      result = retry
      html = retryHtml
    }
  }
  html = applyGenomeMerge(html, plan)
  html = ensureMinimumVerticalSections(html, plan, minSections, route, brief)
  html = ensureBlogPublicationIndex(html, plan, route, brief)
  return {
    html,
    metrics: {
      buildMode: 'vertical-doc-single-gpt',
      buildMs: (result.ms || 0) + retryMs,
      builderModel: result.model || null,
      outputTokens: result.outputTokens || 0,
      tps: result.tps || 0,
      retried: retryMs > 0,
    },
  }
}
