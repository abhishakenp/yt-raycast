import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import {
  JobBoardActionButton,
  JobBoardMutationSpinner,
} from './job-board-interactions.tsx'

/**
 * JobBoardCta — a newsprint "full-page ad" conversion band for a job-board /
 * careers site. A paper band holding a heavy-bordered ad box with a hard offset
 * shadow: a mono "Advertisement" rule row on top, a large serif headline, a
 * supporting paragraph, a centered pair of sharp CTAs (a filled
 * foreground-on-background primary with a trailing arrow + a hairline outlined
 * secondary), both with press feedback, and a small mono reassurance note.
 * Both buttons record real Lakebed actions. Use as the closing conversion block
 * on job boards, hiring marketplaces or recruiting platforms. Renders fully with
 * no props.
 */
export const JobBoardCta = defineCapsule({
  name: 'JobBoardCta',
  description:
    'Newsprint full-page-ad conversion band for a job-board / careers site: a paper band holding a heavy-bordered ad box with a hard offset shadow — a mono Advertisement rule row on top, a large serif headline, a supporting paragraph, a centered pair of sharp CTAs (a filled foreground-on-background primary with a trailing arrow plus a hairline outlined secondary) both with press feedback, and a small mono reassurance note. Both buttons record real Lakebed actions. Use as the closing conversion block on job boards, hiring marketplaces or recruiting platforms.',
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
      <CtaBand
        tone="muted"
        className={`bg-background px-4 py-16 text-foreground sm:px-6 lg:py-24 ${props.className ?? ''}`}
      >
        <CtaBandInner className="max-w-3xl gap-5 border-2 border-foreground bg-background px-6 py-12 shadow-[8px_8px_0_0] shadow-foreground/80 sm:px-10 lg:py-14">
          <div
            aria-hidden="true"
            className="flex w-full items-center gap-3 border-b border-border pb-4"
          >
            <MonoTag tone="faint" className="shrink-0">
              Advertisement
            </MonoTag>
            <span className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="shrink-0 tabular-nums">
              Full page
            </MonoTag>
          </div>
          <CtaBandTitle className="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {heading}
          </CtaBandTitle>
          <CtaBandSubtitle className="text-muted-foreground opacity-100">
            {description}
          </CtaBandSubtitle>
          <div className="flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4">
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none bg-foreground px-8 font-medium text-background transition-[background-color,transform] hover:bg-foreground/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
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
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-none border-2 border-foreground bg-transparent px-8 font-medium text-foreground transition-[background-color,color,transform] hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {secondary}
            </JobBoardActionButton>
          </div>
          <p className="font-mono text-xs text-muted-foreground">{note}</p>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
