import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraFeatures — terminal-industrial capabilities ledger for a cloud-
 * infrastructure / developer-platform SaaS landing page. An asymmetric header
 * (left-aligned heading + description, mono `$`-command meta line on the
 * right) above a collapsed-border module ledger: hairline-separated cells
 * (2-col on mobile, 3-col on desktop), each with a mono index tag, a status
 * square, a title, and a description. A giant ghost `>_` watermark sits
 * behind. Tokens-only. Renders fully on zero arguments.
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
import { Watermark } from '#/section-kit/Decor.tsx'
export const CloudInfraFeatures = defineCapsule({
  name: 'CloudInfraFeatures',
  description:
    'Terminal-industrial capabilities ledger for a cloud-infrastructure / developer-platform SaaS landing page: an asymmetric header (left-aligned heading plus description, mono command meta on the right) above a collapsed-border module ledger of hairline-separated cells (2-col mobile, 3-col desktop), each with a mono index tag, status square, title, and description. Giant ghost watermark behind. Tokens-only. Use for feature grids on cloud hosting, IaaS, PaaS, serverless, container, DevOps, or developer-tooling sites.',
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
      <section
        className={cn(
          'relative overflow-hidden py-14 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-right-8 -top-6 font-mono text-[8rem] sm:text-[12rem] lg:text-[16rem]">
          &gt;_
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-base sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              <span className="text-primary">$</span> cloudshift services --list
            </p>
          </div>
          <FeatureGrid
            columns={3}
            className="[&>div]:grid-cols-2 [&>div]:gap-px [&>div]:border [&>div]:border-border [&>div]:bg-border [&>div]:lg:grid-cols-3"
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
                  className="group gap-3 rounded-none border-0 bg-background p-5 shadow-none transition-colors hover:bg-muted/40 sm:p-7"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/70">
                      {`0${i + 1}`.slice(-2)} /
                    </span>
                    <span
                      aria-hidden="true"
                      className="size-1.5 bg-primary opacity-40 transition-opacity group-hover:opacity-100"
                    />
                  </div>
                  {__iv__.icon && <FeatureIcon>{__iv__.icon}</FeatureIcon>}
                  <FeatureTitle className="text-base font-semibold tracking-tight sm:text-lg">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="text-sm leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
