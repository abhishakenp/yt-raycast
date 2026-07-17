import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { FormField } from '#/section-kit/FormField.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * ConstructionQuote — dark "request a free estimate" lead-capture form for a
 * construction / general contractor page. A centered heading on a dark band
 * above a functional multi-field form (name, email, phone, project type, budget,
 * timeline, project details) with a submit button that writes a Lakebed inquiry,
 * plus a privacy disclaimer. Use as the closing conversion section for
 * construction firms, contractors, builders, or any service business collecting
 * project inquiries. Renders fully with no props via baked-in defaults.
 */
export const ConstructionQuote = defineCapsule({
  name: 'ConstructionQuote',
  description:
    "Dark 'request a free estimate' Lakebed lead-capture form for a construction / general contractor page: a centered heading on a dark band above a functional multi-field form (name, email, phone, project type, budget, timeline, project details) with a submit button that writes a shared inquiry record, plus a privacy disclaimer. Use as the closing conversion section for construction firms, contractors, builders, or any service business collecting project inquiries.",
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
      'w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30'

    return (
      <section className={cn('bg-foreground py-20 lg:py-28', props.className)}>
        <Container size="sm" className="max-w-4xl">
          <SectionHeading
            title={heading}
            subtitle={description}
            align="center"
            titleClassName="text-3xl font-bold text-background sm:text-4xl"
            subtitleClassName="text-lg text-background/60"
            className="mb-12 gap-6"
          />

          <form
            className="rounded-xl bg-card p-8 shadow-xl lg:p-12"
            onSubmit={inquiry.submitForm}
          >
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <FormField
                id="con-quote-name"
                name="name"
                label="Full Name"
                required
                placeholder="John Smith"
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
              <FormField
                id="con-quote-email"
                name="email"
                label="Email Address"
                type="email"
                required
                placeholder="john@example.com"
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <FormField
                id="con-quote-phone"
                name="phone"
                label="Phone Number"
                type="tel"
                required
                placeholder="(206) 555-1234"
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
              <FormField
                id="con-quote-type"
                name="projectType"
                label="Project Type"
                as="select"
                required
                options={projectTypes}
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <FormField
                id="con-quote-budget"
                name="budget"
                label="Estimated Budget"
                as="select"
                required
                options={budgets}
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
              <FormField
                id="con-quote-timeline"
                name="timeline"
                label="Desired Timeline"
                as="select"
                required
                options={timelines}
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
            </div>

            <div className="mb-6">
              <FormField
                id="con-quote-message"
                name="message"
                label="Project Details"
                as="textarea"
                rows={4}
                placeholder="Tell us about your project, goals, and any specific requirements..."
                inputClassName={inputCls}
                labelClassName="text-foreground/80"
              />
            </div>

            <button
              type="submit"
              aria-busy={inquiry.isPending}
              disabled={inquiry.isPending}
              className="w-full rounded-lg bg-foreground py-4 text-lg font-semibold text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {inquiry.isPending ? 'Sending' : submitLabel}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {inquiry.statusText}
            </p>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {disclaimer}
            </p>
          </form>
        </Container>
      </section>
    )
  },
})
