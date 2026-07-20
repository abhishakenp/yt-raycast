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
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * CybersecurityHero — terminal-stealth asymmetric hero (7:5 split) for an
 * enterprise security platform. A giant "//"-glyph ghost watermark sits behind
 * the band. Left column: a hairline status rule (pulsing primary square + mono
 * badge microcopy + decorative "[ CLEARANCE: L4 ]" tag), an oversized
 * extrabold display headline, the subheading, a decorative mono
 * redaction-bar intercept line (solid censor blocks over non-essential words),
 * dual square-edged CTAs (ink-inverted primary with hard-offset shadow +
 * hairline secondary, both with press feedback), and mono "[ OK ]" trust
 * proofs. Right column: the command-center photo on a solid offset ink block
 * with a vertical mono feed rail and a square incident-log alert card
 * (destructive status mark) overlapping its corner. CTA buttons record scoped
 * Lakebed intent. Use as the opening hero for cybersecurity vendors,
 * SOC/MDR/XDR providers, threat-detection, zero-trust, or cloud-security SaaS.
 * Renders fully with no props via baked-in "SentinelGuard" defaults.
 */
export const CybersecurityHero = defineCapsule({
  name: 'CybersecurityHero',
  description:
    "Terminal-stealth asymmetric 7:5 hero for an enterprise cybersecurity platform: left column stacks a mono status rule with clearance tag, oversized extrabold display headline, subheading, decorative redaction-bar intercept line, scoped Lakebed demo/platform CTAs (square-edged, hard-offset shadow, press feedback) and mono '[ OK ]' trust proofs; right column shows the command-center photo on a solid offset ink block with a vertical mono rail and a square 'Threat Blocked' incident-log card. CTA buttons record intent instead of colliding with navigation.",
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

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-right-10 top-2 text-[9rem] sm:text-[14rem] lg:-right-4 lg:text-[20rem]">
          {'//'}
        </Watermark>
        <Container size="xl" className="relative py-16 pb-24 sm:py-20 lg:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-border pb-4">
                <span className="flex items-center gap-2.5">
                  <span
                    aria-hidden="true"
                    className="size-2 animate-pulse bg-primary"
                  />
                  <MonoTag className="text-foreground">{badge}</MonoTag>
                </span>
                <MonoTag aria-hidden="true" tone="faint">
                  [ clearance: L4 ]
                </MonoTag>
              </div>
              <HeroHeading className="mb-6 text-[clamp(2.5rem,6.5vw,5rem)] font-extrabold leading-[0.95] tracking-tight">
                {heading}
              </HeroHeading>
              <HeroSubheading className="mb-6 mt-0 max-w-xl text-base sm:text-lg">
                {subheading}
              </HeroSubheading>
              <p
                aria-hidden="true"
                className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70"
              >
                <span>intercepted</span>
                <span className="inline-block h-3 w-14 bg-foreground" />
                <span>neutralized</span>
                <span className="inline-block h-3 w-9 bg-foreground" />
                <span>02:14 utc</span>
              </p>
              <HeroActions className="mt-0 grid grid-cols-1 gap-3 sm:flex sm:flex-row sm:gap-4">
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
                  className="inline-flex items-center justify-center gap-2 rounded-none bg-foreground px-8 py-4 text-center font-mono text-xs font-semibold uppercase tracking-[0.15em] text-background shadow-[5px_5px_0_0] shadow-foreground/25 transition-all duration-150 hover:bg-foreground/90 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
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
                  className="inline-flex items-center justify-center gap-2 rounded-none border border-foreground/25 bg-background px-8 py-4 text-center font-mono text-xs font-semibold uppercase tracking-[0.15em] text-foreground transition-all duration-150 hover:border-foreground hover:bg-muted active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              </HeroActions>
              <HeroSocialProof className="mt-8 gap-x-6 gap-y-2">
                {proofs.map((proof) => (
                  <HeroSocialProofItem
                    key={proof}
                    className="gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground"
                  >
                    <span aria-hidden="true" className="text-foreground">
                      [ OK ]
                    </span>
                    {proof}
                  </HeroSocialProofItem>
                ))}
              </HeroSocialProof>
            </div>
            <div className="relative lg:col-span-5">
              <div
                aria-hidden="true"
                className="absolute inset-0 translate-x-3 translate-y-3 bg-foreground"
              />
              <span
                aria-hidden="true"
                className="absolute -right-7 top-0 hidden select-none font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 [writing-mode:vertical-rl] xl:block"
              >
                sentinel feed // live
              </span>
              <HeroMediaPanel
                alt={imageAlt}
                w={800}
                h={600}
                className="relative aspect-[4/3] w-full rounded-none border border-foreground/20"
              />
              <div className="absolute -bottom-8 -left-2 max-w-xs rounded-none border border-border bg-card p-4 shadow-[6px_6px_0_0] shadow-foreground/20 sm:-left-6 sm:p-5">
                <p
                  aria-hidden="true"
                  className="mb-3 flex items-center justify-between gap-4 border-b border-border pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground"
                >
                  <span>// incident-log</span>
                  <span className="size-2 bg-destructive" />
                </p>
                <p className="font-bold tracking-tight text-card-foreground">
                  {alertTitle}
                </p>
                <p className="text-sm text-muted-foreground">{alertSubtitle}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">
                  {alertMeta}
                </p>
              </div>
            </div>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
