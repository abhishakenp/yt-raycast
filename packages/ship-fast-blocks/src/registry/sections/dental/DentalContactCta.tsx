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
 * DentalContactCta — inverted closing band for a dental practice site. The
 * single full-inversion moment of the page: a bg-foreground/text-background
 * band with a giant ghost "+" cross watermark, a left-aligned giant fluid
 * extrabold heading + supporting paragraph, a pair of square buttons (a filled
 * background-on-ink click-to-call button with a phone icon and a hairline
 * outline online-booking button with a calendar icon, both with press
 * feedback), and a hairline-topped mono row of reassurance perks with "+"
 * tick glyphs. All buttons route through section-kit route links. Use as the
 * final conversion banner above the footer on a dentist, dental office, or
 * clinic site.
 */
export const DentalContactCta = defineCapsule({
  name: 'DentalContactCta',
  description:
    'Inverted closing band for a dental practice site — the single full-inversion moment of the page: a bg-foreground band with a giant ghost "+" cross watermark, a left-aligned giant fluid extrabold heading + supporting paragraph, a pair of square buttons (a filled background-on-ink click-to-call button with a phone icon and a hairline outline online-booking button with a calendar icon), and a hairline-topped mono row of reassurance perks with plus tick glyphs. All buttons route through section-kit route links. Use as the final conversion banner above the footer on a dentist, dental office, or clinic site.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    callCta: z.string().optional(),
    bookCta: z.string().optional(),
    perks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const contactHeading = props.heading ?? 'Ready to love your smile?'
    const contactDesc =
      props.description ??
      'Schedule your first visit today and experience the difference of truly patient-centered dental care. New patient exams are just $99.'
    const contactCallCta = props.callCta ?? 'Call (503) 555-0142'
    const contactBookCta = props.bookCta ?? 'Book Online'
    const contactPerks = props.perks?.length
      ? props.perks
      : ['Open 6 days a week', 'Free parking available', 'Evening appointments']

    const PhoneIcon = ({ className }: { className?: string }) => (
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
        <path d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        className={cn(
          'relative overflow-hidden bg-foreground text-background',
          props.className,
        )}
      >
        <Watermark className="-right-10 -top-24 text-[18rem] text-background/[0.05] sm:text-[26rem]">
          +
        </Watermark>
        <CtaBandInner className="max-w-5xl items-start gap-7 py-20 text-left sm:py-24 lg:py-28">
          <CtaBandTitle className="max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-tight">
            {contactHeading}
          </CtaBandTitle>
          <CtaBandSubtitle className="max-w-2xl text-background/70 opacity-100">
            {contactDesc}
          </CtaBandSubtitle>
          <div className="relative flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4">
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={contactCallCta}
              service="Phone consultation"
              source="final-cta-phone"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-foreground" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none bg-background px-8 py-4 text-base font-semibold text-foreground transition-colors hover:bg-background/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              <PhoneIcon className="size-5" />
              {contactCallCta}
            </LocalServiceBookingButton>
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={contactBookCta}
              service="Dental appointment"
              source="final-cta"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-background" />
              }
              className="inline-flex items-center justify-center gap-2 rounded-none border border-background/30 px-8 py-4 text-base font-semibold text-background transition-colors hover:bg-background/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
              </svg>
              {contactBookCta}
            </LocalServiceBookingButton>
          </div>
          <div className="relative mt-2 flex w-full flex-wrap items-center gap-x-8 gap-y-3 border-t border-background/20 pt-6 font-mono text-[11px] uppercase tracking-[0.15em] text-background/60">
            {contactPerks.map((perk) => (
              <div key={perk} className="flex items-center gap-2.5">
                <span aria-hidden="true" className="text-background/40">
                  +
                </span>
                {perk}
              </div>
            ))}
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
