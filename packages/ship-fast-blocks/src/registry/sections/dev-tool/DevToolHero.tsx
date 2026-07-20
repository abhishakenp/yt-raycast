import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ContentCard } from '#/section-kit/ContentCard.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DevToolHero — full-terminal asymmetric 7/5 hero for a developer tool / API
 * platform. Left column: a square mono release chip with a blinking block
 * cursor, a giant extrabold tight-tracked headline with the key phrase in the
 * primary accent, a supporting paragraph, dual square-cornered CTAs (primary
 * with hard offset shadow + hairline mono secondary, both with press feedback),
 * and a mono "#"-comment footnote. Right column: a sharp-cornered terminal
 * window pane — mono title bar with square chrome dots and a filename tab, the
 * SDK snippet with a "$" prompt rail, and an aria-hidden diff-motif status
 * footer (+/- rows tinted chart-1/destructive) — plus a floating square
 * developer-avatar proof chip. A giant ghost ">_" watermark and faint dot grid
 * sit behind. Use as the top hero for developer tools, API platforms,
 * backend-as-a-service, or technical SaaS landing pages.
 */
export const DevToolHero = defineCapsule({
  name: 'DevToolHero',
  description:
    "Full-terminal asymmetric 7/5 hero for a developer tool / API platform: a left column with a square mono release chip (blinking block cursor), a giant extrabold headline with a primary-accent phrase, a supporting paragraph, a Lakebed-backed square hard-shadow primary CTA, a hairline mono routable docs CTA, and a mono '#'-comment footnote, beside a sharp terminal window pane (mono title bar with square chrome dots + filename tab, '$'-prompt SDK snippet, aria-hidden +/- diff status footer) with a floating square developer-avatar proof chip; a giant ghost '>_' watermark and faint dot grid sit behind. Use as the top hero for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    badge: z.string().optional(),
    headingTop: z.string().optional(),
    /** Phrase rendered in the brand/primary accent color. */
    highlight: z.string().optional(),
    headingBottom: z.string().optional(),
    subheading: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    footnote: z.string().optional(),
    /** Filename label on the code-window title bar. */
    codeFile: z.string().optional(),
    /** Raw code shown in the code-window mockup. */
    code: z.string().optional(),
    /** Floating social-proof card. */
    proofTitle: z.string().optional(),
    proofSubtitle: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'v2.4 Now Available'
    const headingTop =
      props.headingTop ?? 'Build faster with developer APIs that'
    const highlight = props.highlight ?? 'just work'
    const headingBottom = props.headingBottom ?? ''
    const subheading =
      props.subheading ??
      'Authentication, storage, real-time events, and more — all in one platform. Used by 50,000+ developers at companies like Stripe, Notion, and Linear.'
    const primaryCta = props.primaryCta ?? 'Start Building Free'
    const secondaryCta = props.secondaryCta ?? 'View Documentation'
    const footnote =
      props.footnote ?? 'No credit card required. 10,000 free requests/month.'
    const codeFile = props.codeFile ?? 'example.js'
    const code =
      props.code ??
      `import { DevStack } from '@devstack/sdk';
import { HeroSection } from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

const ds = new DevStack({
  apiKey: process.env.DS_API_KEY
});

// Authenticate a user
const user = await ds.auth.verify({
  email: 'sarah@acme.com',
  token: 'otp_123456'
});

// Store user data
await ds.storage.set(\`user:\${user.id}\`, {
  preferences: { theme: 'dark' },
  lastLogin: new Date().toISOString()
});`
    const proofTitle = props.proofTitle ?? '50,000+ developers'
    const proofSubtitle = props.proofSubtitle ?? 'trust DevStack'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <line x1="3" y1="12" x2="21" y2="12" />
        <polyline points="14 6 21 12 14 18" />
      </svg>
    )

    return (
      <HeroSection
        variant="split"
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
        aria-labelledby="hero-heading"
      >
        <DotGrid
          density="default"
          tone="faint"
          fade="bottom"
          className="inset-x-0 top-0 h-72"
        />
        <Watermark className="-bottom-14 -left-6 font-mono text-[11rem] sm:text-[16rem] lg:-bottom-24 lg:text-[24rem]">
          &gt;_
        </Watermark>
        <Container size="xl" className="relative py-16 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="min-w-0 max-w-2xl lg:col-span-7">
              <div className="mb-6 inline-flex items-center gap-2 border border-border bg-background px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground">
                <span
                  aria-hidden="true"
                  className="h-3 w-1.5 animate-pulse bg-primary motion-reduce:animate-none"
                />
                {badge}
              </div>
              <h1
                id="hero-heading"
                className="mb-6 text-4xl font-extrabold leading-[1.02] tracking-tighter text-foreground sm:text-5xl lg:text-6xl"
              >
                {headingTop} <span className="text-primary">{highlight}</span>
                {headingBottom ? ` ${headingBottom}` : null}
              </h1>
              <p className="mb-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
                {subheading}
              </p>
              <div className="mb-8 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4">
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none bg-primary px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-[transform,box-shadow,background-color] duration-150 hover:bg-primary/90 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none motion-reduce:transform-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight />
                </SaasPlanActionButton>
                <NavbarRouteLink
                  className="inline-flex min-h-12 items-center justify-center rounded-none border border-foreground/25 bg-background px-6 py-3 font-mono text-sm font-semibold uppercase tracking-[0.08em] text-foreground transition-[background-color,transform] duration-150 hover:bg-muted active:translate-y-px motion-reduce:transform-none"
                  href={secondaryCta}
                >
                  {secondaryCta}
                </NavbarRouteLink>
              </div>
              <p className="font-mono text-xs text-muted-foreground">
                <span aria-hidden="true" className="text-muted-foreground/60">
                  #{' '}
                </span>
                {footnote}
              </p>
            </div>

            {/* Terminal window pane */}
            <div className="relative min-w-0 lg:col-span-5">
              <ContentCard
                variant="figure-dark"
                className="rounded-none border-foreground/20 shadow-none"
              >
                <div className="flex items-center gap-2 border-b border-background/15 bg-foreground px-4 py-3">
                  <div className="flex gap-1.5" aria-hidden="true">
                    <div className="size-2 bg-background/30" />
                    <div className="size-2 bg-background/30" />
                    <div className="size-2 bg-background/60" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] uppercase tracking-[0.12em] text-background/60">
                    {codeFile}
                  </span>
                  <span
                    aria-hidden="true"
                    className="ml-auto font-mono text-[11px] text-background/40"
                  >
                    — bash
                  </span>
                </div>
                <div className="relative overflow-x-auto p-4">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-4 top-4 select-none font-mono text-sm leading-relaxed text-background/35"
                  >
                    $
                  </span>
                  <pre className="pl-5 font-mono text-sm leading-relaxed text-background/90">
                    <code>{code}</code>
                  </pre>
                </div>
                {/* Diff-motif status footer (abstract +/- rows). */}
                <div
                  aria-hidden="true"
                  className="flex items-center gap-4 border-t border-background/15 px-4 py-2.5 font-mono text-[11px]"
                >
                  <span className="uppercase tracking-[0.12em] text-background/40">
                    [ ok ] exit 0
                  </span>
                  <span className="flex items-center gap-1.5 text-chart-1">
                    +<span className="h-1.5 w-10 bg-chart-1/70" />
                  </span>
                  <span className="flex items-center gap-1.5 text-destructive">
                    −<span className="h-1.5 w-4 bg-destructive/70" />
                  </span>
                </div>
              </ContentCard>
              <Card
                variant="outline"
                className="absolute -bottom-4 -right-2 hidden rounded-none border-foreground/25 bg-background p-3 shadow-[4px_4px_0_0] shadow-foreground/20 sm:block lg:-right-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex -space-x-2">
                    <Image
                      alt="portrait headshot of a female product manager"
                      w={80}
                      h={80}
                      className="size-8 rounded-full border-2 border-background"
                    />
                    <Image
                      alt="portrait headshot of a male software engineer with glasses"
                      w={80}
                      h={80}
                      className="size-8 rounded-full border-2 border-background"
                    />
                    <Image
                      alt="portrait headshot of a female developer with blonde hair"
                      w={80}
                      h={80}
                      className="size-8 rounded-full border-2 border-background"
                    />
                  </div>
                  <div className="text-xs">
                    <p className="font-mono font-semibold text-foreground">
                      {proofTitle}
                    </p>
                    <p className="font-mono text-[11px] text-muted-foreground">
                      {proofSubtitle}
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
