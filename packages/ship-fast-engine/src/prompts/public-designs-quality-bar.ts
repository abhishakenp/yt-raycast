export const PUBLIC_DESIGNS_INNER_PAGE_CRAFT = `
── INNER PAGES (parity with index.html) ──
Match homepage density: layered surfaces, mono kickers, pills, grids, strong closing band—not a thin fragment. Reuse the same Tailwind theme.extend palette and utility vocabulary as the homepage (no separate author CSS).`

export const PUBLIC_DESIGNS_QUALITY_APPENDIX = `
── REFERENCE-TIER OUTPUT (Tailwind-only; density like public/designs) ──
Ship Fast may ship static HTML under public/designs for QA; those files can include legacy author style blocks in head—do not copy that pattern. New outputs must match the same density—many sections, hairline rings, elevated cards, mono kickers, pills, grids, strong footers—not a sparse template. Vague prompts still need invented names, headlines, and real section prose.

STACK (author CSS forbidden for layout, color, typography, borders, shadows, motion):
1) Load \`/scripts/tailwind-browser.js\` first in <head>, then a \`<script>\` that sets \`tailwind.config\` with theme.extend: colors (Midnight-style bg/surface/elev/primary tokens as hex or rgb), fontFamily (body + display + mono from Google Fonts \`<link>\`), boxShadow, transitionTimingFunction, keyframes, animation.
2) Express every layout, color, spacing, border, shadow, blur, gradient, hover, and responsive breakpoint with Tailwind utility classes or arbitrary values (e.g. \`bg-[#0a0e1f]\`, \`border-white/[0.08]\`, \`shadow-[0_14px_40px_rgba(124,92,245,0.22)]\`). Optional: \`@layer\` is still CSS—do not use it. Do not use \`<style>\` for appearance.
3) Mesh / aurora: stacked absolute divs with \`bg-gradient-to-*\` \`blur-3xl\` \`opacity-*\`; watermark numerals: huge \`text-*\` with opacity.

RESPONSIVE: \`<meta name="viewport" content="width=device-width, initial-scale=1">\`. Root layout \`min-h-screen\`, \`overflow-x-hidden\` on body where needed. Mobile-first: stacks (\`flex-col\`, \`gap-6\`) before \`md:flex-row\` / \`lg:grid-cols-*\`. Typography scales (\`text-3xl md:text-5xl\`). Images and media \`max-w-full h-auto\`. Nav collapses via data-mobile-nav.

CONFIG SEMANTICS: In \`theme.extend.colors\`, \`background\`/\`ink\` name the main canvas; \`primary\` names the product accent/CTA (violet, teal, etc.), not the same hex as the deep page bg; \`surface\`/\`elev\` name card/panel steps. A dark SaaS page must not pair \`#f9fafb\` as \`background\` in config with a dark \`bg-background\` body unless the brief demands light mode.

CONTRAST (WCAG-minded): Body text must sit clearly on its surface—e.g. \`text-slate-200\` on \`bg-slate-950\` / \`bg-[#0a0e1f]\`, not \`text-gray-500\` on \`bg-gray-900\`. Muted lines use \`text-slate-400\` minimum on dark; on light surfaces use \`text-slate-700\`+ not pale gray on white. Avoid pure \`#000\` + \`#fff\` sheets; prefer tinted dark and warm off-whites. Primary buttons: clear fg/bg and \`focus-visible:ring-2\`.

ICONS: Lucide via \`https://unpkg.com/lucide@latest\`; \`lucide.createIcons()\`. Every \`<i data-lucide="…">\` at \`w-5 h-5 md:w-6 md:h-6\`, sufficient contrast; on dark use \`text-slate-200\` or \`rounded-lg bg-white/10 p-2\`. No emoji as icons.

LINKS: Every \`<a href="#…">\` must match a real \`id="…"\` on the same page. No \`href="#"\` with no target. Multi-page: filenames that match generated pages.

SITE-TYPE DEPTH:
- SaaS / landing (reference-tier, Tailwind-only, Nova-like): sticky or elevated nav with mono sublabel; hero MUST include a \`<canvas>\` + \`requestAnimationFrame\` particle or mesh field, stacked multi-stop \`radial-gradient\` + \`blur-3xl\` aurora layers with \`theme.extend.keyframes\` slow drift, \`data-magnet\` on two hero CTAs, four+ \`data-reveal\` bands, skew/rotate/clip-path or keyframed mesh rotation so the page is not flat boxes only; pill badge + dual CTAs + micro-trust chips; proof strip (logos text or stat row with mono/tabular numerals); features as bento OR split column + divided list (not three equal icon cards only); pricing band with monthly/year toggle wiring (\`data-pricing-billing\` / paired prices), featured tier ring, at least three tiers; FAQ with accordion; strong penultimate CTA band; footer with multi-column link groups — eight+ major bands; semantic \`theme.extend.colors\` (\`background\`/\`surface\`/\`elev\`/\`primary\` style names as hex); paragraph text on dark stays \`text-slate-300\`/\`400\` not \`text-slate-500\` on large body type.
- Ecommerce: warm editorial gradients, skewed bands, six+ product cards, cart/search in header.
- Docs / dev: search + topic grid + one soft liquid masthead band where readable.
- Institutional: accessible contrast, services grid, notices, contact — layered cards.
- Dashboard: dense shell + widgets/tables.

BANNED: three equal icon cards as the whole page; Inter-only stacks; author \`<style>\` for visuals; \`href="#"\` placeholders; default violet-gray sludge.
`
