import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MarketingAgencyHero — split, conversion-focused hero for a growth / marketing
 * agency. A two-column layout on a light neutral canvas: left column holds a
 * small eyebrow, a large semibold headline with a muted-highlight phrase, a
 * supporting paragraph, dual rounded-pill CTAs (filled primary with arrow +
 * outlined secondary), and inline trust checkmarks; right column shows a rounded
 * team photo with a floating ROI stat card overlapping its lower-left corner.
 * Links route through useNavigate. Use as the top hero for marketing / growth
 * agencies, SEO / paid-ads shops, or B2B SaaS growth firms. Renders with no props.
 */
export const MarketingAgencyHero = defineCapsule({
  name: 'MarketingAgencyHero',
  description:
    'Split, conversion-focused hero for a growth / marketing agency: a two-column layout on a light neutral canvas with a small eyebrow, a large semibold headline featuring a muted-highlight phrase, a supporting paragraph, dual rounded-pill CTAs (filled primary with arrow + outlined secondary), and inline trust checkmarks on the left; a rounded team photo with a floating ROI stat card overlapping its lower-left corner on the right. Links route through useNavigate. Use as the top hero for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.',
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
    const go = useNavigate()
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
        className={cn(
          'relative overflow-hidden bg-background text-foreground',
          props.className,
        )}
      >
        <Container size="xl" className="py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <p className="mb-4 text-sm font-medium text-muted-foreground">
                {eyebrow}
              </p>
              <HeroHeading className="mb-6 font-semibold">
                {headingBefore}{' '}
                <HeroHighlight className="text-muted-foreground">
                  {highlight}
                </HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="mb-8 mt-0">
                {subheading}
              </HeroSubheading>
              <HeroActions className="gap-4">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-full border border-border px-6 py-3 font-medium text-foreground transition-all hover:border-foreground/40"
                >
                  {secondaryCta}
                </button>
              </HeroActions>
              <HeroSocialProof className="mt-10 gap-6">
                {trust.map((t) => (
                  <HeroSocialProofItem key={t}>
                    <Check className="size-5 text-primary" />
                    <span>{t}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                rounded="xl"
                className="w-full shadow-lg"
              />
              <div className="absolute -bottom-6 -left-6 rounded-xl bg-card p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-6"
                      aria-hidden="true"
                    >
                      <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-card-foreground">
                      {statValue}
                    </p>
                    <p className="text-xs text-muted-foreground">{statLabel}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
