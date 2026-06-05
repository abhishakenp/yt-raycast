# Clone conversion — general rules (round 2)

Structural, site-agnostic heuristics applied to convert.ts / fallback.ts / job.ts / generateFromClone.

- Gate every section that has >=1 recoverable DOM content node (was >=3). Short single-paragraph / heading-only blocks must be validated and rebuilt too, not waved through — that floor is what let a home page render with only its heading.
- Score conversions on THREE independent axes against the source DOM, all source-structure driven (never per-domain copy): coverage (faithful fraction reproduced), duplication (per-string multiplicity in program literals), and GROUNDEDNESS (fraction of program word-tokens absent from the source vocabulary).
- Groundedness / hallucination check: build the source vocabulary from every extracted content node + raw section text; any program literal whose words don't appear there is fabricated. >0.35 ungrounded → reject. Catches invented sentences even when real headings are also present (coverage can look fine while garbage is injected).
- On thin / duplicated / fabricated output, swap to the deterministic DOM reconstruction only when it is a STRICT improvement on the failing axis (higher coverage, lower dup, or lower hallucination) and at least ~90% as faithful — never trade a clean stub for a noisier rebuild.
- Prompt the model to reproduce text VERBATIM: every emitted word must exist in the untrusted source block; no inventing names, jokes, backstory, paraphrase, or translation.
- Keep a single-page original SINGLE-page: drop non-home pages that aren't substantive (need >=2 distinct content literals, or one real phrase >=24 chars). In-content anchors / fragment targets that crawl to empty or heading-only documents must not become PageSwitch tabs.
- Collapse near-duplicate crawled pages by ordered section content-signature (Jaccard >=0.85 over program-literal tokens), keeping the first occurrence (home wins) — signature from rendered content, never URLs/slugs.
- Always pass the original section HTML into the fallback so a failed/empty/hallucinated LLM conversion can rebuild the real headings + paragraphs + every <li>/<a> in reading order.
