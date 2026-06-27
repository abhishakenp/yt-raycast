import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceHero — split-layout hero section for a home-cleaning / maid-service landing page. A muted-band background with a left text column (trust pill with checkmark icon, bold multi-line headline with an accent-colored highlight phrase, supporting paragraph, dual pill CTAs, and three trust badges with checkmarks) and a right image column (showcase photo with a floating star-rating card that overlaps the image edge, showing stacked avatars + a star icon + rating value + review count). Every CTA routes through useNavigate. Use as the primary above-the-fold hero for residential cleaning companies, maid services, housekeeping platforms, or local home-service brands. Renders fully with no props via baked-in "PureSpace" defaults.
 */
export const CleaningServiceHero = defineCapsule({
  name: 'CleaningServiceHero',
  description:
    'Split-layout hero section for a home-cleaning / maid-service landing page: muted-band background with left text column (trust pill with checkmark, bold multi-line headline with accent-colored highlight, supporting paragraph, dual pill CTAs, three trust badges) and right image column (showcase photo with floating star-rating card showing stacked avatars, star icon, and review count). CTAs route through useNavigate. Use as the primary hero for residential cleaning, maid services, housekeeping, or local home-service brands.',
  props: z.object({
    /** Trust-pill text above the headline. */
    badge: z.string().optional(),
    /** First line of the headline. */
    headingTop: z.string().optional(),
    /** Accent-colored phrase in the headline. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the showcase hero photo. */
    imageAlt: z.string().optional(),
    /** Star-rating value shown in the floating card. */
    rating: z.string().optional(),
    /** Review-count note under the rating. */
    ratingNote: z.string().optional(),
    /** Trust badges beneath the CTAs. */
    trustBadges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const badge = props.badge ?? 'Trusted by 10,000+ homes in Seattle'
    const headingTop = props.headingTop ?? 'A cleaner home,'
    const highlight = props.highlight ?? 'without the stress.'
    const subheading =
      props.subheading ??
      'Professional cleaning services tailored to your schedule. From deep cleans to weekly maintenance, our vetted, insured cleaners bring sparkle to every room.'
    const primaryCta = props.primaryCta ?? 'Book Your Cleaning'
    const secondaryCta = props.secondaryCta ?? 'View Pricing'
    const imageAlt =
      props.imageAlt ??
      'Professional cleaner in apron wiping kitchen counter with spray bottle in bright modern home'
    const rating = props.rating ?? '4.9'
    const ratingNote = props.ratingNote ?? 'From 2,847 reviews'
    const trustBadges = props.trustBadges?.length
      ? props.trustBadges
      : ['Vetted Cleaners', 'Insured & Bonded', 'Satisfaction Guarantee']

    const CheckCircle = () => (
      <svg
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const Star = () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className="text-primary"
        aria-hidden="true"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    )

    return (
      <section className={cn('relative bg-muted/40', props.className)}>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                <CheckCircle />
                {badge}
              </div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {headingTop}
                <br />
                <span className="text-primary">{highlight}</span>
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <LocalServiceBookingButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  service="Home cleaning"
                  source="hero"
                  pendingChildren={
                    <LocalServiceMutationSpinner className="text-primary-foreground" />
                  }
                  className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </LocalServiceBookingButton>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {trustBadges.map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <span className="text-primary">
                      <CheckCircle />
                    </span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 hidden rounded-xl bg-card p-4 shadow-xl sm:block sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-3">
                    <Image
                      alt="professional headshot of a smiling woman with dark hair"
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-card object-cover"
                    />
                    <Image
                      alt="professional headshot of a smiling man with short brown hair"
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-card object-cover"
                    />
                    <Image
                      alt="professional headshot of a smiling woman with blonde hair"
                      w={100}
                      h={100}
                      className="size-10 rounded-full border-2 border-card object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <Star />
                      <span className="font-semibold text-card-foreground">
                        {rating}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {ratingNote}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
