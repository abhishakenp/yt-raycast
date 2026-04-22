export const ARCHETYPE_PRESETS = {
  marketingDark: `

VISUAL POLISH (marketing / SaaS / landing — dark-first, Nova-class density):
- Implement Tailwind-only: tailwind.config theme.extend for palette (bg/surface/elev/primary), fonts, shadows; one mesh/aurora stack in hero (absolute gradient blurs + blur-3xl); no author <style>.
- Dark default. Headings #fff, body #cbd5e1, muted #94a3b8; hairline rings on cards; never flat gray voids.
- Minimum eight major bands below header: e.g. hero (pill + h1 + sub + dual CTA + optional bento teaser) → social proof strip or stats → asymmetric feature grid or bento → integrations/logo row → deeper feature rows → testimonials or case quotes → pricing (if monetized) → FAQ accordion → final CTA band → rich footer (columns + mono kickers).
- Hero: display headline scale (text-5xl md:text-7xl+), mono eyebrow, primary + ghost CTAs, optional watermark numeral or word in low opacity.
- Include at least one of: bento with unequal cells, split hero (copy vs gradient panel), logo cloud with refined type treatment.
- Short prompts: still full section count and invented product names/metrics — not a three-card placeholder.
`,

  storefrontEditorial: `

VISUAL POLISH (e-commerce / DTC — editorial retail, Arc-class depth):
- Cream/stone/rose/amber grounds; wine or cocoa accent; black or deep promo strip; header with cart bag + badge, search, multi-link shop nav.
- Hero: editorial split or full-bleed with lifestyle/product slot, dual CTAs, benefit chips; skewed section wrapper at least once (-skew-y-1 + counter-inner).
- Six+ featured SKUs in grids or rails with stars, price, add-to-cart; category tiles 4+; materials/story band; reviews; newsletter; four-column footer.
- Cards: hover lift, shadow-xl, image zoom — never icon-only tiles for products.
- Light editorial: cream/stone tokens in tailwind.config.extend.colors; grids and bands stay utility-first.
`,

  docsDev: `

VISUAL POLISH (documentation / API / technical content — shipped-docs density):
- Docs home is still a marketing surface: sticky top bar with logo, version pill, search field, GitHub/external link slots; optional soft liquid/mesh masthead (gradient blurs) behind the title.
- Below: quickstart row (copy + code sample in framed surface), feature/link cards grid (6+), optional API paths or endpoint table strip, “guides” band, newsletter or community CTA, footer with doc columns.
- Code blocks: mono on inset surface, ring, scroll if long; high contrast.
- Short prompts: still search UI, topic grid, and multi-link footer — not a one-column blank.
`,

  institutionalCivic: `

VISUAL POLISH (government / institutional — civic portal, not a wireframe):
- Calm blues/teals or civic neutrals; WCAG-minded contrast; restrained motion.
- Bands: mission hero with search or service spotlight → service tiles or priority links (6+) → news/notice strip with dates → events or announcements row → resident/business paths → mayor/leadership or contact block → directory/footer with many columns.
- Layered cards (bg-surface, ring-1 ring-white/10), not flat bullets only; no startup hype language; no fake IDs.
- Short prompts: still multi-section depth and realistic department names.
`,

  dashboardShell: `

VISUAL POLISH (dashboard / admin / app shell — admin reference density):
- Fixed or sticky sidebar (icon rail + labels), dense nav; top header with workspace switcher, search, notifications, user menu; Tailwind CDN required for the chrome.
- Main: filter row, status chips, data table with sortable columns OR card grid of KPI tiles + secondary panels; right rail or drawer for detail when relevant.
- Real empty states with illustrations or concise copy; plausible widget titles (Queue depth, SLA, Revenue, Active users).
- Short prompts: still full shell — not a blank white page with one chart.
`,

  portfolioShowcase: `

VISUAL POLISH (portfolio / creative):
- Work-forward: project grid or case-study cards, strong imagery or gradient placeholders, about + contact.
- Typography-forward; avoid generic SaaS pricing unless the user sells services with packages.
- Short prompts: still ship hero, work grid (6+ items), about, contact with form affordances.
`,

  blogEditorial: `

VISUAL POLISH (blog / magazine / journal):
- Featured story band + article grid with categories/tags; newsletter strip; readable type scale.
- Short prompts: still ship featured post, 6+ article cards, category row, footer with archives.
`,

  marketplaceTwoSided: `

VISUAL POLISH (marketplace):
- Discovery-first: search, categories, trust + supply/demand hints, listing cards with clear metadata. Avoid pure SaaS pricing hero.
- Short prompts: include category tiles, featured listings, how it works (3 steps), trust strip.
`,

  communitySocial: `

VISUAL POLISH (community / forum / membership):
- Activity-first: members, topics, trending, CTA to join. Warm but structured dark/light both ok.
- Short prompts: still ship hero, stats row, topic grid or feed cards, join CTA, rules/footer links.
`,

  gameLanding: `

VISUAL POLISH (game / interactive promo):
- Bold art direction, hero key art or gradient drama, feature columns, media strip, platform/social links. Respect reduced motion.
- Short prompts: still ship hero, 3–5 feature bands, screenshots/placeholder gallery, download or wishlist CTA.
`,

  gameRaw: `

VISUAL POLISH (playable game HTML — when user asked for a game):
- Follow the GAME section of system instructions; craft preset is secondary.
`,
}

export function getArchetypePresetAppendix(presetKey) {
  const k = presetKey && ARCHETYPE_PRESETS[presetKey] ? presetKey : 'marketingDark'
  return ARCHETYPE_PRESETS[k]
}

export const AURORA_PRESET_APPENDIX = getArchetypePresetAppendix('marketingDark')
