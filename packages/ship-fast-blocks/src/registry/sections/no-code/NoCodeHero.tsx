import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
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
 * NoCodeHero — block-builder-kinetic split hero for a no-code / drag-and-drop
 * app-builder SaaS on a dot-grid "canvas" wash with a giant ghost "BUILD"
 * watermark. The left column (7/12) stacks a square mono live-status chip with
 * a pulsing dot, a huge clamp-scaled extrabold headline whose accent phrase
 * sits on a tilted primary marker block, a supporting paragraph, a mono
 * "[ drag → drop → publish ]" pipeline micro-strip, dual square CTAs with hard
 * offset shadows and press feedback (filled primary + hairline secondary), and
 * a mono trust-microcopy row. The right column (5/12) renders a sharp,
 * hard-shadow visual-EDITOR mockup: mono window chrome, a collapsed-border
 * Blocks rail of chunky component chips, a gridded drag-and-drop canvas with a
 * selected block wired by a connector line, a Properties mini-panel, and a
 * rotated hard-shadow "Published!" sticker badge overlapping its corner. CTA
 * buttons record trial or demo intent via shared Lakebed state. Use as the
 * opening hero for no-code / website-builder / page-builder / SaaS platform
 * products. Renders fully with no props.
 */
export const NoCodeHero = defineCapsule({
  name: 'NoCodeHero',
  description:
    'Block-builder-kinetic split hero for a no-code / drag-and-drop app-builder SaaS on a dot-grid canvas wash and giant ghost BUILD watermark: the left column has a square mono live-status chip, a huge clamp-scaled headline whose accent phrase sits on a tilted primary marker block, supporting paragraph, mono drag → drop → publish micro-strip, scoped Lakebed trial/demo CTAs with hard offset shadows and press feedback, and a mono trust row; the right column renders a sharp hard-shadow visual editor mockup with a collapsed-border Blocks rail, a gridded canvas with a selected block and connector, and a rotated Published sticker badge. CTA buttons record trial or demo intent instead of colliding with navigation.',
  props: z.object({
    /** Live-status pill text. */
    badge: z.string().optional(),
    /** First (solid) headline line. */
    headingTop: z.string().optional(),
    /** Muted continuation of the headline. */
    headingAccent: z.string().optional(),
    /** Supporting paragraph under the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Short checkmarked trust microcopy lines. */
    trust: z.array(z.string()).optional(),
    /** Label shown in the editor mockup's title bar. */
    editorLabel: z.string().optional(),
    /** Floating success-toast label on the mockup. */
    toast: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now with AI-powered components'
    const headingTop = props.headingTop ?? 'Build apps without code.'
    const headingAccent = props.headingAccent ?? 'Drag, drop, launch.'
    const subheading =
      props.subheading ??
      'Create stunning web and mobile apps in minutes. Choose from 200+ professionally designed templates, customize with our intuitive drag-and-drop builder, and publish instantly.'
    const primaryCta = props.primaryCta ?? 'Start building free'
    const secondaryCta = props.secondaryCta ?? 'Watch demo'
    const trust = props.trust?.length
      ? props.trust
      : ['No credit card required', 'Free forever plan']
    const editorLabel = props.editorLabel ?? 'Buildr Editor'
    const toast = props.toast ?? 'Published!'

    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
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
        <circle cx="12" cy="12" r="9" />
        <polygon points="10 9 15 12 10 15 10 9" />
      </svg>
    )

    const railIcons: ReactNode[] = [
      <svg
        key="text"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7V4h16v3M9 20h6M12 4v16" />
      </svg>,
      <svg
        key="grid"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </svg>,
      <svg
        key="bolt"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polygon points="13 2 4 14 11 14 11 22 20 10 13 10 13 2" />
      </svg>,
    ]
    const blocks = ['Text', 'Grid', 'Button']

    return (
      <HeroSection
        variant="split"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
        aria-labelledby="nc-hero"
      >
        {/* Canvas wash: dot grid fading right + giant ghost BUILD watermark. */}
        <DotGrid
          className="inset-y-0 left-0 w-2/3"
          fade="right"
          tone="border"
        />
        <Watermark className="-bottom-10 -left-2 text-[7rem] sm:text-[12rem] lg:text-[18rem]">
          BUILD
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <span className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80">
                <span className="size-2 animate-pulse bg-chart-2" />
                {badge}
              </span>
              <h1
                id="nc-hero"
                className="mb-6 text-[clamp(2.5rem,6.5vw,4.75rem)] font-extrabold leading-[0.98] tracking-tight text-foreground"
              >
                {headingTop}{' '}
                <span className="relative ml-[0.06em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.12em] inset-y-[0.05em] -rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingAccent}
                  </span>
                </span>
              </h1>
              <p className="mb-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <MonoTag aria-hidden="true" tone="faint" className="mb-8 block">
                [ drag → drop → publish ]
              </MonoTag>
              <div className="mb-8 flex flex-col gap-4 sm:flex-row">
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
                  <PlayIcon />
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-4 text-primary" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual editor mockup — sharp, hard-shadow builder canvas. */}
            <div
              className="relative -mx-2 sm:mx-0 lg:col-span-5"
              aria-hidden="true"
            >
              <div className="border-2 border-foreground/80 bg-card shadow-[8px_8px_0_0] shadow-foreground/15">
                <div className="flex items-center gap-2 border-b-2 border-foreground/80 bg-muted px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 border border-foreground/40" />
                    <span className="size-2.5 bg-primary" />
                  </div>
                  <span className="ml-2 truncate font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {editorLabel}
                  </span>
                </div>
                <div className="grid min-h-[360px] grid-cols-12">
                  {/* Blocks rail — collapsed-border chunky component chips. */}
                  <div className="col-span-4 space-y-2.5 border-r-2 border-foreground/80 bg-muted/40 p-3">
                    <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                      Blocks
                    </p>
                    {blocks.map((c, i) => (
                      <div
                        key={c}
                        className="flex items-center gap-2 border border-border bg-card px-2 py-2 shadow-[2px_2px_0_0] shadow-foreground/10"
                      >
                        <span className="grid size-6 shrink-0 place-items-center border border-border text-foreground [&>svg]:size-3.5">
                          {railIcons[i % railIcons.length]}
                        </span>
                        <span className="truncate text-xs font-semibold text-card-foreground">
                          {c}
                        </span>
                      </div>
                    ))}
                  </div>
                  {/* Canvas — gridded, selected block wired by a connector. */}
                  <div className="relative col-span-8 bg-card p-5">
                    <div className="absolute inset-0 bg-[linear-gradient(currentColor_1px,transparent_1px),linear-gradient(90deg,currentColor_1px,transparent_1px)] [background-size:22px_22px] text-border" />
                    <div className="relative space-y-0">
                      <div className="border-2 border-primary bg-primary/10 p-4 shadow-[4px_4px_0_0] shadow-primary/40">
                        <p className="text-sm font-bold tracking-tight text-foreground">
                          Welcome to My App
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          Build something amazing today
                        </p>
                        <span className="mt-3 inline-block bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background">
                          Get Started
                        </span>
                      </div>
                      <span className="mx-auto block h-6 w-0.5 bg-foreground/40" />
                      <div className="border-2 border-dashed border-border bg-background p-4">
                        <div className="mb-2 h-2 w-3/4 bg-border" />
                        <div className="h-2 w-1/2 bg-border" />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Properties strip — mono spec readout. */}
                <div className="grid grid-cols-3 border-t-2 border-foreground/80 divide-x divide-border">
                  {[
                    ['Fill', 'Primary'],
                    ['Padding', '24px'],
                    ['Radius', '0px'],
                  ].map(([k, v]) => (
                    <div key={k} className="min-w-0 px-3 py-2.5">
                      <p className="truncate font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
                        {k}
                      </p>
                      <p className="truncate text-xs font-bold tracking-tight text-card-foreground tabular-nums">
                        {v}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              {/* Rotated hard-shadow "Published!" sticker overlapping the corner. */}
              <div className="absolute -right-3 -top-5 flex items-center gap-2 rotate-2 border-2 border-foreground bg-background px-3 py-2 shadow-[4px_4px_0_0] shadow-foreground sm:-right-5">
                <span className="grid size-6 place-items-center bg-chart-2/15 text-chart-2">
                  <Check className="size-3.5" />
                </span>
                <span className="text-sm font-bold tracking-tight text-foreground">
                  {toast}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
