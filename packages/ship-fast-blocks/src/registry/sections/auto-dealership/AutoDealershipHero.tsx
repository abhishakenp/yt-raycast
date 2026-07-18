import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  AutoLeadActionButton,
  AutoMutationSpinner,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

/**
 * AutoDealershipHero — split, two-column hero for an auto dealership / used-car
 * landing page on a soft muted band. Left column: an uppercase eyebrow, a large
 * headline, a lead paragraph, dual CTAs (solid primary + outlined secondary),
 * and an inline KPI strip with divider rules (inventory count / starting APR /
 * Google rating). Right column: a large rounded showroom hero photo with a deep
 * shadow. Inventory CTA routes through useNavigate; test-drive CTA writes a
 * Lakebed lead intent. Use as the top hero for car
 * dealerships, used-car lots, certified pre-owned sellers, or EV/hybrid
 * showrooms. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipHero = defineCapsule({
  name: 'AutoDealershipHero',
  description:
    'Split two-column hero for an auto dealership / used-car landing page on a soft muted band: left column has an uppercase eyebrow, a large headline, a lead paragraph, dual CTAs (solid primary inventory navigation + outlined Lakebed test-drive action), and an inline KPI strip with divider rules (inventory count / starting APR / Google rating); right column has a large rounded showroom hero photo with a deep shadow. The photo uses the alt-driven Image component. Use as the top hero for car dealerships, used-car lots, certified pre-owned sellers, or EV/hybrid showrooms.',
  props: z.object({
    /** Uppercase eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Lead paragraph under the headline. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Alt text driving the showroom hero photo. */
    imageAlt: z.string().optional(),
    /** Inline KPI strip stats. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Premium Pre-Owned Vehicles'
    const heading = props.heading ?? 'Find Your Perfect Drive'
    const subheading =
      props.subheading ??
      'Over 200 certified pre-owned vehicles. Competitive financing from 3.9% APR. 7-day money-back guarantee on every purchase.'
    const primaryCta = props.primaryCta ?? 'Browse Inventory'
    const secondaryCta = props.secondaryCta ?? 'Schedule Test Drive'
    const imageAlt =
      props.imageAlt ??
      'Premium white sedan parked in modern showroom with floor-to-ceiling windows'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '200+', label: 'Vehicles in Stock' },
          { value: '3.9%', label: 'Starting APR' },
          { value: '4.9', label: 'Google Rating' },
        ]

    return (
      <HeroSection
        className={cn('relative overflow-hidden bg-muted', props.className)}
      >
        <Container size="xl" className="py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  {eyebrow}
                </p>
                <HeroHeading className="font-semibold">{heading}</HeroHeading>
                <HeroSubheading className="mt-0 max-w-xl">
                  {subheading}
                </HeroSubheading>
              </div>
              <HeroActions className="mt-0 flex flex-col gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={() => go(primaryCta)}
                  className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </button>
                <AutoLeadActionButton
                  lakebed={lakebed}
                  action="test_drive"
                  label={secondaryCta}
                  intentKey="hero-test-drive"
                  source="hero"
                  pendingChildren={
                    <>
                      <AutoMutationSpinner />
                      Sending
                    </>
                  }
                  className="inline-flex items-center justify-center rounded-md border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
                >
                  {secondaryCta}
                </AutoLeadActionButton>
              </HeroActions>
              <div className="flex items-center gap-8 pt-4">
                {stats.map((s, i) => (
                  <div key={s.label} className="flex items-center gap-8">
                    {i > 0 && <div className="h-10 w-px bg-border" />}
                    <div>
                      <p className="text-2xl font-semibold">{s.value}</p>
                      <p className="text-sm text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                rounded="xl"
                className="aspect-[4/3] w-full rounded-lg shadow-2xl"
              />
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
