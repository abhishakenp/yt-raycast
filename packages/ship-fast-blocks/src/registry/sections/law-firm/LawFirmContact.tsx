import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * LawFirmContact — a dark, split contact band on the primary surface pairing firm
 * details with a real consultation-request form. The left column carries a
 * tracked-uppercase eyebrow, serif heading, lead paragraph, a phone / email /
 * address contact list with line icons, and a LinkedIn social button; the right
 * column is a light card holding a form (first + last name, email, phone,
 * practice-area select, message textarea and a full-width submit) plus a fine
 * legal disclaimer. Refined, authoritative editorial aesthetic with sharp
 * squared corners. Contact links and the social button route through useNavigate;
 * submit writes a Lakebed inquiry. Use as the closing conversion section on
 * law-firm, attorney, consulting or professional-services pages. Renders fully
 * with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
export const LawFirmContact = defineCapsule({
  name: 'LawFirmContact',
  description:
    'Dark split contact band on the primary surface pairing firm details with a real Lakebed consultation-request form: the left column carries a tracked-uppercase eyebrow, serif heading, lead paragraph, a phone / email / address contact list with line icons and a LinkedIn social button; the right column is a light card holding a form (first + last name, email, phone, practice-area select, message textarea, full-width submit) plus a fine legal disclaimer. Refined, authoritative editorial aesthetic with sharp squared corners; contact links and the social button route through useNavigate, while submit writes a shared inquiry record. Use as the closing consultation / lead-capture conversion section on law-firm, attorney, consulting, accounting or professional-services pages.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().optional(),
    address: z.string().optional(),
    formHeading: z.string().optional(),
    submit: z.string().optional(),
    disclaimer: z.string().optional(),
    /** Practice-area options for the form select. */
    practiceOptions: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Schedule Consultation'
    const heading = props.heading ?? "Let's Discuss Your Matter"
    const description =
      props.description ??
      "Whether you're facing a complex transaction, litigation threat, or strategic business decision, we invite you to schedule a confidential consultation with one of our partners. Every conversation begins with listening."
    const phone = props.phone ?? '(212) 555-0147'
    const email = props.email ?? 'consult@reinhart.law'
    const address =
      props.address ?? '450 Lexington Avenue, 28th Floor, New York, NY 10017'
    const formHeading = props.formHeading ?? 'Request Consultation'
    const submit = props.submit ?? 'Submit Request'
    const disclaimer =
      props.disclaimer ??
      'By submitting this form, you acknowledge that this does not create an attorney-client relationship. Please do not include confidential information.'
    const practiceOptions = props.practiceOptions?.length
      ? props.practiceOptions
      : [
          'Select a practice area',
          'Corporate & Securities',
          'Commercial Litigation',
          'Employment Law',
          'Real Estate',
          'Intellectual Property',
          'Tax & Estates',
          'Other',
        ]
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Law firm consultation',
      successMessage:
        "Thanks. We've received your consultation request and will respond soon.",
    })
    const inputCls =
      'w-full rounded-sm border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'
    const PhoneIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
    const MailIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    )
    const MapPinIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
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
        <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
    const LinkedInIcon = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    )
    return (
      <section
        className={cn(
          'bg-primary py-24 text-primary-foreground lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <SectionHeading
                align="left"
                eyebrow={eyebrow}
                title={heading}
                subtitle={description}
                className="mb-8 gap-0"
                eyebrowClassName="mb-4 text-sm uppercase tracking-widest text-primary-foreground/70"
                titleClassName="mb-6 font-serif text-3xl lg:text-5xl"
                subtitleClassName="text-lg leading-relaxed text-primary-foreground/80"
              />
              <div className="mb-8 space-y-4">
                <button
                  type="button"
                  onClick={() => go(phone)}
                  className="flex items-center gap-4 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  <PhoneIcon className="size-5 text-primary-foreground/60" />
                  <span>{phone}</span>
                </button>
                <button
                  type="button"
                  onClick={() => go(email)}
                  className="flex items-center gap-4 text-primary-foreground/80 transition-colors hover:text-primary-foreground"
                >
                  <MailIcon className="size-5 text-primary-foreground/60" />
                  <span>{email}</span>
                </button>
                <div className="flex items-center gap-4 text-primary-foreground/80">
                  <MapPinIcon className="size-5 shrink-0 text-primary-foreground/60" />
                  <span>{address}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  aria-label="LinkedIn"
                  onClick={() => go('LinkedIn')}
                  className="grid size-10 place-items-center bg-primary-foreground/10 text-primary-foreground transition-colors hover:bg-primary-foreground/20"
                >
                  <LinkedInIcon className="size-5" />
                </button>
              </div>
            </div>

            <div className="bg-card p-8 text-foreground lg:p-10">
              <h3 className="mb-6 font-serif text-2xl text-foreground">
                {formHeading}
              </h3>
              <ContactForm className="space-y-6" onSubmit={inquiry.submitForm}>
                <div className="grid gap-6 sm:grid-cols-2">
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="lawfirm-contact-first"
                      className="text-foreground"
                    >
                      First Name
                    </ContactFormLabel>
                    <ContactFormInput
                      id="lawfirm-contact-first"
                      name="firstName"
                      type="text"
                      required
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="lawfirm-contact-last"
                      className="text-foreground"
                    >
                      Last Name
                    </ContactFormLabel>
                    <ContactFormInput
                      id="lawfirm-contact-last"
                      name="lastName"
                      type="text"
                      required
                      className={inputCls}
                    />
                  </ContactFormField>
                </div>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="lawfirm-contact-email"
                    className="text-foreground"
                  >
                    Email Address
                  </ContactFormLabel>
                  <ContactFormInput
                    id="lawfirm-contact-email"
                    name="email"
                    type="email"
                    required
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="lawfirm-contact-phone"
                    className="text-foreground"
                  >
                    Phone Number
                  </ContactFormLabel>
                  <ContactFormInput
                    id="lawfirm-contact-phone"
                    name="phone"
                    type="tel"
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="lawfirm-contact-practice"
                    className="text-foreground"
                  >
                    Practice Area
                  </ContactFormLabel>
                  <ContactFormSelect
                    id="lawfirm-contact-practice"
                    name="practiceArea"
                    className={cn(inputCls, 'appearance-none')}
                  >
                    {practiceOptions.map((opt) => (
                      <option key={opt} className="bg-background">
                        {opt}
                      </option>
                    ))}
                  </ContactFormSelect>
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="lawfirm-contact-message"
                    className="text-foreground"
                  >
                    How Can We Help?
                  </ContactFormLabel>
                  <ContactFormTextarea
                    id="lawfirm-contact-message"
                    name="message"
                    rows={4}
                    className={cn(inputCls, 'resize-none')}
                  />
                </ContactFormField>
                <ContactFormSubmit
                  type="submit"
                  aria-busy={inquiry.isPending}
                  disabled={inquiry.isPending}
                  className="w-full bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
                >
                  {inquiry.isPending ? 'Sending' : submit}
                </ContactFormSubmit>
                <ContactFormFooter
                  className="text-sm text-muted-foreground"
                  aria-live="polite"
                >
                  {inquiry.statusText}
                </ContactFormFooter>
                <p className="text-xs text-muted-foreground">{disclaimer}</p>
              </ContactForm>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
