import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { useNavigate } from '#/lib/use-navigate.tsx'
import { CtaBand } from '#/section-kit/CtaBand.tsx'

/**
 * FaqContactCta — a "Still need help?" contact call-to-action band for a
 * help-center / support page. A primary-colored rounded panel centered on a muted
 * section: heading, supporting description, two centered buttons (a solid
 * background "Email Support" with mail icon and a translucent "Start Live Chat"
 * with chat icon), and a small response-time note with a highlighted span. Buttons
 * route through useNavigate. Use as the closing support / contact prompt on SaaS
 * knowledge bases, help centers, or FAQ pages. Renders fully with no props.
 */
export const FaqContactCta = defineCapsule({
  name: 'FaqContactCta',
  description:
    "A 'Still need help?' contact call-to-action band for a help-center / support page: a primary-colored rounded panel centered on a muted section, with a heading, supporting description, two centered buttons (a solid 'Email Support' with mail icon and a translucent 'Start Live Chat' with chat icon), and a small response-time note with a highlighted span. Buttons route through useNavigate. Use as the closing support / contact prompt on SaaS knowledge bases, help centers, or FAQ pages.",
  props: z.object({
    /** Band heading. */
    heading: z.string().optional(),
    /** Supporting description. */
    description: z.string().optional(),
    /** Primary button label. */
    primary: z.string().optional(),
    /** Secondary button label. */
    secondary: z.string().optional(),
    /** Leading text of the response-time note. */
    note: z.string().optional(),
    /** Highlighted tail of the response-time note. */
    noteHighlight: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Still need help?'
    const description =
      props.description ??
      "Can't find what you're looking for? Our support team is available Monday-Friday, 9am-6pm EST. Enterprise customers have 24/7 access."
    const primary = props.primary ?? 'Email Support'
    const secondary = props.secondary ?? 'Start Live Chat'
    const note = props.note ?? 'Average response time:'
    const noteHighlight = props.noteHighlight ?? 'under 2 hours for paid plans'

    return (
      <CtaBand
        tone="muted"
        title={heading}
        subtitle={description}
        titleClassName="text-primary-foreground sm:text-3xl"
        subtitleClassName="text-primary-foreground/70"
        innerClassName="max-w-4xl gap-5 rounded-2xl bg-primary p-8 sm:p-12 lg:p-16"
        className={`border-t border-border bg-muted/40 py-12 sm:py-16 ${props.className ?? ''}`}
      >
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <button
            type="button"
            onClick={() => go(primary)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted sm:w-auto"
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
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-10 5L2 7" />
            </svg>
            {primary}
          </button>
          <button
            type="button"
            onClick={() => go(secondary)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-foreground/10 px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary-foreground/20 sm:w-auto"
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {secondary}
          </button>
        </div>
        <p className="mt-6 text-sm text-primary-foreground/60">
          {note}{' '}
          <span className="text-primary-foreground/90">{noteHighlight}</span>
        </p>
      </CtaBand>
    )
  },
})
