import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DentalContactCta — bold closing call-to-action banner for a dental practice
 * site. A full-width primary-colored section with soft blurred corner glows, a
 * centered heading + supporting paragraph, a pair of pill buttons (an inverted
 * click-to-call button with a phone icon and a translucent online-booking button
 * with a calendar icon), and a row of check-marked reassurance perks. All
 * buttons route through useNavigate. Use as the final conversion banner above
 * the footer on a dentist, dental office, or clinic site.
 */
export const DentalContactCta = defineComponent({
  name: 'DentalContactCta',
  description:
    'Bold closing call-to-action banner for a dental practice site: a full-width primary-colored section with soft blurred corner glows, a centered heading + supporting paragraph, a pair of pill buttons (an inverted click-to-call button with a phone icon and a translucent online-booking button with a calendar icon), and a row of check-marked reassurance perks. All buttons route through useNavigate. Use as the final conversion banner above the footer on a dentist, dental office, or clinic site.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    callCta: z.string().optional(),
    bookCta: z.string().optional(),
    perks: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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
      <section
        className={cn(
          'relative overflow-hidden bg-primary py-24 text-primary-foreground',
          props.className,
        )}
      >
        <div aria-hidden="true" className="absolute inset-0 opacity-10">
          <div className="absolute left-0 top-0 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground blur-3xl" />
          <div className="absolute bottom-0 right-0 size-96 translate-x-1/2 translate-y-1/2 rounded-full bg-primary-foreground blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-6 text-3xl font-bold sm:text-4xl lg:text-5xl">
            {contactHeading}
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-primary-foreground/80">
            {contactDesc}
          </p>
          <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => go(contactCallCta)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-background px-8 py-4 text-lg font-semibold text-primary transition-colors hover:bg-muted"
            >
              <PhoneIcon className="size-5" />
              {contactCallCta}
            </button>
            <button
              type="button"
              onClick={() => go(contactBookCta)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-foreground/15 px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/25"
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
            </button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-primary-foreground/80">
            {contactPerks.map((perk) => (
              <div key={perk} className="flex items-center gap-2">
                <svg
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="size-5"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {perk}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
