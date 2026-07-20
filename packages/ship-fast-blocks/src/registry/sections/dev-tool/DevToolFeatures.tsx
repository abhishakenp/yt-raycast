import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * DevToolFeatures — "--flag" ledger features grid for a developer tool / API
 * platform. An asymmetric header (left-aligned heading + intro, aria-hidden
 * mono "[ modules ]" count meta right) above a collapsed-border 1/2/3-column
 * ledger of sharp-cornered cells sharing hairline borders. Each cell carries a
 * mono index, an aria-hidden "--slug" flag derived from the title, the feature
 * title, a description, and a mono "Learn more →" route link. A giant ghost
 * "--" watermark bleeds off the edge. Use to showcase platform capabilities
 * for developer tools, API platforms, backend-as-a-service, or technical SaaS.
 */
export const DevToolFeatures = defineCapsule({
  name: 'DevToolFeatures',
  description:
    "'--flag' ledger features grid for a developer tool / API platform: an asymmetric header (heading + intro left, aria-hidden mono module-count meta right) above a collapsed-border 1/2/3-column ledger of sharp cells sharing hairline borders, each with a mono index, an aria-hidden '--slug' flag derived from the title, the feature title, a description, and a mono 'Learn more' route link; a giant ghost '--' watermark bleeds off the edge. Use to showcase platform capabilities for developer tools, API platforms, backend-as-a-service, or technical SaaS.",
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
    const learnMore = props.learnMore ?? 'Learn more'
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

    const toFlag = (title: string) =>
      '--' +
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    return (
      <section
        className={cn(
          'relative overflow-hidden py-16 lg:py-24',
          props.className,
        )}
        aria-labelledby="features-heading"
      >
        <Watermark className="-right-8 top-2 font-mono text-[10rem] sm:text-[14rem]">
          --
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-14">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              titleId="features-heading"
              className="max-w-2xl gap-4"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-lg text-muted-foreground"
            />
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              [ modules ] {String(items.length).padStart(2, '0')} loaded
            </MonoTag>
          </div>
          <FeatureGrid
            columns={3}
            className="gap-0 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
            {items.map((f, i) => {
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
                <FeatureCard
                  key={__iv__.title}
                  className="gap-3 rounded-none border-0 border-b border-r border-border bg-transparent p-6 hover:translate-y-0 hover:border-border hover:bg-muted/50 sm:p-7"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <MonoTag tone="faint" aria-hidden="true">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="truncate font-mono text-[11px] tracking-[0.06em] text-primary"
                    >
                      {toFlag(__iv__.title)}
                    </span>
                  </div>
                  {__iv__.icon && (
                    <FeatureIcon className="rounded-none">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <FeatureTitle className="text-lg font-bold tracking-tight text-foreground">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="text-sm leading-relaxed text-muted-foreground">
                    {__iv__.description}
                  </FeatureDescription>
                  <NavbarRouteLink
                    href={__iv__.title}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 pt-2 font-mono text-[11px] uppercase tracking-[0.12em] text-foreground transition-colors hover:text-primary active:translate-y-px motion-reduce:transform-none"
                  >
                    {learnMore}
                    <span aria-hidden="true">→</span>
                  </NavbarRouteLink>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
