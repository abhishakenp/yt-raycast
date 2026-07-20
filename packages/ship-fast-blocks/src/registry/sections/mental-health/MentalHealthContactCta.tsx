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
 * MentalHealthContactCta — the single inverted closing band for a therapy
 * practice, cut in on a gentle slanted clip-path seam. On a calm
 * bg-foreground / text-background surface with a giant faint ghost quotation
 * watermark: a centered serif heading + reassuring paragraph, a pair of square
 * buttons (a filled background-on-ink online-booking button with a calendar
 * icon and a hairline outline click-to-call button with a phone icon, both with
 * press feedback), and a hairline-topped mono row of reassurance badges (HIPAA,
 * secure, next-day) with tick glyphs. Warm yet confident wellness aesthetic.
 * Buttons request a booking through the shared lakebed. Use as the closing
 * conversion section for therapists, counselors, psychologists or wellness
 * centers.
 */
export const MentalHealthContactCta = defineCapsule({
  name: 'MentalHealthContactCta',
  description:
    'Single inverted closing band for a therapy practice, cut in on a gentle slanted clip-path seam: a calm bg-foreground / text-background surface with a giant faint ghost quotation watermark, a centered serif heading + reassuring paragraph, a pair of square buttons (a filled background-on-ink online-booking button with a calendar icon and a hairline outline click-to-call button with a phone icon), and a hairline-topped mono row of reassurance badges (HIPAA, secure, next-day) with tick glyphs. Warm yet confident wellness aesthetic. Buttons request a booking through the shared lakebed. Use as the closing conversion section for therapists, counselors, psychologists or wellness centers.',
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

    const Check = ({ className }: { className?: string }) => (
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

    const Phone = ({ className }: { className?: string }) => (
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
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-16 select-none font-serif text-[16rem] text-background/[0.05] sm:text-[22rem]">
          &rdquo;
        </Watermark>
        <CtaBandInner className="items-center gap-7 pb-20 pt-24 text-center sm:pb-24 sm:pt-32 lg:pb-28 lg:pt-40">
          <CtaBandTitle className="max-w-3xl font-serif text-[clamp(2.25rem,5vw,3.75rem)] font-medium leading-[1.05] tracking-tight">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="relative flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={bookLabel}
              service={primaryCta}
              source="final-cta"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-foreground" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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
                <LocalServiceMutationSpinner className="text-background" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/30 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              <Phone className="size-5" />
              {secondaryCta}
            </LocalServiceBookingButton>
          </div>
          <div className="relative mt-2 flex w-full flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-background/20 pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
            {badges.map((b) => (
              <div key={b} className="flex items-center gap-2.5">
                <Check className="size-4 text-background/50" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
