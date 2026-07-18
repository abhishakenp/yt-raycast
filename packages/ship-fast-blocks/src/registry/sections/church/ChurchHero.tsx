import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroHeading,
  HeroSubheading,
  HeroActions,
} from '#/section-kit/HeroSection.tsx'

/**
 * ChurchHero — centered, image-backed hero section for a church or faith-community
 * landing page. A generous top-padded section with a soft background Image, an
 * established-since eyebrow, a two-tone headline, supporting paragraph, dual pill
 * CTAs (filled primary + outlined secondary), and an inline service-time + address
 * strip beneath. Warm, inviting, and conversion-focused. CTAs route through
 * useNavigate. Use as the opening hero for churches, worship centers, ministries,
 * or religious nonprofits. Renders fully with no props via baked-in defaults.
 */
export const ChurchHero = defineCapsule({
  name: 'ChurchHero',
  description:
    'Centered, image-backed hero section for a church or faith-community landing page: generous top padding over a soft background photo with gradient overlay, an established-since eyebrow, a two-tone headline (primary + muted accent line), supporting paragraph, dual pill CTAs (filled primary + outlined secondary), and an inline service-time + address strip beneath. Warm, inviting, and conversion-focused; CTAs route through useNavigate. Use as the opening hero for churches, worship centers, ministries, or religious nonprofits.',
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** First headline line (rendered in foreground color). */
    headingTop: z.string().optional(),
    /** Second headline line (rendered in muted foreground color). */
    headingBottom: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Service-time line shown in the bottom strip. */
    serviceTime: z.string().optional(),
    /** Address line shown in the bottom strip. */
    address: z.string().optional(),
    /** Alt text for the background hero image. */
    imageAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Est. 1987 • Portland, Oregon'
    const headingTop = props.headingTop ?? 'A place to belong,'
    const headingBottom = props.headingBottom ?? 'believe, and become.'
    const subheading =
      props.subheading ??
      "We're a welcoming community of faith, hope, and love. Whether you're exploring spirituality for the first time or looking for a church home, there's a seat for you here."
    const primaryCta = props.primaryCta ?? 'Plan Your Visit'
    const secondaryCta = props.secondaryCta ?? 'Watch Live'
    const serviceTime = props.serviceTime ?? 'Sundays at 9:00 & 11:00 AM'
    const address = props.address ?? '4521 NE Glisan Street'
    const imageAlt =
      props.imageAlt ??
      'Sunlight streaming through tall church windows creating warm golden rays'

    return (
      <HeroSection
        variant="full-bleed"
        className={cn('pt-20 pb-20 lg:pt-28 lg:pb-28', props.className)}
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10">
          <Image
            alt={imageAlt}
            w={1920}
            h={1080}
            className="size-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>
        <HeroContent className="mx-auto max-w-4xl px-6 text-center lg:px-8">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted-foreground">
            {eyebrow}
          </p>
          <HeroHeading className="mb-6 font-medium">
            {headingTop}
            <br />
            <span className="text-muted-foreground">{headingBottom}</span>
          </HeroHeading>
          <HeroSubheading variant="large" className="sm:text-lg">
            {subheading}
          </HeroSubheading>
          <HeroActions className="mt-0 flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center rounded-full bg-primary px-8 py-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryCta)}
              className="inline-flex items-center rounded-full border border-border bg-card px-8 py-4 text-sm font-medium text-card-foreground transition-colors hover:bg-accent"
            >
              <svg
                className="mr-2 size-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              {secondaryCta}
            </button>
          </HeroActions>
          <div className="mt-16 flex items-center justify-center gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{serviceTime}</span>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <svg
                className="size-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span>{address}</span>
            </div>
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
