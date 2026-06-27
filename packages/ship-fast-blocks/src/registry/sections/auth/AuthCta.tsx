import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * AuthCta — bold, centered conversion band for Authly, a developer authentication
 * product. Thin configuration over the shared `CtaBand` composite at
 * `tone="primary"`: an eyebrow, a strong headline ("Add auth in minutes"), a
 * short developer-focused subtitle, and a centered row of two routable CTAs — a
 * high-contrast "Start Free" button (variant "primary") routing to sign-up plus
 * an outlined "Read the Docs" button. Both actions route through useNavigate. Use
 * near the bottom of an auth platform, identity API, or login SDK page to drive
 * sign-ups. Renders fully with no props.
 */
export const AuthCta = defineCapsule({
  name: 'AuthCta',
  description:
    "Bold, centered conversion band for a developer-auth product backed by shared Lakebed conversion state: an eyebrow, a strong headline ('Add auth in minutes'), a short developer-focused subtitle, and a centered row of actions. Primary sign-up/sales actions record fullstack intent with scoped loading; secondary documentation actions still route through useNavigate. Use near the bottom of an auth platform, identity API, or login SDK page to drive sign-ups.",
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
    const go = useNavigate()
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

    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-7 px-6 text-center">
          <p className="text-sm font-medium text-primary-foreground/80">
            {eyebrow}
          </p>
          <div className="flex flex-col gap-4">
            <h2 className="text-3xl font-semibold tracking-tight md:text-5xl">
              {headline}
            </h2>
            <p className="mx-auto max-w-2xl text-base text-primary-foreground/80 md:text-lg">
              {subheading}
            </p>
          </div>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
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
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full bg-primary-foreground px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
            </SaasPlanActionButton>
            {secondaryIsDocs ? (
              <button
                type="button"
                onClick={() => go(secondaryTarget)}
                className="inline-flex min-w-40 items-center justify-center rounded-full border border-primary-foreground/35 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10"
              >
                {secondaryCta}
              </button>
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
                className="inline-flex min-w-40 items-center justify-center gap-2 rounded-full border border-primary-foreground/35 px-6 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
              >
                {secondaryCta}
              </SaasPlanActionButton>
            )}
          </div>
        </div>
      </section>
    )
  },
})
