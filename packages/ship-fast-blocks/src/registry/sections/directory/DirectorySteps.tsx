import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * DirectorySteps — "How It Works" 3-step explainer for a local-business
 * directory. A card-surface section with a centered heading + description and a
 * responsive 3-column grid of numbered steps, each a centered rounded
 * muted-badge number above a step title and a descriptive paragraph. Static, no
 * links. Use to explain the search-compare-connect flow on local directories,
 * find-a-service platforms, or review-and-discovery sites.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { StepTimeline, StepTimelineGrid } from '#/section-kit/StepTimeline.tsx'
export const DirectorySteps = defineCapsule({
  name: 'DirectorySteps',
  description:
    'How-It-Works 3-step explainer for a local-business DIRECTORY: a card-surface section with a centered heading and description and a responsive 3-column grid of numbered steps — each a centered rounded muted-badge number above a step title and a descriptive paragraph. Static, no links. Use to explain the search / compare / connect flow on local directories, business-listing marketplaces, find-a-service platforms, or review-and-discovery sites.',
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
      <StepTimeline className={cn('bg-card py-16 lg:py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-12 lg:mb-16 gap-0"
            titleClassName="mb-4 text-3xl font-semibold text-foreground sm:text-4xl"
            subtitleClassName="mx-auto max-w-2xl text-lg text-muted-foreground"
          />

          <StepTimelineGrid columns={3} className="gap-8 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-muted">
                  <span className="text-2xl font-bold text-foreground">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </StepTimelineGrid>
        </Container>
      </StepTimeline>
    )
  },
})
