import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { HeroSection } from '#/section-kit/HeroSection.tsx'

/**
 * CorporateHero — split-layout enterprise hero section for a corporate B2B
 * marketing page. A white canvas with a muted band: left side holds a live
 * trust badge with a pulsing dot, a large multi-line headline, a supporting
 * paragraph, dual CTAs (filled primary + outlined secondary), and SOC 2 / ISO
 * compliance check-marks; right side shows a showcase photo with a floating
 * ROI stat card. Clean, authoritative, and conversion-focused. All CTAs route
 * through useNavigate. Use as the opening hero for enterprise software, cloud
 * infrastructure, IT consultancies, or any corporate site that needs Fortune 500
 * credibility.
 */
export const CorporateHero = defineCapsule({
  name: 'CorporateHero',
  description:
    'Split-layout enterprise hero section for a corporate B2B marketing page: left side with a live trust badge (pulsing dot), authoritative headline, supporting paragraph, dual CTAs, and SOC 2 / ISO compliance check-marks; right side with a showcase office photo and a floating ROI stat card. Clean, trustworthy, conversion-focused. CTAs route through useNavigate. Use as the opening hero for enterprise software, cloud infrastructure, IT consultancies, or any corporate site.',
  props: z.object({
    /** Trust badge text above the headline. */
    badge: z.string().optional(),
    /** Main headline text. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Compliance / trust check-mark labels under the CTAs. */
    badges: z.array(z.string()).optional(),
    /** Alt text for the hero showcase image. */
    imageAlt: z.string().optional(),
    /** Floating stat card label over the image. */
    statLabel: z.string().optional(),
    /** Floating stat card value over the image. */
    statValue: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heroBadge = props.badge ?? 'Trusted by 500+ Enterprise Clients'
    const heroHeading =
      props.heading ?? 'Enterprise infrastructure for the modern economy'
    const heroSub =
      props.subheading ??
      "Nexus delivers mission-critical cloud infrastructure, enterprise software, and digital transformation solutions that power the world's most demanding organizations. From Fortune 500 to high-growth startups."
    const heroPrimary = props.primaryCta ?? 'Schedule a Demo'
    const heroSecondary = props.secondaryCta ?? 'Explore Solutions'
    const heroBadges = props.badges?.length
      ? props.badges
      : ['SOC 2 Type II Certified', 'ISO 27001 Compliant']
    const heroImageAlt =
      props.imageAlt ??
      'Modern corporate office interior with glass walls and collaborative workspace'
    const heroStatLabel = props.statLabel ?? 'Average ROI'
    const heroStatValue = props.statValue ?? '340%'

    const Check = ({ className }: { className?: string }) => (
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
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden bg-muted/50', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-xs font-medium text-muted-foreground">
                  {heroBadge}
                </span>
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heroHeading}
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(heroPrimary)}
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {heroPrimary}
                </button>
                <button
                  type="button"
                  onClick={() => go(heroSecondary)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted"
                >
                  {heroSecondary}
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-6 pt-4 text-sm text-muted-foreground">
                {heroBadges.map((b) => (
                  <span key={b} className="flex items-center gap-2">
                    <Check className="size-5 text-primary" />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative">
              <Image
                alt={heroImageAlt}
                w={800}
                h={600}
                loading="eager"
                className="aspect-[4/3] w-full rounded-xl object-cover shadow-2xl"
              />
              <Card
                padding="sm"
                shadow="lg"
                className="absolute -bottom-6 -left-6 hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-lg bg-muted text-foreground">
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
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {heroStatLabel}
                    </p>
                    <p className="text-lg font-semibold text-card-foreground">
                      {heroStatValue}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
