import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * MarketingAgencyContactCta — a high-contrast dark closing call-to-action band. A
 * centered block on the primary surface with a large heading, a supporting
 * paragraph, dual rounded-pill CTAs (a filled booking button with a calendar icon
 * + an outlined email/contact button), and a row of inline reassurance checkmarks
 * below. Links route through useNavigate; the email button routes to a separate
 * contactTarget. Use as the final conversion band before the footer on a
 * marketing / growth agency or B2B services page. Renders fully with no props.
 */
export const MarketingAgencyContactCta = defineCapsule({
  name: 'MarketingAgencyContactCta',
  description:
    'High-contrast dark closing call-to-action band on the primary surface: a centered block with a large heading, a supporting paragraph, dual rounded-pill CTAs (a filled booking button with a calendar icon + an outlined email/contact button), and a row of inline reassurance checkmarks below. Links route through useNavigate; the email button routes to a separate contactTarget. Use as the final conversion band before the footer on a marketing / growth agency or B2B services landing page.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    /** Email / contact label shown on the outlined button. */
    email: z.string().optional(),
    /** Navigation target for the outlined email/contact button. */
    contactTarget: z.string().optional(),
    reassurances: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Ready to Scale Your Growth?'
    const description =
      props.description ??
      "Book a free 30-minute strategy call. We'll audit your current marketing, identify quick wins, and build a roadmap for sustainable growth."
    const primaryCta = props.primaryCta ?? 'Book Your Free Call'
    const email = props.email ?? 'hello@nexusgrowth.com'
    const contactTarget = props.contactTarget ?? 'Get Started'
    const reassurances = props.reassurances?.length
      ? props.reassurances
      : ['30 minutes', 'No pitch, just strategy', 'Recording shared after']

    const Check = ({ className }: { className?: string }) => (
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
        className={cn(
          'bg-primary py-24 text-primary-foreground',
          props.className,
        )}
      >
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-primary-foreground/70">
            {description}
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              type="button"
              onClick={() => go(primaryCta)}
              className="inline-flex items-center justify-center rounded-full bg-background px-8 py-4 font-medium text-foreground transition-colors hover:bg-background/90"
            >
              {primaryCta}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-2 size-5"
                aria-hidden="true"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => go(contactTarget)}
              className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 px-8 py-4 font-medium text-primary-foreground transition-colors hover:border-primary-foreground/70"
            >
              {email}
            </button>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
            {reassurances.map((r) => (
              <div key={r} className="flex items-center gap-2">
                <Check className="size-5 text-primary-foreground" />
                {r}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
