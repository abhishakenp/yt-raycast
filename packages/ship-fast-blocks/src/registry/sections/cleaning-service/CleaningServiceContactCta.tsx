import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { DotGrid, Watermark } from '#/section-kit/Decor.tsx'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceContactCta — playful-Swiss closing book-now block for a
 * home-cleaning / maid-service landing page. On a muted band sits a square
 * bright-primary card with a 2px border, a big hard offset shadow, a faint
 * dot-grid overlay, and a giant rotated ghost sparkle watermark: an oversized
 * extrabold heading and supporting paragraph lead into dual square CTAs
 * (filled primary-foreground + outlined with phone icon), both with press
 * feedback, and a mono checkbox-square cancellation note beneath. A small
 * rotated "✓ same-day" chip sticks out of the card's top edge. Every CTA
 * routes through section-kit route links. Use as the final conversion push for
 * residential cleaning companies, maid services, housekeeping platforms, or
 * any local home-service brand. Renders fully with no props via baked-in
 * "PureSpace" defaults.
 */
export const CleaningServiceContactCta = defineCapsule({
  name: 'CleaningServiceContactCta',
  description:
    'Playful-Swiss closing book-now block for a home-cleaning / maid-service landing page: a square bright-primary card on a muted band with 2px border, big hard offset shadow, faint dot-grid overlay, giant rotated ghost sparkle watermark, and a rotated chip sticking out of its top edge. Oversized extrabold heading + supporting paragraph, dual square CTAs (filled primary-foreground + outlined with phone icon) with press feedback, and a mono checkbox-square cancellation note beneath. CTAs route through section-kit route links. Use as the final conversion push for residential cleaning, maid services, housekeeping, or local home-service brands.',
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

    const ArrowRight = ({ className }: { className?: string }) => (
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

    const PhoneIcon = ({ className }: { className?: string }) => (
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
        className={cn('px-4 py-16 sm:px-6 lg:px-8 lg:py-24', props.className)}
      >
        <CtaBandInner className="relative max-w-5xl rounded-none border-2 border-foreground bg-primary p-8 shadow-[10px_10px_0_0] shadow-foreground lg:p-14">
          <DotGrid
            density="tight"
            className="inset-0 text-primary-foreground/15"
          />
          <Watermark className="-right-6 -top-8 rotate-12 text-[9rem] text-primary-foreground/10 sm:text-[13rem]">
            ✱
          </Watermark>
          <span
            aria-hidden="true"
            className="absolute -top-4 right-8 inline-flex rotate-3 items-center gap-1.5 border-2 border-foreground bg-background px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-foreground"
          >
            <svg
              width="10"
              height="10"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="square"
              className="text-primary"
            >
              <path d="M3 11l4 4 10-11" />
            </svg>
            same-day
          </span>
          <CtaBandTitle className="relative text-4xl font-extrabold tracking-tight text-primary-foreground sm:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="relative text-primary-foreground/85">
            {description}
          </CtaBandSubtitle>
          <div className="relative grid w-full grid-cols-1 justify-center gap-4 sm:flex sm:w-auto sm:flex-row">
            <LocalServiceBookingButton
              lakebed={lakebed}
              intentLabel={primaryCta}
              service="Home cleaning"
              source="final-cta"
              pendingChildren={
                <LocalServiceMutationSpinner className="text-primary" />
              }
              className="inline-flex items-center justify-center rounded-none border-2 border-foreground bg-primary-foreground px-7 py-3.5 text-base font-bold text-primary shadow-[4px_4px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
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
              className="inline-flex items-center justify-center rounded-none border-2 border-primary-foreground/50 bg-primary px-7 py-3.5 text-base font-bold text-primary-foreground transition-all duration-150 hover:border-primary-foreground hover:bg-primary-foreground/10 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              <PhoneIcon className="mr-2 size-5" />
              {secondaryCta}
            </LocalServiceBookingButton>
          </div>
          <p className="relative flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-primary-foreground/80">
            <span
              aria-hidden="true"
              className="grid size-4 shrink-0 place-items-center border-2 border-primary-foreground/60 text-primary-foreground"
            >
              <svg
                width="9"
                height="9"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="square"
              >
                <path d="M3 11l4 4 10-11" />
              </svg>
            </span>
            {note}
          </p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
