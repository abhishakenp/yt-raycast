import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * JobBoardSteps — "How it works" index ledger for a job-board / careers site. A
 * muted paper band with a giant ghost "HOW" watermark and an asymmetric hairline
 * header (serif heading + description left, mono step-count meta right) above a
 * collapsed-border 3-column ledger of steps: each sharp-cornered cell carries a
 * huge ghost serif numeral bleeding out of its corner, a mono "Step 01" tag, the
 * step title, and a supporting paragraph. Static (no links). Use to explain the
 * candidate journey (create profile, discover & apply, get hired) on job boards,
 * hiring marketplaces or recruiting platforms.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
} from '#/section-kit/StepTimeline.tsx'
export const JobBoardSteps = defineCapsule({
  name: 'JobBoardSteps',
  description:
    'How-it-works index ledger for a job-board / careers site: a muted paper band with a giant ghost HOW watermark and an asymmetric hairline header (serif heading and description left, mono step-count meta right) above a collapsed-border 3-column ledger of steps — each sharp-cornered cell carries a huge ghost serif numeral bleeding out of its corner, a mono Step tag, the step title and a supporting paragraph. Static (no links). Use to explain the candidate journey (create profile, discover & apply, get hired) on job boards, hiring marketplaces or recruiting platforms.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Steps: title + description (numbered automatically). */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'How it works'
    const description =
      props.description ?? 'Three simple steps to your next career opportunity'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Create your profile',
            description:
              'Upload your resume, set your preferences, and let employers discover you. Complete profiles get 3x more views.',
          },
          {
            title: 'Discover & apply',
            description:
              'Browse curated listings, filter by what matters to you, and apply with one click using your saved profile.',
          },
          {
            title: 'Get hired',
            description:
              'Connect directly with hiring managers, interview, and land your next role. Average placement in 14 days.',
          },
        ]
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-muted/40 py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-left-4 bottom-0 font-serif text-[7rem] sm:text-[10rem] lg:text-[14rem]">
          HOW
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between lg:mb-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <MonoTag tone="faint" aria-hidden="true" className="shrink-0">
              {String(items.length).padStart(2, '0')} steps · No account needed
            </MonoTag>
          </div>

          <StepTimelineGrid
            columns={3}
            className="gap-0 border-l border-t border-border bg-background"
          >
            {items.map((step, i) => (
              <StepItem
                key={step.title}
                className="overflow-hidden border-b border-r border-border p-6 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-2 -top-6 select-none font-serif text-[6rem] font-bold leading-none text-foreground/[0.06] sm:text-[7rem]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <MonoTag tone="muted" className="tabular-nums">
                  Step {String(i + 1).padStart(2, '0')}
                </MonoTag>
                <h3 className="relative mt-4 text-xl font-extrabold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="relative mt-3 max-w-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </StepItem>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
