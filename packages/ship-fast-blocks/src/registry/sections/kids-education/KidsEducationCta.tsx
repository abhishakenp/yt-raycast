import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * KidsEducationCta — dark closing call-to-action band for a kids / family
 * learning platform. A full-width dark (foreground) section with soft gradient
 * wash and blurred glow orbs behind a centered headline, supporting paragraph,
 * dual rounded CTAs (filled primary with arrow + outlined play-icon secondary),
 * and a small reassurance note. Every CTA routes through useNavigate. Use as the
 * final conversion band before the footer for kids-education startups, children's
 * e-learning platforms, tutoring services, and family learning apps. Renders
 * fully with no props via baked-in defaults.
 */
export const KidsEducationCta = defineCapsule({
  name: 'KidsEducationCta',
  description:
    "Dark closing call-to-action band for a kids / family learning platform: a full-width dark (foreground) section with soft gradient wash and blurred glow orbs behind a centered headline, supporting paragraph, dual rounded CTAs (filled primary with arrow + outlined play-icon secondary), and a small reassurance note. CTAs route through useNavigate. Use as the final conversion band before the footer for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Section headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to Start the Adventure?'
    const description =
      props.description ??
      'Join 50,000+ families who have made learning a joyful daily ritual. Start your free 14-day trial today—no credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const secondaryCta = props.secondaryCta ?? 'Watch Demo'
    const note =
      props.note ?? 'Used by families in 35+ countries. Cancel anytime.'

    const ArrowRight = ({ className }) => (
      <svg
        className={className}
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
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
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
        <circle cx="12" cy="12" r="9" />
        <path d="M10 9l4 3-4 3V9z" fill="currentColor" />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-24 text-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10"
        />
        <div
          aria-hidden="true"
          className="absolute left-0 top-0 size-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-0 right-0 size-96 rounded-full bg-secondary/20 blur-3xl"
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-background/70">
            {description}
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
              <ArrowRight />
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-background/20 bg-background/10 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/20"
            >
              <PlayIcon />
              {secondaryCta}
            </button>
          </div>
          <p className="mt-8 text-sm text-background/60">{note}</p>
        </div>
      </section>
    )
  },
})
