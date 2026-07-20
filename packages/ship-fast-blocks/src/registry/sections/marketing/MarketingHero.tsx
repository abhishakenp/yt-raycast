import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Image } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MarketingHero — bold-kinetic split product hero for a SaaS / product-marketing
 * landing page. An asymmetric 7:5 grid over a dot-grid wash with a giant ghost
 * "SHIP" watermark: on the left a square mono status chip with a pulsing dot, a
 * huge clamp-scaled extrabold headline whose final word sits on a tilted primary
 * marker block (the signature move), a supporting paragraph, dual square CTAs
 * (filled primary with hard offset shadow + hairline "watch demo" with a play
 * glyph, both with press feedback) and a mono trust footnote; on the right a
 * sharp-cornered browser mockup with mono window chrome, an app rail carrying the
 * brand initial, a product preview image, a collapsed-border sprint-velocity bar
 * chart, a task checklist, and a rotated hard-shadow trend sticker overlapping
 * the corner. CTAs route through section-kit route links. Use as the top hero for
 * B2B SaaS, team/project-management, productivity, or developer-platform pages.
 */
export const MarketingHero = defineCapsule({
  name: 'MarketingHero',
  description:
    "Bold-kinetic split product hero for a SaaS / product-marketing landing page: an asymmetric 7:5 grid over a dot-grid wash and giant ghost SHIP watermark, with a square mono status chip, a huge clamp-scaled headline whose final word sits on a tilted primary marker block, dual square CTAs (filled primary with hard offset shadow + hairline 'watch demo', press feedback) and a mono trust footnote, plus a sharp-cornered browser mockup of a live product dashboard (mono window chrome, app rail with the brand initial, a product preview image, a collapsed-border sprint-velocity bar chart, a task checklist, and a rotated hard-shadow trend sticker). CTAs route through section-kit route links. Use as the top hero for B2B SaaS, team/project-management, productivity, or developer-platform landing pages.",
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
        <Watermark className="-top-8 right-0 text-[8rem] sm:text-[12rem] lg:-top-16 lg:text-[18rem]">
          SHIP
        </Watermark>
        <Container className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="text-center lg:col-span-7 lg:text-left">
              <span className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80">
                <span
                  aria-hidden="true"
                  className="size-2 animate-pulse bg-primary"
                />
                {badge}
              </span>
              <h1 className="mb-6 text-[clamp(2.5rem,6.5vw,4.5rem)] font-extrabold leading-[0.98] tracking-tight text-balance text-foreground">
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
              <p className="mx-auto mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground lg:mx-0">
                {subheading}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                <NavbarRouteLink
                  href={primaryCta}
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-primary px-8 py-4 text-center text-base font-semibold text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none"
                >
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
                <NavbarRouteLink
                  href={secondaryCta}
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground bg-background px-8 py-4 text-center text-base font-semibold text-foreground transition-[transform,background-color] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                >
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
              </div>
              <p className="mt-4 font-mono text-xs text-muted-foreground">
                {note}
              </p>
            </div>

            {/* Browser mockup / product visual (decorative). */}
            <div
              className="relative -mx-2 sm:mx-0 lg:col-span-5"
              aria-hidden="true"
            >
              <div className="border border-foreground/80 bg-card shadow-[8px_8px_0_0] shadow-foreground/15">
                {/* Browser header */}
                <div className="flex items-center gap-2 border-b border-foreground/80 bg-muted px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 bg-primary" />
                  </div>
                  <div className="ml-2 flex-1 truncate border border-border bg-background px-2.5 py-1 text-center font-mono text-[0.7rem] text-muted-foreground">
                    {appUrl}
                  </div>
                </div>
                {/* Browser body */}
                <div className="flex min-h-[20rem]">
                  {/* App rail */}
                  <div className="flex w-14 flex-col items-center gap-4 border-r border-border bg-muted py-3">
                    <span className="grid size-7 place-items-center rounded-none bg-primary text-[0.7rem] font-bold text-primary-foreground">
                      {brand.charAt(0)}
                    </span>
                    <span className="size-7 rounded-none bg-primary/80" />
                    <span className="size-7 rounded-none bg-muted-foreground/20" />
                    <span className="size-7 rounded-none bg-muted-foreground/20" />
                    <span className="size-7 rounded-none bg-muted-foreground/20" />
                  </div>
                  {/* App main */}
                  <div className="flex-1 p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
                        {appTitle}
                      </div>
                      <div className="flex items-center gap-2.5">
                        <span className="h-[22px] w-[60px] rounded-none bg-primary/90" />
                        <div className="flex">
                          <span className="size-[22px] rounded-full border-2 border-card bg-chart-4" />
                          <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-5" />
                          <span className="-ml-1.5 size-[22px] rounded-full border-2 border-card bg-chart-3" />
                        </div>
                      </div>
                    </div>
                    <div className="mb-4 overflow-hidden border border-border bg-muted/40">
                      <Image
                        alt={previewAlt}
                        w={1000}
                        h={520}
                        className="aspect-[16/7] w-full object-cover opacity-85"
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-0 border-l border-t border-border sm:grid-cols-2">
                      {/* Chart widget */}
                      <div className="border-b border-r border-border bg-card p-4">
                        <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {chartTitle}
                        </div>
                        <div className="flex h-[5.625rem] items-end gap-2">
                          {barHeights.map((h, i) => (
                            <span
                              key={i}
                              style={{ height: h }}
                              className={cn(
                                'flex-1',
                                i === barHeights.length - 1
                                  ? 'bg-primary'
                                  : 'bg-foreground/15',
                              )}
                            />
                          ))}
                        </div>
                      </div>
                      {/* Tasks widget */}
                      <div className="border-b border-r border-border bg-card p-4">
                        <div className="mb-3 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                          {tasksTitle}
                        </div>
                        <div className="flex flex-col gap-2.5">
                          {[false, false, false, true].map((checked, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'size-3.5 shrink-0 border',
                                  checked
                                    ? 'border-primary bg-primary'
                                    : 'border-muted-foreground/40',
                                )}
                              />
                              <span
                                className={cn(
                                  'h-2 bg-muted-foreground/20',
                                  checked ? 'w-3/5' : 'w-full',
                                )}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Rotated hard-shadow trend sticker overlapping the top corner. */}
              <div className="absolute -top-5 right-2 rotate-3 border border-foreground bg-background px-3 py-2 shadow-[5px_5px_0_0] shadow-foreground sm:-right-4">
                <span className="flex items-center gap-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-foreground">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                  {chartTitle}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
