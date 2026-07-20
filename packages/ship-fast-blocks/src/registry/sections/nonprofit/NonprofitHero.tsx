import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  HeroSection,
  HeroStatBadge,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NonprofitHero — warm mission-editorial asymmetric 7/5 hero for a nonprofit /
 * charity landing page. On a soft layered muted wash with two giant faint halo
 * rings drifting off the corner: a left column with a mono micro-label eyebrow,
 * a large serif mission headline whose closing phrase is accented in the primary
 * color, a compassionate supporting paragraph, a square filled-primary "Make a
 * Donation" CTA (the one accent moment, with press feedback and a trailing
 * arrow) beside a square hairline outline "Explore" link, and a hairline ledger
 * row of check certifications with primary tick dashes; on the right a
 * documentary hero photo in a hairline offset double frame with a square
 * quote card overlapping its bottom-left corner. Warm, human, donor-focused —
 * not corporate. CTAs route through section-kit route links; imagery uses the
 * alt-driven Image component. Use as the opening hero for nonprofits, charities,
 * NGOs, foundations, or humanitarian campaigns. Renders fully with no props via
 * baked-in "Roots of Hope" defaults.
 */
export const NonprofitHero = defineCapsule({
  name: 'NonprofitHero',
  description:
    'Warm mission-editorial asymmetric 7/5 hero for a nonprofit / charity landing page on a soft layered muted wash with two giant faint halo rings: a left column with a mono micro-label eyebrow, a large serif mission headline whose closing phrase is accented in the primary color, a compassionate supporting paragraph, a square filled-primary "Make a Donation" CTA (the one accent moment, with press feedback and trailing arrow) beside a square hairline outline "Explore" link, and a hairline ledger row of check certifications with primary tick dashes; on the right a documentary hero photo in a hairline offset double frame with a square quote card overlapping its bottom-left corner. Warm, human, donor-focused — not corporate. CTAs route through section-kit route links; imagery uses the alt-driven Image component. Use as the opening hero for nonprofits, charities, NGOs, foundations, or humanitarian campaigns.',
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

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden border-b border-border bg-gradient-to-b from-muted/50 via-background to-muted/30',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -right-40 -top-48 size-[40rem] rounded-full border border-primary/15" />
          <span className="absolute -right-12 -top-24 size-[26rem] rounded-full border border-foreground/10" />
        </div>
        <Container size="xl" className="relative pb-20 pt-16 lg:pb-28 lg:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2.5 border border-border bg-background/70 px-3.5 py-2">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                <MonoTag>{eyebrow}</MonoTag>
              </div>
              <h1 className="mb-6 max-w-2xl font-serif text-[clamp(2.5rem,6vw,4.25rem)] font-medium leading-[1.03] tracking-tight text-foreground">
                {headingBefore}{' '}
                <span className="text-primary">{highlight}</span>
              </h1>
              <p className="mb-9 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  href={primaryCta}
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="inline-flex items-center justify-center rounded-none border border-foreground/25 bg-background px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted active:translate-y-px focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <div className="mt-12 grid max-w-xl grid-cols-1 gap-0 border-t border-border sm:grid-cols-2">
                {badges.map((badge) => (
                  <div
                    key={badge}
                    className="flex items-center gap-3 border-b border-border py-3.5 text-sm text-muted-foreground sm:border-b-0 sm:pr-4"
                  >
                    <span
                      aria-hidden="true"
                      className="h-px w-4 shrink-0 bg-primary"
                    />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -inset-3 border border-border sm:-inset-4"
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-none border border-border bg-muted">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-3 max-w-xs rounded-none border-border p-5 shadow-none sm:-left-8">
                <HeroStatBadgeTitle className="font-serif text-base font-normal italic leading-snug">
                  &ldquo;{quote}&rdquo;
                </HeroStatBadgeTitle>
                <HeroStatBadgeSubtitle className="mt-2 font-mono text-[11px] uppercase tracking-[0.12em]">
                  {quoteAuthor}
                </HeroStatBadgeSubtitle>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
