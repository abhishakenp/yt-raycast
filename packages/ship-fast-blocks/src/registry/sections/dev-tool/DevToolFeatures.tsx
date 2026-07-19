import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * DevToolFeatures — a 6-up product features grid for a developer tool / API
 * platform. A centered heading + intro paragraph above a responsive 1/2/3-column
 * grid of bordered cards, each with a tinted square icon tile, a title, a
 * description, and a "Learn more" chevron link. Icons rotate through a built-in
 * developer set (auth, database, real-time, serverless, edge, observability).
 * Every card link routes through useNavigate. Use to showcase platform
 * capabilities for developer tools, API platforms, backend-as-a-service, or
 * technical SaaS.
 */
export const DevToolFeatures = defineCapsule({
  name: 'DevToolFeatures',
  description:
    "6-up product features grid for a developer tool / API platform: a centered heading + intro paragraph above a responsive 1/2/3-column grid of bordered cards, each with a tinted square icon tile, title, description, and a 'Learn more' chevron link. Built-in developer icon set (auth, database, real-time, serverless, edge, observability) rotates across cards. Card links route through useNavigate. Use to showcase platform capabilities for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    learnMore: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Everything you need to ship'
    const description =
      props.description ??
      'One platform for authentication, storage, real-time events, and serverless functions. No more stitching together multiple services.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Authentication',
            description:
              'Complete auth with email, OAuth, SSO, and MFA. Support for React, Vue, Svelte, and native mobile SDKs.',
          },
          {
            title: 'Database & Storage',
            description:
              'Auto-scaling PostgreSQL with real-time subscriptions. Key-value store with sub-10ms latency. Object storage with CDN.',
          },
          {
            title: 'Real-time Events',
            description:
              'WebSocket-based pub/sub with 99.99% uptime. Broadcast to millions of connections instantly. Presence detection built-in.',
          },
          {
            title: 'Serverless Functions',
            description:
              'Deploy functions in Node.js, Python, Go, or Rust. Cold starts under 50ms. Automatic scaling from zero to thousands.',
          },
          {
            title: 'Edge Functions',
            description:
              'Run code at 250+ edge locations worldwide. Cache at the edge. Geolocation, bot detection, and A/B testing utilities.',
          },
          {
            title: 'Observability',
            description:
              'Built-in logging, metrics, and tracing. Custom dashboards. Alerts via Slack, PagerDuty, or webhook. 30-day retention.',
          },
        ]

    return (
      <section
        className={cn('py-20 lg:py-28', props.className)}
        aria-labelledby="features-heading"
      >
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            titleId="features-heading"
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
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
