import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * HotelResortBooking — split booking section for a luxury hotel / resort & spa
 * site. A dark foreground-surface band with an eyebrow + thin heading +
 * paragraph, then a two-column layout: numbered how-it-works steps on the left
 * and a raised light availability form on the right (check-in / check-out date
 * inputs, guests and room-type selects, a full-width submit, and a reassurance
 * note). The submit and selects route through useNavigate. Use to drive
 * reservations for hotels, resorts, spa retreats, villas, or inns. Renders
 * fully with no props via baked-in resort defaults.
 */
export const HotelResortBooking = defineComponent({
  name: 'HotelResortBooking',
  description:
    'Split booking section for a luxury hotel / resort & spa site: a dark foreground-surface band with an uppercase eyebrow + thin heading + paragraph, then a two-column layout pairing numbered how-it-works steps on the left with a raised light availability form on the right (check-in / check-out date inputs, guests and room-type selects, a full-width submit, and a reassurance note). The form submit routes through useNavigate. Use to drive reservations for hotels, resorts, spa retreats, villas, or boutique inns.',
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
    /** Form submit button label + navigation target. */
    submit: z.string().optional(),
    /** Reassurance note beneath the form. */
    note: z.string().optional(),
    /** Options for the guests select. */
    guestOptions: z.array(z.string()).optional(),
    /** Options for the room-type select. */
    roomOptions: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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

    const inputCls =
      'w-full rounded-md border border-input bg-background px-4 py-3 text-sm text-foreground transition-colors focus:border-ring focus:outline-none'

    return (
      <section
        className={cn(
          'bg-foreground py-24 text-background lg:py-32',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <p className="mb-3 text-sm uppercase tracking-widest text-background/60">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-light lg:text-4xl">{heading}</h2>
            <p className="leading-relaxed text-background/70">{description}</p>
          </div>
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              {steps.map((step, i) => (
                <div key={step.title} className="flex gap-6">
                  <div className="grid size-12 flex-shrink-0 place-items-center rounded-full bg-background/10">
                    <span className="text-xl font-light">{i + 1}</span>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-medium">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-background/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg bg-background p-8 text-foreground">
              <h3 className="mb-6 text-xl font-medium">{formHeading}</h3>
              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault()
                  go(submit)
                }}
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="hotel-resort-booking-checkin"
                      className="mb-2 block text-sm font-medium"
                    >
                      Check-in
                    </label>
                    <input
                      id="hotel-resort-booking-checkin"
                      type="date"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="hotel-resort-booking-checkout"
                      className="mb-2 block text-sm font-medium"
                    >
                      Check-out
                    </label>
                    <input
                      id="hotel-resort-booking-checkout"
                      type="date"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="hotel-resort-booking-guests"
                    className="mb-2 block text-sm font-medium"
                  >
                    Guests
                  </label>
                  <select id="hotel-resort-booking-guests" className={inputCls}>
                    {guestOptions.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="hotel-resort-booking-roomtype"
                    className="mb-2 block text-sm font-medium"
                  >
                    Room Type
                  </label>
                  <select
                    id="hotel-resort-booking-roomtype"
                    className={inputCls}
                  >
                    {roomOptions.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-foreground py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
                >
                  {submit}
                </button>
              </form>
              <p className="mt-4 text-center text-xs text-muted-foreground">
                {note}
              </p>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
