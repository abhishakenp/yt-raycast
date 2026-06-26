import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MusicFestivalCta — a dark closing call-to-action band for a music / arts
 * festival landing page. A full-bleed inverted (foreground) centered section
 * with a large headline, a supporting paragraph, dual pill CTAs (get tickets /
 * join mailing list), and a small contact note beneath. Both CTAs route through
 * useNavigate. Use as the final conversion push on music festivals, arts
 * festivals, concert series, or any multi-day ticketed event.
 */
export const MusicFestivalCta = defineComponent({
  name: 'MusicFestivalCta',
  description:
    'Dark closing call-to-action band for a music / arts festival landing page: a full-bleed inverted (foreground background, light text) centered section with a large headline, a supporting paragraph, dual pill CTAs (get tickets / join mailing list), and a small contact note beneath. Both CTAs route through useNavigate. Use as the final conversion push before the footer on music festivals, arts festivals, concert series, raves, or any multi-day ticketed event.',
  props: z.object({
    /** Headline. */
    heading: z.string().optional(),
    /** Supporting paragraph. */
    description: z.string().optional(),
    /** Primary CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Small contact note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Your horizon awaits'
    const description =
      props.description ??
      'Join us August 15-17 for three days that will stay with you forever. Early bird pricing ends soon.'
    const primaryCta = props.primaryCta ?? 'Get Tickets'
    const secondaryCta = props.secondaryCta ?? 'Join Mailing List'
    const note =
      props.note ?? 'Questions? Email us at hello@horizonfestival.com'

    const ArrowRight = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section
        className={cn(
          'bg-foreground py-24 text-background lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-4xl font-bold tracking-tight lg:text-6xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
              <ArrowRight />
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center rounded-full border border-background/30 px-8 py-4 font-medium transition-colors hover:bg-background/10"
            >
              {secondaryCta}
            </button>
          </div>
          <p className="mt-8 text-sm text-background/50">{note}</p>
        </div>
      </section>
    )
  },
})
