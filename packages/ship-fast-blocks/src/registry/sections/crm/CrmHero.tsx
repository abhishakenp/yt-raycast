import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CrmHero — kinetic-SaaS hero band for a CRM / sales-platform landing page.
 * An asymmetric 7:5 grid over a dot-grid wash with a giant ghost "CRM"
 * watermark: on the left a square mono status chip with pulsing dot, a huge
 * clamp-scaled extrabold headline whose final word sits on a tilted primary
 * marker block, a supporting paragraph, a mono "[ LEAD → QUALIFIED → WON ]"
 * pipeline micro-strip, dual square CTAs with hard offset shadows and press
 * feedback, and a fine-print note; on the right a sharp-cornered Kanban
 * "Sales Pipeline" mockup panel with mono window chrome, collapsed-border
 * stage columns of tabular-nums deal cards (mono stage labels, a won tick),
 * a hairline stats bar, and a rotated hard-shadow revenue badge overlapping
 * its corner. CTA buttons record trial or demo intent via shared Lakebed
 * state. Use as the opening hero for CRM products, sales-pipeline tools or
 * deal-tracking SaaS. Renders fully with no props.
 */
export const CrmHero = defineCapsule({
  name: 'CrmHero',
  description:
    'Kinetic-SaaS hero band for a CRM / sales-platform landing page: an asymmetric 7:5 grid over a dot-grid wash and giant ghost CRM watermark, with a square mono status chip, huge clamp-scaled headline whose final word sits on a tilted primary marker block, mono pipeline-stage micro-strip, scoped Lakebed trial/demo CTAs with hard offset shadows, and a sharp collapsed-border Kanban SALES PIPELINE mockup panel with tabular-nums deal cards and a rotated hard-shadow revenue badge. CTA buttons record trial or demo intent instead of colliding with navigation. Use as the opening hero for CRM products, sales-pipeline tools or deal-tracking SaaS.',
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

    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        {/* Layered wash: dot grid fading out to the right + ghost watermark. */}
        <DotGrid
          className="inset-y-0 left-0 w-2/3"
          fade="right"
          tone="border"
        />
        <Watermark className="-top-8 right-0 text-[8rem] sm:text-[12rem] lg:-top-16 lg:text-[20rem]">
          CRM
        </Watermark>
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80">
                <span className="size-2 animate-pulse bg-primary" />
                {badge}
              </span>
              <h1 className="mb-6 text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.04em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <MonoTag aria-hidden="true" tone="faint" className="mb-8 block">
                [ lead → qualified → proposal → won ]
              </MonoTag>
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-8 py-4 text-center font-semibold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-8 py-4 text-center font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                {note}
              </p>
            </div>

            {/* Pipeline mockup panel — sharp, collapsed-border, tabular. */}
            <div className="relative -mx-2 sm:mx-0 lg:col-span-5">
              <div className="border border-foreground/80 bg-card shadow-[8px_8px_0_0] shadow-foreground/15">
                <div className="flex items-center gap-2 border-b border-foreground/80 bg-muted px-4 py-2.5">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 bg-primary" />
                  </div>
                  <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {mockupTitle}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-0 border-b border-border">
                  {columns.map((col, ci) => (
                    <div
                      key={col.label}
                      className={cn(
                        'min-w-0 p-2.5 sm:p-3',
                        ci > 0 && 'border-l border-border',
                      )}
                    >
                      <p className="mb-2.5 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                        {col.label}
                      </p>
                      <div className="space-y-2">
                        {(col.deals ?? []).map((deal) => (
                          <div
                            key={deal.name}
                            className={cn(
                              'border p-2',
                              deal.won
                                ? 'border-primary/50 bg-primary/5'
                                : 'border-border bg-background',
                            )}
                          >
                            <p className="truncate text-xs font-semibold text-card-foreground">
                              {deal.name}
                            </p>
                            <p
                              className={cn(
                                'mt-1 truncate font-mono text-[10px] tabular-nums',
                                deal.won
                                  ? 'font-medium text-foreground'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {deal.value}
                              {deal.won ? ' ✓' : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-border">
                  {mockupStats.map((s) => (
                    <div key={s.label} className="min-w-0 px-3 py-3 sm:px-4">
                      <p className="truncate font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {s.label}
                      </p>
                      <p className="truncate text-base font-bold tracking-tight text-card-foreground tabular-nums sm:text-lg">
                        {s.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Rotated hard-shadow revenue badge overlapping the top corner. */}
              <div className="absolute -top-6 right-2 rotate-2 border border-foreground bg-background p-3 shadow-[5px_5px_0_0] shadow-foreground sm:-right-4">
                <p className="text-sm font-bold tracking-tight text-foreground tabular-nums">
                  {badgeValue}
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {badgeLabel}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
