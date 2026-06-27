import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * PlumbingHvacHero — full-bleed, image-forward hero for a local plumbing & HVAC
 * trade site built around the 24/7 emergency angle. A single photo of a
 * uniformed technician at work fills the band edge to edge under a token-based
 * dark overlay so light text reads cleanly on top. Left-anchored content stacks
 * an uppercase "24/7 Emergency Service" eyebrow pill, a large headline, a
 * supporting paragraph, dual CTAs (filled "Call Now" + outlined translucent
 * "Book Online"), and a trust-badge row (Licensed, Insured, years in business,
 * star rating). CTAs route through useNavigate. Use as the opening hero for
 * plumbers, HVAC contractors, drain/sewer pros, and water-heater installers.
 * Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacHero = defineCapsule({
  name: 'PlumbingHvacHero',
  description:
    "Full-bleed image-forward hero for a local plumbing & HVAC trade site built around the 24/7 emergency angle: a photo of a uniformed technician at work fills the band edge to edge under a token-based dark overlay so light text stays readable. Content has an uppercase '24/7 Emergency Service' eyebrow pill, a large headline, a supporting paragraph, dual CTAs (filled 'Call Now' + outlined translucent 'Book Online'), and a trust-badge row (Licensed, Insured, years in business, star rating). CTAs route through useNavigate. Use as the opening hero for plumbers, HVAC contractors, drain/sewer pros, and water-heater installers.",
  props: z.object({
    /** Small uppercase eyebrow pill above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label (call-to-action). */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Alt text driving the full-bleed hero photo. */
    imageAlt: z.string().optional(),
    /** Short trust badges rendered as a pill row below the CTAs. */
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? '24/7 Emergency Service'
    const heading =
      props.heading ?? 'Fast, reliable plumbing & HVAC — any hour, any day'
    const subheading =
      props.subheading ??
      'Burst pipe at 2am? AC down in a heatwave? Our licensed technicians arrive on time, fix it right the first time, and leave your home cleaner than we found it. Upfront pricing, no surprises.'
    const primaryCta = props.primaryCta ?? 'Call Now'
    const primaryTarget = props.primaryTarget ?? 'Contact'
    const secondaryCta = props.secondaryCta ?? 'Book Online'
    const secondaryTarget = props.secondaryTarget ?? 'Contact'
    const imageAlt =
      props.imageAlt ??
      'uniformed plumbing and HVAC technician repairing equipment under a kitchen sink with a toolbox nearby'
    const badges = props.badges?.length
      ? props.badges
      : [
          'Licensed & Bonded',
          'Fully Insured',
          '20+ Years Experience',
          '4.9★ Rated',
        ]

    return (
      <section
        className={cn('relative isolate overflow-hidden', props.className)}
      >
        <Image
          alt={imageAlt}
          w={1920}
          h={1080}
          loading="lazy"
          className="absolute inset-0 -z-10 size-full object-cover"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-foreground/60"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-foreground/80 via-foreground/50 to-foreground/30"
        />

        <div className="mx-auto flex max-w-7xl flex-col items-start px-6 pb-28 pt-36 text-left sm:pt-40 lg:px-8 lg:pb-32 lg:pt-48">
          <span className="inline-flex items-center gap-2 rounded-full border border-background/30 bg-background/10 px-4 py-1.5 text-xs font-semibold tracking-[0.2em] text-background uppercase backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="size-2 animate-pulse rounded-full bg-primary"
            />
            {eyebrow}
          </span>

          <h1 className="mt-8 max-w-3xl text-4xl font-bold leading-tight tracking-tight text-background sm:text-5xl lg:text-6xl">
            {heading}
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-relaxed text-background/80 sm:text-lg">
            {subheading}
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(primaryTarget)}
              className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {primaryCta}
            </button>
            <button
              type="button"
              onClick={() => go(secondaryTarget)}
              className="inline-flex items-center justify-center rounded-full border border-border bg-card/10 px-8 py-4 font-semibold text-background backdrop-blur-sm transition-colors hover:bg-card/20"
            >
              {secondaryCta}
            </button>
          </div>

          <div className="mt-12 flex flex-wrap items-center gap-3">
            {badges.map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-2 rounded-full border border-background/20 bg-background/10 px-4 py-2 text-sm font-medium text-background backdrop-blur-sm"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-primary"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
