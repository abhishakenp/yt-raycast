import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
  CtaAction,
} from '#/section-kit/CtaBand.tsx'
import { cn } from '#/lib/utils.ts'
import { Drift, Glow } from '#/section-kit/motion.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'

/**
 * AuthCta — inverted closing conversion band for Authly, a developer
 * authentication product. The dark foreground-toned band carries a slowly
 * drifting primary glow; the left column stacks a mono
 * eyebrow chip, a large tight-tracked headline ("Add auth in
 * minutes"), a short developer-focused subtitle, and two CTAs — a
 * high-contrast "Start Free" action plus an outlined "Read the Docs" route.
 * The right column is a terminal "action panel" console echoing the chosen
 * CTAs as key/value log lines with dotted leaders. Primary actions record
 * Lakebed intent; docs route through section-kit route links. Use near the bottom of an
 * auth platform, identity API, or login SDK page to drive sign-ups. Renders
 * fully with no props.
 */
export const AuthCta = defineCapsule({
  name: 'AuthCta',
  description:
    "Inverted closing conversion band for a developer-auth product backed by shared Lakebed conversion state: a dark band with a drifting primary glow, a mono eyebrow chip, a large tight-tracked headline ('Add auth in minutes'), a short developer-focused subtitle, and paired CTAs beside a terminal 'action panel' console that echoes the chosen actions as key/value log lines. Primary sign-up/sales actions record fullstack intent with scoped loading; secondary documentation actions still route through section-kit route links. Use near the bottom of an auth platform, identity API, or login SDK page to drive sign-ups.",
  props: z.object({
    /** Small eyebrow above the headline. */
    eyebrow: z.string().optional(),
    /** Conversion headline (maps to CtaBand title). */
    headline: z.string().optional(),
    /** Short supporting line (maps to CtaBand subtitle). */
    subheading: z.string().optional(),
    /** High-contrast primary CTA label. */
    primaryCta: z.string().optional(),
    /** Route label the primary CTA navigates to. */
    primaryTarget: z.string().optional(),
    /** Outlined secondary CTA label. */
    secondaryCta: z.string().optional(),
    /** Route label the secondary CTA navigates to. */
    secondaryTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Get started'
    const headline = props.headline ?? 'Add auth in minutes'
    const subheading =
      props.subheading ??
      'Spin up secure sign-in, SSO, and MFA with a few lines of code. Free up to 10,000 monthly active users — no credit card required.'
    const primaryCta = props.primaryCta ?? 'Start Free'
    const primaryTarget = props.primaryTarget ?? 'Sign Up'
    const secondaryCta = props.secondaryCta ?? 'Read the Docs'
    const secondaryTarget = props.secondaryTarget ?? 'Docs'
    const secondaryIsDocs = /\b(doc|guide|learn|read)\b/i.test(secondaryCta)
    const panelRows = [
      { key: 'primary', value: primaryCta },
      { key: 'destination', value: primaryTarget },
      { key: 'secondary', value: secondaryCta },
    ]

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden border-y border-border bg-foreground',
          props.className,
        )}
      >
        <Drift x={36} y={-20} duration={28} className="absolute inset-0">
          <Glow className="-top-24 right-[-10%] h-80 w-[32rem] bg-primary/20" />
        </Drift>
        <CtaBandInner
          align="left"
          className="relative grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 text-left sm:px-6 sm:py-24 lg:grid-cols-[minmax(0,1.1fr)_minmax(18rem,0.65fr)] lg:px-8"
        >
          <div className="min-w-0">
            <CtaBandEyebrow className="inline-flex items-center rounded-full border border-background/20 bg-background/10 px-3.5 py-1.5 font-mono text-[0.68rem] tracking-[0.14em] text-background/80">
              {eyebrow}
            </CtaBandEyebrow>
            <CtaBandTitle className="mt-6 max-w-3xl text-balance text-3xl font-semibold leading-[1.06] tracking-[-0.03em] text-background sm:text-4xl md:text-5xl lg:text-6xl">
              {headline}
            </CtaBandTitle>
            <CtaBandSubtitle className="mt-5 max-w-2xl text-pretty text-base leading-7 text-background/70 sm:text-lg sm:leading-8">
              {subheading}
            </CtaBandSubtitle>
            <div className="mt-9 grid w-full max-w-md grid-cols-2 gap-3 sm:max-w-none sm:w-auto sm:grid-cols-2 lg:max-w-xl">
              <SaasPlanActionButton
                lakebed={lakebed}
                intentLabel={primaryTarget}
                plan={primaryCta}
                source="cta"
                pendingChildren={
                  <>
                    <SaasMutationSpinner className="size-4" />
                    Starting
                  </>
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-background px-4 py-3 text-sm font-semibold text-foreground shadow-sm transition-[background-color,transform] duration-150 ease-out hover:bg-background/90 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground disabled:pointer-events-none disabled:opacity-70 sm:px-7"
              >
                {primaryCta}
              </SaasPlanActionButton>
              {secondaryIsDocs ? (
                <CtaAction
                  variant="outline"
                  className="min-h-12 rounded-xl border-background/25 bg-transparent px-4 py-3 text-sm font-semibold text-background transition-[background-color,border-color,transform] duration-150 ease-out hover:border-background/50 hover:bg-background/10 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground sm:px-7"
                  asChild
                >
                  <NavbarRouteLink href={secondaryTarget}>
                    {secondaryCta}
                  </NavbarRouteLink>
                </CtaAction>
              ) : (
                <SaasPlanActionButton
                  lakebed={lakebed}
                  intentLabel={secondaryTarget}
                  plan={secondaryCta}
                  source="cta"
                  pendingChildren={
                    <>
                      <SaasMutationSpinner className="size-4" />
                      Sending
                    </>
                  }
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-background/25 px-4 py-3 text-sm font-semibold text-background transition-[background-color,border-color,transform] duration-150 ease-out hover:border-background/50 hover:bg-background/10 active:scale-[0.98] motion-reduce:transform-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-background/70 focus-visible:ring-offset-2 focus-visible:ring-offset-foreground disabled:pointer-events-none disabled:opacity-70 sm:px-7"
                >
                  {secondaryCta}
                </SaasPlanActionButton>
              )}
            </div>
          </div>

          <div className="relative min-w-0 rotate-1 rounded-2xl border border-background/15 bg-background/[0.07] p-5 font-mono text-xs text-background/70 shadow-sm shadow-background/5 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="absolute -top-5 right-6 z-10 inline-flex rotate-3 rounded-lg border-[3px] border-double border-primary bg-foreground/80 px-3.5 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.14em] text-primary backdrop-blur-sm max-lg:-top-4 max-lg:px-2.5 max-lg:py-1 max-lg:text-[0.68rem]"
            >
              cleared for production
            </span>
            <div className="flex items-center justify-between border-b border-background/15 pb-3 uppercase tracking-[0.14em]">
              <span>action panel</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-primary"
                />
                ready
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {panelRows.map((row) => (
                <div
                  key={row.key}
                  className="flex min-w-0 items-baseline gap-3"
                >
                  <span className="shrink-0">{row.key}</span>
                  <span
                    aria-hidden="true"
                    className="min-w-4 flex-1 border-b border-dotted border-background/25"
                  />
                  <span className="truncate text-background">{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
