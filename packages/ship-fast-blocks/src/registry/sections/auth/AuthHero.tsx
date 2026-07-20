import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCta,
  HeroCodeWindow,
  HeroCodeWindowHeader,
  HeroCodeWindowBody,
} from '#/section-kit/HeroSection.tsx'
import { Drift, Float, Glow, GridField, Tilt } from '#/section-kit/motion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * AuthHero — the opening spread of the "clearance dossier" hero for Authly, an
 * authentication-as-a-service product (think Clerk / Auth0). The whole page is
 * art-directed as a declassified access-control file about your app: the left
 * column opens with a mono case-file line, an oversized tight-tracked
 * headline crossed by a rotated double-border "ACCESS GRANTED" stamp, a
 * supporting paragraph, dual CTAs, and a quiet mono trust line. The right
 * column is EXHIBIT A: a tilt-reactive code window inside a dashed evidence
 * frame, wearing a rotated exhibit tag, a TLS tag, a session status strip,
 * and a floating "session verified" chip. Graph-paper grid and one drifting
 * token glow light the section. CTAs route through section-kit route links; nothing in
 * the exhibit is interactive. Use as the opening hero for auth platforms,
 * identity APIs, login SDKs, or any developer-first SaaS. Renders fully with
 * no props.
 */
const codeLineTone = (line: string) =>
  line.trimStart().startsWith('//')
    ? 'text-muted-foreground italic'
    : 'text-foreground/90'

export const AuthHero = defineCapsule({
  name: 'AuthHero',
  description:
    "Clearance-dossier hero for a developer-auth product (Authly, an authentication-as-a-service like Clerk / Auth0): a mono case-file line, an oversized tight-tracked headline crossed by a rotated double-border 'ACCESS GRANTED' stamp, a supporting paragraph, a Lakebed-backed primary sign-up CTA with scoped loading, an outlined Docs route, and a quiet mono trust line — beside EXHIBIT A, a tilt-reactive code window in a dashed evidence frame with an exhibit tag, session status strip, tone-tinted SDK lines, and a floating 'session verified' chip, on graph paper with a drifting token glow. Use as the opening hero for auth platforms, identity APIs, login SDKs, or developer-first SaaS pages.",
  props: z.object({
    /** Small uppercase eyebrow pill above the headline. */
    eyebrow: z.string().optional(),
    /** Large headline. */
    heading: z.string().optional(),
    /** Supporting paragraph beneath the headline. */
    subheading: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    /** Small trust line beneath the CTAs (segments split on '·'). */
    trustLine: z.string().optional(),
    /** Mono code lines shown in the preview card. */
    codeLines: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Auth-as-a-service'
    const heading = props.heading ?? 'Authentication for developers'
    const subheading =
      props.subheading ??
      'Drop in secure sign-in, SSO, MFA, and user management with a few lines of code. Authly handles sessions, tokens, and compliance so you can ship features instead of building auth.'
    const primaryCta = props.primaryCta ?? 'Start Building'
    const primaryTarget = props.primaryTarget ?? 'Sign Up'
    const secondaryCta = props.secondaryCta ?? 'Docs'
    const secondaryTarget = props.secondaryTarget ?? 'Docs'
    const trustLine =
      props.trustLine ??
      'Free up to 10,000 monthly active users · No credit card required'
    const trustItems = trustLine
      .split('·')
      .map((item) => item.trim())
      .filter(Boolean)
    const codeLines = props.codeLines?.length
      ? props.codeLines
      : [
          'import { Auth } from "@authly/sdk"',
          '',
          'const auth = new Auth({',
          '  apiKey: process.env.AUTHLY_KEY,',
          '})',
          '',
          '// protect any route',
          'export const session = await auth.verify(req)',
        ]

    return (
      <HeroSection
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <GridField
          size={52}
          className="text-foreground/[0.06]"
          mask="radial-gradient(ellipse 90% 70% at 50% 0%, black 20%, transparent 78%)"
        />
        <Drift x={40} y={-24} duration={26} className="absolute inset-0">
          <Glow className="-top-32 left-[-10%] h-96 w-[36rem] bg-primary/15" />
        </Drift>

        <Container className="relative grid grid-cols-1 items-center gap-12 px-5 py-16 sm:py-24 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)] md:gap-10 lg:py-28 xl:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)] xl:gap-16">
          <div className="flex min-w-0 flex-col md:max-w-xl lg:max-w-2xl">
            <HeroBadge
              variant="solid"
              className="w-full max-w-xl items-baseline gap-3 rounded-none border-0 bg-transparent p-0 font-mono text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase"
            >
              <span className="shrink-0 font-bold text-primary">file 0001</span>
              <span
                aria-hidden="true"
                className="h-px min-w-4 flex-1 self-center bg-border"
              />
              <span className="shrink-0">{eyebrow}</span>
            </HeroBadge>

            <HeroHeading className="mt-6 max-w-2xl origin-left -rotate-1 text-balance text-[2.6rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl md:text-6xl lg:text-7xl">
              {heading}
            </HeroHeading>

            <HeroSubheading className="mt-6 max-w-xl text-pretty text-base leading-7 sm:text-lg sm:leading-8">
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-9 grid grid-cols-2 gap-3 sm:inline-grid sm:w-fit">
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={primaryTarget}
                plan={primaryCta}
                source="hero"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Starting
                  </>
                }
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-primary/90 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-70 sm:px-7"
              >
                {primaryCta}
              </SaasPlanActionButton>
              <HeroCta
                asChild
                variant="outline"
                className="min-h-12 rounded-xl bg-background/70 px-4 py-3 text-sm font-semibold backdrop-blur transition-[background-color,border-color,transform] duration-150 ease-out hover:border-foreground/25 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:px-7"
              >
                <NavbarRouteLink href={secondaryTarget}>
                  {secondaryCta}
                </NavbarRouteLink>
              </HeroCta>
            </HeroActions>

            <p className="mt-7 max-w-md font-mono text-xs leading-6 text-muted-foreground">
              {trustItems.join(' · ')}
            </p>
          </div>

          <div className="relative min-w-0 md:justify-self-stretch">
            <div
              aria-hidden="true"
              className="absolute -inset-3 rounded-3xl border-2 border-dashed border-foreground/15 sm:-inset-5"
            />
            <span
              aria-hidden="true"
              className="absolute -bottom-3 right-8 z-10 bg-background px-2 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground sm:-bottom-[0.85rem]"
            >
              exhibit a
            </span>
            <span
              aria-hidden="true"
              className="absolute -top-4 -left-2 z-20 inline-flex -rotate-6 rounded-lg border-[3px] border-double border-primary bg-background/85 px-2.5 py-1 font-mono text-[0.68rem] font-bold uppercase tracking-[0.14em] text-primary backdrop-blur-sm md:-top-5 md:-left-4 md:px-3.5 md:py-1.5 md:text-xs"
            >
              access granted
            </span>
            <Tilt max={4} glare className="relative rounded-2xl">
              <HeroCodeWindow className="relative max-h-[26rem] min-w-0 overflow-hidden rounded-2xl border-border/80 bg-card shadow-2xl shadow-primary/10 md:max-h-[30rem]">
                <HeroCodeWindowHeader className="bg-muted/70">
                  <span className="font-mono text-xs text-foreground/80">
                    auth.ts
                  </span>
                  <span className="ml-auto inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-muted-foreground">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-primary"
                    />
                    tls 1.3
                  </span>
                </HeroCodeWindowHeader>
                <div className="grid grid-cols-3 border-b border-border bg-background/80 font-mono text-[0.68rem] text-muted-foreground">
                  {['session.valid', 'mfa.required', 'risk.low'].map(
                    (item, index) => (
                      <span
                        key={item}
                        className="inline-flex min-w-0 items-center gap-1.5 border-r border-border px-3 py-2 last:border-r-0"
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            'size-1.5 shrink-0 rounded-full',
                            index === 0 ? 'bg-primary' : 'bg-border',
                          )}
                        />
                        <span className="truncate">{item}</span>
                      </span>
                    ),
                  )}
                </div>
                <HeroCodeWindowBody className="overflow-x-auto p-4 text-[0.78rem] leading-6 sm:p-5 sm:text-sm">
                  <pre className="min-w-max">
                    {codeLines.map((line, i) => (
                      <div key={i} className="flex min-w-max">
                        <span
                          aria-hidden="true"
                          className="mr-4 w-5 shrink-0 select-none text-right text-muted-foreground/60"
                        >
                          {i + 1}
                        </span>
                        <span className={codeLineTone(line)}>
                          {line || ' '}
                        </span>
                      </div>
                    ))}
                  </pre>
                </HeroCodeWindowBody>
              </HeroCodeWindow>
            </Tilt>
            <Float
              amplitude={6}
              duration={5}
              className="absolute -bottom-5 left-6 z-10 md:block"
            >
              <span
                aria-hidden="true"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/95 px-4 py-2 font-mono text-xs text-foreground shadow-lg shadow-foreground/10 backdrop-blur"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                session verified · 12ms
              </span>
            </Float>
          </div>
        </Container>
      </HeroSection>
    )
  },
})
