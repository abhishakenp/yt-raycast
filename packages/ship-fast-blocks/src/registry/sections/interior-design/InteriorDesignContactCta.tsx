import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * InteriorDesignContactCta — split contact section pairing studio details with a
 * real inquiry form for an upscale interior-design / architecture studio. A two-
 * column layout: on the left an uppercase eyebrow, a light-weight heading, a
 * supporting paragraph and a stack of contact rows (studio address, email,
 * phone) each with a circular muted line icon; on the right a bordered inquiry
 * form (first/last name, email, project-type + budget selects, message
 * textarea) with a filled submit button and a footnote. Editorial and
 * conversion-focused. The email and phone route through useNavigate; submit
 * writes a Lakebed inquiry. Use as the closing contact / lead-capture block for
 * interior designers, design studios or architecture firms. Renders fully with
 * no props via baked-in defaults.
 */
export const InteriorDesignContactCta = defineCapsule({
  name: 'InteriorDesignContactCta',
  description:
    'Split contact section pairing studio details with a real Lakebed inquiry form for an upscale interior-design / architecture studio: two-column layout with an uppercase eyebrow, light-weight heading, supporting paragraph and a stack of contact rows (studio address, email, phone) each with a circular muted line icon on the left, and a bordered inquiry form (first/last name, email, project-type + budget selects, message textarea) with a filled submit button and footnote on the right. Editorial and conversion-focused; email and phone route through useNavigate, while submit writes a shared inquiry record. Use as the closing contact / lead-capture block for interior designers, design studios or architecture firms.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    submit: z.string().optional(),
    footnote: z.string().optional(),
    studioLabel: z.string().optional(),
    studioAddress: z.string().optional(),
    emailLabel: z.string().optional(),
    email: z.string().optional(),
    phoneLabel: z.string().optional(),
    phone: z.string().optional(),
    projectTypes: z.array(z.string()).optional(),
    budgets: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Start Your Project'
    const heading = props.heading ?? "Let's create something beautiful together"
    const description =
      props.description ??
      "Ready to transform your space? We'd love to hear about your project. Schedule a complimentary consultation to discuss your vision, timeline, and investment."
    const submit = props.submit ?? 'Request Consultation'
    const footnote =
      props.footnote ??
      'We typically respond within 24-48 hours. Initial consultations are complimentary.'
    const studioLabel = props.studioLabel ?? 'Studio'
    const studioAddress =
      props.studioAddress ??
      '465 California Street, Suite 1200\nSan Francisco, CA 94104'
    const emailLabel = props.emailLabel ?? 'Email'
    const email = props.email ?? 'hello@atelierstudio.co'
    const phoneLabel = props.phoneLabel ?? 'Phone'
    const phone = props.phone ?? '(415) 555-0147'
    const projectTypes = props.projectTypes?.length
      ? props.projectTypes
      : [
          'Select project type',
          'Residential — Full Home',
          'Residential — Single Room',
          'Commercial Office',
          'Hospitality',
          'Design Consultation',
          'Other',
        ]
    const budgets = props.budgets?.length
      ? props.budgets
      : [
          'Select budget range',
          '$25,000 — $50,000',
          '$50,000 — $100,000',
          '$100,000 — $250,000',
          '$250,000+',
        ]
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Interior design consultation',
      successMessage:
        "Thanks. We've received your consultation request and will respond soon.",
    })

    const inputCls =
      'w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

    return (
      <section
        className={cn(
          'px-4 pt-28 pb-20 sm:px-6 md:pt-32 md:pb-28 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            <div className="space-y-8">
              <div>
                <p className="mb-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                  {eyebrow}
                </p>
                <h2 className="mb-6 text-3xl font-light text-foreground md:text-4xl">
                  {heading}
                </h2>
                <p className="leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{studioLabel}</p>
                    <p className="whitespace-pre-line text-muted-foreground">
                      {studioAddress}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{emailLabel}</p>
                    <button
                      type="button"
                      onClick={() => go(email)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {email}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex size-10 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{phoneLabel}</p>
                    <button
                      type="button"
                      onClick={() => go(phone)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {phone}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <form className="space-y-6" onSubmit={inquiry.submitForm}>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="interior-design-contact-first-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    First Name
                  </label>
                  <input
                    id="interior-design-contact-first-name"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Enter first name"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label
                    htmlFor="interior-design-contact-last-name"
                    className="mb-2 block text-sm font-medium text-foreground"
                  >
                    Last Name
                  </label>
                  <input
                    id="interior-design-contact-last-name"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Enter last name"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="interior-design-contact-email"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Email Address
                </label>
                <input
                  id="interior-design-contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label
                  htmlFor="interior-design-contact-project-type"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Project Type
                </label>
                <select
                  id="interior-design-contact-project-type"
                  name="projectType"
                  className={cn(inputCls, 'appearance-none')}
                >
                  {projectTypes.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="interior-design-contact-budget"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Estimated Budget
                </label>
                <select
                  id="interior-design-contact-budget"
                  name="budget"
                  className={cn(inputCls, 'appearance-none')}
                >
                  {budgets.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="interior-design-contact-message"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  Tell Us About Your Project
                </label>
                <textarea
                  id="interior-design-contact-message"
                  name="message"
                  rows={4}
                  placeholder="Describe your space, timeline, and any specific design goals..."
                  className={cn(inputCls, 'resize-none')}
                />
              </div>

              <button
                type="submit"
                aria-busy={inquiry.isPending}
                disabled={inquiry.isPending}
                className="w-full bg-foreground px-8 py-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
              >
                {inquiry.isPending ? 'Sending' : submit}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                {inquiry.statusText}
              </p>

              <p className="text-center text-xs text-muted-foreground">
                {footnote}
              </p>
            </form>
          </div>
        </div>
      </section>
    )
  },
})
