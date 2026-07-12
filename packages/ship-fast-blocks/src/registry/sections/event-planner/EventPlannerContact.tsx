import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * EventPlannerContact — dark split contact section with a full inquiry form. A
 * primary-colored two-column band: a left details column (uppercase eyebrow, thin
 * light heading, lede, and click-to-email / click-to-call buttons plus an address
 * row with inline icons) beside a right rounded card form (first/last name, email,
 * event-type + guest-count selects, event date, vision textarea, and a full-width
 * primary submit pill). Contact buttons route through useNavigate; submit writes
 * a Lakebed inquiry. Use as the booking/inquiry section above the footer for
 * event/wedding planners or premium service businesses.
 */
export const EventPlannerContact = defineCapsule({
  name: 'EventPlannerContact',
  description:
    'Dark split contact section with a full Lakebed inquiry form: a primary-colored two-column band with a left details column (uppercase eyebrow, thin light heading, lede, click-to-email / click-to-call buttons and an address row with inline icons) beside a right rounded card form (first/last name, email, event-type and guest-count selects, event date, vision textarea, and a full-width primary submit pill). Contact buttons route through useNavigate; submit writes a shared inquiry record. Use as the booking/inquiry section above the footer for event/wedding planners, gala organizers, or premium service businesses.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    eventTypes: z.array(z.string()).optional(),
    guestRanges: z.array(z.string()).optional(),
    submit: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const contactEyebrow = props.eyebrow ?? 'Start Your Journey'
    const contactHeading = props.heading ?? "Let's Create Something Beautiful"
    const contactDesc =
      props.description ??
      "Ready to begin planning your perfect event? We'd love to hear about your vision. Fill out the inquiry form and we'll be in touch within 24 hours to schedule your complimentary consultation."
    const contactEmail = props.email ?? 'hello@sereneevents.com'
    const contactPhone = props.phone ?? '(415) 555-0147'
    const contactAddress =
      props.address ?? '580 Market Street, Suite 800, San Francisco, CA 94104'
    const eventTypes = props.eventTypes?.length
      ? props.eventTypes
      : [
          'Select an event type',
          'Wedding',
          'Corporate Event',
          'Private Celebration',
          'Non-Profit Gala',
          'Destination Event',
        ]
    const guestRanges = props.guestRanges?.length
      ? props.guestRanges
      : [
          'Select range',
          '1-50 guests',
          '51-100 guests',
          '101-150 guests',
          '151-200 guests',
          '200+ guests',
        ]
    const contactSubmit = props.submit ?? 'Send Inquiry'
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Event planner inquiry',
      successMessage:
        "Thanks. We've received your event inquiry and will follow up shortly.",
    })

    const inputCls =
      'w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-transparent focus:ring-2 focus:ring-ring'

    return (
      <section
        className={cn(
          'bg-primary px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-widest text-primary-foreground/70">
                {contactEyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-light text-primary-foreground sm:text-4xl lg:text-5xl">
                {contactHeading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-primary-foreground/80">
                {contactDesc}
              </p>
              <div className="space-y-4 text-primary-foreground/80">
                <button
                  type="button"
                  onClick={() => go(contactEmail)}
                  className="flex items-center gap-4 text-left transition-colors hover:text-primary-foreground"
                >
                  <svg
                    className="size-5 text-primary-foreground/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>{contactEmail}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(contactPhone)}
                  className="flex items-center gap-4 text-left transition-colors hover:text-primary-foreground"
                >
                  <svg
                    className="size-5 text-primary-foreground/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>{contactPhone}</span>
                </button>
                <div className="flex items-center gap-4">
                  <svg
                    className="size-5 shrink-0 text-primary-foreground/70"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>{contactAddress}</span>
                </div>
              </div>
            </div>
            <form
              className="rounded-2xl bg-card p-8 lg:p-10"
              onSubmit={inquiry.submitForm}
            >
              <div className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ep-first"
                      className="mb-2 block text-sm font-medium text-card-foreground"
                    >
                      First Name
                    </label>
                    <input
                      id="ep-first"
                      name="firstName"
                      type="text"
                      required
                      placeholder="Jane"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ep-last"
                      className="mb-2 block text-sm font-medium text-card-foreground"
                    >
                      Last Name
                    </label>
                    <input
                      id="ep-last"
                      name="lastName"
                      type="text"
                      required
                      placeholder="Smith"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="ep-email"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Email Address
                  </label>
                  <input
                    id="ep-email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="ep-type"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Event Type
                  </label>
                  <select
                    id="ep-type"
                    name="eventType"
                    required
                    className={cn(inputCls, 'appearance-none')}
                  >
                    {eventTypes.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ep-date"
                      className="mb-2 block text-sm font-medium text-card-foreground"
                    >
                      Event Date
                    </label>
                    <input
                      id="ep-date"
                      name="date"
                      type="date"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ep-guests"
                      className="mb-2 block text-sm font-medium text-card-foreground"
                    >
                      Guest Count
                    </label>
                    <select
                      id="ep-guests"
                      name="guestCount"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {guestRanges.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="ep-message"
                    className="mb-2 block text-sm font-medium text-card-foreground"
                  >
                    Tell Us About Your Vision
                  </label>
                  <textarea
                    id="ep-message"
                    name="vision"
                    rows={4}
                    placeholder="Share details about your dream event, preferred style, venues you're considering, or any questions you have..."
                    className={cn(inputCls, 'resize-none')}
                  />
                </div>
                <button
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="w-full rounded-full bg-primary px-8 py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : contactSubmit}
                </button>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {inquiry.statusText}
                </p>
              </div>
            </form>
          </div>
        </div>
      </section>
    )
  },
})
