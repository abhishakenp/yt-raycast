import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * HealthcareCta — inverted closing band for a medical-clinic page. The single
 * full-inversion moment of the page: a bg-foreground/text-background band cut
 * by a slanted clip-path seam, carrying a giant ghost "+" cross watermark, a
 * left-aligned giant fluid extrabold heading + supporting paragraph, a pair of
 * square buttons (a filled background-on-ink "book" button with an arrow and a
 * hairline outline click-to-call phone button with a phone icon, both with
 * press feedback), and a small mono reassurance note beneath. Both buttons
 * route through shared booking state. Use as the closing conversion band before
 * the footer of a doctors' office, primary-care practice or telehealth clinic.
 * Renders fully with no props via baked-in "Vitality Health Partners" defaults.
 */
export const HealthcareCta = defineCapsule({
  name: 'HealthcareCta',
  description:
    "Inverted closing band for a medical-clinic page — the single full-inversion moment of the page: a bg-foreground band cut by a slanted clip-path seam with a giant ghost '+' cross watermark, a left-aligned giant fluid extrabold heading + supporting paragraph, a pair of square buttons (a filled background-on-ink book button with an arrow and a hairline outline click-to-call phone button with a phone icon), and a small mono reassurance note beneath. Both buttons write to shared booking state. Use as the closing conversion band before the footer of a doctors' office, primary-care practice or telehealth clinic.",
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

    const ArrowRight = ({ className }: { className?: string }) => (
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
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-10 -top-16 text-[16rem] text-background/[0.05] sm:text-[24rem]">
          +
        </Watermark>
        <CtaBandInner className="max-w-5xl items-start gap-7 pb-20 pt-24 text-left sm:pb-24 sm:pt-28 lg:pb-28 lg:pt-32">
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              service="Healthcare appointment"
              source="final-cta"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-foreground" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {primaryCta}
              <ArrowRight />
            </LocalServiceBookingButton>
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={phone}
              service="Phone consultation"
              source="final-cta-phone"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-background" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/30 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              <svg
                className="size-5"
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
          <p className="relative mt-2 font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
            {note}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
