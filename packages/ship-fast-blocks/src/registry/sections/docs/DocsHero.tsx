import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DocsHero — search-forward hero band for a developer DOCUMENTATION / API-reference
 * home. A centered, clean-aesthetic header: an uppercase "Documentation" eyebrow pill
 * in accent, a large semibold headline, a muted supporting paragraph, then a prominent
 * search bar (an inline magnifier glyph + a real `type="search"` input whose form submit
 * routes to the search/getting-started target), and a row of two CTA pill buttons —
 * a primary "Read the docs" and an outline "Quickstart" — plus an optional ⌘K keyboard
 * hint chip. Every CTA and the search form route through useNavigate (never a dead "#"),
 * and labels match site routes so PageSwitch can swap pages. Use as the lead band for
 * docs homes, API references, SDK guides, developer portals, or knowledge bases. Renders
 * fully with no props via baked-in "StackForge" defaults.
 */
export const DocsHero = defineComponent({
  name: 'DocsHero',
  description:
    "Search-forward centered hero band for a developer DOCUMENTATION / API-reference home: an uppercase 'Documentation' eyebrow pill in accent, a large semibold headline, a muted supporting paragraph, a prominent search bar with an inline magnifier glyph and a real type='search' input whose form submit routes to the search target, and a row of two CTA pill buttons (primary 'Read the docs' + outline 'Quickstart') with an optional ⌘K keyboard hint chip. CTAs and the search form route through useNavigate for page-switching; labels match site routes. Use as the lead band for docs homes, API references, SDK guides, developer portals, or knowledge bases. Clean developer-docs aesthetic, theme tokens only.",
  props: z.object({
    /** Uppercase eyebrow pill label above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Placeholder text for the search input. */
    searchPlaceholder: z.string().optional(),
    /** Route the search form submit navigates to (must match a site route). */
    searchTarget: z.string().optional(),
    /** Primary CTA pill label. */
    primaryCta: z.string().optional(),
    /** Route the primary CTA navigates to (must match a site route). */
    primaryTarget: z.string().optional(),
    /** Outline CTA pill label. */
    secondaryCta: z.string().optional(),
    /** Route the outline CTA navigates to (must match a site route). */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Documentation'
    const heading =
      props.heading ?? 'Everything you need to build with StackForge'
    const subheading =
      props.subheading ??
      'Guides, API references, and tutorials to take you from first request to production.'
    const searchPlaceholder = props.searchPlaceholder ?? 'Search the docs...'
    const searchTarget = props.searchTarget ?? 'Getting Started'
    const primaryCta = props.primaryCta ?? 'Read the docs'
    const primaryTarget = props.primaryTarget ?? 'Getting Started'
    const secondaryCta = props.secondaryCta ?? 'Quickstart'
    const secondaryTarget = props.secondaryTarget ?? 'Quick Start'

    return (
      <section
        className={cn(
          'mx-auto w-full max-w-4xl px-6 py-20 text-center sm:py-24',
          props.className,
        )}
      >
        <p className="mb-5 inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium uppercase tracking-widest text-accent">
          {eyebrow}
        </p>

        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {heading}
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">
          {subheading}
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            go(searchTarget)
          }}
          className="mx-auto mt-9 max-w-2xl"
        >
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              aria-label="Search the documentation"
              placeholder={searchPlaceholder}
              className="w-full rounded-xl border border-input bg-background py-3.5 pl-11 pr-4 text-foreground placeholder-muted-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring"
            />
            <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs font-medium text-muted-foreground sm:inline-flex">
              ⌘K
            </span>
          </div>
        </form>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => go(primaryTarget)}
            className="rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {primaryCta}
          </button>
          <button
            type="button"
            onClick={() => go(secondaryTarget)}
            className="rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            {secondaryCta}
          </button>
        </div>
      </section>
    )
  },
})
