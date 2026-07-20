import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * DirectorySteps — "How It Works" index ledger for a local-business directory.
 * A paper section with a giant ghost "HOW" watermark and an asymmetric
 * hairline header (serif heading + description left, mono "3 steps" meta
 * right) above a collapsed-border 3-column ledger of steps: each
 * sharp-cornered cell carries a huge ghost serif numeral bleeding out of its
 * corner, a mono "Step 01" tag, the step title, and a descriptive paragraph.
 * Static, no links. Use to explain the search-compare-connect flow on local
 * directories, find-a-service platforms, or review-and-discovery sites.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepTimeline, StepTimelineGrid } from '#/section-kit/StepTimeline.tsx'
export const DirectorySteps = defineCapsule({
  name: 'DirectorySteps',
  description:
    'How-It-Works index ledger for a local-business DIRECTORY: a paper section with a giant ghost HOW watermark and an asymmetric hairline header (serif heading and description left, mono meta right) above a collapsed-border 3-column ledger of steps — each sharp-cornered cell carries a huge ghost serif numeral bleeding out of its corner, a mono Step tag, the step title, and a descriptive paragraph. Static, no links. Use to explain the search / compare / connect flow on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Numbered step items (title + description). */
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
    const heading = props.heading ?? 'How It Works'
    const description =
      props.description ??
      'Find and connect with local businesses in three simple steps'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Search & Discover',
            description:
              'Enter what you need and your location. Browse thousands of verified local businesses across 24 categories.',
          },
          {
            title: 'Compare & Review',
            description:
              'Check real customer reviews, photos, hours, and pricing. Filter by ratings, distance, and availability.',
          },
          {
            title: 'Connect & Book',
            description:
              'Call directly, book online, or send a message. Get directions and save favorites for quick access.',
          },
        ]
    return (
      <StepTimeline
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
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
              <div
                key={step.title}
                className="relative overflow-hidden border-b border-r border-border p-6 sm:p-8"
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
              </div>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
