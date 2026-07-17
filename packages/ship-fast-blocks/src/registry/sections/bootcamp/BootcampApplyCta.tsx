import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { CtaBand } from '#/section-kit/CtaBand.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * BootcampApplyCta — high-contrast application CTA with a real multi-field
 * form for a coding bootcamp / career-school landing page. A centered headline
 * and description over a primary-colored band, above a rounded card containing
 * a functional form (first name, last name, email, program select, current
 * occupation, submit button). Below the form sits a fineprint line and a row
 * of trust chips with check icons. Form submit writes a Lakebed application
 * inquiry. Use as the closing conversion section for bootcamps, dev academies,
 * or career-switch programs encouraging applications.
 */
export const BootcampApplyCta = defineCapsule({
  name: 'BootcampApplyCta',
  description:
    'High-contrast application CTA with a real Lakebed multi-field form for a coding bootcamp / career-school landing page: centered headline and description over a primary-colored band, above a rounded card containing a functional form (first name, last name, email, program select, current occupation, submit button). Below the form sits a fineprint line and a row of trust chips with check icons. Form submit writes a shared inquiry record. Use as the closing conversion section for bootcamps, dev academies, or career-switch programs encouraging applications.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Program options for the select field. */
    programs: z.array(z.string()).optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Fineprint text under the form. */
    fineprint: z.string().optional(),
    /** Inline trust chips beneath the form card. */
    trust: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const applyHeading = props.heading ?? 'Ready to start your tech career?'
    const applyDesc =
      props.description ??
      'Applications are open for our July 14, 2025 cohort. Spots fill quickly — join 2,400+ graduates who transformed their lives.'
    const applyPrograms = props.programs?.length
      ? props.programs
      : ['Full-time (16 weeks)', 'Part-time (32 weeks)']
    const applySubmit = props.submit ?? 'Start Your Application'
    const applyFineprint =
      props.fineprint ??
      "By applying, you agree to our Terms and Privacy Policy. We'll never spam you."
    const applyTrust = props.trust?.length
      ? props.trust
      : ['Job guarantee', '1-on-1 mentorship', 'Career support']
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Bootcamp application',
      successMessage:
        "Thanks. We've received your application and will follow up soon.",
    })

    const inputCls =
      'w-full rounded-lg border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'

    const Check = ({ className }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    )

    return (
      <CtaBand
        tone="primary"
        title={applyHeading}
        subtitle={applyDesc}
        titleClassName="font-bold sm:text-4xl lg:text-5xl"
        subtitleClassName="text-primary-foreground/80"
        className={props.className}
      >
        <div className="mx-auto max-w-xl rounded-2xl bg-card p-8 shadow-xl">
          <form className="space-y-4 text-left" onSubmit={inquiry.submitForm}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="bootcamp-apply-first"
                  className="mb-1 block text-sm font-medium text-card-foreground"
                >
                  First name
                </label>
                <input
                  id="bootcamp-apply-first"
                  name="firstName"
                  type="text"
                  required
                  placeholder="Jane"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="bootcamp-apply-last"
                  className="mb-1 block text-sm font-medium text-card-foreground"
                >
                  Last name
                </label>
                <input
                  id="bootcamp-apply-last"
                  name="lastName"
                  type="text"
                  required
                  placeholder="Smith"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="bootcamp-apply-email"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                Email address
              </label>
              <input
                id="bootcamp-apply-email"
                name="email"
                type="email"
                required
                placeholder="jane@example.com"
                className={inputCls}
              />
            </div>
            <div>
              <label
                htmlFor="bootcamp-apply-program"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                Program preference
              </label>
              <select
                id="bootcamp-apply-program"
                name="program"
                className={cn(inputCls, 'appearance-none')}
              >
                {applyPrograms.map((p) => (
                  <option key={p} className="bg-background">
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="bootcamp-apply-occupation"
                className="mb-1 block text-sm font-medium text-card-foreground"
              >
                Current occupation
              </label>
              <input
                id="bootcamp-apply-occupation"
                name="occupation"
                type="text"
                placeholder="e.g. Teacher, Retail Manager, Student"
                className={inputCls}
              />
            </div>
            <button
              type="submit"
              aria-busy={inquiry.isPending}
              disabled={inquiry.isPending}
              className="w-full rounded-lg bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {inquiry.isPending ? 'Sending' : applySubmit}
            </button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {inquiry.statusText}
            </p>
          </form>
          <p className="mt-4 text-xs text-muted-foreground">{applyFineprint}</p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-8 text-sm text-primary-foreground/70">
          {applyTrust.map((t) => (
            <div key={t} className="flex items-center gap-2">
              <Check className="size-5 text-primary-foreground" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </CtaBand>
    )
  },
})
