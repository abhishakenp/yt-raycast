const FLUFF =
  /\b(modern|clean|fast|scalable|minimal|simple|beautiful|elegant|professional|sleek|intuitive|responsive|ai-?powered|next-?gen|cutting-?edge|innovative|seamless|powerful|robust)\b/gi

const EXCLUDED_SITE_TYPES = new Set(['ecommerce', 'dashboard', 'game', 'institutional'])

export const isVagueMarketingPrompt = (prompt) => {
  const s = String(prompt || '').trim()
  if (s.length < 10) return true
  if (s.length > 420) return false
  const words = s.split(/\s+/).filter(Boolean)
  if (words.length > 52) return false
  if (/\d/.test(s) && s.length > 90) return false
  if (/\b(soc2|soc 2|gdpr|hipaa|kubernetes|terraform|postgres|snowflake|salesforce|hubspot|stripe|oauth|api\b|vs\.?|integrat|compliance|dashboard|playbook|series [a-z]|icp)\b/i.test(s))
    return false
  const fluffHits = (s.match(FLUFF) || []).length
  if (s.length < 100) return true
  if (s.length < 170 && fluffHits >= 2) return true
  if (s.length < 240 && fluffHits >= 3 && words.length < 50) return true
  return false
}

export const shouldExpandVagueMarketing = (prompt, siteType) => {
  if (!isVagueMarketingPrompt(prompt)) return false
  const st = String(siteType || '').toLowerCase()
  if (st && EXCLUDED_SITE_TYPES.has(st)) return false
  if (!st || st === 'landing' || st === 'saas' || st === 'blog' || st === 'portfolio' || st === 'docs') return true
  if (/\b(saas|b2b|software|app|platform|product|tool|startup)\b/i.test(String(prompt || '')))
    return true
  return false
}

export const VAGUE_MARKETING_HOMEPAGE_APPENDIX = `
── VAGUE-PROMPT MODE (user gave little detail) ──
Ship reference-tier work anyway: invent a believable product name, audience, and outcome—no Lorem, no placeholder walls, no copy-paste paragraphs across feature cards.

TARGET BAR: The same automated checks compare your HTML to the bundled exemplar for this site type (e.g. public/designs/design-03-saas-homepage.html for SaaS/landing). If you would not proudly ship it next to that file, keep expanding sections, depth, and interactivity until you would.

VISUAL WOW (SaaS/landing/portfolio/blog): boring flat Tailwind cards fail. You need the same class of polish as design-03: hero <canvas> + rAF particles/mesh, stacked radial-gradient aurora blobs with blur-3xl, theme keyframed liquid motion, data-reveal scroll staging, data-magnet on hero CTAs, skew/rotate or clip-path energy somewhere, and strong text contrast (slate-300/400 for paragraphs on dark—never washed slate-500 on large body type).

DENSITY: Match public/designs style—many bands, hairline surfaces, mono kickers, one accent.

HERO: Sticky or blurred header with mono sublabel; pill badge; stacked mesh = multiple absolute divs with bg-gradient-to-* + blur-3xl + opacity-30–70 (not a single flat gradient only); primary + secondary CTAs + 2+ micro trust chips. Right side = type-forward panel (code block, “workspace” card, or metrics strip)—never a blank gray rectangle.

CAPABILITIES: Split layout (5/7 or bento)—NOT three equal text cards with the same body sentence. At least 4 rows with unique sublines (mono: “a → b → c” or metrics).

PROOF: 2×2 or 1×4 stat grid (mono label + tabular-nums) + 6+ recognizable company **names** as text + 1 long testimonial (full name, title, org, 2–3 lines that reference a real-sounding problem).

PRICING (on this HTML): \`#pricing\`, \`data-pricing-billing\`, M/Y toggle, \`data-show-monthly\` / \`data-show-yearly\` or visible dual prices, ≥3 distinct tiers, one “featured” with stronger border/shadow. Do not only link away unless this page is a stub—prefer full table here.

FAQ: 4+ items with **specific** answers (trade-offs, security, data, not generic marketing). Optional two-column intro + list like premium examples.

MOTION: \`theme.extend.keyframes\` for subtle float/glow, OR \`data-reveal\` + one small IIFE; \`data-counter\` on stats; \`[prefers-reduced-motion:reduce]\` kills heavy motion. Wire pricing toggle in the page script if present.

LOGOS: Text names only, muted—never 6 empty gray divs as “trust”.

TYPOGRAPHY: Google Fonts: display (Cabinet, Syne, Fraunces, Outfit…) + body + mono for labels; map all three in \`fontFamily\`.

TOKENS: \`background\`/\`ink\` = canvas; \`primary\` = accent/CTA; never a light #f9fafb as “background” in config on a dark page unless light mode is explicit.

BANNED: Repeating the same 15+ word sentence; Inter-only; generic stock hero photos as empty boxes.
`

export const VAGUE_MARKETING_THIN_SPEC_APPENDIX = `
- VAGUE user prompt: homepage JSON must still name **4+ feature lines** (unique descriptions), **4+ proof metrics**, **3+ pricing tiers** with price strings, **4+ FAQ** Q/A pairs, and a **6+ item** “social proof / logos” as **text company names** (not image placeholders) in the homepage sections so export HTML can be rich.
`
