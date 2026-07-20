import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CorporateHero — Swiss-corporate asymmetric 7/5 hero for a corporate B2B
 * marketing page. Opens with a hairline mono meta rule (primary index square +
 * trust badge text left, ghost index numeral right), then a strict 12-column
 * split: left column carries a giant clamped display headline, supporting
 * lede, dual square-edged CTAs with press feedback, and SOC 2 / ISO
 * compliance marks as mono micro-labels with primary tick squares; the right
 * column holds a hairline-framed showcase photo with an offset ghost frame
 * (the section's calculated rupture) and a square stat plate breaching the
 * photo's bottom-left edge. All CTAs route through section-kit route links.
 * Use as the opening hero for enterprise software, cloud infrastructure, IT
 * consultancies, or any corporate site that needs Fortune 500 credibility.
 */
export const CorporateHero = defineCapsule({
  name: 'CorporateHero',
  description:
    'Swiss-corporate asymmetric 7/5 hero for a corporate B2B marketing page: a hairline mono meta rule (primary index square + trust badge text) above a 12-column split — giant clamped display headline, lede, dual square-edged CTAs with press feedback, and SOC 2 / ISO compliance mono micro-labels on the left; a hairline-framed showcase photo with an offset ghost frame and a square stat plate breaching its bottom-left edge on the right. CTAs route through section-kit route links. Use as the opening hero for enterprise software, cloud infrastructure, IT consultancies, or any corporate site.',
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

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-background',
          props.className,
        )}
      >
        <Container size="xl" className="relative py-14 sm:py-20 lg:py-28">
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-14">
            <span className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
              <span className="truncate">{heroBadge}</span>
            </span>
            <span
              aria-hidden="true"
              className="shrink-0 tabular-nums text-muted-foreground/60"
            >
              01 / Overview
            </span>
          </div>

          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7 lg:pr-6">
              <h1 className="text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-tight text-foreground">
                {heroHeading}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {heroSub}
              </p>
              <div className="mt-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none bg-primary px-7 py-3.5 text-base font-medium text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px"
                  href={heroPrimary}
                >
                  {heroPrimary}
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-none border border-border bg-background px-7 py-3.5 text-base font-medium text-foreground transition-all duration-150 hover:bg-muted active:translate-y-px"
                  href={heroSecondary}
                >
                  {heroSecondary}
                </NavbarRouteLink>
              </div>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-border pt-5">
                {heroBadges.map((b) => (
                  <span
                    key={b}
                    className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                  >
                    <span
                      aria-hidden="true"
                      className="size-1.5 shrink-0 bg-primary"
                    />
                    {b}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 -top-3 hidden size-full border border-border sm:block"
              />
              <Image
                alt={heroImageAlt}
                w={800}
                h={600}
                loading="eager"
                className="relative aspect-[4/3] w-full rounded-none border border-border object-cover"
              />
              <HeroStatBadge className="absolute -bottom-6 -left-3 flex items-center gap-3 rounded-none border-border bg-background p-4 shadow-none sm:-left-6">
                <HeroStatBadgeIcon className="rounded-none bg-foreground text-background">
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
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeSubtitle className="font-mono text-[10px] uppercase tracking-[0.16em]">
                    {heroStatLabel}
                  </HeroStatBadgeSubtitle>
                  <HeroStatBadgeTitle className="text-xl font-semibold tabular-nums tracking-tight">
                    {heroStatValue}
                  </HeroStatBadgeTitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
