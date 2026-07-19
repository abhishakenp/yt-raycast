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
  HeroStatBadgeIcon,
  HeroStatBadgeContent,
  HeroStatBadgeTitle,
  HeroStatBadgeSubtitle,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * CloudInfraHero — two-column hero section for a cloud-infrastructure / developer-
 * platform SaaS landing page. Left side carries a status pill with a chart-2 dot,
 * a bold multi-size headline, supporting paragraph, dual CTAs (filled primary
 * with arrow + outlined secondary), and a row of trust checkmarks. Right side is a
 * 4:3 alt-driven image with a floating stat card overlaid at the bottom-left.
 * Uses semantic tokens throughout. CTAs and links route through section-kit route links.
 * Renders fully on zero arguments via baked-in defaults.
 */
export const CloudInfraHero = defineCapsule({
  name: 'CloudInfraHero',
  description:
    'Two-column hero section for a cloud-infrastructure / developer-platform SaaS landing page: a status pill with a chart-2 dot, a bold headline, supporting paragraph, Lakebed-backed dual pill CTAs, trust checkmark row, a 4:3 alt-driven image on the right with a floating stat card overlaid at the bottom-left. CTA intent is shared across sections. Use as the primary hero for cloud hosting, IaaS/PaaS, serverless, container, DevOps, or developer-tooling sites.',
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

    const Check = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

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
        className={cn('relative overflow-hidden bg-muted/40', props.className)}
      >
        <Container size="xl" className="py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                <span
                  aria-hidden="true"
                  className="mr-2 size-2 rounded-full bg-chart-2"
                />
                {badge}
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </h1>
              <p className="max-w-lg text-lg leading-relaxed text-muted-foreground sm:text-xl">
                {subheading}
              </p>
              <div className="flex flex-wrap gap-4">
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
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {primaryCta}
                  <ArrowRight className="ml-2 size-5" />
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
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                {trust.map((t) => (
                  <div key={t} className="flex items-center gap-2">
                    <Check className="size-5 text-chart-2" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-muted shadow-2xl">
                <Image
                  alt={imageAlt}
                  w={1200}
                  h={900}
                  className="size-full object-cover"
                />
              </div>
              <HeroStatBadge className="absolute -bottom-6 -left-6 hidden items-center gap-3 sm:flex">
                <HeroStatBadgeIcon className="size-10 bg-chart-2/15 text-chart-2">
                  <svg
                    className="size-6"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </HeroStatBadgeIcon>
                <HeroStatBadgeContent>
                  <HeroStatBadgeSubtitle className="text-xs">
                    {statLabel}
                  </HeroStatBadgeSubtitle>
                  <HeroStatBadgeTitle className="text-lg font-semibold">
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
