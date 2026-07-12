import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * MentalHealthContactCta — a final full-bleed booking CTA band for a therapy
 * practice. A solid primary-colored section with a centered heading + reassuring
 * paragraph, dual rounded CTAs (a light booking button with a calendar icon + an
 * outline phone button), and a row of trust badges (HIPAA, secure, next-day) with
 * checkmarks. Calm yet confident wellness aesthetic. CTAs route through
 * useNavigate. Use as the closing conversion section for therapists, counselors,
 * psychologists or wellness centers.
 */
export const MentalHealthContactCta = defineCapsule({
  name: 'MentalHealthContactCta',
  description:
    'Final full-bleed booking CTA band for a therapy practice: a solid primary-colored section with a centered heading + reassuring paragraph, dual rounded CTAs (a light booking button with a calendar icon + an outline phone button), and a row of trust badges (HIPAA, secure, next-day) with checkmarks. Calm yet confident wellness aesthetic. CTAs route through useNavigate. Use as the closing conversion section for therapists, counselors, psychologists or wellness centers.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    primaryCta: z.string().optional(),
    secondaryCta: z.string().optional(),
    badges: z.array(z.string()).optional(),
    /** Navigation target for both CTAs (e.g. "Book Session"). */
    bookLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to take the first step?'
    const description =
      props.description ??
      "Schedule your free 15-minute consultation today. We'll discuss your needs, answer questions, and match you with the right therapist. No obligation, no pressure."
    const primaryCta = props.primaryCta ?? 'Book Online Now'
    const secondaryCta = props.secondaryCta ?? 'Call (503) 555-0147'
    const badges = props.badges?.length
      ? props.badges
      : ['HIPAA Compliant', 'Secure & Confidential', 'Next Day Appointments']
    const bookLabel = props.bookLabel ?? 'Book Session'

    const Check = ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    )

    const Phone = ({ className }) => (
      <svg
        className={className}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-primary py-20 lg:py-28',
          props.className,
        )}
      >
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-semibold text-primary-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-primary-foreground/80">
            {description}
          </p>

          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={bookLabel}
              service={primaryCta}
              source="final-cta"
              pendingChildren={<LocalServiceMutationSpinner />}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 font-medium text-primary shadow-lg transition-colors hover:bg-accent disabled:pointer-events-none disabled:opacity-70"
            >
              <svg
                className="size-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {primaryCta}
            </LocalServiceBookingButton>
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={secondaryCta}
              service="Phone consultation"
              source="final-cta-phone"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-primary-foreground" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-full border border-primary-foreground/30 bg-primary/80 px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/70 disabled:pointer-events-none disabled:opacity-70"
            >
              <Phone className="size-5" />
              {secondaryCta}
            </LocalServiceBookingButton>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-primary-foreground/80">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <Check className="size-5" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
