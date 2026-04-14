## Summary

Tracks the ecommerce prompt/pipeline work so generated storefronts read as **retail**, user-supplied **reference URLs** steer layout/mood ahead of fixed exemplars, and homepage generation reinforces **merchandising** over SaaS marketing patterns.

## Before / after preview

### Before

| Area | Behavior |
|------|----------|
| **Homepage LLM** | One large system prompt mixes app UI, SaaS/landing, and ecommerce; models often fell back to pill-badge / feature-grid / pricing-adjacent layouts for shops. |
| **Exemplar weight** | MVMT / Ledger / Apple–style exemplar copy repeated across design brief, site spec, and task prompts, converging on a generic “premium DTC” template and drowning user links. |
| **Reference URLs** | Links are text-only; no pixels. Path hints help slightly, but downstream prompts still injected the **full** exemplar block when refs were present. |
| **Vision** | `SHIP_FAST_ECOMMERCE_VISION_REFERENCES` had no image pass—placeholder for future multimodal. |

### After

| Area | Behavior |
|------|----------|
| **groq homepage** | Ecommerce bullet adds explicit **FORBIDDEN** (pricing-as-hero, icon-feature grids, bento-as-hero, dashboard framing) and **REQUIRED** retail cues; optional **REFERENCE-FIRST** system block when workspace has design refs; **storefront retail reminder** appended to the user prompt when the prompt looks like a shop. |
| **Guidelines** | `getEcommerceGenerationGuidelines({ hasUserDesignReferences })` swaps exemplar-first copy for **reference-first** copy when `design-references.json` exists; Medusa/motion/growth sections preserved. |
| **Threading** | `hasUserDesignReferences` from `readDesignReferenceUrlsFromWorkspace(workspace)` flows through runner → design brief, site spec (generate + edit), task `pagePrompt`. |
| **Vision stub** | `resolveEcommerceVisionReferenceImageUrls` exported for a future screenshot/mood-image pipeline. |

## How to verify

1. Create a session with **design reference URLs** (HTTPS) in the dashboard optional field; confirm `design-references.json` in the workspace.
2. Prompt an **ecommerce** store; inspect generated `index.html` for dense header/shop nav, category + product grids, prices + ATC—not a thin SaaS hero + three feature cards.
3. Compare a run **with** vs **without** reference URLs: exemplar noise should drop when refs are present (prompt text in logs / `prompt.txt`).

## Related

Recent commits on `develop` implementing the above (anti-SaaS `groq` rules, conditional guidelines, design-ref merge, legal UI).
