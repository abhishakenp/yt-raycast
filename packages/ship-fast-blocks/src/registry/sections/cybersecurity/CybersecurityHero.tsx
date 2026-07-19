import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroMediaPanel,
  HeroSocialProof,
  HeroSocialProofItem,
} from '#/section-kit/HeroSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CybersecurityHero — split, two-column hero for an enterprise security
 * platform. Left column stacks a live-status pill (pulsing dot + certification
 * microcopy), a large bold headline, a long reassuring subheading, dual CTAs
 * (solid primary + outlined secondary), and a row of check-marked trust proofs.
 * Right column shows a security command-center photo on a rotated gradient
 * backdrop with a floating "Threat Blocked" alert card overlapping its corner.
 * Both CTAs and the trust chips route through section-kit route links. Use as the opening
 * hero for cybersecurity vendors, SOC/MDR/XDR providers, threat-detection,
 * zero-trust, or cloud-security SaaS. Renders fully with no props via baked-in
 * "SentinelGuard" defaults.
 */
export const CybersecurityHero = defineCapsule({
  name: 'CybersecurityHero',
  description:
    "Split two-column hero for an enterprise cybersecurity platform: left column stacks a live-status pill, headline, subheading, scoped Lakebed demo/platform CTAs and trust proofs; right column shows a security command-center photo with a floating 'Threat Blocked' alert. CTA buttons record intent instead of colliding with navigation.",
  props: z.object({
    /** Live-status pill microcopy. */
    badge: z.string().optional(),
    /** Large hero headline. */
    heading: z.string().optional(),
    /** Supporting subheading paragraph. */
    subheading: z.string().optional(),
    /** Solid primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Check-marked trust microcopy chips under the CTAs. */
    proofs: z.array(z.string()).optional(),
    /** Alt text driving the command-center hero image. */
    imageAlt: z.string().optional(),
    /** Floating alert card title. */
    alertTitle: z.string().optional(),
    /** Floating alert card subtitle. */
    alertSubtitle: z.string().optional(),
    /** Floating alert card meta line. */
    alertMeta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const badge = props.badge ?? 'Now SOC 2 Type II Certified'
    const heading = props.heading ?? 'Security that never sleeps, so you can'
    const subheading =
      props.subheading ??
      "SentinelGuard's AI-powered platform detected and neutralized 2.4 million threats last quarter for Fortune 500 companies. Our 24/7 Security Operations Center monitors your infrastructure while you focus on growth."
    const primaryCta = props.primaryCta ?? 'Schedule Live Demo'
    const secondaryCta = props.secondaryCta ?? 'Explore Platform'
    const proofs = props.proofs?.length
      ? props.proofs
      : ['14-day free trial', 'No credit card required']
    const imageAlt =
      props.imageAlt ??
      'Cybersecurity command center with multiple monitors displaying threat monitoring dashboards and network security visualizations'
    const alertTitle = props.alertTitle ?? 'Threat Blocked'
    const alertSubtitle = props.alertSubtitle ?? 'Ransomware attempt'
    const alertMeta = props.alertMeta ?? 'Just now • Acme Corp infrastructure'

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

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Container size="xl" className="py-24 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2">
                <span className="size-2 animate-pulse rounded-full bg-primary" />
                <span className="text-sm font-medium text-muted-foreground">
                  {badge}
                </span>
              </div>
              <HeroHeading className="mb-6">{heading}</HeroHeading>
              <HeroSubheading className="mb-8 mt-0 sm:text-xl">
                {subheading}
              </HeroSubheading>
              <HeroActions className="mt-0 flex flex-col gap-4 sm:flex-row">
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={primaryCta}
                  plan={primaryCta}
                  source="hero"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Scheduling
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-4 text-center font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
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
                      Opening
                    </>
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-8 py-4 text-center font-semibold text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </HeroActions>
              <HeroSocialProof className="gap-6">
                {proofs.map((proof) => (
                  <HeroSocialProofItem key={proof}>
                    <Check className="size-5 text-primary" />
                    {proof}
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 rotate-3 rounded-3xl bg-gradient-to-br from-muted to-accent"
              />
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="relative aspect-[4/3] w-full shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 max-w-xs rounded-xl bg-card p-4 shadow-xl sm:p-6">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10">
                    <svg
                      className="size-5 text-destructive"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-card-foreground">
                      {alertTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {alertSubtitle}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{alertMeta}</p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
