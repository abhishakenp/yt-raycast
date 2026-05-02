# OpenUI personalization (Ship Fast)

Product stance: **personalization is OpenUI-native** — parametric components, parallel component names, compositional graphs, and **session entropy** in the generator prompt. **Not** fixed page template SKUs and **not** a token-only Figma kit as the product definition.

## Human approval (authoritative gate)

1. **First meaningful preview** — After generation, open the preview and judge layout, hierarchy, and copy. Parser `ok` is necessary, not sufficient. Reject → regenerate or clarify the brief.
2. **Pre-release** — Re-check preview after changes to `contract.ts`, `index.tsx` charts/components, or engine generation prompts.

Optional tooling (validate, preprocess, `openui:playground`, `openUIDevQualityHints`) is advisory only.

## Personalization model (axes)

| Axis | Mechanism | Examples in contract / renderer |
|------|-----------|--------------------------------|
| Parametric enums | Weak model chooses among **allowed** Zod enums; React branches on props | `PageShell.visualRhythm`, `SplitHero.layoutVariant`, `EditorialHero.layoutVariant`, `DashboardShell.chrome`, `FeatureBento.gridMood`, `AuthSplitPanel.panelLayout`, `MetricGrid.density`, `FeatureCard.visualWeight`, `ProductCard.cardStyle`, `CategoryTile.tileVariant`, `Evil*.chartFrame` |
| Parallel identities | Different **component names** for the same role → different program graph | `EditorialHero` vs `SplitHero` for heroes; `DashboardShell` vs marketing stacks |
| Composition | Section **order** and **subset** in openui-lang | VARIATION `sectionOrderHint`, `compositionHint` (optional omit); model may drop a section when hint aligns |
| Entropy | Session id (or seed) hashed into system prompt | `buildOpenUIVariationBlock` → persona, hero family, chrome, fingerprint |

Full schemas: `src/openui/library/contract.ts`. Interactive renderer: `src/openui/library/index.tsx` + `charts.tsx`.

## Same-prompt diversity policy

- **No template IDs** — The model must not select a named page template; it composes from category blocks.
- **Seed** — `variationSeed` defaults to session id in `generateAndWriteOpenUIHome` / `generateAndWriteOpenUIPage` (`phase-openui-home.js`).
- **Different seed + same NL prompt** → different VARIATION lines (persona, hero, order, omit hint, dashboard chrome, fingerprint). The model is instructed to honor those hints and to vary enums when the fingerprint changes.

## Diversity / entropy in the generator

Injected via `buildOpenUIGenerationSystemPrompt` → `OPENUI_SYSTEM_PROMPT` + session facts + **VARIATION block** (`packages/ship-fast-engine/src/lib/openui-pipeline-prompt.js`, `openui-variation.js`). All hints are expressible as **valid** openui-lang plus allowed props.

## Open-world composition

- **Abstract intents** — marketing landing, dashboard app, commerce storefront, editorial, auth onboarding — map to **componentGroups** (Layout, Marketing, Commerce, Dashboard, Forms, Charts, Artifacts), not to downloadable templates.
- **Recipes** are **compositional**: pick blocks, order, and optional omissions per VARIATION.

## Visual personas (research → React)

Personas are **bias profiles** implemented as VARIATION + enums (not separate design systems):

| Persona (VARIATION) | Typical React / enum lean |
|---------------------|---------------------------|
| airy | `PageShell.visualRhythm` airy, more whitespace, `FeatureBento` even grid |
| dense | `PageShell` dense or `MetricGrid.density` compact, `DashboardShell.chrome` minimal |
| bold | `PageShell` bold ring, `FeatureCard.visualWeight` emphasis, `chartFrame` emphasis on charts |
| balanced | Default spacing; still rotate hero family and section order per seed |

## Category coverage matrix

| Category | Intent examples | Primary components | Gaps / notes |
|----------|-----------------|-------------------|--------------|
| Layout / shell | Full page, hero vs app | `PageShell`, `EditorialHero`, `SplitHero`, `DashboardShell`, `SidebarShell` | Add new **parallel** shells only when a pattern repeats in production |
| Marketing | Landing, social proof | `FeatureBento`, `FeatureCard`, `TestimonialCard`, `PricingTier`, `FAQBlock`, `MetricGrid` | Omit/add blocks per `compositionHint` |
| Commerce | PLP, promo | `ProductCard`, `CategoryTile`, `CartSummary`, `PromoBand` | `cardStyle` / `tileVariant` for variety |
| Dashboard / data | Ops UI, analytics | `DashboardShell`, `MetricGrid`, `CampaignList`, `ActivityTable`, `DataPanel`, `Evil*` | `chrome` + `density` for rhythm |
| Forms / auth | Sign-up, onboarding | `AuthSplitPanel` | `panelLayout` split vs stacked |
| Charts / artifacts | Metrics viz, secondary content | `EvilBar`…`EvilRadar`, `PreviewArtifact`… | `chartFrame` for chrome only until full Recharts wiring |

## Upstream OpenUI audit (extend vs custom)

- **Official**: `@openuidev/react-lang`, `react-ui` (`openuiLibrary`, `openuiChatLibrary`), `lang-core`, CLI — see [OpenUI SDK](https://www.openui.com/docs/api-reference).
- **Patterns**: [shadcn + OpenUI](https://www.openui.com/docs/openui-lang/examples/shadcn-chat) — bridge **your** components (Ship Fast already does this).
- **Third-party** npm: still sparse; expect **custom** `defineComponent` libraries per product. Re-scan periodically for `@openuidev/react-lang` dependents.

**Decision:** Compose **official** ideas where useful; **Ship Fast** differentiation stays in this repo’s parametric library + VARIATION policy.

## OOD and escalation

- **LLM failure** → bounded `OPENUI_HOME_FALLBACK` (minimal scaffold).
- **Parse failure** → preprocess + up to **3 retry rounds** in `phase-openui-home.js`, then fallback.
- **User reject** → new brief, model tier, or **new** component/variant when a gap is recurring — not a bigger template catalog.

## Contract / prompt sync

- Parser + LLM schema: `shipFastOpenUIContractLibrary` in `contract.ts`.
- Full-fidelity render: `shipFastOpenUILibrary` in `index.tsx` must stay aligned for new props.
- `getShipFastOpenUISystemPrompt()` uses **contract** (with `Section` replace). Renderer imports **`index.tsx`** library.

## Optional dev tooling (not a quality gate)

- **`openUIDevQualityHints`** — `packages/ship-fast-engine/src/lib/openui-dev-quality.js` — lightweight heuristics on source length, assignments, and primary components.
- **`bun run openui:playground`** — validate `.openui`, `--dump-ast`, `--variation-demo`, `--golden-variation`, `--dir`, `--quality`. See script header in `scripts/openui-engine-playground.ts`.
- **Golden variation** — Measures **diversity of VARIATION blocks** across seeds for a fixed prompt (parse sanity for full programs still needs real LLM output or saved fixtures).

## Anti-clone prompt summary

Reflected in `additionalRules` and `componentGroups.notes`: honor VARIATION (including fingerprint-driven enum variety), vary hero family, vary section subset per `compositionHint`, use category blocks not skeletons, no raw Recharts.
