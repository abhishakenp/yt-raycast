import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
} from '#/section-kit/HeroSection.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * MarketingHero — split product hero for a SaaS / product-marketing landing page.
 * A soft top-down indigo gradient section pairing a left content column (a
 * check-pill badge, a bold balanced headline, a supporting paragraph, dual CTAs
 * — filled primary + outline "watch demo" with a play glyph — and a trust
 * footnote) with a right 3D-tilted browser mockup: traffic-light dots, an
 * address bar, an app rail with the brand initial, an animated sprint-velocity
 * bar chart, and a task checklist. Clean premium indigo-on-light aesthetic;
 * CTAs route through section-kit route links. Use as the top hero for B2B SaaS,
 * team/project-management, productivity, or developer-platform landing pages.
 */
export const MarketingHero = defineCapsule({
  name: 'MarketingHero',
  description:
    "Split product hero for a SaaS / product-marketing landing page: a soft top-down indigo gradient section pairing a left content column (a check-pill badge, a bold balanced headline, a supporting paragraph, dual CTAs — filled primary + outline 'watch demo' with a play glyph — and a trust footnote) with a right 3D-tilted browser mockup of a live product dashboard (traffic-light dots, address bar, an app rail with the brand initial, an animated sprint-velocity bar chart, and a task checklist). Clean premium indigo-on-light aesthetic; CTAs route through section-kit route links. Use as the top hero for B2B SaaS, team/project-management, productivity, or developer-platform landing pages.",
  props: z.object({
    /** Brand initial shown in the mockup app rail. */
    brand: z.string().optional(),
    badge: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    note: z.string().optional(),
    /** Address-bar text shown in the browser mockup. */
    appUrl: z.string().optional(),
    /** Title shown in the mockup's inner product header. */
    appTitle: z.string().optional(),
    /** Title of the chart widget in the mockup. */
    chartTitle: z.string().optional(),
    /** Title of the task widget in the mockup. */
    tasksTitle: z.string().optional(),
    /** Image search phrase used for the hero product preview. */
    previewAlt: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Flowstate'
    const badge = props.badge ?? 'Now with AI-powered insights'
    const heading =
      props.heading ?? 'Focus on what matters. Let Flowstate handle the rest.'
    const subheading =
      props.subheading ??
      'The all-in-one workspace that helps teams plan, track, and ship work 2x faster — without the chaos of endless tabs and status meetings.'
    const primaryCta = props.primaryCta ?? 'Start free trial'
    const secondaryCta = props.secondaryCta ?? 'Watch demo'
    const note = props.note ?? 'No credit card required. 14-day free trial.'
    const appUrl = props.appUrl ?? 'app.flowstate.io/dashboard'
    const appTitle = props.appTitle ?? 'Product Roadmap'
    const chartTitle = props.chartTitle ?? 'Sprint Velocity'
    const tasksTitle = props.tasksTitle ?? "Today's Tasks"
    const previewAlt =
      props.previewAlt ?? `${brand} ${appTitle} product dashboard preview`

    // Chart bar heights — preserved from the original nth-child rules.
    const barHeights = ['40%', '70%', '55%', '85%', '65%']

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-gradient-to-b from-primary/10 via-primary/5 to-background pt-20 pb-28',
          props.className,
        )}
      >
        <Container
          size="lg"
          className="relative grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]"
        >
          <div className="text-center lg:text-left">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm">
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
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {badge}
            </span>
            <HeroHeading
              variant="extra-bold"
              className="text-balance lg:text-[3.6rem]"
            >
              {heading}
            </HeroHeading>
            <HeroSubheading className="mx-auto mt-5 max-w-[48ch] lg:mx-0">
              {subheading}
            </HeroSubheading>
            <HeroActions className="justify-center gap-3 lg:justify-start">
              <HeroCta
                asChild
                variant="primary"
                className="gap-2 rounded-xl px-7 py-3.5 text-base font-semibold shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-px"
              >
                <NavbarRouteLink href={primaryCta}>
                  {primaryCta}
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
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </NavbarRouteLink>
              </HeroCta>
              <HeroCta
                asChild
                variant="outline"
                className="gap-2 rounded-xl bg-muted/50 px-7 py-3.5 text-base font-semibold transition-colors hover:bg-muted"
              >
                <NavbarRouteLink href={secondaryCta}>
                  <svg
                    width="16"
                    height="16"
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
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>
            <p className="mt-4 text-sm text-muted-foreground">{note}</p>
          </div>

          {/* Browser mockup / product visual (decorative). */}
          <div className="[perspective:1200px]" aria-hidden="true">
            <div className="group overflow-hidden rounded-2xl bg-card shadow-[0_30px_60px_-15px_rgba(0,0,0,0.18)] ring-1 ring-border transition-transform duration-500 [transform:rotateX(2deg)_rotateY(-2deg)] hover:[transform:rotateX(0deg)_rotateY(0deg)]">
              {/* Browser header */}
              <div className="flex items-center gap-3 border-b border-border bg-muted/60 px-4 py-3">
                <div className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-chart-1" />
                  <span className="size-2.5 rounded-full bg-chart-2" />
                  <span className="size-2.5 rounded-full bg-chart-3" />
                </div>
                <div className="flex-1 truncate rounded-md border border-border bg-background px-2.5 py-1 text-center text-[0.7rem] text-muted-foreground">
                  {appUrl}
                </div>
              </div>
              {/* Browser body */}
              <div className="flex min-h-[20rem]">
                {/* App rail */}
                <div className="flex w-14 flex-col items-center gap-4 border-r border-border bg-muted/60 py-3">
                  <span className="grid size-7 place-items-center rounded-md bg-primary text-[0.7rem] font-bold text-primary-foreground">
                    {brand.charAt(0)}
                  </span>
                  <span className="size-7 rounded-md bg-primary" />
                  <span className="size-7 rounded-md bg-muted-foreground/20" />
                  <span className="size-7 rounded-md bg-muted-foreground/20" />
                  <span className="size-7 rounded-md bg-muted-foreground/20" />
                </div>
                {/* App main */}
                <div className="flex-1 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="text-sm font-bold text-foreground">
                      {appTitle}
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="h-[22px] w-[60px] rounded bg-primary/90" />
                      <div className="flex">
                        <span className="size-[22px] rounded-full border-2 border-card bg-chart-4" />
                        <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-5" />
                        <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-3" />
                      </div>
                    </div>
                  </div>
                  <Card
                    variant="outline"
                    className="mb-4 overflow-hidden bg-muted/40 p-0"
                  >
                    <Image
                      alt={previewAlt}
                      w={1000}
                      h={520}
                      className="aspect-[16/7] w-full object-cover opacity-85"
                    />
                  </Card>
                  <ResponsiveGrid cols="1-2" className="gap-4">
                    {/* Chart widget */}
                    <Card variant="outline" className="bg-muted/40 p-4">
                      <div className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {chartTitle}
                      </div>
                      <div className="flex h-[5.625rem] items-end gap-2">
                        {barHeights.map((h, i) => (
                          <span
                            key={i}
                            style={{ height: h }}
                            className="flex-1 rounded-t bg-primary/85"
                          />
                        ))}
                      </div>
                    </Card>
                    {/* Tasks widget */}
                    <Card variant="outline" className="bg-muted/40 p-4">
                      <div className="mb-3 text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {tasksTitle}
                      </div>
                      <div className="flex flex-col gap-2.5">
                        {[false, false, false, true].map((checked, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span
                              className={cn(
                                'size-3.5 shrink-0 rounded border-2',
                                checked
                                  ? 'border-primary bg-primary'
                                  : 'border-muted-foreground/30',
                              )}
                            />
                            <span
                              className={cn(
                                'h-2 rounded-full bg-muted-foreground/20',
                                checked ? 'w-3/5' : 'w-full',
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </ResponsiveGrid>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
