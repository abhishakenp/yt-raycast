import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroActions,
  HeroCodeWindow,
  HeroCodeWindowHeader,
  HeroCodeWindowBody,
} from '#/section-kit/HeroSection.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AuthHero — bespoke two-column developer hero for Authly, an authentication-as-a-service
 * product (think Clerk / Auth0). The left column stacks an eyebrow pill, a large
 * sharp headline ("Authentication for developers"), a supporting paragraph, dual
 * CTAs (filled "Start Building" + outlined "Docs"), and a small trust line. The
 * right column shows a presentational code-snippet preview card — a faux editor
 * window with a dot bar and a few token-styled, font-mono SDK lines — so the
 * developer story reads instantly. CTAs route through useNavigate; nothing in the
 * preview is interactive. Use as the opening hero for auth platforms, identity
 * APIs, login SDKs, or any developer-first SaaS. Renders fully with no props.
 */
export const AuthHero = defineCapsule({
  name: 'AuthHero',
  description:
    "Bespoke two-column developer hero for a developer-auth product (Authly, an authentication-as-a-service like Clerk / Auth0). Left column: an uppercase eyebrow pill, a large sharp headline 'Authentication for developers', a supporting paragraph, a Lakebed-backed primary sign-up CTA with scoped loading, an outlined Docs route, and a small trust line. Right column: a presentational faux-editor preview card with token-styled SDK lines. Use as the opening hero for auth platforms, identity APIs, login SDKs, or developer-first SaaS pages.",
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
    /** Small trust line beneath the CTAs. */
    trustLine: z.string().optional(),
    /** Mono code lines shown in the preview card. */
    codeLines: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
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
        className={cn('overflow-hidden bg-background', props.className)}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-5 py-16 sm:px-6 sm:py-20 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.95fr)] md:gap-8 lg:gap-14 lg:px-8 lg:py-28 xl:grid-cols-[minmax(0,0.92fr)_minmax(28rem,1.08fr)]">
          <div className="flex min-w-0 flex-col md:max-w-xl lg:max-w-2xl">
            <HeroBadge
              variant="solid"
              className="w-fit border border-border text-[0.68rem] tracking-[0.18em] text-accent uppercase sm:text-xs"
            >
              {eyebrow}
            </HeroBadge>

            <HeroHeading className="mt-5 max-w-xl text-3xl font-semibold sm:text-4xl md:text-5xl lg:text-6xl">
              {heading}
            </HeroHeading>

            <HeroSubheading className="mt-5 max-w-xl text-base leading-7 sm:text-lg">
              {subheading}
            </HeroSubheading>

            <HeroActions className="mt-8 grid grid-cols-1 gap-3 sm:inline-grid sm:w-fit sm:grid-cols-2">
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
                className="inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {primaryCta}
              </SaasPlanActionButton>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex min-h-12 items-center justify-center rounded-lg border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </HeroActions>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">
              {trustLine}
            </p>
          </div>

          <div className="relative min-w-0 md:justify-self-stretch">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-3xl border border-primary/10 bg-primary/[0.03]"
            />
            <HeroCodeWindow className="relative max-h-[26rem] min-w-0 overflow-hidden rounded-2xl shadow-lg shadow-foreground/5 md:max-h-[30rem]">
              <HeroCodeWindowHeader className="bg-muted/70">
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-border"
                />
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-border"
                />
                <span
                  aria-hidden="true"
                  className="size-3 rounded-full bg-border"
                />
                <span className="ml-3 font-mono text-xs text-muted-foreground">
                  auth.ts
                </span>
              </HeroCodeWindowHeader>
              <HeroCodeWindowBody className="overflow-x-auto p-4 text-[0.78rem] leading-6 sm:p-5 sm:text-sm">
                <pre className="min-w-max">
                  {codeLines.map((line, i) => (
                    <div key={i} className="flex min-w-max">
                      <span
                        aria-hidden="true"
                        className="mr-4 w-5 shrink-0 select-none text-right text-muted-foreground"
                      >
                        {i + 1}
                      </span>
                      <span>{line || ' '}</span>
                    </div>
                  ))}
                </pre>
              </HeroCodeWindowBody>
            </HeroCodeWindow>
          </div>
        </div>
      </HeroSection>
    )
  },
})
