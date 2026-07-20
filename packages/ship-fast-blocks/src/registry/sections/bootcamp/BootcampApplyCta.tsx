import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import {
  ContactForm,
  ContactFormField,
  ContactFormLabel,
  ContactFormInput,
  ContactFormSelect,
  ContactFormSubmit,
  ContactFormFooter,
} from '#/section-kit/ContactForm.tsx'
import { GraphPaper, Watermark } from '#/section-kit/Decor.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * BootcampApplyCta — "Terminal Classroom" closing application band with a
 * real multi-field form for a coding bootcamp / career-school landing page.
 * An asymmetric 5:7 split on a graph-paper muted wash with a giant ghost
 * `>_` watermark: the left rail carries a decorative `$ apply --cohort`
 * prompt line, a big tracking-tight headline, the supporting paragraph, and
 * a mono `[x]` checklist of trust chips; the right column frames the
 * functional form (first name, last name, email, program select, current
 * occupation, submit) as a terminal window — three window dots, mono title
 * bar, sharp hairline border, hard offset shadow — with mono uppercase field
 * labels, a square primary submit block with press feedback, and a fineprint
 * line beneath. Form submit writes a Lakebed application inquiry. Use as the
 * closing conversion section for bootcamps, dev academies, or career-switch
 * programs encouraging applications.
 */
export const BootcampApplyCta = defineCapsule({
  name: 'BootcampApplyCta',
  description:
    'Terminal-styled closing application band with a real Lakebed multi-field form for a coding bootcamp / career-school landing page: asymmetric 5:7 split on a graph-paper muted wash with a giant ghost ">_" watermark. Left rail has a decorative "$ apply --cohort" prompt, big tracking-tight headline, supporting paragraph, and a mono "[x]" checklist of trust chips; right column frames the functional form (first name, last name, email, program select, current occupation, submit) as a terminal window with window dots, mono title bar, hard offset shadow, mono uppercase field labels, and a square primary submit block with press feedback plus a fineprint line. Form submit writes a shared inquiry record. Use as the closing conversion section for bootcamps, dev academies, or career-switch programs encouraging applications.',
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
      'w-full rounded-none border border-input bg-background px-4 py-2.5 text-foreground placeholder-muted-foreground transition-colors focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/20'
    const labelCls =
      'font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground'

    return (
      <CtaBand
        tone="muted"
        className={cn(
          'relative overflow-hidden border-y border-border bg-muted/40 text-foreground',
          props.className,
        )}
      >
        <GraphPaper className="inset-0" />
        <Watermark className="-left-4 bottom-0 font-mono text-[8rem] sm:text-[14rem]">
          {'>_'}
        </Watermark>
        <CtaBandInner className="relative grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 text-left sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-24">
          <div className="lg:col-span-5">
            <p
              aria-hidden="true"
              className="font-mono text-sm text-muted-foreground"
            >
              <span className="text-primary">$</span> apply --cohort july-14
            </p>
            <CtaBandTitle className="mt-4 text-4xl font-bold tracking-tighter sm:text-5xl">
              {applyHeading}
            </CtaBandTitle>
            <CtaBandSubtitle className="mt-4 max-w-md text-muted-foreground">
              {applyDesc}
            </CtaBandSubtitle>
            <ul className="mt-8 space-y-3">
              {applyTrust.map((t) => (
                <li key={t} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className="font-mono text-xs text-primary"
                  >
                    [x]
                  </span>
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                    {t}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full lg:col-span-7">
            <div className="overflow-hidden rounded-none border border-border bg-card shadow-[8px_8px_0_0] shadow-foreground/10">
              <div className="flex items-center gap-2 border-b border-border bg-muted px-4 py-2.5">
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-muted-foreground/40"
                />
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-muted-foreground/25"
                />
                <span
                  aria-hidden="true"
                  className="size-2.5 rounded-full bg-primary/60"
                />
                <span className="ml-2 truncate font-mono text-[11px] text-muted-foreground">
                  apply — admissions.form
                </span>
              </div>
              <div className="p-6 sm:p-8">
                <ContactForm
                  className="space-y-4 text-left"
                  onSubmit={inquiry.submitForm}
                >
                  <ResponsiveGrid cols="1-2" className="gap-4">
                    <ContactFormField className="mb-0">
                      <ContactFormLabel
                        htmlFor="bootcamp-apply-first"
                        className={labelCls}
                      >
                        First name
                      </ContactFormLabel>
                      <ContactFormInput
                        id="bootcamp-apply-first"
                        name="firstName"
                        type="text"
                        required
                        placeholder="Jane"
                        className={inputCls}
                      />
                    </ContactFormField>
                    <ContactFormField className="mb-0">
                      <ContactFormLabel
                        htmlFor="bootcamp-apply-last"
                        className={labelCls}
                      >
                        Last name
                      </ContactFormLabel>
                      <ContactFormInput
                        id="bootcamp-apply-last"
                        name="lastName"
                        type="text"
                        required
                        placeholder="Smith"
                        className={inputCls}
                      />
                    </ContactFormField>
                  </ResponsiveGrid>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="bootcamp-apply-email"
                      className={labelCls}
                    >
                      Email address
                    </ContactFormLabel>
                    <ContactFormInput
                      id="bootcamp-apply-email"
                      name="email"
                      type="email"
                      required
                      placeholder="jane@example.com"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="bootcamp-apply-program"
                      className={labelCls}
                    >
                      Program preference
                    </ContactFormLabel>
                    <ContactFormSelect
                      id="bootcamp-apply-program"
                      name="program"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {applyPrograms.map((p) => (
                        <option key={p} className="bg-background">
                          {p}
                        </option>
                      ))}
                    </ContactFormSelect>
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="bootcamp-apply-occupation"
                      className={labelCls}
                    >
                      Current occupation
                    </ContactFormLabel>
                    <ContactFormInput
                      id="bootcamp-apply-occupation"
                      name="occupation"
                      type="text"
                      placeholder="e.g. Teacher, Retail Manager, Student"
                      className={inputCls}
                    />
                  </ContactFormField>
                  <ContactFormSubmit
                    type="submit"
                    aria-busy={inquiry.isPending}
                    disabled={inquiry.isPending}
                    className="w-full rounded-none bg-primary py-3.5 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-[4px_4px_0_0] shadow-primary/25 transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 active:translate-y-px active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                  >
                    {inquiry.isPending ? 'Sending' : applySubmit}
                  </ContactFormSubmit>
                  <ContactFormFooter
                    className="text-sm text-muted-foreground"
                    aria-live="polite"
                  >
                    {inquiry.statusText}
                  </ContactFormFooter>
                </ContactForm>
                <p className="mt-4 text-xs text-muted-foreground">
                  {applyFineprint}
                </p>
              </div>
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
