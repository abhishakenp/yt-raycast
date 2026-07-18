import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Card } from '#/section-kit/Card.tsx'
import { ContentCard } from '#/section-kit/ContentCard.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { HeroSection } from '#/section-kit/HeroSection.tsx'

/**
 * DevToolHero — two-column product hero for a developer tool / API platform.
 * A muted-banded section with a left content column (animated release/version
 * pill, bold headline with a brand-accent highlighted phrase, supporting
 * paragraph, dual CTAs — filled primary + outline secondary — and a no-credit-
 * card footnote) beside a right dark code-window mockup (traffic-light dots,
 * filename tab, syntax-spaced SDK snippet) with a floating developer-avatar
 * social-proof card. Clean light slate-and-blue aesthetic. All CTAs route
 * through useNavigate. Use as the top hero for developer tools, API platforms,
 * backend-as-a-service, or technical SaaS landing pages.
 */
export const DevToolHero = defineCapsule({
  name: 'DevToolHero',
  description:
    'Two-column product hero for a developer tool / API platform: a left content column with an animated release/version pill, a bold headline with a brand-accent highlighted phrase, a supporting paragraph, a Lakebed-backed primary conversion CTA, a routable docs CTA, and a no-credit-card footnote, beside a right dark code-window mockup with a floating developer-avatar social-proof card. Clean light slate-and-blue aesthetic. Use as the top hero for developer tools, API platforms, backend-as-a-service, or technical SaaS.',
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
    const go = useNavigate()
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
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                {badge}
              </div>
              <h1
                id="hero-heading"
                className="mb-6 text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl"
              >
                {headingTop} <span className="text-primary">{highlight}</span>
                {headingBottom ? ` ${headingBottom}` : null}
              </h1>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
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
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight />
                </SaasPlanActionButton>
                <button
                  type="button"
                  onClick={() => go(secondaryCta)}
                  className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-6 py-3 font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {secondaryCta}
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{footnote}</p>
            </div>

            {/* Code window mockup */}
            <div className="relative">
              <ContentCard variant="figure-dark" className="shadow-2xl">
                <div className="flex items-center gap-2 border-b border-border/30 bg-foreground/95 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-destructive" />
                    <div className="size-3 rounded-full bg-chart-4" />
                    <div className="size-3 rounded-full bg-chart-2" />
                  </div>
                  <span className="ml-2 font-mono text-xs text-background/60">
                    {codeFile}
                  </span>
                </div>
                <div className="overflow-x-auto p-4">
                  <pre className="font-mono text-sm leading-relaxed text-background/90">
                    <code>{code}</code>
                  </pre>
                </div>
              </ContentCard>
              <Card
                rounded="lg"
                padding="none"
                shadow="lg"
                variant="outline"
                className="absolute -bottom-4 -right-4 hidden bg-background p-3 sm:block"
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
                    <p className="font-semibold text-foreground">
                      {proofTitle}
                    </p>
                    <p className="text-muted-foreground">{proofSubtitle}</p>
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
