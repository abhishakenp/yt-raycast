import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraFeatures — product capabilities grid for a cloud-infrastructure /
 * developer-platform SaaS landing page. A centered heading + description above
 * a responsive 3-column card grid. Each card has a rounded tinted icon tile with
 * an inline SVG, a title, and a description. Cards lift with a primary border
 * tint on hover. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
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
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <SectionHeading
            title={heading}
            subtitle={description}
            className="mb-16 max-w-3xl gap-0"
            titleClassName="mb-4 tracking-tight sm:text-4xl"
            subtitleClassName="text-lg"
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
