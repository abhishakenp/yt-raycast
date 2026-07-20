import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketingAgencyHero — kinetic split hero for a growth / marketing agency. An
 * asymmetric 7:5 grid over a dot-grid wash and giant ghost "GROWTH" watermark:
 * the left column stacks a mono index eyebrow, a giant clamp-scaled extrabold
 * headline whose highlight phrase sits on a tilted primary marker block, a
 * supporting paragraph, dual square CTAs with hard offset shadows and mechanical
 * press feedback (filled primary with arrow + hairline secondary), and a mono
 * trust strip of checkmarks. The right column shows a sharp-cornered team photo
 * with a rotated hard-shadow ROI stat sticker overlapping its corner. Links route
 * through section-kit route links. Use as the top hero for marketing / growth
 * agencies, SEO / paid-ads shops, or B2B SaaS growth firms. Renders with no props.
 */
export const MarketingAgencyHero = defineCapsule({
  name: 'MarketingAgencyHero',
  description:
    'Kinetic split hero for a growth / marketing agency: an asymmetric 7:5 grid over a dot-grid wash and giant ghost GROWTH watermark, with a mono index eyebrow, a giant clamp-scaled extrabold headline whose highlight phrase sits on a tilted primary marker block, a supporting paragraph, dual square CTAs with hard offset shadows and press feedback, and a mono checkmark trust strip on the left; a sharp-cornered team photo with a rotated hard-shadow ROI stat sticker overlapping its corner on the right. Links route through section-kit route links. Use as the top hero for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    headingBefore: z.string().optional(),
    /** Phrase rendered with the muted highlight color. */
    highlight: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    /** Inline trust reassurances beside the CTAs. */
    trust: z.array(z.string()).optional(),
    imageAlt: z.string().optional(),
    /** Floating stat card over the hero image. */
    statValue: z.string().optional(),
    statLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Growth Marketing Agency'
    const headingBefore = props.headingBefore ?? 'Turn Visitors Into'
    const highlight = props.highlight ?? 'Loyal Customers'
    const subheading =
      props.subheading ??
      "We help B2B SaaS and e-commerce brands scale with data-driven marketing strategies. From SEO to paid acquisition, we've generated $47M+ in revenue for our clients since 2019."
    const primaryCta = props.primaryCta ?? 'Book a Free Strategy Call'
    const secondaryCta = props.secondaryCta ?? 'View Case Studies'
    const trust = props.trust?.length
      ? props.trust
      : ['No long-term contracts', 'Results in 90 days']
    const imageAlt =
      props.imageAlt ??
      'Marketing team collaborating in modern office workspace with laptops and analytics dashboards'
    const statValue = props.statValue ?? '340%'
    const statLabel = props.statLabel ?? 'Avg. ROI Increase'

    const Check = ({ className }: { className?: string }) => (
      <svg
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

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
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

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background text-foreground',
          props.className,
        )}
      >
        {/* Layered wash: dot grid fading right + giant ghost watermark. */}
        <DotGrid
          className="inset-y-0 left-0 w-2/3"
          fade="right"
          tone="border"
        />
        <Watermark className="-top-8 right-0 text-[7rem] sm:text-[12rem] lg:-top-12 lg:text-[18rem]">
          GROWTH
        </Watermark>
        <Container size="xl" className="relative py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-12">
            <div className="lg:col-span-7">
              <MonoTag className="mb-5 block">01 / {eyebrow}</MonoTag>
              <HeroHeading className="mb-6 text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground">
                {headingBefore}{' '}
                <HeroHighlight
                  variant={undefined}
                  className="relative ml-[0.12em] inline-block whitespace-nowrap text-foreground"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.04em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {highlight}
                  </span>
                </HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0 max-w-xl text-lg leading-relaxed">
                {subheading}
              </HeroSubheading>
              <HeroActions className="gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-none px-6 py-3.5 font-semibold shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={primaryCta}>
                    {primaryCta}
                    <ArrowRight className="ml-2 size-4" />
                  </NavbarRouteLink>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-none border-foreground px-6 py-3.5 font-semibold transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                >
                  <NavbarRouteLink href={secondaryCta}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-10 gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.14em]">
                {trust.map((t) => (
                  <HeroSocialProofItem key={t}>
                    <Check className="size-4 text-primary" />
                    <span>{t}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative -mx-2 sm:mx-0 lg:col-span-5">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="w-full rounded-none border border-foreground/80 shadow-[8px_8px_0_0] shadow-foreground/15"
              />
              {/* Rotated hard-shadow ROI stat sticker overlapping the corner. */}
              <div className="absolute -bottom-6 -left-4 rotate-2 border border-foreground bg-background p-4 shadow-[5px_5px_0_0] shadow-foreground sm:-left-6">
                <p className="text-3xl font-extrabold leading-none tracking-tight text-foreground tabular-nums">
                  {statValue}
                </p>
                <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {statLabel}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
