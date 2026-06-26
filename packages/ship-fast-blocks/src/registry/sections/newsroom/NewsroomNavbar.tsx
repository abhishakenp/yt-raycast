import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NewsroomNavbar — refined editorial masthead bar for a digital newsroom or
 * online magazine. A sticky, press-feeling header in three tiers: a thin top
 * utility strip with today's date on the left and a live "BREAKING" ticker line
 * on the right; a prominent center-stage serif wordmark row flanked by a search
 * affordance on the left and a filled "Subscribe" button plus a text "Sign in"
 * link on the right; and a dense, bordered horizontal section nav beneath
 * (Latest, World, Politics, Business, Tech, Culture, Opinion). Every section
 * link, the search, the subscribe button and the sign-in link route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for digital newspapers, magazines, newsrooms, media brands or longform
 * publications. Renders fully with no props via baked-in "The Daily Ledger"
 * defaults.
 */
export const NewsroomNavbar = defineComponent({
  name: 'NewsroomNavbar',
  description:
    "Refined editorial masthead bar for a digital newsroom or online magazine: a sticky, press-feeling header in three tiers — a thin top utility strip with today's date on the left and a live 'BREAKING' ticker on the right; a prominent center-stage serif wordmark row flanked by a search affordance and a filled 'Subscribe' button plus a text 'Sign in' link; and a dense bordered horizontal section nav beneath (Latest, World, Politics, Business, Tech, Culture, Opinion). Section links, search, subscribe and sign-in route through useNavigate for page-switching. Use as the sticky site header for digital newspapers, magazines, newsrooms, media brands or longform publications.",
  props: z.object({
    /** Publication / masthead wordmark rendered in a prominent serif. */
    brand: z.string().optional(),
    /** Today's date shown in the top utility strip. */
    date: z.string().optional(),
    /** Breaking-news headline shown in the live ticker line. */
    breaking: z.string().optional(),
    /** Horizontal section nav labels (first item is highlighted/active). */
    sections: z.array(z.string()).optional(),
    /** Filled primary subscribe CTA label on the right. */
    subscribeCta: z.string().optional(),
    /** Text sign-in link label on the right. */
    signInCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Daily Ledger'
    const date = props.date ?? 'Sunday, June 22, 2026'
    const breaking =
      props.breaking ??
      'Central bank holds rates steady as inflation cools to a three-year low'
    const sections = props.sections?.length
      ? props.sections
      : [
          'Latest',
          'World',
          'Politics',
          'Business',
          'Tech',
          'Culture',
          'Opinion',
        ]
    const subscribeCta = props.subscribeCta ?? 'Subscribe'
    const signInCta = props.signInCta ?? 'Sign in'

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background',
          props.className,
        )}
      >
        {/* Top utility strip: date + live BREAKING ticker */}
        <div className="border-b border-border bg-muted">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-1.5 text-xs sm:px-6 lg:px-8">
            <time className="hidden font-medium uppercase tracking-wider text-muted-foreground sm:block">
              {date}
            </time>
            <div className="flex min-w-0 items-center gap-2">
              <span className="inline-flex shrink-0 items-center gap-1.5 rounded-sm bg-primary px-2 py-0.5 font-semibold uppercase tracking-wider text-primary-foreground">
                <span className="size-1.5 animate-pulse rounded-full bg-primary-foreground" />
                Breaking
              </span>
              <button
                type="button"
                onClick={() => go(breaking)}
                className="truncate text-muted-foreground transition-colors hover:text-foreground"
              >
                {breaking}
              </button>
            </div>
          </div>
        </div>

        {/* Masthead row: search · serif wordmark · subscribe + sign in */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid h-20 grid-cols-[1fr_auto_1fr] items-center gap-4">
            <div className="flex items-center justify-start">
              <button
                type="button"
                aria-label="Search"
                onClick={() => go('Search')}
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => go(sections[0])}
              className="justify-self-center text-center font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl"
            >
              {brand}
            </button>

            <div className="flex items-center justify-end gap-2 sm:gap-4">
              <button
                type="button"
                onClick={() => go(signInCta)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-block"
              >
                {signInCta}
              </button>
              <button
                type="button"
                onClick={() => go(subscribeCta)}
                className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {subscribeCta}
              </button>
            </div>
          </div>
        </div>

        {/* Section nav: dense, bordered editorial rail */}
        <div className="border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 sm:justify-center sm:gap-2">
              {sections.map((label, i) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className={cn(
                    'shrink-0 rounded-sm px-3 py-1.5 text-sm font-medium uppercase tracking-wide transition-colors hover:bg-muted hover:text-foreground',
                    i === 0
                      ? 'text-foreground underline decoration-primary decoration-2 underline-offset-8'
                      : 'text-muted-foreground',
                  )}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
    )
  },
})
