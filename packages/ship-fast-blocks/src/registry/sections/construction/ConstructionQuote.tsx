import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
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
import { GraphPaper } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'

import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * ConstructionQuote — industrial-brutalist "request a free estimate"
 * lead-capture band for a construction / general contractor page. A full
 * foreground-inversion band cutting in on a slanted clip-path seam with a
 * blueprint graph-paper overlay: a mono work-order meta rule + left-aligned
 * extrabold uppercase heading above a hard-edged 2px-bordered intake form
 * (mono uppercase labels, square inputs for name, email, phone, project type,
 * budget, timeline, project details) whose hazard-filled square submit button
 * has a hard offset shadow and press feedback and writes a Lakebed inquiry,
 * plus a mono privacy disclaimer. Use as the closing conversion section for
 * construction firms, contractors, builders, or any service business
 * collecting project inquiries. Renders fully with no props via baked-in
 * defaults.
 */
export const ConstructionQuote = defineCapsule({
  name: 'ConstructionQuote',
  description:
    "Industrial-brutalist 'request a free estimate' Lakebed lead-capture band for a construction / general contractor page: a foreground-inversion band with a slanted clip-path top seam and blueprint graph-paper overlay, a mono work-order meta rule + extrabold uppercase heading, and a hard-edged 2px-bordered intake form (mono uppercase labels, square inputs for name, email, phone, project type, budget, timeline, project details) whose hazard-filled square submit button carries a hard offset shadow and press feedback and writes a shared inquiry record, plus a mono privacy disclaimer. Use as the closing conversion section for construction firms, contractors, builders, or any service business collecting project inquiries.",
  props: z.object({
    /** Form section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Privacy disclaimer below the submit button. */
    disclaimer: z.string().optional(),
    /** Project-type options for the select dropdown. */
    projectTypes: z.array(z.string()).optional(),
    /** Budget-range options for the select dropdown. */
    budgets: z.array(z.string()).optional(),
    /** Timeline options for the select dropdown. */
    timelines: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to start your project?'
    const description =
      props.description ??
      "Get a free, no-obligation estimate. We'll respond within 24 hours."
    const submitLabel = props.submit ?? 'Request Free Estimate'
    const disclaimer =
      props.disclaimer ??
      "By submitting, you agree to our privacy policy. We'll never share your information."
    const projectTypes = props.projectTypes?.length
      ? props.projectTypes
      : [
          'Select a project type',
          'Kitchen Remodel',
          'Bathroom Remodel',
          'Home Addition',
          'Custom Home',
          'Commercial Building',
          'Whole Home Renovation',
          'Other',
        ]
    const budgets = props.budgets?.length
      ? props.budgets
      : [
          'Select budget range',
          '$50,000 - $100,000',
          '$100,000 - $250,000',
          '$250,000 - $500,000',
          '$500,000 - $1,000,000',
          '$1,000,000+',
        ]
    const timelines = props.timelines?.length
      ? props.timelines
      : [
          'Select timeline',
          'ASAP',
          'Within 3 months',
          'Within 6 months',
          'Within 1 year',
          'Just planning',
        ]
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Construction estimate',
      successMessage:
        "Thanks. We've received your estimate request and will respond soon.",
    })

    const inputCls =
      'w-full rounded-none border-2 border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30'
    const labelCls =
      'font-mono text-[11px] uppercase tracking-[0.15em] text-foreground/80'

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-foreground py-16 pt-24 [clip-path:polygon(0_3rem,100%_0,100%_100%,0_100%)] sm:pt-28 lg:py-24 lg:pt-32',
          props.className,
        )}
      >
        <GraphPaper className="inset-0 text-background/[0.05]" />
        <Container size="sm" className="relative max-w-4xl">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-background/20 pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="size-2 animate-pulse bg-primary"
              />
              Work order / intake
            </span>
            <span className="tabular-nums">24h response</span>
          </div>
          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            titleClassName="text-3xl font-extrabold uppercase tracking-tight text-background sm:text-4xl lg:text-5xl"
            subtitleClassName="text-lg text-background/60"
            className="mb-10 gap-4"
          />

          <ContactForm
            variant="card"
            className="rounded-none border-2 border-background/25 bg-card p-6 shadow-[10px_10px_0_0] shadow-background/15 sm:p-8 lg:p-12"
            onSubmit={inquiry.submitForm}
          >
            <ResponsiveGrid cols="1-md-2" className="mb-6 gap-6">
              <ContactFormField className="mb-0">
                <ContactFormLabel htmlFor="con-quote-name" className={labelCls}>
                  Full Name
                </ContactFormLabel>
                <ContactFormInput
                  id="con-quote-name"
                  name="name"
                  required
                  placeholder="John Smith"
                  className={inputCls}
                />
              </ContactFormField>
              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="con-quote-email"
                  className={labelCls}
                >
                  Email Address
                </ContactFormLabel>
                <ContactFormInput
                  id="con-quote-email"
                  name="email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className={inputCls}
                />
              </ContactFormField>
            </ResponsiveGrid>

            <ResponsiveGrid cols="1-md-2" className="mb-6 gap-6">
              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="con-quote-phone"
                  className={labelCls}
                >
                  Phone Number
                </ContactFormLabel>
                <ContactFormInput
                  id="con-quote-phone"
                  name="phone"
                  type="tel"
                  required
                  placeholder="(206) 555-1234"
                  className={inputCls}
                />
              </ContactFormField>
              <ContactFormField className="mb-0">
                <ContactFormLabel htmlFor="con-quote-type" className={labelCls}>
                  Project Type
                </ContactFormLabel>
                <ContactFormSelect
                  id="con-quote-type"
                  name="projectType"
                  required
                  className={inputCls}
                >
                  {projectTypes.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </ContactFormSelect>
              </ContactFormField>
            </ResponsiveGrid>

            <ResponsiveGrid cols="1-md-2" className="mb-6 gap-6">
              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="con-quote-budget"
                  className={labelCls}
                >
                  Estimated Budget
                </ContactFormLabel>
                <ContactFormSelect
                  id="con-quote-budget"
                  name="budget"
                  required
                  className={inputCls}
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
                  htmlFor="con-quote-timeline"
                  className={labelCls}
                >
                  Desired Timeline
                </ContactFormLabel>
                <ContactFormSelect
                  id="con-quote-timeline"
                  name="timeline"
                  required
                  className={inputCls}
                >
                  {timelines.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </ContactFormSelect>
              </ContactFormField>
            </ResponsiveGrid>

            <div className="mb-6">
              <ContactFormField className="mb-0">
                <ContactFormLabel
                  htmlFor="con-quote-message"
                  className={labelCls}
                >
                  Project Details
                </ContactFormLabel>
                <ContactFormTextarea
                  id="con-quote-message"
                  name="message"
                  rows={4}
                  placeholder="Tell us about your project, goals, and any specific requirements..."
                  className={inputCls}
                />
              </ContactFormField>
            </div>

            <ContactFormSubmit
              type="submit"
              aria-busy={inquiry.isPending}
              disabled={inquiry.isPending}
              className="w-full rounded-none bg-primary py-4 font-mono text-sm font-bold uppercase tracking-[0.15em] text-primary-foreground shadow-[5px_5px_0_0] shadow-foreground/40 transition-all duration-100 hover:-translate-y-px hover:bg-primary/90 active:translate-x-px active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
            >
              {inquiry.isPending ? 'Sending' : submitLabel}
            </ContactFormSubmit>

            <ContactFormFooter className="mt-4 text-center text-sm text-muted-foreground">
              {inquiry.statusText}
            </ContactFormFooter>

            <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
              {disclaimer}
            </p>
          </ContactForm>
        </Container>
      </section>
    )
  },
})
