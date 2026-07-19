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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

/**
 * AgencyServices — capabilities / services grid for a creative digital-agency
 * page. A left-aligned section heading + lead paragraph above a responsive
 * 1/2/3-column grid of hover-lift cards; each card has a rounded tinted icon
 * tile (rotating inline line-icons), a title, and a description. Cards lift and
 * glow on hover. Tokens-only, no links. Use to present an agency's offerings —
 * brand strategy, UI/UX, development, marketing, motion, creative direction — or
 * any "what we do" capabilities block. Renders fully with no props via six
 * baked-in default services.
 */
export const AgencyServices = defineCapsule({
  name: 'AgencyServices',
  description:
    "Capabilities / services grid for a creative digital-agency page: a left-aligned section heading and lead paragraph above a responsive 1/2/3-column grid of hover-lift cards, each with a rounded tinted icon tile (rotating inline line-icons), a title and a description; cards lift and glow on hover. Tokens-only, no links. Use to present an agency's offerings (brand strategy, UI/UX, development, marketing, motion, creative direction) or any 'what we do' / capabilities block.",
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
    const heading = props.heading ?? 'Capabilities that cover the full journey.'
    const description =
      props.description ??
      'From initial concept to final pixel, we offer end-to-end services designed to transform ambitious ideas into market-leading digital products.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Brand Strategy',
            description:
              'Positioning, messaging, and visual identity systems that resonate with your audience and differentiate you from competitors.',
          },
          {
            title: 'UI/UX Design',
            description:
              'User-centered interfaces crafted through research, wireframing, and high-fidelity prototyping for web and mobile.',
          },
          {
            title: 'Web Development',
            description:
              'Performance-first frontend engineering with modern frameworks, clean architecture, and scalable infrastructure.',
          },
          {
            title: 'Digital Marketing',
            description:
              'Data-driven growth campaigns across SEO, content, paid media, and social to acquire and retain high-value customers.',
          },
          {
            title: 'Motion Design',
            description:
              'Cinematic animations, micro-interactions, and video production that bring interfaces and stories to life.',
          },
          {
            title: 'Creative Direction',
            description:
              'Holistic creative leadership ensuring every touchpoint aligns with your brand vision and business objectives.',
          },
        ]

    return (
      <section
        className={cn(
          'relative pt-28 pb-24 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="xl" className="px-6 lg:px-6">
          <SectionHeading
            align="left"
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-6 text-4xl font-bold tracking-tight sm:text-5xl"
            subtitleClassName="text-lg leading-relaxed text-muted-foreground"
          />
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
