import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { Eyebrow } from '#/section-kit/Eyebrow.tsx'
import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'

/**
 * CrmHero — split, light-aesthetic hero band for a CRM / sales-platform landing
 * page. A two-column grid over a soft muted surface: on the left a pulsing
 * live-status pill, a bold tracking-tight headline, a supporting paragraph, dual
 * CTAs (filled primary + outlined secondary) and a fine-print note; on the right
 * an inline visual Kanban "Sales Pipeline" mockup card with browser chrome, four
 * stage columns of deal cards (dollar values, color-coded accents, a won check),
 * a pipeline-value/win-rate/active-deals stats bar, and a floating
 * revenue-growth badge. Clean, professional, conversion-focused; CTAs route
 * through useNavigate. Use as the opening hero for CRM products, sales-pipeline
 * tools or deal-tracking SaaS. Renders fully with no props.
 */
export const CrmHero = defineCapsule({
  name: 'CrmHero',
  description:
    'Split light-aesthetic hero band for a CRM / sales-platform landing page: a two-column grid over a soft muted surface with live-status pill, bold headline, supporting paragraph, scoped Lakebed trial/demo CTAs, and an inline visual Kanban SALES PIPELINE mockup card. Clean, professional and conversion-focused; CTA buttons record trial or demo intent instead of colliding with navigation. Use as the opening hero for CRM products, sales-pipeline tools or deal-tracking SaaS.',
  props: z.object({
    /** Pulsing live-status pill text. */
    badge: z.string().optional(),
    /** Bold hero headline. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Fine-print note beneath the CTAs. */
    note: z.string().optional(),
    /** Title shown in the mockup browser chrome. */
    mockupTitle: z.string().optional(),
    /** Kanban columns; each column has a label and deal cards. */
    columns: z
      .array(
        z.object({
          label: z.string(),
          deals: z
            .array(
              z.object({
                name: z.string(),
                value: z.string(),
                won: z.boolean().optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    /** Stats bar beneath the Kanban columns. */
    mockupStats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    /** Floating badge value over the mockup card. */
    badgeValue: z.string().optional(),
    /** Floating badge label over the mockup card. */
    badgeLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now with AI-powered forecasting'
    const heading =
      props.heading ??
      'Close deals faster with a sales pipeline that actually works'
    const subheading =
      props.subheading ??
      "Pipeline Pro gives your team a visual, intuitive way to track every opportunity from first contact to closed-won. Join 15,000+ sales teams who've transformed their process."
    const primaryCta = props.primaryCta ?? 'Start 14-day free trial'
    const secondaryCta = props.secondaryCta ?? 'Watch 2-min demo'
    const note = props.note ?? 'No credit card required. Setup takes 3 minutes.'
    const mockupTitle = props.mockupTitle ?? 'Sales Pipeline - Q2 2024'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            label: 'Lead',
            deals: [
              { name: 'Acme Corp', value: '$24,000' },
              { name: 'TechFlow', value: '$18,500' },
            ],
          },
          {
            label: 'Contact',
            deals: [{ name: 'StartupXYZ', value: '$45,000' }],
          },
          {
            label: 'Proposal',
            deals: [
              { name: 'GlobalTech', value: '$67,000' },
              { name: 'Nexus Inc', value: '$32,000' },
            ],
          },
          {
            label: 'Closed',
            deals: [{ name: 'BrightCo', value: '$89,000', won: true }],
          },
        ]
    const mockupStats = props.mockupStats?.length
      ? props.mockupStats
      : [
          { value: '$275,500', label: 'Pipeline Value' },
          { value: '34%', label: 'Win Rate' },
          { value: '6 active', label: 'Deals' },
        ]
    const badgeValue = props.badgeValue ?? '+23% this month'
    const badgeLabel = props.badgeLabel ?? 'Revenue growth'

    const columnAccents = [
      'bg-muted border-border',
      'bg-chart-1/10 border-chart-1/30',
      'bg-chart-4/10 border-chart-4/30',
      'bg-chart-2/10 border-chart-2/30',
    ]

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden bg-muted/50', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-sm font-medium text-foreground/80">
                <span className="size-2 animate-pulse rounded-full bg-chart-2" />
                {badge}
              </span>
              <h1 className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Sending
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{note}</p>
            </div>

            {/* Pipeline mockup card */}
            <div className="relative">
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
                <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-destructive/60" />
                    <div className="size-3 rounded-full bg-chart-4/70" />
                    <div className="size-3 rounded-full bg-chart-2/70" />
                  </div>
                  <span className="ml-2 text-xs text-muted-foreground">
                    {mockupTitle}
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <div className="grid grid-cols-4 gap-3">
                    {columns.map((col, ci) => (
                      <div key={col.label} className="space-y-2">
                        <Eyebrow
                          variant="text"
                          className="mb-3 block tracking-wider text-muted-foreground"
                        >
                          {col.label}
                        </Eyebrow>
                        {(col.deals ?? []).map((deal) => (
                          <div
                            key={deal.name}
                            className={cn(
                              'rounded-lg border p-3',
                              columnAccents[ci % columnAccents.length],
                            )}
                          >
                            <p className="text-sm font-medium text-card-foreground">
                              {deal.name}
                            </p>
                            <p
                              className={cn(
                                'mt-1 text-xs',
                                deal.won
                                  ? 'font-medium text-chart-2'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {deal.value}
                              {deal.won ? ' ✓' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <div className="flex items-center gap-6">
                      {mockupStats.map((s) => (
                        <div key={s.label}>
                          <p className="text-xs text-muted-foreground">
                            {s.label}
                          </p>
                          <p className="text-lg font-bold text-card-foreground">
                            {s.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <Card
                rounded="lg"
                padding="none"
                shadow="lg"
                className="absolute -bottom-4 -left-4 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-full bg-chart-2/15 text-chart-2">
                    <svg
                      className="size-5"
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
                    <p className="text-sm font-semibold text-card-foreground">
                      {badgeValue}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {badgeLabel}
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
