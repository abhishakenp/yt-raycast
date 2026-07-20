import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  FormField,
  FormFieldLabel,
  FormFieldControl,
} from '#/section-kit/FormField.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { BookingForm } from '#/section-kit/BookingForm.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { cn } from '#/lib/utils.ts'
import { useHotelAvailabilitySubmission } from './hotel-resort-interactions.tsx'
import { hotelResortLakebed } from './hotel-resort-lakebed.ts'

/**
 * HotelResortBooking — inverted split booking band for a luxury-editorial hotel
 * / resort & spa site. The one dramatic dark foreground-surface band, entered by
 * a slanted clip-path seam and carrying a giant ghost serif watermark: a mono
 * eyebrow + thin serif heading + paragraph, then an asymmetric two-column layout
 * pairing mono-numbered hairline how-it-works steps on the left with a raised
 * sharp-cornered light availability form on the right (check-in / check-out date
 * inputs, guests and room-type selects, a full-width mono submit with press
 * feedback, and a reassurance note). Submit writes a shared Lakebed availability
 * request. Use to drive reservations for hotels, resorts, spa retreats, villas,
 * or inns. Renders fully with no props via baked-in resort defaults.
 */
export const HotelResortBooking = defineCapsule({
  name: 'HotelResortBooking',
  description:
    'Inverted split booking band for a luxury-editorial hotel / resort & spa site: the one dramatic dark foreground-surface band, entered by a slanted clip-path seam and carrying a giant ghost serif watermark, with a mono eyebrow + thin serif heading + paragraph, then an asymmetric two-column layout pairing mono-numbered hairline how-it-works steps on the left with a raised sharp-cornered light Lakebed availability form on the right (check-in / check-out date inputs, guests and room-type selects, a full-width mono submit with press feedback, and a reassurance note). Form submit writes a shared booking/inquiry record used by navbar badges and room search state. Use to drive reservations for hotels, resorts, spa retreats, villas, or boutique inns.',
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Numbered how-it-works steps on the left. */
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Heading above the availability form. */
    formHeading: z.string().optional(),
    /** Form submit button label. */
    submit: z.string().optional(),
    /** Reassurance note beneath the form. */
    note: z.string().optional(),
    /** Options for the guests select. */
    guestOptions: z.array(z.string()).optional(),
    /** Options for the room-type select. */
    roomOptions: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: hotelResortLakebed,
  component: ({ props, lakebed }) => {
    const eyebrow = props.eyebrow ?? 'Reservations'
    const heading = props.heading ?? 'Book your escape'
    const description =
      props.description ??
      'Secure your preferred dates in just a few steps. Flexible cancellation up to 48 hours before arrival.'
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: 'Choose Your Dates',
            description:
              'Select your check-in and check-out dates. Peak season runs June through August; book early for best availability.',
          },
          {
            title: 'Select Your Suite',
            description:
              'Browse our room categories and choose the perfect accommodation for your stay. Filter by view, size, and amenities.',
          },
          {
            title: 'Confirm & Enjoy',
            description:
              'Complete your reservation with our secure checkout. Receive instant confirmation and start planning your experience.',
          },
        ]
    const formHeading = props.formHeading ?? 'Check Availability'
    const submit = props.submit ?? 'Check Availability'
    const note =
      props.note ?? 'Best rate guarantee • Free cancellation up to 48 hours'
    const guestOptions = props.guestOptions?.length
      ? props.guestOptions
      : [
          '2 Adults',
          '2 Adults, 1 Child',
          '2 Adults, 2 Children',
          '3 Adults',
          '4 Adults',
        ]
    const roomOptions = props.roomOptions?.length
      ? props.roomOptions
      : ['All Room Types', 'Coastal Suite', 'Azure Suite', 'Coastal Villa']
    const inquiry = useHotelAvailabilitySubmission({
      lakebed,
      source: 'Hotel booking',
      successMessage:
        "Thanks. We've received your availability request and will respond soon.",
    })

    const inputCls =
      'w-full rounded-none border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-ring focus:outline-none'

    return (
      <BookingForm asChild>
        <section
          className={cn(
            'relative overflow-hidden bg-foreground pt-32 pb-24 text-background [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] lg:pt-40 lg:pb-28',
            props.className,
          )}
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-[0.14em] -right-[0.03em] select-none font-serif text-[26vw] font-normal leading-none tracking-tighter text-background/[0.05]"
          >
            Stay
          </span>
          <Container size="xl" className="relative px-6">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={description}
              align="left"
              eyebrowClassName="font-mono text-[11px] font-medium text-background/60 tracking-[0.22em]"
              titleClassName="font-serif text-4xl font-normal text-background tracking-tight lg:text-5xl"
              subtitleClassName="leading-relaxed text-background/70"
              className="mb-16 max-w-2xl gap-4"
            />
            <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
              <div className="lg:col-span-5">
                {steps.map((step, i) => (
                  <div
                    key={step.title}
                    className="flex gap-6 border-t border-background/15 py-7 first:border-t-0 first:pt-0"
                  >
                    <div className="grid size-12 flex-shrink-0 place-items-center rounded-none border border-background/25">
                      <span className="font-serif text-xl font-normal tabular-nums">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-2 font-serif text-lg font-normal tracking-tight">
                        {step.title}
                      </h3>
                      <p className="text-sm leading-relaxed text-background/60">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-none bg-background p-8 text-foreground lg:col-span-7">
                <div className="mb-6 flex items-center gap-4">
                  <h3 className="font-serif text-2xl font-normal tracking-tight">
                    {formHeading}
                  </h3>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
                <form className="space-y-5" onSubmit={inquiry.submitForm}>
                  <ResponsiveGrid cols="1-2" className="gap-4">
                    <FormField>
                      <FormFieldLabel htmlFor="hotel-resort-booking-checkin">
                        Check-in
                      </FormFieldLabel>
                      <FormFieldControl
                        id="hotel-resort-booking-checkin"
                        name="checkIn"
                        type="date"
                        className={inputCls}
                      />
                    </FormField>
                    <FormField>
                      <FormFieldLabel htmlFor="hotel-resort-booking-checkout">
                        Check-out
                      </FormFieldLabel>
                      <FormFieldControl
                        id="hotel-resort-booking-checkout"
                        name="checkOut"
                        type="date"
                        className={inputCls}
                      />
                    </FormField>
                  </ResponsiveGrid>
                  <FormField>
                    <FormFieldLabel htmlFor="hotel-resort-booking-guests">
                      Guests
                    </FormFieldLabel>
                    <FormFieldControl
                      id="hotel-resort-booking-guests"
                      name="guests"
                      as="select"
                      options={guestOptions}
                      className={inputCls}
                    />
                  </FormField>
                  <FormField>
                    <FormFieldLabel htmlFor="hotel-resort-booking-roomtype">
                      Room Type
                    </FormFieldLabel>
                    <FormFieldControl
                      id="hotel-resort-booking-roomtype"
                      name="roomType"
                      as="select"
                      options={roomOptions}
                      className={inputCls}
                    />
                  </FormField>
                  <button
                    type="submit"
                    aria-busy={inquiry.isPending}
                    disabled={inquiry.isPending}
                    className="w-full rounded-none bg-foreground py-4 font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-background transition-[background-color,transform] duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                  >
                    {inquiry.isPending ? 'Sending' : submit}
                  </button>
                  <p
                    className="text-center text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    {inquiry.statusText}
                  </p>
                </form>
                <p className="mt-4 text-center text-xs text-muted-foreground">
                  {note}
                </p>
              </div>
            </div>
          </Container>
        </section>
      </BookingForm>
    )
  },
})
