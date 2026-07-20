import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandEyebrow,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
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
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * InteriorDesignContactCta — editorial-spatial split contact block pairing studio
 * details with a real Lakebed inquiry form for an upscale interior-design /
 * architecture studio. An asymmetric 5:7 layout: on the left a mono "08 / CONTACT"
 * rail, a light-weight heading, a supporting paragraph and a hairline stack of
 * contact rows (studio address, email, phone) each with a square outlined line
 * icon and mono label; on the right a hairline-framed inquiry form (first/last
 * name, email, project-type + budget selects, message textarea) with a square
 * filled submit button with press feedback and a footnote. Editorial,
 * conversion-focused, binary radius. The email and phone route through section-kit
 * route links; submit writes a Lakebed inquiry. Use as the closing contact /
 * lead-capture block for interior designers, design studios or architecture
 * firms. Renders fully with no props via baked-in defaults.
 */
export const InteriorDesignContactCta = defineCapsule({
  name: 'InteriorDesignContactCta',
  description:
    'Editorial-spatial split contact block pairing studio details with a real Lakebed inquiry form for an upscale interior-design / architecture studio: an asymmetric 5:7 layout with a mono "08 / CONTACT" rail, light-weight heading, supporting paragraph and a hairline stack of contact rows (studio address, email, phone) each with a square outlined line icon and mono label on the left, and a hairline-framed inquiry form (first/last name, email, project-type + budget selects, message textarea) with a square filled submit button with press feedback and footnote on the right. Editorial, conversion-focused, binary radius; email and phone route through section-kit route links, while submit writes a shared inquiry record. Use as the closing contact / lead-capture block for interior designers, design studios or architecture firms.',
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
      'w-full rounded-none border border-input bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

    return (
      <CtaBand tone="muted" className={cn('bg-muted/40', props.className)}>
        <CtaBandInner
          align="left"
          className="max-w-7xl gap-8 px-4 pt-24 pb-16 sm:px-6 md:pt-28 md:pb-24 lg:px-8 lg:gap-10"
        >
          <CtaBandEyebrow className="flex items-center gap-3 font-mono text-[11px] font-normal normal-case tracking-[0.2em] text-muted-foreground">
            <span aria-hidden="true" className="size-2 bg-primary" />
            08 / {eyebrow}
          </CtaBandEyebrow>
          <CtaBandTitle className="max-w-2xl text-balance font-light tracking-tight md:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-muted-foreground leading-relaxed">
            {description}
          </CtaBandSubtitle>
          <div className="mt-4 grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-5">
              <div className="space-y-0 border-t border-border">
                <FeatureListItem className="items-start gap-4 border-b border-border py-5">
                  <FeatureListItemIcon className="flex size-11 items-center justify-center rounded-none border border-border bg-transparent text-foreground">
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
                  </FeatureListItemIcon>
                  <FeatureListItemBody>
                    <FeatureListItemTitle asChild>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {studioLabel}
                      </p>
                    </FeatureListItemTitle>
                    <FeatureListItemDescription className="whitespace-pre-line">
                      {studioAddress}
                    </FeatureListItemDescription>
                  </FeatureListItemBody>
                </FeatureListItem>

                <FeatureListItem className="items-start gap-4 border-b border-border py-5">
                  <FeatureListItemIcon className="flex size-11 items-center justify-center rounded-none border border-border bg-transparent text-foreground">
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
                  </FeatureListItemIcon>
                  <FeatureListItemBody>
                    <FeatureListItemTitle asChild>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {emailLabel}
                      </p>
                    </FeatureListItemTitle>
                    <NavbarRouteLink
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      href={email}
                    >
                      {email}
                    </NavbarRouteLink>
                  </FeatureListItemBody>
                </FeatureListItem>

                <FeatureListItem className="items-start gap-4 border-b border-border py-5">
                  <FeatureListItemIcon className="flex size-11 items-center justify-center rounded-none border border-border bg-transparent text-foreground">
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
                  </FeatureListItemIcon>
                  <FeatureListItemBody>
                    <FeatureListItemTitle asChild>
                      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        {phoneLabel}
                      </p>
                    </FeatureListItemTitle>
                    <NavbarRouteLink
                      className="text-muted-foreground transition-colors hover:text-foreground"
                      href={phone}
                    >
                      {phone}
                    </NavbarRouteLink>
                  </FeatureListItemBody>
                </FeatureListItem>
              </div>
            </div>

            <ContactForm
              className="space-y-6 border border-border bg-background p-6 sm:p-8 lg:col-span-7"
              onSubmit={inquiry.submitForm}
            >
              <ResponsiveGrid cols="1-2" className="gap-6">
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="interior-design-contact-first-name"
                    className="text-foreground"
                  >
                    First Name
                  </ContactFormLabel>
                  <ContactFormInput
                    id="interior-design-contact-first-name"
                    name="firstName"
                    type="text"
                    required
                    placeholder="Enter first name"
                    className={inputCls}
                  />
                </ContactFormField>
                <ContactFormField className="mb-0">
                  <ContactFormLabel
                    htmlFor="interior-design-contact-last-name"
                    className="text-foreground"
                  >
                    Last Name
                  </ContactFormLabel>
                  <ContactFormInput
                    id="interior-design-contact-last-name"
                    name="lastName"
                    type="text"
                    required
                    placeholder="Enter last name"
                    className={inputCls}
                  />
                </ContactFormField>
              </ResponsiveGrid>

              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="interior-design-contact-email"
                  className="text-foreground"
                >
                  Email Address
                </ContactFormLabel>
                <ContactFormInput
                  id="interior-design-contact-email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className={inputCls}
                />
              </ContactFormField>

              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="interior-design-contact-project-type"
                  className="text-foreground"
                >
                  Project Type
                </ContactFormLabel>
                <ContactFormSelect
                  id="interior-design-contact-project-type"
                  name="projectType"
                  className={cn(inputCls, 'appearance-none')}
                >
                  {projectTypes.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </ContactFormSelect>
              </ContactFormField>

              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="interior-design-contact-budget"
                  className="text-foreground"
                >
                  Estimated Budget
                </ContactFormLabel>
                <ContactFormSelect
                  id="interior-design-contact-budget"
                  name="budget"
                  className={cn(inputCls, 'appearance-none')}
                >
                  {budgets.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </ContactFormSelect>
              </ContactFormField>

              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="interior-design-contact-message"
                  className="text-foreground"
                >
                  Tell Us About Your Project
                </ContactFormLabel>
                <ContactFormTextarea
                  id="interior-design-contact-message"
                  name="message"
                  rows={4}
                  placeholder="Describe your space, timeline, and any specific design goals..."
                  className={cn(inputCls, 'resize-none')}
                />
              </ContactFormField>

              <ContactFormSubmit
                type="submit"
                aria-busy={inquiry.isPending}
                disabled={inquiry.isPending}
                className="w-full rounded-none bg-foreground px-8 py-4 text-sm font-medium text-background transition-all duration-150 hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
              >
                {inquiry.isPending ? 'Sending' : submit}
              </ContactFormSubmit>

              <ContactFormFooter className="text-center text-sm text-muted-foreground">
                {inquiry.statusText}
              </ContactFormFooter>

              <p className="text-center text-xs text-muted-foreground">
                {footnote}
              </p>
            </ContactForm>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
