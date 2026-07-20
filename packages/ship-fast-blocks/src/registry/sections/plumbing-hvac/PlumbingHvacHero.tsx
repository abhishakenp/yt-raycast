import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBackgroundImage,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PlumbingHvacHero — full-bleed, image-forward trade-industrial hero for a
 * local plumbing & HVAC site built around the 24/7 emergency angle. A single
 * photo of a uniformed technician at work fills the band edge to edge under a
 * token-based dark overlay so light text reads cleanly on top, with a giant
 * ghost "24/7" watermark bleeding off the right edge. Left-anchored content
 * stacks a mono index eyebrow rule, a squared uppercase "24/7 Emergency
 * Service" chip with a live status dot, a giant extrabold slab headline, a
 * supporting paragraph, dual squared CTAs with press feedback (filled "Call
 * Now" + outlined translucent "Book Online"), and a collapsed-border trust
 * ledger of mono badges (Licensed, Insured, years in business, star rating).
 * CTAs route through section-kit route links. Use as the opening hero for
 * plumbers, HVAC contractors, drain/sewer pros, and water-heater installers.
 * Renders fully with no props via baked-in defaults.
 */
export const PlumbingHvacHero = defineCapsule({
  name: 'PlumbingHvacHero',
  description:
    "Full-bleed image-forward trade-industrial hero for a local plumbing & HVAC site built around the 24/7 emergency angle: a photo of a uniformed technician at work fills the band edge to edge under a token-based dark overlay with a giant ghost '24/7' watermark so light text stays readable. Content has a mono index eyebrow rule, a squared uppercase '24/7 Emergency Service' chip with a live status dot, a giant extrabold slab headline, a supporting paragraph, dual squared CTAs with press feedback (filled 'Call Now' + outlined translucent 'Book Online'), and a collapsed-border trust ledger of mono badges (Licensed, Insured, years in business, star rating). CTAs route through section-kit route links. Use as the opening hero for plumbers, HVAC contractors, drain/sewer pros, and water-heater installers.",
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
      <HeroSection
        variant="full-bleed"
        className={cn('overflow-hidden', props.className)}
      >
        <HeroBackgroundImage
          alt={imageAlt}
          overlayClassName="bg-foreground/60"
          gradientClassName="bg-gradient-to-r from-foreground/85 via-foreground/55 to-foreground/25"
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-6 top-24 z-0 select-none font-mono text-[9rem] font-extrabold leading-none tracking-tighter text-background/[0.06] sm:text-[13rem] lg:-right-10 lg:text-[18rem]"
        >
          24/7
        </span>

        <Container asChild>
          <HeroContent className="flex flex-col items-start pb-28 pt-36 text-left sm:pt-40 lg:pb-32 lg:pt-48">
            <div className="mb-6 flex w-full max-w-md items-center gap-3 border-b-2 border-background/40 pb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-background/70">
              <span className="tabular-nums text-background">[ 01 ]</span>
              <span>Emergency Line</span>
              <span
                aria-hidden="true"
                className="ml-auto hidden tabular-nums text-background/60 sm:inline"
              >
                ON CALL
              </span>
            </div>

            <HeroBadge
              variant="pill"
              className="gap-2 rounded-none border-background/40 bg-background/10 font-mono font-semibold"
            >
              <span
                aria-hidden="true"
                className="size-2 animate-pulse rounded-full bg-primary"
              />
              {eyebrow}
            </HeroBadge>

            <HeroHeading className="mt-8 max-w-3xl text-balance text-5xl font-extrabold leading-[0.95] tracking-tight text-background sm:text-6xl lg:text-7xl">
              {heading}
            </HeroHeading>

            <HeroSubheading variant="light">{subheading}</HeroSubheading>

            <HeroActions className="mt-10 w-full flex-col gap-4 sm:w-auto sm:flex-row">
              <HeroCta
                asChild
                variant="none"
                className="rounded-none bg-primary px-8 py-4 font-semibold text-primary-foreground transition-all duration-150 hover:bg-primary/90 active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={primaryTarget}>
                  {primaryCta}
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="none"
                className="rounded-none border-2 border-background bg-background/10 px-8 py-4 font-semibold text-background backdrop-blur-sm transition-all duration-150 hover:bg-background hover:text-foreground active:translate-y-px motion-reduce:transform-none"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            <div className="mt-12 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className="inline-flex items-center gap-2 rounded-none border-2 border-background/40 bg-background/10 px-3.5 py-2 font-mono text-xs uppercase tracking-[0.1em] text-background backdrop-blur-sm"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-primary"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {badge}
                </span>
              ))}
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
