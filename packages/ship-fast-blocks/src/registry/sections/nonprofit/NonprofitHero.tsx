import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'

/**
 * NonprofitHero — warm 2-column hero band for a nonprofit / charity landing
 * page. On a light neutral canvas: a left column with an uppercase eyebrow, a
 * large headline with one highlighted phrase in the brand color, a supporting
 * paragraph, dual pill CTAs (filled Donate + outlined Explore), and a row of
 * check-marked trust badges; on the right, a rounded hero photo with a floating
 * quote card overlapping its bottom-left corner. Editorial, compassionate,
 * donor-focused. CTAs route through useNavigate. Use as the opening hero for
 * nonprofits, charities, NGOs, foundations, or humanitarian campaigns. Renders
 * fully with no props via baked-in "Roots of Hope" defaults.
 */
export const NonprofitHero = defineCapsule({
  name: 'NonprofitHero',
  description:
    'Warm 2-column hero band for a nonprofit / charity landing page on a light neutral canvas: a left column with an uppercase eyebrow, a large headline with one highlighted phrase in the brand color, a supporting paragraph, dual pill CTAs (filled Donate + outlined Explore), and a row of check-marked trust badges; on the right a rounded hero photo with a floating quote card overlapping its bottom-left corner. Editorial, compassionate and donor-focused; CTAs route through useNavigate. Use as the opening hero for nonprofits, charities, NGOs, foundations, or humanitarian campaigns.',
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Heading text before the highlighted phrase. */
    headingBefore: z.string().optional(),
    /** Phrase rendered with the brand highlight color inside the headline. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Check-marked trust badges beneath the CTAs. */
    badges: z.array(z.string()).optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating quote card text. */
    quote: z.string().optional(),
    /** Floating quote card attribution. */
    quoteAuthor: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Established 2008 • Global Impact'
    const headingBefore = props.headingBefore ?? 'Planting seeds of change for'
    const highlight = props.highlight ?? 'brighter tomorrows'
    const subheading =
      props.subheading ??
      "Roots of Hope empowers underserved communities through education, sustainable development, and compassionate support. Together, we've touched over 50,000 lives across 12 countries."
    const primaryCta = props.primaryCta ?? 'Make a Donation'
    const secondaryCta = props.secondaryCta ?? 'Explore Our Programs'
    const badges = props.badges?.length
      ? props.badges
      : ['501(c)(3) Certified', '4-Star Charity Navigator']
    const imageAlt =
      props.imageAlt ??
      'Group of children in a classroom smiling and raising their hands enthusiastically'
    const quote =
      props.quote ?? 'Every child deserves the chance to learn and dream.'
    const quoteAuthor = props.quoteAuthor ?? '— Maria Santos, Program Director'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const CheckCircle = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
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
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 lg:px-8 lg:pb-32 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <Eyebrow
                variant="text"
                className="mb-4 text-sm tracking-wider text-muted-foreground"
              >
                {eyebrow}
              </Eyebrow>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingBefore}{' '}
                <span className="text-primary">{highlight}</span>
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-card px-8 py-4 text-base font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {badges.map((badge) => (
                  <div key={badge} className="flex items-center gap-2">
                    <CheckCircle className="size-5 text-primary" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <Card
                padding="sm"
                shadow="lg"
                className="absolute -bottom-6 -left-6 max-w-xs p-5"
              >
                <p className="text-sm font-medium text-card-foreground">
                  &ldquo;{quote}&rdquo;
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {quoteAuthor}
                </p>
              </Card>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
