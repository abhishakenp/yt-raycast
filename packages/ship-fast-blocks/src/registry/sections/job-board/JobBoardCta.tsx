import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import {
  JobBoardActionButton,
  JobBoardMutationSpinner,
} from './job-board-interactions.tsx'

/**
 * JobBoardCta — a dark conversion CTA panel for a job-board / careers site. A
 * centered rounded inverted card (foreground bg, background text) on a light
 * section, holding a heading, a supporting paragraph, a pair of buttons (a solid
 * inverted primary with a trailing arrow + an outlined secondary), and a small
 * reassurance note. Buttons record real Lakebed actions. Use as the closing
 * conversion block on job boards, hiring marketplaces or recruiting platforms.
 * Renders fully with no props.
 */
export const JobBoardCta = defineCapsule({
  name: 'JobBoardCta',
  description:
    'Dark conversion CTA panel for a job-board / careers site: a centered rounded inverted card (foreground bg, background text) on a light section, holding a heading, supporting paragraph, a pair of buttons (a solid inverted primary with a trailing arrow + an outlined secondary) and a small reassurance note. Buttons record real Lakebed actions. Use as the closing conversion block on job boards, hiring marketplaces or recruiting platforms.',
  lakebed: jobBoardLakebed,
  props: z.object({
    /** Panel heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Primary button label. */
    primary: z.string().optional(),
    /** Secondary (outlined) button label. */
    secondary: z.string().optional(),
    /** Small reassurance note below the buttons. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Ready to find your next role?'
    const description =
      props.description ??
      'Join 48,000+ professionals who found their dream jobs through WorkFlow. Your next opportunity is waiting.'
    const primary = props.primary ?? 'Browse all jobs'
    const secondary = props.secondary ?? 'Post a job'
    const note = props.note ?? 'Free for job seekers. No credit card required.'

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )

    return (
      <CtaBand tone="muted" className={props.className}>
        <CtaBandInner className="max-w-5xl rounded-3xl bg-foreground p-8 sm:p-12 lg:p-16">
          <CtaBandTitle className="text-background">{heading}</CtaBandTitle>
          <CtaBandSubtitle className="text-background/60">
            {description}
          </CtaBandSubtitle>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <JobBoardActionButton
              lakebed={lakebed}
              action={primary}
              source="cta:primary"
              pendingChildren={
                <>
                  <JobBoardMutationSpinner />
                  Recording
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-background px-8 py-4 font-semibold text-foreground transition-colors hover:bg-background/90 disabled:pointer-events-none disabled:opacity-70"
            >
              {primary}
              <ArrowRight className="size-5" />
            </JobBoardActionButton>
            <JobBoardActionButton
              lakebed={lakebed}
              action={secondary}
              source="cta:secondary"
              pendingChildren={
                <>
                  <JobBoardMutationSpinner />
                  Recording
                </>
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-background/30 px-8 py-4 font-semibold text-background transition-colors hover:bg-background/10 disabled:pointer-events-none disabled:opacity-70"
            >
              {secondary}
            </JobBoardActionButton>
          </div>
          <p className="text-sm text-background/50">{note}</p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
