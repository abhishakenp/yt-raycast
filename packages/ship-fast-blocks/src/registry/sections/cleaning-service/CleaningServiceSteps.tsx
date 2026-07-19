import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * CleaningServiceSteps — a "how it works" + "what's included" combo section for a home-cleaning / maid-service landing page. A muted-band background with a centered heading + lead paragraph above a responsive 3-column grid of numbered step cards (with connector lines on desktop), followed by a split-row card: left side shows a "what's included" checklist with checkmark icons, right side shows a 2x2 lazy-loaded photo grid. Use for process-explanation / expectations-setting blocks for residential cleaning companies, maid services, or home-service platforms. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  StepTimeline,
  StepTimelineGrid,
  StepItem,
  StepContent,
} from '#/section-kit/StepTimeline.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const CleaningServiceSteps = defineCapsule({
  name: 'CleaningServiceSteps',
  description:
    "A 'how it works' + 'what\'s included' combo section for a home-cleaning / maid-service landing page: muted-band background with centered heading + lead above a 3-column numbered step-card grid (with desktop connector lines), followed by a split-row card with a checklist on the left and a 2x2 lazy-loaded photo grid on the right. Use for process-explanation / expectations-setting blocks for residential cleaning, maid services, or home-service platforms.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Numbered step cards: title + description. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
        }),
      )
      .optional(),
    /** Heading for the checklist sub-section. */
    includedHeading: z.string().optional(),
    /** Checklist items for the "what's included" sub-section. */
    included: z.array(z.string()).optional(),
    /** Alt texts driving the 2x2 result photo grid. */
    gallery: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Book in minutes, clean in hours'
    const description =
      props.description ??
      'Our streamlined process gets your home cleaned with zero hassle.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Book Online',
            description:
              'Select your service, home size, and preferred time slot. Get instant pricing with no hidden fees. Book as early as tomorrow or schedule recurring visits.',
          },
          {
            title: 'We Match & Clean',
            description:
              'Our algorithm matches you with a vetted, background-checked cleaner in your area. They arrive on time with all supplies and equipment.',
          },
          {
            title: 'Enjoy & Relax',
            description:
              'Come home to sparkling spaces. Rate your cleaner and schedule your next visit. We follow up to ensure everything exceeded expectations.',
          },
        ]
    const includedHeading =
      props.includedHeading ?? "What's included in every clean"
    const included = props.included?.length
      ? props.included
      : [
          'All rooms dusted & vacuumed',
          'Bathrooms sanitized',
          'Kitchen counters & appliances',
          'Floors mopped & polished',
          'Trash removed',
          'Beds made & linens changed',
          'Mirrors & glass cleaned',
          'Supplies provided',
        ]
    const gallery = props.gallery?.length
      ? props.gallery
      : [
          'sparkling clean modern kitchen with white cabinets and marble countertops',
          'clean bathroom with white tiles and glass shower door',
          'tidied bedroom with made bed and natural light',
          'organized living room with clean surfaces and vacuumed carpet',
        ]
    const Check = ({ className }: { className?: string }) => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    return (
      <StepTimeline
        className={cn('bg-muted/40 py-20 lg:py-28', props.className)}
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <StepTimelineGrid columns={3} className="gap-8 lg:gap-12">
            {items.map((step, i) => (
              <StepItem key={step.title} className="relative">
                <StepContent className="mt-0 h-full gap-0 rounded-2xl border bg-card p-6 shadow-sm">
                  <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                    {i + 1}
                  </div>
                  <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                    {step.title}
                  </h3>
                  <p className="leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </StepContent>
                {i < items.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-12 hidden h-0.5 w-12 -translate-x-4 bg-primary/40 md:block"
                  />
                ) : null}
              </StepItem>
            ))}
          </StepTimelineGrid>
          <Card
            rounded="2xl"
            padding="lg"
            shadow="sm"
            className="mt-16 lg:p-12"
          >
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                <h3 className="mb-4 text-2xl font-bold text-card-foreground">
                  {includedHeading}
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {included.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <Check className="mt-0.5 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <ResponsiveGrid cols="2" gap="sm">
                {gallery.map((alt) => (
                  <Image
                    key={alt}
                    alt={alt}
                    w={400}
                    h={300}
                    loading="lazy"
                    className="h-40 w-full rounded-xl object-cover"
                  />
                ))}
              </ResponsiveGrid>
            </div>
          </Card>
        </Container>
      </StepTimeline>
    )
  },
})
