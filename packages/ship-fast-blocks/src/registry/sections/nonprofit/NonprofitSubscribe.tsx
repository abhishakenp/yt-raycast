import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * NonprofitSubscribe — warm get-involved / newsletter band for a nonprofit /
 * charity / NGO page. A centered `SectionHeading` (eyebrow + title + subtitle)
 * sits on a soft muted surface above a styled (non-functional) email-capture
 * row with a submit button, and a short row of secondary get-involved links
 * (Volunteer, Fundraise, Partner with us). The submit button and the
 * get-involved links route through useNavigate so nothing is a dead link. Use
 * to grow the mailing list and surface ways to help on nonprofit, foundation,
 * or humanitarian pages. Renders fully with no props via baked-in "Roots of
 * Hope" defaults.
 */
export const NonprofitSubscribe = defineComponent({
  name: 'NonprofitSubscribe',
  description:
    'Warm get-involved / newsletter band for a nonprofit / charity / NGO page: a centered SectionHeading (eyebrow + title + subtitle) on a soft muted surface above a styled non-functional email-capture row with a submit button, plus a short row of secondary get-involved links (Volunteer, Fundraise, Partner with us). The submit button and links route through useNavigate. Use to grow the mailing list and surface ways to help on nonprofit, foundation, or humanitarian pages.',
  props: z.object({
    /** Small uppercase eyebrow above the title. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Placeholder text for the email-capture input. */
    emailPlaceholder: z.string().optional(),
    /** Label for the email-capture submit button. */
    submitCta: z.string().optional(),
    /** Navigation target for the submit button. */
    submitTarget: z.string().optional(),
    /** Secondary get-involved link labels under the form. */
    getInvolved: z.array(z.string()).optional(),
    /** Fine-print line beneath the form. */
    footnote: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Get involved'
    const heading = props.heading ?? 'Stay close to the change you make'
    const subheading =
      props.subheading ??
      "Join our community and we'll send you stories from the field, updates on the programs you support, and simple ways to do more good."
    const emailPlaceholder = props.emailPlaceholder ?? 'you@example.com'
    const submitCta = props.submitCta ?? 'Join us'
    const submitTarget = props.submitTarget ?? submitCta
    const getInvolved = props.getInvolved?.length
      ? props.getInvolved
      : ['Volunteer', 'Fundraise', 'Partner with us']
    const footnote =
      props.footnote ?? 'No spam, ever. Unsubscribe with one click.'

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-border bg-muted/40 px-6 py-12 sm:px-12 lg:py-16">
            <SectionHeading
              eyebrow={eyebrow}
              title={heading}
              subtitle={subheading}
            />

            <form
              onSubmit={(e) => e.preventDefault()}
              className="mx-auto mt-8 flex max-w-xl flex-col gap-3 sm:flex-row"
            >
              <input
                type="email"
                placeholder={emailPlaceholder}
                aria-label="Email address"
                className="w-full rounded-full border border-border bg-background px-5 py-3 text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
              <button
                type="button"
                onClick={() => go(submitTarget)}
                className="shrink-0 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {submitCta}
              </button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              {footnote}
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-sm text-muted-foreground">
                Other ways to help:
              </span>
              {getInvolved.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-accent underline-offset-4 transition-colors hover:text-foreground hover:underline"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
