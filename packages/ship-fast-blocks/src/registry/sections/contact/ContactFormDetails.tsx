import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { inquiryLakebed } from './inquiry-lakebed.ts'
import {
  InquiryContactSheetButton,
  useInquirySubmission,
} from './inquiry-interactions.tsx'

type ContactDetailIcon = 'clock' | 'mail' | 'map-pin' | 'phone'
type ContactDetailItem = {
  icon?: ContactDetailIcon
  label: string
  value: string
  value2?: string
}

/**
 * ContactFormDetails — two-up band pairing a working contact form with a
 * contact-details card. Left side: full-name, email, and message fields with
 * labels, placeholders, and a wide send button. Right side: a tinted-icon list
 * of contact info (email, phone, address, hours) plus a row of social-link
 * buttons. Cards are raised with soft shadows and border tokens. Use as the
 * main conversion block on contact, support, or sales-inquiry pages. Renders
 * fully with no props via baked-in defaults.
 */
export const ContactFormDetails = defineCapsule({
  name: 'ContactFormDetails',
  description:
    'Two-up band pairing a working contact form with a contact-details card. Left side: full-name, email, and message fields with labels, placeholders, and a wide send button. Right side: a tinted-icon list of contact info (email, phone, address, hours) plus a row of social-link buttons. Raised cards with soft shadows and border tokens. Use as the main conversion block on contact, support, or sales-inquiry pages.',
  props: z.object({
    /** Contact form copy: field labels, placeholders, submit + confirmation. */
    form: z
      .object({
        nameLabel: z.string().optional(),
        namePlaceholder: z.string().optional(),
        emailLabel: z.string().optional(),
        emailPlaceholder: z.string().optional(),
        messageLabel: z.string().optional(),
        messagePlaceholder: z.string().optional(),
        submit: z.string().optional(),
        confirmation: z.string().optional(),
      })
      .optional(),
    /** Contact-details card: heading, items (icon + label + value), and optional second value line. */
    details: z
      .object({
        heading: z.string().optional(),
        items: z
          .array(
            z.object({
              icon: z.enum(['mail', 'phone', 'map-pin', 'clock']).optional(),
              label: z.string(),
              value: z.string(),
              value2: z.string().optional(),
            }),
          )
          .optional(),
        socials: z.array(z.string()).optional(),
      })
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const nameLabel = props.form?.nameLabel ?? 'Full Name'
    const namePlaceholder = props.form?.namePlaceholder ?? 'John Doe'
    const emailLabel = props.form?.emailLabel ?? 'Email Address'
    const emailPlaceholder = props.form?.emailPlaceholder ?? 'john@company.com'
    const messageLabel = props.form?.messageLabel ?? 'Message'
    const messagePlaceholder =
      props.form?.messagePlaceholder ??
      'Tell us about your project, timeline, and budget...'
    const submitLabel = props.form?.submit ?? 'Send Message'
    const confirmation =
      props.form?.confirmation ??
      'Thanks for reaching out! We will get back to you shortly.'
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Contact form',
      successMessage: confirmation,
    })

    const detailsHeading = props.details?.heading ?? 'Contact Information'
    const defaultDetailItems: ContactDetailItem[] = [
      {
        icon: 'mail',
        label: 'Email',
        value: 'hello@orbitdigital.co',
      },
      {
        icon: 'phone',
        label: 'Phone',
        value: '+1 (415) 555-1234',
      },
      {
        icon: 'map-pin',
        label: 'Office',
        value: '1201 Mission Street, Suite 400',
        value2: 'San Francisco, CA 94103',
      },
      {
        icon: 'clock',
        label: 'Business Hours',
        value: 'Mon — Fri: 9:00 AM – 6:00 PM PST',
      },
    ]
    const detailItems: ContactDetailItem[] = props.details?.items?.length
      ? props.details.items
      : defaultDetailItems
    const socials = props.details?.socials?.length
      ? props.details.socials
      : ['Twitter', 'LinkedIn', 'GitHub', 'Instagram']

    const detailIcons: Record<ContactDetailIcon, ReactNode> = {
      mail: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="2" y="4" width="20" height="16" rx="2" />
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
        </svg>
      ),
      phone: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      'map-pin': (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      ),
      clock: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      ),
    }

    const socialPath = (label: string) => {
      const l = label.toLowerCase()
      if (l.includes('linkedin'))
        return {
          path: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z',
          extra: true,
        }
      if (l.includes('github'))
        return {
          path: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
          extra: false,
        }
      if (l.includes('instagram'))
        return {
          path: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z',
          extra: false,
          insta: true,
        }
      return {
        path: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z',
        extra: false,
      }
    }

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="grid items-start gap-10 lg:grid-cols-2">
            {/* Contact form */}
            <Card
              rounded="2xl"
              padding="none"
              className="p-9 shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-colors hover:border-border/60"
            >
              <h2 className="sr-only">Contact form</h2>
              <form onSubmit={inquiry.submitForm}>
                <div className="mb-6">
                  <label
                    htmlFor="cfd-name"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {nameLabel}
                  </label>
                  <input
                    type="text"
                    id="cfd-name"
                    name="name"
                    placeholder={namePlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="cfd-email"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {emailLabel}
                  </label>
                  <input
                    type="email"
                    id="cfd-email"
                    name="email"
                    placeholder={emailPlaceholder}
                    className="w-full rounded-lg border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <div className="mb-6">
                  <label
                    htmlFor="cfd-message"
                    className="mb-2 block text-[0.82rem] font-semibold uppercase tracking-[0.06em] text-muted-foreground"
                  >
                    {messageLabel}
                  </label>
                  <textarea
                    id="cfd-message"
                    name="message"
                    placeholder={messagePlaceholder}
                    className="min-h-[140px] w-full resize-y rounded-lg border border-input bg-background px-4 py-3.5 text-[0.97rem] text-foreground placeholder:text-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/50"
                  />
                </div>
                <p className="sr-only" aria-live="polite">
                  {inquiry.statusText}
                </p>
                <button
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="flex w-full items-center justify-center gap-2.5 rounded-lg bg-primary px-7 py-4 text-[0.95rem] font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-70"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M22 2 11 13" />
                    <path d="M22 2 15 22l-4-9-9-4 20-7z" />
                  </svg>
                  {inquiry.isPending ? 'Sending' : submitLabel}
                </button>
                <p className="mt-4 text-sm text-muted-foreground">
                  {inquiry.statusText}
                </p>
              </form>
            </Card>

            {/* Contact details */}
            <Card
              rounded="2xl"
              padding="none"
              className="p-9 shadow-[0_24px_64px_rgba(0,0,0,0.45)] transition-colors hover:border-border/60"
            >
              <h2 className="mb-6 text-xl font-bold text-foreground">
                {detailsHeading}
              </h2>
              <div className="flex flex-col gap-6">
                {detailItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start gap-4 rounded-lg border border-transparent bg-muted/40 p-5 transition-all hover:border-border hover:bg-muted/60"
                  >
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                      {detailIcons[item.icon ?? 'mail']}
                    </span>
                    <div>
                      <h3 className="mb-0.5 text-[0.95rem] font-semibold text-foreground">
                        {item.label}
                      </h3>
                      <p className="text-[0.9rem] leading-[1.5] text-muted-foreground">
                        {item.value}
                        {item.value2 ? (
                          <>
                            <br />
                            {item.value2}
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-2.5">
                {socials.map((label) => {
                  const s = socialPath(label)
                  return (
                    <InquiryContactSheetButton
                      key={label}
                      lakebed={lakebed}
                      label={label}
                      target={label}
                      source="Contact details"
                      heading={`Connect on ${label}`}
                      description={`Open this ${label} contact option without leaving the generated page.`}
                      buttonClassName="grid size-[42px] place-items-center rounded-xl border border-border bg-background text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        {s.insta ? (
                          <>
                            <rect
                              x="2"
                              y="2"
                              width="20"
                              height="20"
                              rx="5"
                              ry="5"
                            />
                            <path d={s.path} />
                            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                          </>
                        ) : s.extra ? (
                          <>
                            <path d={s.path} />
                            <rect x="2" y="9" width="4" height="12" />
                            <circle cx="4" cy="4" r="2" />
                          </>
                        ) : (
                          <path d={s.path} />
                        )}
                      </svg>
                    </InquiryContactSheetButton>
                  )
                })}
              </div>
            </Card>
          </div>
        </Container>
      </section>
    )
  },
})
