import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * PortfolioDevServices — a 4-up services band for a modern developer portfolio
 * in an editorial-terminal language. Thin configuration over the shared
 * `FeatureGrid` composite (grid only — the header is rendered locally so it can
 * sit left-aligned under a mono meta rule): a monospace `--flag` kicker and a
 * ghost index numeral sit on each sharp-cornered card describing the kinds of
 * work the developer takes on — web apps, mobile, APIs, and cloud/DevOps. Each
 * card pairs a title with a short, concrete description and lifts onto a hard
 * offset shadow on hover with motion-reduce respected. Uses theme tokens only.
 * Use mid-page on a freelance engineer, full-stack developer, or studio
 * portfolio to summarize offerings. Renders fully with no props via baked-in
 * defaults.
 */
export const PortfolioDevServices = defineCapsule({
  name: 'PortfolioDevServices',
  description:
    '4-up editorial-terminal services band for a modern developer portfolio: a left-aligned mono meta rule and heading above a responsive grid of sharp-cornered cards, each carrying a monospace `--flag` kicker and a ghost index numeral, describing the work the developer takes on — production web apps, cross-platform mobile, REST/GraphQL APIs, and cloud/DevOps. Each card pairs a short title with a concrete one-line description and lifts onto a hard offset shadow on hover. Theme-token only. Use mid-page on a freelance engineer, full-stack developer, or studio portfolio to summarize offerings.',
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
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              {subheading}
            </span>
            <span className="tabular-nums">
              {String(features.length).padStart(2, '0')} / services
            </span>
          </div>
          <h2 className="mb-10 max-w-2xl text-4xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-5xl">
            {heading}
          </h2>
          <FeatureGrid columns={4}>
            {features.map((f, i) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              const flag =
                '--' +
                __iv__.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, '-')
                  .replace(/(^-|-$)/g, '')
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="relative gap-3 overflow-hidden rounded-none border-border bg-card transition-[transform,box-shadow,border-color] duration-150 hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[5px_5px_0_0] hover:shadow-foreground motion-reduce:transform-none"
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute right-3 top-2 select-none font-mono text-5xl font-extrabold tabular-nums leading-none tracking-tighter text-foreground/[0.05]"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-primary">
                    {flag}
                  </span>
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
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
