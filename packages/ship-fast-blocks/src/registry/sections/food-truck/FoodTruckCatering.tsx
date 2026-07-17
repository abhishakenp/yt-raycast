import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * FoodTruckCatering — a dark, inverted CATERING band with a request-a-quote form. A
 * foreground-filled section splits into a left pitch column (eyebrow, heading,
 * paragraph, a checklist of catering options each with a check-icon tile, and a row of
 * soft event-type chips) and a right elevated card form with name, email, event date,
 * guest-count + event-type selects and a message textarea, ending in a full-width
 * submit. The form submit writes a Lakebed inquiry. Use as the catering /
 * private-events lead-capture section for food trucks, caterers or street-food
 * vendors booking events.
 */
export const FoodTruckCatering = defineCapsule({
  name: 'FoodTruckCatering',
  description:
    'Dark, inverted CATERING band with a Lakebed request-a-quote form: a foreground-filled section split into a left pitch column (eyebrow, heading, paragraph, a checklist of catering options each with a check-icon tile, and a row of soft event-type chips) and a right elevated card form with name, email, event date, guest-count and event-type selects and a message textarea, ending in a full-width submit. Form submit writes a shared inquiry record. Use as the catering / private-events lead-capture section for food trucks, caterers, street-food vendors or any mobile-food brand booking corporate lunches, weddings and parties.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    options: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    tags: z.array(z.string()).optional(),
    formTitle: z.string().optional(),
    guestCounts: z.array(z.string()).optional(),
    eventTypes: z.array(z.string()).optional(),
    submit: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const cateringEyebrow = props.eyebrow ?? 'Private Events'
    const cateringHeading = props.heading ?? 'Catering Services'
    const cateringDesc =
      props.description ??
      'Bring the Curbside Kitchen experience to your event. We handle everything from intimate gatherings to corporate celebrations up to 500 guests.'
    const cateringOptions = props.options?.length
      ? props.options
      : [
          {
            title: 'Full-Service Truck',
            description:
              'We bring the full truck setup, cook fresh on-site, serve your guests',
          },
          {
            title: 'Drop-Off Catering',
            description:
              'Pre-packed meals delivered hot, perfect for office lunches',
          },
          {
            title: 'Buffet Setup',
            description:
              'Self-serve taco bars, bowl stations, full service included',
          },
        ]
    const cateringTags = props.tags?.length
      ? props.tags
      : ['Corporate Events', 'Weddings', 'Birthdays', 'Festivals']
    const cateringFormTitle = props.formTitle ?? 'Request a Quote'
    const guestCounts = props.guestCounts?.length
      ? props.guestCounts
      : ['25-50', '50-100', '100-200', '200-500']
    const eventTypes = props.eventTypes?.length
      ? props.eventTypes
      : [
          'Corporate Lunch',
          'Wedding',
          'Birthday Party',
          'Festival / Public Event',
          'Other',
        ]
    const cateringSubmit = props.submit ?? 'Request Quote'
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Food truck catering',
      successMessage:
        "Thanks. We've received your catering request and will follow up soon.",
    })

    const inputCls =
      'w-full rounded-lg border border-input bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

    return (
      <section
        className={cn(
          'bg-foreground px-6 py-20 text-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div className="space-y-6">
              <SectionHeading
                eyebrow={cateringEyebrow}
                title={cateringHeading}
                subtitle={cateringDesc}
                align="left"
                eyebrowClassName="text-background/70 tracking-widest"
                titleClassName="text-3xl font-bold text-background md:text-4xl"
                subtitleClassName="leading-relaxed text-background/80"
                className="gap-4"
              />

              <div className="space-y-4 pt-4">
                {cateringOptions.map((opt) => (
                  <div key={opt.title} className="flex items-start gap-4">
                    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-background/10">
                      <svg
                        className="size-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold">{opt.title}</h4>
                      <p className="text-sm text-background/70">
                        {opt.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-4 pt-4">
                {cateringTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-background/10 px-3 py-1 text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-card p-8 text-card-foreground">
              <h3 className="mb-6 text-xl font-semibold">
                {cateringFormTitle}
              </h3>
              <form className="space-y-4" onSubmit={inquiry.submitForm}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ft-catering-name"
                      className="mb-1 block text-sm font-medium"
                    >
                      Name
                    </label>
                    <input
                      id="ft-catering-name"
                      name="name"
                      type="text"
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ft-catering-email"
                      className="mb-1 block text-sm font-medium"
                    >
                      Email
                    </label>
                    <input
                      id="ft-catering-email"
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      className={inputCls}
                    />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="ft-catering-date"
                      className="mb-1 block text-sm font-medium"
                    >
                      Event Date
                    </label>
                    <input
                      id="ft-catering-date"
                      name="date"
                      type="date"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="ft-catering-guests"
                      className="mb-1 block text-sm font-medium"
                    >
                      Guest Count
                    </label>
                    <select
                      id="ft-catering-guests"
                      name="guestCount"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {guestCounts.map((g) => (
                        <option key={g} className="bg-background">
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="ft-catering-type"
                    className="mb-1 block text-sm font-medium"
                  >
                    Event Type
                  </label>
                  <select
                    id="ft-catering-type"
                    name="eventType"
                    className={cn(inputCls, 'appearance-none')}
                  >
                    {eventTypes.map((t) => (
                      <option key={t} className="bg-background">
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="ft-catering-message"
                    className="mb-1 block text-sm font-medium"
                  >
                    Message
                  </label>
                  <textarea
                    id="ft-catering-message"
                    name="message"
                    rows={3}
                    placeholder="Tell us about your event..."
                    className={cn(inputCls, 'resize-none')}
                  />
                </div>
                <button
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="w-full rounded-lg bg-foreground px-6 py-3 font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : cateringSubmit}
                </button>
                <p className="text-sm text-muted-foreground" aria-live="polite">
                  {inquiry.statusText}
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
