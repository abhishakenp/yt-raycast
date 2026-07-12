import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * PortfolioDevServices — a 4-up services band for a modern developer portfolio.
 * Thin configuration over the shared `FeatureGrid` composite: a centered
 * heading and subheading above a responsive grid of plain feature cards (no
 * icons) describing the kinds of work the developer takes on — web apps,
 * mobile, APIs, and cloud/DevOps. Each card shows a title and a short,
 * concrete description so a prospective client can scan capabilities fast.
 * Uses theme tokens only and inherits the kit's card styling. Use mid-page on a
 * freelance engineer, full-stack developer, or studio portfolio to summarize
 * offerings. Renders fully with no props via baked-in defaults.
 */
export const PortfolioDevServices = defineCapsule({
  name: 'PortfolioDevServices',
  description:
    '4-up services band for a modern developer portfolio: a centered heading and subheading above a responsive grid of plain feature cards (no icons) describing the work the developer takes on — production web apps, cross-platform mobile, REST/GraphQL APIs, and cloud/DevOps. Each card pairs a short title with a concrete one-line description. Theme-token only. Use mid-page on a freelance engineer, full-stack developer, or studio portfolio to summarize offerings.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Short supporting line under the heading. */
    subheading: z.string().optional(),
    /** Service cards: title + description. */
    features: z
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
    const heading = props.heading ?? 'Services'
    const subheading = props.subheading ?? 'What I build'
    const features = props.features?.length
      ? props.features
      : [
          {
            title: 'Web Apps',
            description:
              'Production React, Next.js, and TypeScript apps with clean architecture and fast load times.',
          },
          {
            title: 'Mobile',
            description:
              'Cross-platform React Native apps that feel native on both iOS and Android.',
          },
          {
            title: 'APIs',
            description:
              'Robust REST and GraphQL backends with Node, Postgres, and solid auth.',
          },
          {
            title: 'Cloud / DevOps',
            description:
              'CI/CD, containerization, and infra-as-code on AWS, Vercel, and Cloudflare.',
          },
        ]

    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={heading}
            subheading={subheading}
            features={features}
            columns={4}
          />
        </Container>
      </section>
    )
  },
})
