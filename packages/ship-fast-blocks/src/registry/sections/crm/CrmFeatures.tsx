import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CrmFeatures — centered, multi-column feature grid for a CRM / sales-platform
 * landing page. A heading + supporting paragraph above a responsive 1/2/3-up
 * grid of bordered cards, each with a soft tinted icon tile (rotating line
 * icons: pipeline, clock, AI bulb, team, report, mobile), a title and a
 * description; cards lift with a hover shadow. Clean and professional. Use to
 * showcase the core capabilities of a CRM, sales-enablement or B2B SaaS product.
 * Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
export const CrmFeatures = defineCapsule({
  name: 'CrmFeatures',
  description:
    'Centered multi-column feature grid for a CRM / sales-platform landing page: a heading + supporting paragraph above a responsive 1/2/3-up grid of bordered cards, each with a soft tinted icon tile (rotating line icons for pipeline, activity, AI, team, reporting, mobile), a title and a description; cards lift with a hover shadow. Clean and professional. Use to showcase the core capabilities of a CRM, sales-enablement or B2B SaaS product.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards. */
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
    const heading = props.heading ?? 'Everything your sales team needs'
    const description =
      props.description ??
      'From lead capture to deal closure, Pipeline Pro provides a complete toolkit for modern sales operations.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Visual Pipeline',
            description:
              "Drag-and-drop Kanban boards customized to your sales process. See every deal's status at a glance with color-coded stages.",
          },
          {
            title: 'Activity Tracking',
            description:
              'Log calls, emails, and meetings automatically. Never lose track of customer interactions with a complete activity timeline.',
          },
          {
            title: 'AI Forecasting',
            description:
              'Predict revenue with machine learning based on historical data, deal velocity, and seasonal patterns. 94% accuracy rate.',
          },
          {
            title: 'Team Collaboration',
            description:
              'Share contacts, assign leads, and collaborate on deals. @mentions, comments, and real-time notifications keep everyone aligned.',
          },
          {
            title: 'Advanced Reporting',
            description:
              'Build custom dashboards with 50+ metrics. Track conversion rates, sales cycle length, and rep performance in real-time.',
          },
          {
            title: 'Mobile App',
            description:
              'Update deals, check schedules, and log activities on the go. Native iOS and Android apps with offline mode support.',
          },
        ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid columns={3}>
            {items.map((f) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard key={__iv__.title}>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle>{__iv__.title}</FeatureTitle>
                  <FeatureDescription>{__iv__.description}</FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
