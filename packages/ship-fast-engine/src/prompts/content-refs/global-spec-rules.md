# Global site spec rules (all archetypes)

## Visual craft

Spacing: consistent rhythm (e.g. 4/8px steps, generous section padding). Align blocks to a clear grid; avoid arbitrary staggered columns.

Typography: limit distinct levels per view (hero, section title, body, caption); keep body copy readable on mobile—never tiny low-contrast gray for primary text.

Color: one dominant accent per major view; neutrals for structure; avoid competing rainbow accents and cliché violet/indigo defaults unless the brand demands it.

Components: consistent border-radius scale and restrained elevation; interactive elements need clear hover and focus-visible states.

Whitespace: separate sections and ideas with space, not decoration; strip non-functional visual noise.

Encode spacing and typographic intent in `theme.spacing`, `theme.typography.scale`, and `theme.radius`; keep sections scannable without clutter.

## Output shape

- When `siteType` is ecommerce or the user asks for a carousel, slider, gallery, or marquee, expect Swiper-powered product strips in framework exports and matching Swiper markup in static HTML (policy-driven).
- The output must be directly renderable into HTML, React, and Next.js.
- Prefer structured content and interaction descriptors over raw scripts.
- Include enough pages and sections to satisfy the prompt.
- Do not omit required project metadata.
- If the prompt mentions a production domain, preserve it in `seo.siteUrl` and page canonicals.

## Programmatic SEO

- Use clean subfolder routes only for indexable pages (no query-string permutations).
- Each indexable page needs a distinct title and description; link hub pages to spokes via navigation or footer.
- Keep `page.seo.noIndex` false for public pages unless the user explicitly asks for private routes.

## Page inventory

- For public marketing sites, prefer Home plus 2–4 meaningful secondary pages unless the user explicitly requests a single-page site.
- Secondary pages should be internally linkable through navigation, footer links, or CTAs.

## Copy and SEO patterns

- Homepage copy should support SEO with a clear product headline, descriptive supporting copy, and at least one FAQ section when relevant.
- Use clean title patterns: homepage as "Project Name | Core benefit" and secondary pages as "Topic | Project Name" or "Project Name Topic | Benefit". Avoid keyword stuffing.
- When you include FAQ content, write realistic buyer or user questions rather than placeholder copy.

## Brand and trust

- When verified brand details are provided, use them for logo, contact, footer, and social sections and keep those fields exact.
- Do not invent physical addresses or phone numbers in contact or footer; omit them if not in the prompt or brand block.
- Do not put generator or tool branding strings in any page content.

## Uncertainty

- Use the fallback structure from the prompt when uncertain rather than inventing a malformed schema.

## Shipped HTML parity (static generator)

- Target the same visual density as high-quality static references: many distinct sections per homepage, hairline borders on elevated cards, mono eyebrow labels, strong footers — encode colors and radii in `theme` / `tailwind` fields for Tailwind-driven output, not hand-written page CSS.
- Section stacks should be explicit in the spec (`sections`, `contentGoals`, `contentBlocks`) so pages are implementable as long HTML, not single-block placeholders.
- Prefer internal routes and real `href` targets over bare `#` anchors unless an id exists on the same page.
