import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * MarketingFeatures — a centered-header 6-up feature grid for a SaaS /
 * product-marketing landing page. A bold centered heading + supporting line
 * over a responsive 1/2/3-column grid of bordered cards, each with a soft
 * indigo rounded icon tile, a bold title, and a description; cards lift and
 * raise a shadow on hover. Rotates a built-in set of line icons (boards,
 * collaboration, analytics, workflows, security, integrations). Clean premium
 * indigo-on-light aesthetic. Use to showcase product capabilities on B2B SaaS,
 * team/project-management, productivity, or developer-platform pages.
 */
export const MarketingFeatures = defineCapsule({
  name: 'MarketingFeatures',
  description:
    'Centered-header 6-up feature grid for a SaaS / product-marketing landing page: a bold centered heading + supporting line over a responsive 1/2/3-column grid of bordered cards, each with a soft indigo rounded icon tile, a bold title and a description, lifting with a raised shadow on hover. Rotates a built-in set of line icons (boards, collaboration, analytics, workflows, security, integrations). Clean premium indigo-on-light aesthetic. Use to showcase product capabilities on B2B SaaS, team/project-management, productivity, or developer-platform pages.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything your team needs to ship faster'
    const description =
      props.description ??
      'Powerful, flexible tools that adapt to how you work — not the other way around.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Intuitive Task Boards',
            description:
              'Drag-and-drop Kanban boards that make it easy to visualize work, limit WIP, and spot bottlenecks before they derail your sprint.',
          },
          {
            title: 'Real-time Collaboration',
            description:
              'Work together in the same document, comment inline, and mention teammates so everyone stays aligned without endless threads.',
          },
          {
            title: 'Advanced Analytics',
            description:
              'Track velocity, burndown, and cycle time with beautiful dashboards. Turn raw data into actionable insights in one click.',
          },
          {
            title: 'Automated Workflows',
            description:
              'Automate repetitive tasks with customizable rules. Move cards, send updates, and trigger alerts so nothing slips through.',
          },
          {
            title: 'Enterprise Security',
            description:
              'SOC 2 Type II certified with end-to-end encryption, SSO, and granular permissions. Your data stays yours — always.',
          },
          {
            title: 'Seamless Integrations',
            description:
              'Connect with GitHub, Slack, Figma, and 50+ tools you already use. Keep your workflow in one place, not fifty.',
          },
        ]

    return (
      <section className={cn('py-20', props.className)}>
        <Container size="lg" className="px-6 lg:px-6">
          <div className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">{description}</p>
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
