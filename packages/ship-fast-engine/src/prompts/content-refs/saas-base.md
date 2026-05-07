# SaaS / product marketing

## Pages
- Home, Pricing, Docs or Product, FAQ, Contact (adjust to prompt). Optional: Security, Changelog, Careers.
- B2B tone: outcomes, integrations, compliance hints only when prompt supports them.

## Homepage
- `hero` with product value prop; `features` (3–6); `logo-cloud` or `stats`; `pricing` if monetized; `testimonials`; `faq`; `cta`; `footer`.
- Clear primary vs secondary actions in `actions` arrays.

## Data
- Populate `businessProfile` for segment and revenue model when inferable.
- `backendFeatureHints`: auth, billing, webhooks, API, analytics—as appropriate to prompt.

## Richness
- Non-home pages: set `pageRole` (`docs`, `pricing`, `compare`) and 2–4 `contentGoals`.
- Sections: use `contentBlocks` for implementation notes, comparison bullets, and trust quotes.

## Static HTML parity
- Homepage spec must imply Nova-class depth: eight or more major bands, bento or asymmetric layouts, mono kickers, hairline card rings, mesh or gradient hero — not three feature cards and done.
- Encode token-friendly structure: surfaces, CTAs, stats, integrations, pricing blocks, FAQ, footer columns in `sections`.
