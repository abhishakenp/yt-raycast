import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  HeroSection,
  HeroContent,
  HeroBadge,
  HeroHeading,
  HeroHighlight,
  HeroSubheading,
  HeroActions,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AnalyticsHero — bold, data-forward split hero for an analytics product
 * landing page. A two-column band: the left column carries an eyebrow status
 * pill, a large headline with one phrase rendered in the primary highlight, a
 * supporting paragraph, dual CTAs (filled-primary "Start Free Trial" + outlined
 * "Book a demo"), and a compact three-stat proof strip; the right column frames
 * a product dashboard screenshot inside a bordered card with a faux toolbar dot
 * row. Sharp, marketing-grade, conversion-focused; CTAs write to Lakebed.
 * Use as the opening hero for analytics, BI, dashboards, product
 * metrics, or data-product sites. Renders fully with no props.
 */
export const AnalyticsHero = defineCapsule({
  name: 'AnalyticsHero',
  description:
    "Bold, data-forward split hero for an analytics product landing page. The left column carries an eyebrow status pill, a large headline with one phrase in the primary highlight, a supporting paragraph, dual fullstack CTAs (filled-primary 'Start Free Trial' + outlined 'Book a demo'), and a compact three-stat proof strip; the right column frames a product dashboard screenshot inside a bordered card with a faux toolbar dot row. Sharp, marketing-grade and conversion-focused; CTAs write to shared Lakebed conversion state. Use as the opening hero for analytics, BI, dashboards, product metrics, or data-product sites.",
  props: z.object({
    /** Eyebrow status / announcement pill text. */
    eyebrow: z.string().optional(),
    /** Headline text before the highlighted phrase. */
    heading: z.string().optional(),
    /** Phrase inside the heading rendered in the primary highlight color. */
    highlight: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary filled CTA label. */
    primaryCta: z.string().optional(),
    /** Secondary outlined CTA label. */
    secondaryCta: z.string().optional(),
    /** Proof stats shown in the strip under the CTAs. */
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Real-time product analytics'
    const heading = props.heading ?? 'Turn raw events into'
    const highlight = props.highlight ?? 'decisions you can ship'
    const subheading =
      props.subheading ??
      'Pulse unifies every event, funnel, and cohort into one fast, queryable view — so your team stops guessing and starts shipping with confidence.'
    const primaryCta = props.primaryCta ?? 'Start Free Trial'
    const secondaryCta = props.secondaryCta ?? 'Book a demo'
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: '12B+', label: 'Events / day' },
          { value: '50ms', label: 'Query latency' },
          { value: '99.99%', label: 'Uptime' },
        ]

    return (
      <HeroSection
        variant="default"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/3 -right-[15%] size-[700px] rounded-full bg-primary/[0.07] blur-3xl"
        />
        <Container asChild>
          <HeroContent className="grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-24">
            <div>
              <HeroBadge variant="pulsing-dot" className="mb-6 bg-card py-1.5">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-primary" />
                {eyebrow}
              </HeroBadge>
              <HeroHeading variant="extra-bold" className="leading-[1.05]">
                {heading}{' '}
                <HeroHighlight variant="primary">{highlight}</HeroHighlight>
              </HeroHeading>
              <HeroSubheading className="max-w-xl">{subheading}</HeroSubheading>
              <HeroActions>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  plan={primaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Starting
                    </>
                  }
                  className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  {primaryCta}
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  plan={secondaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-7 py-3.5 text-base font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polygon points="10 8 16 12 10 16 10 8" />
                  </svg>
                  {secondaryCta}
                </SaasPlanActionButton>
              </HeroActions>
              <dl className="mt-10 flex flex-wrap gap-8 border-t border-border pt-8">
                {stats.map((s) => (
                  <div key={s.label} className="flex flex-col gap-1">
                    <dt className="text-2xl font-bold tracking-tight text-foreground">
                      {s.value}
                    </dt>
                    <dd className="text-sm text-muted-foreground">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex justify-center">
              <Card
                variant="elevated"
                rounded="2xl"
                padding="none"
                className="w-full max-w-[560px] overflow-hidden"
              >
                <div
                  className="flex items-center gap-2 border-b border-border px-5 py-4"
                  aria-hidden="true"
                >
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="size-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="ml-auto text-xs font-medium text-muted-foreground">
                    Live dashboard
                  </span>
                </div>
                <Image
                  alt="analytics dashboard screenshot charts"
                  w={1120}
                  h={760}
                  className="block aspect-[3/2] w-full object-cover"
                />
              </Card>
            </div>
          </HeroContent>
        </Container>
      </HeroSection>
    )
  },
})
