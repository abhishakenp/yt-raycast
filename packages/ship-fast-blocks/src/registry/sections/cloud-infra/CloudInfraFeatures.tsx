import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Card } from '#/section-kit/Card.tsx'

/**
 * CloudInfraFeatures — product capabilities grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above
 * a responsive 3-column card grid. Each card has a rounded tinted icon tile with
 * an inline SVG, a title, and a description. Cards lift with a primary border
 * tint on hover. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CloudInfraFeatures = defineCapsule({
  name: 'CloudInfraFeatures',
  description:
    'Product capabilities grid for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description above a responsive 3-column card grid. Each card has a rounded tinted icon tile with an inline SVG, a title, and a description; cards lift with a primary border tint on hover. Tokens-only. Use for feature grids on cloud hosting, IaaS, PaaS, serverless, container, DevOps, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
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
    const heading = props.heading ?? 'Everything you need to ship faster'
    const description =
      props.description ??
      'From container orchestration to serverless functions, CloudShift provides the infrastructure building blocks modern applications demand.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Container Registry',
            description:
              'Secure, scalable Docker registry with vulnerability scanning. Push and pull images globally with edge caching.',
          },
          {
            title: 'Serverless Functions',
            description:
              'Deploy functions in 12 languages. Auto-scaling from zero to thousands of instances in milliseconds.',
          },
          {
            title: 'Managed Databases',
            description:
              'PostgreSQL, MySQL, and Redis with automated backups, point-in-time recovery, and read replicas.',
          },
          {
            title: 'Edge Security',
            description:
              'DDoS protection, WAF rules, and bot management deployed across 300+ edge locations worldwide.',
          },
          {
            title: 'Object Storage',
            description:
              'S3-compatible storage with 99.999999999% durability. Global CDN integration for instant asset delivery.',
          },
          {
            title: 'Observability',
            description:
              'Real-time metrics, distributed tracing, and intelligent alerting. Pinpoint issues before users notice.',
          },
        ]
    const icons: ReactNode[] = [
      <svg
        key="registry"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>,
      <svg
        key="serverless"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="database"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>,
      <svg
        key="security"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg
        key="storage"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>,
      <svg
        key="observability"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>,
    ]
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <Card
                key={item.title}
                padding="lg"
                className="group transition-colors hover:border-primary/40"
              >
                <div className="mb-6 grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
                  {icons[i % icons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </Card>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
