interface TokenStats {
  inputTokens?: number
  outputTokens?: number
  cost?: number
}

export interface RunAllStats {
  elapsed: number
  done: number
  total: number
  ctxPages: number
  homepageChars: number
  tasks: unknown[]
  designStats?: TokenStats
  detectStats?: TokenStats
  ctxStats?: TokenStats
  siteSpecStats?: TokenStats
  homepageStats?: TokenStats
  genStats?: {
    pages?: TokenStats & { count?: number }
    backend?: TokenStats & { count?: number }
  }
  navFixStats?: TokenStats
  indiaMode?: { code?: string; name?: string }
}

export function formatRunAllReport(
  timings: Record<string, number>,
  stats: RunAllStats,
) {
  const {
    elapsed,
    done,
    total,
    ctxPages,
    homepageChars,
    tasks,
    designStats,
    detectStats,
    ctxStats,
    siteSpecStats,
    homepageStats,
    genStats,
    navFixStats,
    indiaMode,
  } = stats

  const homepageLabel =
    indiaMode?.code && indiaMode.code !== 'en'
      ? `Groq (${indiaMode.name})   `
      : 'Groq gpt-oss-120b '
  const pageLabel =
    indiaMode?.code && indiaMode.code !== 'en'
      ? `Groq (${indiaMode.name})   `
      : 'Groq              '
  const ms = (a: string, b: unknown) =>
    timings[b as string] && timings[a]
      ? ((timings[b as string] - timings[a]) / 1000).toFixed(1)
      : '\u2014'
  const tokFmt = (t: unknown) =>
    (t as number) > 0 ? (t as number).toLocaleString() : '\u2014'

  const totalInput =
    (designStats?.inputTokens ?? 0) +
    (detectStats?.inputTokens ?? 0) +
    (ctxStats?.inputTokens ?? 0) +
    (siteSpecStats?.inputTokens ?? 0) +
    (homepageStats?.inputTokens ?? 0) +
    (genStats?.pages?.inputTokens ?? 0) +
    (genStats?.backend?.inputTokens ?? 0) +
    (navFixStats?.inputTokens ?? 0)

  const totalOutput =
    (designStats?.outputTokens ?? 0) +
    (detectStats?.outputTokens ?? 0) +
    (ctxStats?.outputTokens ?? 0) +
    (siteSpecStats?.outputTokens ?? 0) +
    (homepageStats?.outputTokens ?? 0) +
    (genStats?.pages?.outputTokens ?? 0) +
    (genStats?.backend?.outputTokens ?? 0) +
    (navFixStats?.outputTokens ?? 0)

  const totalCost =
    (designStats?.cost ?? 0) +
    (detectStats?.cost ?? 0) +
    (ctxStats?.cost ?? 0) +
    (siteSpecStats?.cost ?? 0) +
    (homepageStats?.cost ?? 0) +
    (genStats?.pages?.cost ?? 0) +
    (genStats?.backend?.cost ?? 0) +
    (navFixStats?.cost ?? 0)

  const pagesCount = genStats?.pages?.count ?? 0
  const backendCount = genStats?.backend?.count ?? 0

  return `
  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
  \u2502                      SHIP-FAST REPORT                           \u2502
  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
  \u2502  Design Brief (Groq gpt-oss-120b) ${ms('t0', 'design_end').padStart(6)}s   design.md                  \u2502
  \u2502  Context JSON (Groq)           ${ms('design_end', 'ctx_end').padStart(6)}s   ${ctxPages} pages extracted         \u2502
  \u2502  Site Spec JSON (Groq)         ${ms('ctx_end', 'site_spec_end').padStart(6)}s   site-spec.json              \u2502
  \u2502  Homepage (${homepageLabel})${ms('ctx_end', 'homepage_end').padStart(6)}s   ${homepageChars} chars               \u2502
  \u2502  Task Derivation               ${ms('derive_start', 'derive_end').padStart(6)}s   ${tasks.length} tasks (no LLM call)    \u2502
  \u2502  Page Generation (${pageLabel})${ms('gen_start', 'gen_end').padStart(6)}s   ${pagesCount} pages, ${backendCount} backend        \u2502
  \u2502  Homepage Nav Fix (Groq)       ${ms('navfix_start', 'navfix_end').padStart(6)}s   1 file                      \u2502
  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
  \u2502  TOTAL                         ${String(elapsed).padStart(6)}s   ${done}/${total} tasks completed       \u2502
  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
  \u2502  Groq tokens in:  ${tokFmt(totalInput).padStart(8)}                                    \u2502
  \u2502  Groq tokens out: ${tokFmt(totalOutput).padStart(8)}                                    \u2502
  \u2502  Groq cost:       $${totalCost.toFixed(4).padStart(8)}                                    \u2502
  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`
}

export function formatEditReport(
  done: number,
  total: number,
  elapsed: number,
  totalInput: number,
  totalOutput: number,
  totalCost: number,
) {
  return `
  \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
  \u2502                    SHIP-FAST EDIT REPORT                        \u2502
  \u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524
  \u2502  Files edited:    ${String(done).padStart(3)}/${String(total).padStart(3)}                                         \u2502
  \u2502  Total time:     ${String(elapsed).padStart(6)}s                                         \u2502
  \u2502  Groq tokens in:  ${String(totalInput.toLocaleString()).padStart(8)}                                    \u2502
  \u2502  Groq tokens out: ${String(totalOutput.toLocaleString()).padStart(8)}                                    \u2502
  \u2502  Groq cost:       $${totalCost.toFixed(4).padStart(8)}                                    \u2502
  \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518`
}
