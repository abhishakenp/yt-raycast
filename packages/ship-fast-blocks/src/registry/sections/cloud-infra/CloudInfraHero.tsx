import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import {
  HeroStatBadge,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CloudInfraHero — terminal-industrial asymmetric hero (7/5 split) for a
 * cloud-infrastructure / developer-platform SaaS landing page. Left column:
 * a mono status chip with a pulsing square indicator, an extrabold display
 * headline, supporting paragraph, dual square-cornered CTAs (inverted
 * foreground fill + hairline outline, both with press feedback), and a mono
 * `[ok]`-style trust row. Right column: the 4:3 alt-driven image framed as a
 * terminal pane (inverted mono title bar with square window dots, chamfered
 * corner) with an inverted stat ledger chip overlaid at the bottom-left.
 * A faint dot-grid and a giant `>_` ghost watermark sit behind. Uses semantic
 * tokens throughout. CTAs and links route through section-kit route links.
 * Renders fully on zero arguments via baked-in defaults.
 */
export const CloudInfraHero = defineCapsule({
  name: 'CloudInfraHero',
  description:
    'Terminal-industrial asymmetric hero (7/5 split) for a cloud-infrastructure / developer-platform SaaS landing page: a mono status chip with pulsing square indicator, extrabold display headline, supporting paragraph, Lakebed-backed dual square CTAs with press feedback, a mono trust row, and a 4:3 alt-driven image framed as a chamfered terminal pane with an inverted stat ledger chip at the bottom-left. Faint dot-grid and giant ghost `>_` watermark behind. CTA intent is shared across sections. Use as the primary hero for cloud hosting, IaaS/PaaS, serverless, container, DevOps, or developer-tooling sites.',
  props: z.object({
    /** Status pill text before the headline. */
    badge: z.string().optional(),
    /** Main headline text. */
    heading: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Primary CTA label (also becomes navigation target). */
    primaryCta: z.string().optional(),
    /** Secondary CTA label (also becomes navigation target). */
    secondaryCta: z.string().optional(),
    /** Trust bullets beneath the CTAs. */
    trust: z.array(z.string()).optional(),
    /** Alt text driving the hero image. */
    imageAlt: z.string().optional(),
    /** Floating stat card label text. */
    statLabel: z.string().optional(),
    /** Floating stat card value text. */
    statValue: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now with GPU instances'
    const heading = props.heading ?? 'Cloud infrastructure that scales with you'
    const subheading =
      props.subheading ??
      'Deploy containers, virtual machines, and serverless functions in seconds. Pay only for the compute you actually use—down to the millisecond.'
    const primaryCta = props.primaryCta ?? 'Start free trial'
    const secondaryCta = props.secondaryCta ?? 'View pricing'
    const trust = props.trust?.length
      ? props.trust
      : ['No credit card required', '$500 free credits']
    const imageAlt =
      props.imageAlt ??
      'Abstract visualization of global cloud network infrastructure with interconnected nodes'
    const statLabel = props.statLabel ?? 'Avg. deployment time'
    const statValue = props.statValue ?? '12 seconds'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <DotGrid
          density="tight"
          tone="border"
          fade="left"
          className="inset-y-0 right-0 w-1/2"
        />
        <Watermark className="-bottom-10 -left-4 font-mono text-[9rem] tracking-tighter sm:text-[14rem] lg:text-[19rem]">
          &gt;_
        </Watermark>
        <Container size="xl" className="relative py-14 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="space-y-7 lg:col-span-7">
              <div className="inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="size-1.5 animate-pulse bg-primary"
                />
                {badge}
              </div>
              <h1 className="text-4xl font-extrabold leading-[0.95] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p
                aria-hidden="true"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
              >
                <span className="text-primary">$</span> cloudshift deploy
                --region=auto
              </p>
              <p className="max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
                {subheading}
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-foreground px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight className="size-4" />
                </SaasPlanActionButton>
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryCta}
                  plan={secondaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Sending
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground/25 bg-background px-6 py-3 font-mono text-sm font-semibold uppercase tracking-wide text-foreground transition-colors hover:border-foreground active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {trust.map((t) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    <span aria-hidden="true" className="size-1.5 bg-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative lg:col-span-5">
              <div className="border border-border bg-background [clip-path:polygon(0_0,100%_0,100%_calc(100%-1.25rem),calc(100%-1.25rem)_100%,0_100%)]">
                <div className="flex items-center justify-between bg-foreground px-3 py-2 text-background">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    ~/cloudshift — deploy
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-1.5"
                  >
                    <span className="size-1.5 bg-background/40" />
                    <span className="size-1.5 bg-background/40" />
                    <span className="size-1.5 bg-background" />
                  </span>
                </div>
                <div className="aspect-[4/3] overflow-hidden bg-muted">
                  <Image
                    alt={imageAlt}
                    w={1200}
                    h={900}
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <HeroStatBadge className="absolute -bottom-5 -left-3 hidden gap-3 rounded-none border-0 bg-foreground p-4 text-background shadow-none sm:flex sm:items-center lg:-left-6">
                <span
                  aria-hidden="true"
                  className="grid size-9 shrink-0 place-items-center border border-background/20 font-mono text-sm text-background/80"
                >
                  &gt;_
                </span>
                <HeroStatBadgeContent>
                  <HeroStatBadgeSubtitle className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60">
                    {statLabel}
                  </HeroStatBadgeSubtitle>
                  <HeroStatBadgeTitle className="text-lg font-semibold tracking-tight text-background tabular-nums">
                    {statValue}
                  </HeroStatBadgeTitle>
                </HeroStatBadgeContent>
              </HeroStatBadge>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
