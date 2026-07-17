import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { CtaBand } from '#/section-kit/CtaBand.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareCta — full-bleed accent call-to-action band for a medical-clinic
 * page. A solid primary-colored strip with a centered large heading, a
 * supporting paragraph, two CTAs (a light "book" button + an outlined
 * phone-number button with a phone icon), and a small reassurance note beneath.
 * Both CTAs route through useNavigate. Use as the closing conversion band before
 * the footer of a doctors' office, primary-care practice or telehealth clinic.
 * Renders fully with no props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareCta = defineCapsule({
  name: 'HealthcareCta',
  description:
    "Full-bleed accent call-to-action band for a medical-clinic page: a solid primary-colored strip with a centered large heading, a supporting paragraph, two CTAs (a light 'book' button + an outlined phone-number button with a phone icon), and a small reassurance note beneath. Both CTAs route through useNavigate. Use as the closing conversion band before the footer of a doctors' office, primary-care practice or telehealth clinic.",
  props: z.object({
    /** Heading text. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Light primary CTA label. */
    primaryCta: z.string().optional(),
    /** Phone number shown on the outlined button and used as its link. */
    phone: z.string().optional(),
    /** Small reassurance note beneath the CTAs. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to prioritize your health?'
    const description =
      props.description ??
      'Join thousands of San Francisco families who trust Vitality Health Partners for their primary care. Same-day appointments available.'
    const primaryCta = props.primaryCta ?? 'Book Your First Visit'
    const phone = props.phone ?? '(415) 555-1234'
    const note =
      props.note ?? 'No-commitment consultation. Most insurance plans accepted.'

    const ArrowRight = ({ className }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        title={heading}
        subtitle={description}
        className={props.className}
      >
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={primaryCta}
            service="Healthcare appointment"
            source="final-cta"
            pendingChildren={<LocalServiceMutationSpinner />}
            className="inline-flex items-center justify-center rounded-xl bg-background px-8 py-4 font-semibold text-primary shadow-lg transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-70"
          >
            {primaryCta}
            <ArrowRight className="ml-2" />
          </LocalServiceBookingButton>
          <LocalServiceBookingButton
            lakebed={lakebed}
            intentLabel={phone}
            service="Phone consultation"
            source="final-cta-phone"
            pendingChildren={
              <LocalServiceMutationSpinner className="text-primary-foreground" />
            }
            className="inline-flex items-center justify-center rounded-xl border border-primary-foreground/30 bg-primary px-8 py-4 font-semibold text-primary-foreground transition-colors hover:bg-primary/80 disabled:pointer-events-none disabled:opacity-70"
          >
            <svg
              className="mr-2 size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {phone}
          </LocalServiceBookingButton>
        </div>
        <p className="text-sm text-primary-foreground/70">{note}</p>
      </CtaBand>
    )
  },
})
