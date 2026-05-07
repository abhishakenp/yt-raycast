# Landing / marketing (default)

## Pages
- Home plus 2–4 meaningful routes (pricing, product, about, contact, FAQ) unless the user asks for a single-page site.
- Each indexable page: distinct `seo.title`, `seo.description`, `route`, and internal links from nav, footer, or CTAs.

## Homepage sections (typical)
- `navbar` first with non-empty labels; `hero` with headline, subheadline, primary CTA; proof (`logo-cloud` or `stats`); `features`; `testimonials` or social proof when credible; `faq` when it helps conversion; `cta` band; `footer`.

## planMeta / page metadata
- Set `planMeta.qualityChecklist` with 3–6 concrete checks (e.g. every CTA has a target route, FAQ has real questions, no empty grid sections).
- For each page set `pageRole` (e.g. `conversion`, `support`, `story`) and `contentGoals` (short strings).

## Sections
- Use `contentBlocks` for long-form copy: `paragraph`, `list`, `quote`, `stat` kinds with real text—not placeholders.
- Prefer filled `items` arrays in grids (≥3 items when type is `features`, `testimonials`, or `pricing`).

## Programmatic SEO
- Indexable routes use clean paths only; hub pages link to spokes; `seo.noIndex` false unless user requests private pages.
