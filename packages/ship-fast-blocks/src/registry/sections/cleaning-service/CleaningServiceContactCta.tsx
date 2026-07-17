import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceContactCta — a big closing book-now CTA section for a home-cleaning / maid-service landing page. A centered heading + supporting paragraph inside a rounded-3xl primary-colored card with a subtle dot-pattern background overlay, followed by dual pill CTAs (filled primary-foreground + outlined secondary) and a cancellation-note line beneath. Every CTA routes through useNavigate. Use as the final conversion push for residential cleaning companies, maid services, housekeeping platforms, or any local home-service brand. Renders fully with no props via baked-in "PureSpace" defaults.
 */
export const CleaningServiceContactCta = defineCapsule({
  name: 'CleaningServiceContactCta',
  description:
    'Big closing book-now CTA section for a home-cleaning / maid-service landing page: centered heading + supporting paragraph inside a rounded-3xl primary-colored card with a subtle dot-pattern background overlay, followed by dual pill CTAs (filled primary-foreground + outlined secondary with phone icon) and a cancellation-note line beneath. CTAs route through useNavigate. Use as the final conversion push for residential cleaning, maid services, housekeeping, or local home-service brands.',
  props: z.object({
    /** Section heading inside the colored card. */
    heading: z.string().optional(),
    /** Supporting paragraph inside the colored card. */
    description: z.string().optional(),
    /** Filled primary CTA label. */
    primaryCta: z.string().optional(),
    /** Outlined secondary CTA label (often a phone line). */
    secondaryCta: z.string().optional(),
    /** Small note line beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready for a cleaner home?'
    const description =
      props.description ??
      'Book your first cleaning today and experience the PureSpace difference. Same-day appointments available for urgent needs.'
    const primaryCta = props.primaryCta ?? 'Book Your Cleaning Now'
    const secondaryCta = props.secondaryCta ?? 'Call (555) 123-4567'
    const note =
      props.note ?? 'Free cancellation up to 24 hours before your appointment'

    const ArrowRight = ({ className }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    const PhoneIcon = ({ className }) => (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <CtaBand
        tone="muted"
        title={heading}
        subtitle={description}
        titleClassName="text-primary-foreground"
        subtitleClassName="text-primary-foreground/80"
        innerClassName="max-w-5xl rounded-3xl bg-primary p-8 lg:p-16"
        className={props.className}
      >
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-10">
          <svg
            className="size-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <pattern
              id="cleaning-service-cta-grid"
              width="10"
              height="10"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="1" cy="1" r="1" fill="currentColor" />
            </pattern>
            <rect
              width="100"
              height="100"
              fill="url(#cleaning-service-cta-grid)"
              className="text-primary-foreground"
            />
          </svg>
        </div>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={primaryCta}
            service="Home cleaning"
            source="final-cta"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary" />
            }
            className="inline-flex items-center justify-center rounded-full bg-primary-foreground px-8 py-4 text-base font-semibold text-primary shadow-lg transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {primaryCta}
            <ArrowRight className="ml-2 size-5" />
          </LocalServiceBookingButton>
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={secondaryCta}
            service="Phone consultation"
            source="final-cta-phone"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="inline-flex items-center justify-center rounded-full border border-primary-foreground/40 bg-primary px-8 py-4 text-base font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 disabled:pointer-events-none disabled:opacity-70"
          >
            <PhoneIcon className="mr-2 size-5" />
            {secondaryCta}
          </LocalServiceBookingButton>
        </div>
        <p className="text-sm text-primary-foreground/70">{note}</p>
      </CtaBand>
    )
  },
})
