import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraFaq — accordion-style FAQ section for a cloud-infrastructure / developer-
 * platform SaaS landing page. A centered heading + description above an accordion
 * list of detail/summary pairs. Each details block opens with a border transition
 * to primary; summary includes a chevron that rotates on open. Tokens-only. Renders
 * fully on zero arguments. ID attributes are namespaced.
 */
export const CloudInfraFaq = defineCapsule({
  name: 'CloudInfraFaq',
  description:
    'Accordion-style FAQ section for a cloud-infrastructure / developer-platform SaaS landing page: a centered heading plus description above an accordion list of detail/summary pairs. Each details block opens with a border transition to primary, and the summary includes a chevron that rotates on open. Tokens-only. Use for FAQ bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** FAQ items: question + answer. */
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently asked questions'
    const description =
      props.description ?? 'Everything you need to know about CloudShift.'
    const items = props.items?.length
      ? props.items
      : [
          {
            q: 'How does per-second billing work?',
            a: "You pay only for the compute time you actually use, measured in 1-second increments with a 60-second minimum. If you run a container for 3 minutes and 45 seconds, you're billed for exactly 225 seconds at the hourly rate. No rounding up to the nearest hour like traditional cloud providers.",
          },
          {
            q: 'Can I bring my own container images?',
            a: 'Absolutely. CloudShift supports any OCI-compliant container image from Docker Hub, GitHub Container Registry, AWS ECR, or our built-in registry. We also offer automated builds that trigger on every git push, with layer caching to speed up subsequent deployments.',
          },
          {
            q: 'What regions are available?',
            a: 'We operate 35 regions across 6 continents: 10 in North America, 8 in Europe, 6 in Asia-Pacific, 4 in South America, 4 in Africa, and 3 in the Middle East. All regions offer the same services and pricing. You can deploy to multiple regions for high availability or keep data within specific geographies for compliance.',
          },
          {
            q: 'Do you offer managed databases?',
            a: 'Yes. We offer managed PostgreSQL 15, MySQL 8.0, and Redis 7 with automated backups, point-in-time recovery, and read replicas. Database pricing starts at $15/month for 2GB RAM / 1 vCPU instances with 10GB storage. All databases run on dedicated hardware with encryption at rest and in transit.',
          },
          {
            q: 'How does your free tier work?',
            a: "Every new account receives $500 in credits valid for 12 months. Additionally, our always-free tier includes 1 million serverless requests, 10GB object storage, and 1GB database storage per month. No credit card required to start, and we'll notify you before any billable usage occurs.",
          },
          {
            q: "What's your uptime guarantee?",
            a: 'We offer a 99.99% uptime SLA for compute and database services (52.6 minutes of downtime per year max). If we fall below this threshold, you receive service credits: 10% for 99.9-99.99%, 25% for 99.5-99.9%, and 50% for below 99.5%. Enterprise customers can negotiate custom SLAs up to 99.999%.',
          },
        ]

    const Chevron = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 9l-7 7-7-7" />
      </svg>
    )

    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FaqAccordion>
            {items.map((item) => (
              <FaqItem key={item.q} className="open:border-primary">
                <FaqQuestion className="p-6">
                  <h3 className="pr-8 text-lg font-medium text-card-foreground">
                    {item.q}
                  </h3>
                  <span
                    aria-hidden="true"
                    className="transition-transform group-open:rotate-180"
                  >
                    <Chevron className="size-5 text-muted-foreground" />
                  </span>
                  <FaqQuestionIcon />
                </FaqQuestion>
                <FaqAnswer asChild className="px-6 pb-6">
                  <div>{item.a}</div>
                </FaqAnswer>
              </FaqItem>
            ))}
          </FaqAccordion>
        </div>
      </section>
    )
  },
})
