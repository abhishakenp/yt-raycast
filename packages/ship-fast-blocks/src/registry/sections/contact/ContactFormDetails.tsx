import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
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
  ContactFormTextarea,
  ContactFormSubmit,
  ContactFormFooter,
} from '#/section-kit/ContactForm.tsx'
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
 * ContactFormDetails — editorial split band pairing a working contact form
 * with an inverted contact-details ledger, framed by a single hairline
 * collapsed border. Left rail (5 cols, bg-foreground inversion): the details
 * heading over a hairline ledger of contact rows — mono index numeral,
 * squared hairline icon tile, mono uppercase micro-label, value lines — plus
 * a row of squared social buttons and a ghost "@" watermark. Right column
 * (7 cols): full-name, email, and message fields with mono index numerals
 * and uppercase micro-labels over hairline underline-only inputs, closed by
 * a full-width inverted submit bar with press feedback. Sharp edges, no soft
 * shadows, token-only colors. Use as the main conversion block on contact,
 * support, or sales-inquiry pages. Renders fully with no props via baked-in
 * defaults.
 */
export const ContactFormDetails = defineCapsule({
  name: 'ContactFormDetails',
  description:
    'Editorial split band pairing a working contact form with an inverted contact-details ledger inside one hairline collapsed frame. Left rail (5 cols, bg-foreground inversion): details heading over a hairline ledger of contact rows — mono index numerals, squared icon tiles, mono uppercase micro-labels — plus squared social buttons and a ghost "@" watermark. Right column (7 cols): full-name, email, and message fields as mono micro-labels over hairline underline-only inputs, closed by a full-width inverted submit bar with press feedback. Sharp edges, token-only colors. Use as the main conversion block on contact, support, or sales-inquiry pages.',
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
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      ),
      'map-pin': (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
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

    const fieldIndex = (index: string, label: ReactNode) => (
      <div className="mb-3 flex items-baseline gap-3">
        <span
          aria-hidden="true"
          className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground/60"
        >
          {index}
        </span>
        {label}
      </div>
    )

    const inputClasses =
      'w-full rounded-none border-0 border-b border-border bg-transparent px-0 py-3 text-base text-foreground placeholder:text-muted-foreground/50 shadow-none outline-none transition-colors focus:border-foreground focus:ring-0'

    return (
      <section
        className={cn('bg-background py-14 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="grid border border-border lg:grid-cols-12">
            {/* Inverted contact-details ledger rail */}
            <Card className="relative order-2 flex flex-col overflow-hidden rounded-none border-0 border-t border-border bg-foreground p-6 text-background sm:p-10 lg:order-1 lg:col-span-5 lg:border-t-0 lg:border-r lg:p-12">
              <Watermark className="-right-10 -bottom-14 text-[11rem] text-background/[0.05] sm:text-[14rem]">
                @
              </Watermark>
              <MonoTag tone="inverted" aria-hidden="true">
                A / Details
              </MonoTag>
              <h2 className="relative mt-4 mb-2 text-2xl font-extrabold tracking-tight text-background">
                {detailsHeading}
              </h2>
              <div className="relative mt-4 flex flex-col">
                {detailItems.map((item, i) => (
                  <FeatureListItem
                    key={item.label}
                    className="items-start gap-4 border-t border-background/15 py-5"
                  >
                    <span
                      aria-hidden="true"
                      className="pt-2.5 font-mono text-[11px] tracking-[0.2em] text-background/40"
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <FeatureListItemIcon className="grid size-10 shrink-0 place-items-center rounded-none border border-background/25 bg-transparent text-background/80">
                      {detailIcons[item.icon ?? 'mail']}
                    </FeatureListItemIcon>
                    <FeatureListItemBody>
                      <FeatureListItemTitle
                        asChild
                        className="mb-1.5 font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-background/55"
                      >
                        <h3>{item.label}</h3>
                      </FeatureListItemTitle>
                      <FeatureListItemDescription className="text-[0.95rem] leading-relaxed text-background">
                        {item.value}
                        {item.value2 ? (
                          <>
                            <br />
                            {item.value2}
                          </>
                        ) : null}
                      </FeatureListItemDescription>
                    </FeatureListItemBody>
                  </FeatureListItem>
                ))}
              </div>

              <div className="relative mt-auto flex gap-2 border-t border-background/15 pt-6">
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
                      buttonClassName="grid size-11 place-items-center rounded-none border border-background/25 bg-transparent text-background/70 transition-colors hover:border-background hover:bg-background hover:text-foreground active:translate-y-px"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
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

            {/* Underline-input contact form */}
            <Card className="order-1 rounded-none border-0 bg-transparent p-6 text-foreground sm:p-10 lg:order-2 lg:col-span-7 lg:p-12">
              <h2 className="sr-only">Contact form</h2>
              <MonoTag aria-hidden="true" tone="faint">
                B / Write to us
              </MonoTag>
              <ContactForm onSubmit={inquiry.submitForm} className="mt-6">
                <ContactFormField className="mb-8">
                  {fieldIndex(
                    '01',
                    <ContactFormLabel
                      htmlFor="cfd-name"
                      className="mb-0 block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-foreground"
                    >
                      {nameLabel}
                    </ContactFormLabel>,
                  )}
                  <ContactFormInput
                    type="text"
                    id="cfd-name"
                    name="name"
                    placeholder={namePlaceholder}
                    className={inputClasses}
                  />
                </ContactFormField>
                <ContactFormField className="mb-8">
                  {fieldIndex(
                    '02',
                    <ContactFormLabel
                      htmlFor="cfd-email"
                      className="mb-0 block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-foreground"
                    >
                      {emailLabel}
                    </ContactFormLabel>,
                  )}
                  <ContactFormInput
                    type="email"
                    id="cfd-email"
                    name="email"
                    placeholder={emailPlaceholder}
                    className={inputClasses}
                  />
                </ContactFormField>
                <ContactFormField className="mb-8">
                  {fieldIndex(
                    '03',
                    <ContactFormLabel
                      htmlFor="cfd-message"
                      className="mb-0 block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-foreground"
                    >
                      {messageLabel}
                    </ContactFormLabel>,
                  )}
                  <ContactFormTextarea
                    id="cfd-message"
                    name="message"
                    placeholder={messagePlaceholder}
                    className={cn(inputClasses, 'min-h-[140px] resize-y')}
                  />
                </ContactFormField>
                <p className="sr-only" aria-live="polite">
                  {inquiry.statusText}
                </p>
                <ContactFormSubmit
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="flex w-full items-center justify-between gap-3 rounded-none bg-foreground px-6 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-background transition-colors hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : submitLabel}
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
                    <path d="M5 12h14" />
                    <path d="m12 5 7 7-7 7" />
                  </svg>
                </ContactFormSubmit>
                <ContactFormFooter className="mt-4 text-sm text-muted-foreground">
                  {inquiry.statusText}
                </ContactFormFooter>
              </ContactForm>
            </Card>
          </div>
        </Container>
      </section>
    )
  },
})
