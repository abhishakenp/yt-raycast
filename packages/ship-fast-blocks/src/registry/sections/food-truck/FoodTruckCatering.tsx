import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  FeatureListItem,
  FeatureListItemIcon,
  FeatureListItemBody,
  FeatureListItemTitle,
  FeatureListItemDescription,
} from '#/section-kit/FeatureListItem.tsx'
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
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * FoodTruckCatering — a sticker-poster inverted CATERING band with a slanted clip-path
 * seam and a request-a-quote form. A foreground-filled section under a giant ghost
 * "CATER" watermark splits into a left pitch column (mono index eyebrow, extrabold slab
 * heading, paragraph, a checklist of catering options each with a square rubber-stamp
 * check tile, and a row of event-type stamp chips) and a right hard-bordered card form
 * with name, email, event date, guest-count + event-type selects and a message textarea,
 * ending in a full-width slab submit with press feedback. The form submit writes a
 * Lakebed inquiry. Use as the catering / private-events lead-capture section for food
 * trucks, caterers or street-food vendors booking events.
 */
export const FoodTruckCatering = defineCapsule({
  name: 'FoodTruckCatering',
  description:
    'Sticker-poster inverted CATERING band with a slanted clip-path seam and a Lakebed request-a-quote form: a foreground-filled section under a giant ghost "CATER" watermark split into a left pitch column (mono index eyebrow, extrabold slab heading, paragraph, a checklist of catering options each with a square rubber-stamp check tile, and a row of event-type stamp chips) and a right hard-bordered card form with name, email, event date, guest-count and event-type selects and a message textarea, ending in a full-width slab submit with press feedback. Form submit writes a shared inquiry record. Use as the catering / private-events lead-capture section for food trucks, caterers, street-food vendors or any mobile-food brand booking corporate lunches, weddings and parties.',
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
      'w-full rounded-none border-2 border-foreground bg-background px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground px-6 pt-28 pb-20 text-background [clip-path:polygon(0_2.5rem,100%_0,100%_100%,0_100%)]',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-10 text-[7rem] text-background/[0.06] sm:text-[12rem] lg:text-[16rem]">
          CATER
        </Watermark>
        <Container size="lg" className="relative">
          <div className="grid items-start gap-12 lg:grid-cols-12">
            <div className="space-y-6 lg:col-span-5">
              <SectionHeading
                eyebrow={`03 / ${cateringEyebrow}`}
                title={cateringHeading}
                subtitle={cateringDesc}
                align="left"
                eyebrowClassName="font-mono uppercase tracking-[0.2em] text-background/70"
                titleClassName="text-4xl font-extrabold tracking-tighter text-background md:text-5xl"
                subtitleClassName="leading-relaxed text-background/80"
                className="gap-4"
              />

              <div className="space-y-4 pt-4">
                {cateringOptions.map((opt) => (
                  <FeatureListItem key={opt.title}>
                    <FeatureListItemIcon className="grid size-9 shrink-0 -rotate-3 place-items-center rounded-none border-2 border-background bg-background/10">
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
                          strokeWidth="2.5"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </FeatureListItemIcon>
                    <FeatureListItemBody>
                      <FeatureListItemTitle className="font-extrabold tracking-tight">
                        {opt.title}
                      </FeatureListItemTitle>
                      <FeatureListItemDescription className="text-background/70">
                        {opt.description}
                      </FeatureListItemDescription>
                    </FeatureListItemBody>
                  </FeatureListItem>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 pt-4">
                {cateringTags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border-2 border-background px-3 py-1 font-mono text-[11px] font-bold uppercase tracking-[0.12em]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-none border-2 border-foreground bg-card p-8 text-card-foreground shadow-[6px_6px_0_0] shadow-background/30 lg:col-span-7">
              <h3 className="mb-6 text-2xl font-extrabold tracking-tight">
                {cateringFormTitle}
              </h3>
              <ContactForm className="space-y-4" onSubmit={inquiry.submitForm}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ft-catering-name"
                      className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Name
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ft-catering-name"
                      name="name"
                      placeholder="Your name"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ft-catering-email"
                      className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Email
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ft-catering-email"
                      name="email"
                      type="email"
                      placeholder="you@email.com"
                      className={inputCls}
                    />
                  </ContactFormField>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ft-catering-date"
                      className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Event Date
                    </ContactFormLabel>
                    <ContactFormInput
                      id="ft-catering-date"
                      name="date"
                      type="date"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="ft-catering-guests"
                      className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                    >
                      Guest Count
                    </ContactFormLabel>
                    <ContactFormSelect
                      id="ft-catering-guests"
                      name="guestCount"
                      className={inputCls}
                    >
                      {guestCounts.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </ContactFormSelect>
                  </ContactFormField>
                </div>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="ft-catering-type"
                    className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    Event Type
                  </ContactFormLabel>
                  <ContactFormSelect
                    id="ft-catering-type"
                    name="eventType"
                    className={inputCls}
                  >
                    {eventTypes.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </ContactFormSelect>
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="ft-catering-message"
                    className="mb-1 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground"
                  >
                    Message
                  </ContactFormLabel>
                  <ContactFormTextarea
                    id="ft-catering-message"
                    name="message"
                    rows={3}
                    placeholder="Tell us about your event..."
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormSubmit
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="w-full rounded-none border-2 border-foreground bg-foreground px-6 py-3 font-bold uppercase tracking-wide text-background shadow-[4px_4px_0_0] shadow-foreground/30 transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0] active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : cateringSubmit}
                </ContactFormSubmit>
                <ContactFormFooter
                  className="font-mono text-xs text-muted-foreground"
                  aria-live="polite"
                >
                  {inquiry.statusText}
                </ContactFormFooter>
              </ContactForm>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
