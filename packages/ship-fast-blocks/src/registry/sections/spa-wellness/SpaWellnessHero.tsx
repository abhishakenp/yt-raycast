import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroCtas,
} from '#/section-kit/HeroSection.tsx'

/**
 * SpaWellnessHero — tranquil full-bleed hero for a day-spa / wellness landing
 * page. A serene treatment-room or natural-element photograph fills the band
 * under a soft token-based overlay so light serif text reads cleanly. Centered
 * content stacks an uppercase eyebrow, a large serif headline, a calming
 * supporting paragraph, dual CTAs (filled "Book a Treatment" + outlined "View
 * Menu"), and a divider-separated hours / location strip beneath. CTAs route
 * through useNavigate. Use as the opening hero for spas, wellness retreats,
 * massage and facial studios, and bathhouses. Renders fully with no props.
 */
export const SpaWellnessHero = defineCapsule({
  name: 'SpaWellnessHero',
  description:
    "Tranquil full-bleed hero for a day-spa / wellness landing page: a serene treatment-room or natural-element photo fills the band under a soft token-based overlay so light serif text stays readable. Centered content has an uppercase eyebrow, a large serif headline, a calming supporting paragraph, dual CTAs (filled 'Book a Treatment' + outlined 'View Menu'), and a divider-separated hours / location strip. CTAs route through useNavigate. Use as the opening hero for spas, wellness retreats, massage and facial studios, and bathhouses.",
  props: z.object({
    /** Small uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large serif headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    /** Opening hours line in the info strip. */
    hours: z.string().optional(),
    /** Address line in the info strip. */
    location: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Rest · Restore · Renew'
    const heading = props.heading ?? 'A calm escape for body and mind'
    const subheading =
      props.subheading ??
      'Step into a sanctuary of warm stone, soft light, and skilled hands. Our therapists craft each treatment around how you want to feel when you leave.'
    const primaryCta = props.primaryCta ?? 'Book a Treatment'
    const primaryTarget = props.primaryTarget ?? 'Booking'
    const secondaryCta = props.secondaryCta ?? 'View Menu'
    const secondaryTarget = props.secondaryTarget ?? 'Treatments'
    const imageAlt =
      props.imageAlt ??
      'serene candlelit spa treatment room with soft towels, smooth stones, and a tranquil natural palette'
    const hours = props.hours ?? 'Open Daily · 9am–8pm'
    const location = props.location ?? '12 Willow Lane, Sausalito'

    const infoItems = [hours, location].filter(Boolean)

    return (
      <HeroSection variant="full-bleed" className={props.className}>
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/50"
          gradientClassName="bg-gradient-to-t from-foreground/60 via-foreground/20 to-foreground/40"
        />

        <HeroContent className="mx-auto flex max-w-7xl flex-col items-center px-6 pb-28 pt-36 text-center sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <HeroBadge variant="pill">{eyebrow}</HeroBadge>

          <HeroHeading variant="serif">{heading}</HeroHeading>

          <HeroSubheading variant="light">{subheading}</HeroSubheading>

          <HeroCtas className="mt-10 flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/10 px-8 py-4 font-medium text-background backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              {secondaryCta}
            </button>
          </HeroCtas>

          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-background/80">
            {infoItems.map((item, i) => (
              <div key={item} className="flex items-center gap-x-4">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="hidden h-4 w-px bg-background/30 sm:block"
                  />
                )}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </HeroContent>
      </HeroSection>
    )
  },
})
