import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * NewsHero — print-style newspaper masthead hero for a news outlet. A bespoke,
 * clean front-page top band: a thin uppercase edition strip (volume/issue on
 * the left, date in the center, "Late Edition" on the right) bracketed by
 * border-y hairline rules, a centered serif display wordmark, and a top
 * headline / lead-story line with a short standfirst beneath. Newspaper feel
 * with serif display type, hairline rules, uppercase tracking and generous
 * whitespace. The wordmark and headline route through useNavigate. Use as the
 * front-page masthead hero for newspapers, news outlets, gazettes, dailies,
 * print-inspired publications or editorial sites. Renders fully with no props.
 */
export const NewsHero = defineComponent({
  name: 'NewsHero',
  description:
    "Print-style newspaper masthead hero for a news outlet: a clean front-page top band with a thin uppercase edition strip (volume/issue left, date center, 'Late Edition' right) bracketed by border-y hairline rules, a centered serif display masthead wordmark, and a top headline / lead-story line with a short standfirst beneath. Newspaper aesthetic with serif display type, hairline rules, uppercase tracking and generous whitespace. The wordmark and headline route through useNavigate. Use as the front-page masthead hero for newspapers, news outlets, gazettes, dailies, print-inspired publications or editorial content sites.",
  props: z.object({
    /** Masthead wordmark rendered in a prominent centered serif. */
    brand: z.string().optional(),
    /** Edition / volume line shown on the left of the date strip. */
    edition: z.string().optional(),
    /** Publication date shown in the center of the date strip. */
    date: z.string().optional(),
    /** Top headline / lead-story line beneath the wordmark. */
    headline: z.string().optional(),
    /** Short standfirst / dek under the headline. */
    dek: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'The Chronicle'
    const edition = props.edition ?? 'VOL. CXLVII · No. 12,847'
    const date = props.date ?? 'Sunday, June 22, 2026'
    const headline =
      props.headline ?? 'A New Era of Independent Reporting Begins Today'
    const dek =
      props.dek ??
      'After months in the making, our newsroom opens its doors to readers everywhere — independent, ad-free, and accountable only to the public it serves.'

    return (
      <section
        aria-labelledby="news-hero-heading"
        className={cn('bg-background', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          {/* Edition strip: volume · date · late edition */}
          <div className="grid grid-cols-3 items-center gap-4 border-y border-border py-2 text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            <span className="justify-self-start">{edition}</span>
            <time className="justify-self-center text-center text-foreground">
              {date}
            </time>
            <span className="justify-self-end text-right">Late Edition</span>
          </div>

          {/* Masthead wordmark */}
          <div className="py-8 text-center sm:py-10">
            <button
              type="button"
              onClick={() => go(brand)}
              className="font-serif text-5xl font-bold tracking-tight text-foreground transition-colors hover:text-muted-foreground sm:text-6xl lg:text-7xl"
            >
              {brand}
            </button>
          </div>

          {/* Top headline + standfirst */}
          <div className="border-t border-border pt-8 text-center sm:pt-10">
            <button
              type="button"
              onClick={() => go(headline)}
              className="group block w-full"
            >
              <h1
                id="news-hero-heading"
                className="mx-auto max-w-4xl font-serif text-3xl font-bold leading-[1.1] tracking-tight text-foreground transition-colors group-hover:text-muted-foreground sm:text-4xl lg:text-5xl"
              >
                {headline}
              </h1>
            </button>
            <p className="mx-auto mt-5 max-w-2xl font-serif text-lg italic leading-relaxed text-muted-foreground sm:text-xl">
              {dek}
            </p>
          </div>
        </div>
      </section>
    )
  },
})
