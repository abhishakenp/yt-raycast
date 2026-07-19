import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * ConsultingServices — 6-up services / capabilities grid with icon tiles for a
 * management-consulting firm page. A centered section heading and lead paragraph
 * above a responsive 3-column grid of bordered cards; each card has a rounded
 * primary icon tile (rotating inline line-icons), a title and a description.
 * Tokens-only, no links. Use to present consulting offerings — corporate strategy,
 * digital transformation, M&A advisory, operations, organization, risk — or any
 * professional-services capabilities block. Renders fully with no props via six
 * baked-in default services.
 */
export const ConsultingServices = defineCapsule({
  name: 'ConsultingServices',
  description:
    '6-up services / capabilities grid with icon tiles for a management-consulting firm page: a centered section heading and lead paragraph above a responsive 3-column grid of bordered cards, each with a rounded primary icon tile (rotating inline line-icons), a title and a description. Tokens-only, no links. Use to present consulting offerings (corporate strategy, digital transformation, M&A advisory, operations, organization, risk) or any professional-services capabilities block.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Comprehensive Consulting Services'
    const description =
      props.description ??
      'From strategy formulation to implementation, we partner with you at every stage of your transformation journey.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Corporate Strategy',
            description:
              'Develop winning strategies that define your competitive position, prioritize growth initiatives, and allocate resources for maximum impact. Our approach combines rigorous analysis with creative problem-solving.',
          },
          {
            title: 'Digital Transformation',
            description:
              'Navigate the digital landscape with confidence. We help organizations leverage technology to reimagine operations, enhance customer experiences, and build new digital business models.',
          },
          {
            title: 'M&A Advisory',
            description:
              'From target identification to post-merger integration, we guide clients through complex transactions. Our team has advised on over 400 deals worth more than $180 billion in total value.',
          },
          {
            title: 'Operations Excellence',
            description:
              'Optimize your end-to-end operations to reduce costs, improve quality, and accelerate delivery. We specialize in supply chain transformation, lean manufacturing, and process automation.',
          },
          {
            title: 'Organization & Change',
            description:
              'Build high-performing organizations and lead successful transformations. We help you redesign structures, develop talent, and manage cultural change to support your strategic objectives.',
          },
          {
            title: 'Risk & Compliance',
            description:
              'Navigate regulatory complexity and protect your enterprise. We help organizations identify, assess, and mitigate risks while ensuring compliance with evolving standards and regulations.',
          },
        ]

    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <ServicesGrid columns={3}>
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
                <ServiceCard key={__iv__.title}>
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <ServiceTitle>{__iv__.title}</ServiceTitle>
                  <ServiceDescription>{__iv__.description}</ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
