import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  SaasMutationSpinner,
  SaasPlanActionButton,
} from '../saas/saas-interactions.tsx'
import { saasLakebed } from '../saas/saas-lakebed.ts'

/**
 * MobileAppDownloadCta — a centered, full-width final download call-to-action. A
 * large headline over a relaxed supporting paragraph, a centered pair of
 * iOS / Android download buttons (with Apple / Play glyphs), and a wrapping row
 * of small check-marked trust badges beneath. Download buttons route through
 * useNavigate; no imagery. Use as the closing conversion band before the footer
 * on a habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in defaults.
 */
export const MobileAppDownloadCta = defineCapsule({
  name: 'MobileAppDownloadCta',
  description:
    'Centered full-width final download call-to-action backed by shared Lakebed conversion state: iOS and Android download buttons record intent with scoped loading, followed by check-marked trust badges. Use as the closing conversion band before the footer on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    badges: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: saasLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Start building better habits today'
    const description =
      props.description ??
      'Join 50,000+ people who are transforming their lives one small step at a time. Free forever plan available.'
    const primaryCta = props.primaryCta ?? 'Download for iOS'
    const secondaryCta = props.secondaryCta ?? 'Download for Android'
    const badges = props.badges?.length
      ? props.badges
      : ['Free 14-day Pro trial', 'No credit card required', 'Cancel anytime']

    const AppleIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
      </svg>
    )

    const PlayIcon = () => (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
      </svg>
    )

    const CheckIcon = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M5 13l4 4L19 7" />
      </svg>
    )

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="mobileapp-cta-heading"
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2
            id="mobileapp-cta-heading"
            className="mb-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl"
          >
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
            {description}
          </p>
          <div className="mb-10 flex flex-col justify-center gap-4 sm:flex-row">
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              plan={primaryCta}
              source="cta-download"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Opening
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              <AppleIcon />
              {primaryCta}
            </SaasPlanActionButton>
            <SaasPlanActionButton
              lakebed={lakebed}
              intentLabel={secondaryCta}
              plan={secondaryCta}
              source="cta-download"
              pendingChildren={
                <>
                  <SaasMutationSpinner className="size-4" />
                  Opening
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-input bg-background px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
            >
              <PlayIcon />
              {secondaryCta}
            </SaasPlanActionButton>
          </div>
          <div className="flex flex-col items-center justify-center gap-4 text-sm text-muted-foreground sm:flex-row sm:gap-6">
            {badges.map((badge) => (
              <span key={badge} className="flex items-center gap-2">
                <CheckIcon className="size-4 text-primary" />
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
