import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  HeroSection,
  HeroBadge,
  HeroHeading,
  HeroSubheading,
  HeroCtas,
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
      <HeroSection className={cn('bg-background', props.className)}>
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-28">
          <div className="flex flex-col">
            <HeroBadge
              variant="solid"
              className="w-fit border border-border text-xs tracking-[0.18em] text-accent uppercase"
            >
              {eyebrow}
            </HeroBadge>

            <HeroHeading className="mt-6 max-w-xl font-semibold">
              {heading}
            </HeroHeading>

            <HeroSubheading className="mt-6 max-w-xl text-base sm:text-lg">
              {subheading}
            </HeroSubheading>

            <HeroCtas className="mt-9 flex flex-col gap-4 sm:flex-row">
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
                className="inline-flex items-center justify-center rounded-lg bg-primary px-7 py-3.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </SaasPlanActionButton>
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-7 py-3.5 font-medium text-foreground transition-colors hover:bg-muted"
              >
                {secondaryCta}
              </button>
            </HeroCtas>

            <p className="mt-6 text-sm text-muted-foreground">{trustLine}</p>
          </div>

          <div className="relative">
            <div className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
              <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-3">
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
              </div>
              <pre className="overflow-x-auto px-5 py-5 font-mono text-sm leading-relaxed text-card-foreground">
                {codeLines.map((line, i) => (
                  <div key={i} className="flex">
                    <span
                      aria-hidden="true"
                      className="mr-4 select-none text-muted-foreground"
                    >
                      {String(i + 1).padStart(2, ' ')}
                    </span>
                    <span>{line || ' '}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>
        </div>
      </HeroSection>
    )
  },
})
