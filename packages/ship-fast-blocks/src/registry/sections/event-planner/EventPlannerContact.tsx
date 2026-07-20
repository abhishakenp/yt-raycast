import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ContactForm,
  ContactFormField,
  ContactFormLabel,
  ContactFormInput,
  ContactFormSelect,
  ContactFormTextarea,
  ContactFormSubmit,
  ContactFormFooter,
} from '#/section-kit/ContactForm.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * EventPlannerContact — kinetic-poster "RSVP invitation" contact section with a
 * full inquiry form. An asymmetric two-column band over a giant faint "RSVP"
 * watermark: a left details column (a mono metadata rail eyebrow, a giant
 * tight-tracked heading, a relaxed lede, and squared click-to-email /
 * click-to-call rows plus an address row with inline icons) beside a right
 * hard-framed invitation card form (first/last name, email, event-type +
 * guest-count selects, event date, vision textarea, and a full-width squared
 * ticket-stub submit with press feedback), all with hairline rounded-none inputs.
 * Contact buttons route through section-kit route links; submit writes a Lakebed
 * inquiry. Use as the booking/inquiry section above the footer for event/wedding
 * planners or premium service businesses.
 */
export const EventPlannerContact = defineCapsule({
  name: 'EventPlannerContact',
  description:
    'Kinetic-poster "RSVP invitation" contact section with a full Lakebed inquiry form: an asymmetric two-column band over a giant faint "RSVP" watermark with a left details column (a mono metadata rail eyebrow, a giant tight-tracked heading, a relaxed lede, squared click-to-email / click-to-call rows and an address row with inline icons) beside a right hard-framed invitation card form (first/last name, email, event-type and guest-count selects, event date, vision textarea, and a full-width squared ticket-stub submit with press feedback), all with hairline rounded-none inputs. Contact buttons route through section-kit route links; submit writes a shared inquiry record. Use as the booking/inquiry section above the footer for event/wedding planners, gala organizers, or premium service businesses.',
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
      'w-full rounded-none border-2 border-input bg-background px-4 py-3 text-foreground outline-none transition-all placeholder:text-muted-foreground focus:border-foreground focus:ring-2 focus:ring-ring'

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background px-4 py-20 sm:px-6 lg:px-8 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
        >
          <span className="absolute -left-4 bottom-0 select-none font-serif italic leading-none tracking-tighter text-foreground/[0.04] text-[9rem] sm:text-[14rem] lg:text-[19rem]">
            RSVP
          </span>
        </div>
        <Container size="xl" className="relative">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <div className="mb-8">
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="size-1.5 shrink-0 bg-primary"
                  />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                    {contactEyebrow}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
                <h2 className="mt-6 text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground text-balance sm:text-5xl lg:text-6xl">
                  {contactHeading}
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                  {contactDesc}
                </p>
              </div>
              <div className="space-y-3 text-foreground/80">
                <NavbarRouteLink
                  className="flex items-center gap-4 rounded-none border-2 border-foreground/15 px-4 py-3 text-left transition-colors duration-150 hover:border-foreground/40 hover:text-foreground"
                  href={contactEmail}
                >
                  <svg
                    className="size-5 text-primary"
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
                </NavbarRouteLink>
                <NavbarRouteLink
                  className="flex items-center gap-4 rounded-none border-2 border-foreground/15 px-4 py-3 text-left transition-colors duration-150 hover:border-foreground/40 hover:text-foreground"
                  href={contactPhone}
                >
                  <svg
                    className="size-5 text-primary"
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
                </NavbarRouteLink>
                <div className="flex items-center gap-4 rounded-none border-2 border-foreground/15 px-4 py-3">
                  <svg
                    className="size-5 shrink-0 text-primary"
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
            <ContactForm
              variant="card"
              className="rounded-none border-2 border-foreground bg-card p-8 shadow-[8px_8px_0_0] shadow-primary/30 lg:col-span-7 lg:p-10"
              onSubmit={inquiry.submitForm}
            >
              <div className="space-y-6">
                <ResponsiveGrid cols="1-2" className="gap-6">
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ep-first"
                      className="text-card-foreground"
                    >
                      First Name
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ep-first"
                      name="firstName"
                      required
                      placeholder="Jane"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ep-last"
                      className="text-card-foreground"
                    >
                      Last Name
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ep-last"
                      name="lastName"
                      required
                      placeholder="Smith"
                      className={inputCls}
                    />
                  </ContactFormField>
                </ResponsiveGrid>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="ep-email"
                    className="text-card-foreground"
                  >
                    Email Address
                  </ContactFormLabel>
                  <ContactFormInput
                    id="ep-email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@example.com"
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="ep-type"
                    className="text-card-foreground"
                  >
                    Event Type
                  </ContactFormLabel>
                  <ContactFormSelect
                    id="ep-type"
                    name="eventType"
                    required
                    className={inputCls}
                  >
                    {eventTypes.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </ContactFormSelect>
                </ContactFormField>
                <ResponsiveGrid cols="1-2" className="gap-6">
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ep-date"
                      className="text-card-foreground"
                    >
                      Event Date
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ep-date"
                      name="date"
                      type="date"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ep-guests"
                      className="text-card-foreground"
                    >
                      Guest Count
                    </ContactFormLabel>
                    <ContactFormSelect
                      id="ep-guests"
                      name="guestCount"
                      className={inputCls}
                    >
                      {guestRanges.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </ContactFormSelect>
                  </ContactFormField>
                </ResponsiveGrid>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="ep-message"
                    className="text-card-foreground"
                  >
                    Tell Us About Your Vision
                  </ContactFormLabel>
                  <ContactFormTextarea
                    id="ep-message"
                    name="vision"
                    rows={4}
                    placeholder="Share details about your dream event, preferred style, venues you're considering, or any questions you have..."
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormSubmit
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="inline-flex w-full items-center justify-center rounded-none border-2 border-foreground bg-primary px-8 py-4 font-semibold text-primary-foreground shadow-[4px_4px_0_0] shadow-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-0 active:shadow-[2px_2px_0_0] disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : contactSubmit}
                </ContactFormSubmit>
                <ContactFormFooter
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {inquiry.statusText}
                </ContactFormFooter>
              </div>
            </ContactForm>
          </div>
        </Container>
      </section>
    )
  },
})
