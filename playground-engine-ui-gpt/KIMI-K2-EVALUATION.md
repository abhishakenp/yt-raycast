# Kimi K2 Quality Evaluation

## Current Estimate

I would put this playground at roughly **70-75% of Kimi K2** today.

The best generated outputs are closer to **80%**, especially when the route, palette, and deterministic media renderer align well. The average random seed still has a schematic generated-HTML feel: good structure, speed, and coherence, but weaker than Kimi K2 on expensive visual richness, real-feeling imagery, and surprising composition.

## Why It Is Not 100%

- The engine is fast and usually coherent, with all smoke-test generations staying under the target budget in the latest real runs.
- The offline Mobbin DNA and deterministic media renderers improved taste and category correctness.
- Same-brief variety is now better because software briefs can route to different primary anchors instead of collapsing to one look.
- The remaining gap is visual luxury: outputs still rely on CSS/HTML artifact surfaces rather than genuinely rich product, place, or editorial imagery.

## 20-Second Clarification

The **under-20s requirement applies only to the production generation path**:

1. GPT-OSS 120B on Groq emits a compact plan/genome or final HTML leg.
2. Deterministic compiler/postprocessor renders and cleans the final HTML.
3. The engine returns `{ html, plan, metrics, audits }`.

Playwright screenshots, browser visual audits, and same-brief visual comparisons are **offline playground/evaluation tools only**. They are used to improve the engine and judge outputs, but they must not block the user-facing generation response.

## If Starting From Scratch

If starting from scratch, I would build a **visual-first compiler**: route to a few high-quality page grammars, ask GPT-OSS for a compact art-direction and content genome, then deterministically render rich domain-specific hero/media systems instead of asking GPT-OSS to invent every layout detail.

I would also make evaluation central from day one: screenshot scoring, same-brief visual distance, category correctness, placeholder leakage, and a human-quality gate that asks whether a generated page would plausibly be compared to Kimi K2.
