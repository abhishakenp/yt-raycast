import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ConsultingHero — two-column hero section for a management-consulting firm
 * landing page. An eyebrow pill, a large headline with a muted-highlight phrase,
 * a supporting paragraph, dual CTAs (filled primary + outlined secondary),
 * inline trust stats with check icons, and a hero photo with a floating
 * client-retention stat card. CTAs route through useNavigate. Use as the
 * opening hero for consulting firms, strategy advisories, professional-services
 * groups, or corporate B2B landing pages. Renders fully with no props via
 * baked-in "Nexus Strategy Partners" defaults.
 */
export const ConsultingHero = defineCapsule({
  name: 'ConsultingHero',
  description:
    'Two-column hero section for a management-consulting firm landing page: an eyebrow pill, a large headline with one phrase rendered in muted highlight, a supporting paragraph, dual CTAs (filled primary and outlined secondary), inline trust stats with check icons, and a hero photo with a floating client-retention stat card. CTAs route through useNavigate. Use as the opening hero for consulting firms, strategy advisories, professional-services groups, or corporate B2B landing pages.',
  props: z.object({
    /** Eyebrow pill text above the headline. */
    eyebrow: z.string().optional(),
    /** Main headline text. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered with muted highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Inline trust stats beneath the hero copy. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero photo. */
    imageAlt: z.string().optional(),
    /** Floating stat card value. */
    statValue: z.string().optional(),
    /** Floating stat card title. */
    statTitle: z.string().optional(),
    /** Floating stat card subtitle. */
    statSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Global Management Consulting'
    const heading =
      props.heading ?? 'Transforming Strategy into Sustainable Results'
    const highlight = props.highlight ?? 'Sustainable Results'
    const subheading =
      props.subheading ??
      'For 28 years, Nexus Strategy Partners has helped Fortune 500 companies and emerging leaders navigate complex challenges, unlock growth potential, and build enduring competitive advantage.'
    const primaryCta = props.primaryCta ?? 'Explore Our Services'
    const secondaryCta = props.secondaryCta ?? 'View Case Studies'
    const trust = props.trust?.length
      ? props.trust
      : ['850+ Clients Served', '24 Offices Worldwide']
    const imageAlt =
      props.imageAlt ??
      'Professional consultants collaborating around a conference table reviewing documents and data on laptops'
    const statValue = props.statValue ?? '92%'
    const statTitle = props.statTitle ?? 'Client Retention Rate'
    const statSubtitle = props.statSubtitle ?? 'Average 8-year partnership'

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )

    const renderHeading = () => {
      const idx = highlight ? heading.indexOf(highlight) : -1
      if (idx === -1) return heading
      return (
        <>
          {heading.slice(0, idx)}
          <span className="text-muted-foreground">{highlight}</span>
          {heading.slice(idx + highlight.length)}
        </>
      )
    }

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted', props.className)}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted"
        />
        <Container size="xl" className="relative py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-medium uppercase tracking-wide text-secondary-foreground">
                {eyebrow}
              </div>
              <HeroHeading>{renderHeading()}</HeroHeading>
              <HeroSubheading className="mt-0 max-w-2xl sm:text-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex-wrap gap-4">
                <HeroCta
                  asChild
                  variant="primary"
                  className="rounded-md px-6 py-3 text-base shadow-lg transition-all"
                >
                  <button type="button" onClick={() => go(primaryCta)}>
                    {primaryCta}
                  </button>
                </HeroCta>
                <HeroCta
                  asChild
                  variant="outline"
                  className="rounded-md px-6 py-3 text-base transition-all"
                >
                  <button type="button" onClick={() => go(secondaryCta)}>
                    {secondaryCta}
                  </button>
                </HeroCta>
              </HeroActions>
              <HeroSocialProof className="mt-0 gap-8 pt-4">
                {trust.map((t) => (
                  <HeroSocialProofItem key={t}>
                    <CheckIcon className="size-5 text-muted-foreground" />
                    <span>{t}</span>
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-2xl bg-secondary/60"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                rounded="xl"
                className="relative aspect-[4/3] w-full shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-lg bg-card p-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {statValue}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-card-foreground">
                      {statTitle}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {statSubtitle}
                    </p>
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
