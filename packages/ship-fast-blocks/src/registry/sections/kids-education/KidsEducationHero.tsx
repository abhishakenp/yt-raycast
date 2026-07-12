import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * KidsEducationHero — bright, playful split hero for a kids / family learning
 * platform. Left side: a live-learners pill with a pulsing dot, a bold headline
 * with a gradient "adventure" highlight, a supporting paragraph, dual rounded
 * CTAs (filled primary with arrow + outlined play-icon secondary), and an
 * inline trust-points row with check icons. Right side: a large rounded hero
 * photo with a soft overlay plus two floating cards — a star-rating card anchored
 * bottom-left and an avatar-stack "+2k today" card anchored top-right. Decorative
 * blurred glow orbs sit behind everything. Every CTA routes through useNavigate.
 * Use as the opening hero for kids-education startups, children's e-learning,
 * family learning apps, and playful course platforms. Renders fully with no
 * props via baked-in "WonderLearn" defaults.
 */
export const KidsEducationHero = defineCapsule({
  name: 'KidsEducationHero',
  description:
    "Bright, playful split hero for a kids / family learning platform: left side with a live-learners pill (pulsing dot), bold headline with a gradient 'adventure' highlight, supporting paragraph, dual rounded CTAs (filled primary with arrow + outlined play-icon secondary), and an inline trust-points row with check icons; right side has a large rounded hero photo with soft overlay plus two floating cards (a star-rating card bottom-left and an avatar-stack '+2k today' card top-right). Decorative blurred glow orbs sit behind. CTAs route through useNavigate. Use as the opening hero for kids-education startups, children's e-learning, family learning apps, and playful course platforms.",
  props: z.object({
    /** Live-learners status pill text. */
    badge: z.string().optional(),
    /** First heading line (before the highlight). */
    headingTop: z.string().optional(),
    /** Phrase rendered with the amber-green gradient highlight. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the large hero photo. */
    imageAlt: z.string().optional(),
    /** Floating rating-card headline value. */
    ratingValue: z.string().optional(),
    /** Floating rating-card sub-label. */
    ratingLabel: z.string().optional(),
    /** Avatar-stack card badge text. */
    avatarBadge: z.string().optional(),
    /** Trust-points row beneath the CTAs. */
    trustPoints: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Join 50,000+ happy learners'
    const headingTop = props.headingTop ?? 'Learning is an'
    const highlight = props.highlight ?? 'adventure'
    const subheading =
      props.subheading ??
      'Engaging, play-based activities designed for curious minds ages 4-12. Science experiments, art projects, coding games, and more—delivered daily.'
    const primaryCta = props.primaryCta ?? 'Start Free 14-Day Trial'
    const secondaryCta = props.secondaryCta ?? 'See Activities'
    const imageAlt =
      props.imageAlt ??
      'Happy children doing a hands-on science experiment with colorful liquids in a bright classroom'
    const ratingValue = props.ratingValue ?? '4.9/5 Rating'
    const ratingLabel = props.ratingLabel ?? 'From 12,000+ parents'
    const avatarBadge = props.avatarBadge ?? '+2k today'
    const trustPoints = props.trustPoints?.length
      ? props.trustPoints
      : ['No credit card required', 'Cancel anytime']

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

    const CheckCircle = ({ className }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10 opacity-70"
        />
        <div
          aria-hidden="true"
          className="absolute left-10 top-20 size-72 rounded-full bg-primary/20 opacity-30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute bottom-20 right-10 size-96 rounded-full bg-secondary/20 opacity-30 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="text-center lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                <span className="size-2 animate-pulse rounded-full bg-secondary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <h1 className="mb-6 text-4xl font-bold leading-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {highlight}
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl lg:mx-0">
                {subheading}
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row lg:justify-start">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="flex items-center justify-center gap-2 rounded-full bg-foreground px-8 py-4 font-semibold text-background shadow-lg transition-all hover:bg-foreground/90"
                >
                  {primaryCta}
                  <ArrowRight />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-border bg-card px-8 py-4 font-semibold text-foreground transition-all hover:border-foreground/20 hover:bg-muted"
                >
                  <PlayIcon />
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-8 flex items-center justify-center gap-6 text-sm text-muted-foreground lg:justify-start">
                {trustPoints.map((point) => (
                  <div key={point} className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-secondary" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={600}
                  loading="eager"
                  className="h-auto w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 flex items-center gap-3 rounded-2xl bg-card p-4 shadow-xl">
                <div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-card-foreground">
                    {ratingValue}
                  </p>
                  <p className="text-sm text-muted-foreground">{ratingLabel}</p>
                </div>
              </div>
              <div className="absolute -right-4 -top-4 rounded-2xl bg-card p-4 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {[
                      'Happy child learning',
                      'Smiling young learner',
                      'Excited student',
                    ].map((a) => (
                      <Image
                        key={a}
                        alt={a}
                        w={100}
                        h={100}
                        className="size-8 rounded-full border-2 border-card object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">
                    {avatarBadge}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
