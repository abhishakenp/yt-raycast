import { defineCapsule } from '#/capsules/openui.ts'

import {
  FaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'

import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraFaq — terminal-industrial manual-page FAQ for a cloud-
 * infrastructure / developer-platform SaaS landing page. Asymmetric 4/8
 * split: the left rail carries a left-aligned heading, description, and a
 * mono `$ man` meta line (sticky on desktop); the right column is a
 * collapsed-border accordion ledger of detail/summary rows, each with a mono
 * `Q.NN` index tag and a chevron that rotates on open. Tokens-only. Renders
 * fully on zero arguments. ID attributes are namespaced.
 */
export const CloudInfraFaq = defineCapsule({
  name: 'CloudInfraFaq',
  description:
    'Terminal-industrial manual-page FAQ for a cloud-infrastructure / developer-platform SaaS landing page: an asymmetric 4/8 split with a sticky left rail (heading, description, mono meta line) and a collapsed-border accordion ledger on the right — detail/summary rows with mono Q-index tags and a chevron that rotates on open. Tokens-only. Use for FAQ bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
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
      <section className={cn('py-14 sm:py-20 lg:py-28', props.className)}>
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-24">
                <p
                  aria-hidden="true"
                  className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
                >
                  <span className="text-primary">$</span> man cloudshift
                </p>
                <SectionHeading
                  align="left"
                  title={heading}
                  subtitle={description}
                  className="gap-3"
                  titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
                  subtitleClassName="text-base sm:text-lg"
                />
                <span
                  aria-hidden="true"
                  className="mt-6 hidden h-1 w-12 bg-primary lg:block"
                />
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqAccordion className="space-y-0 divide-y divide-border border border-border bg-background">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.q}
                    className="rounded-none border-0 bg-transparent"
                  >
                    <FaqQuestion className="items-baseline gap-4 p-5 sm:p-6">
                      <span
                        aria-hidden="true"
                        className="shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground/70"
                      >
                        Q.{`0${i + 1}`.slice(-2)}
                      </span>
                      <h3 className="flex-1 pr-4 text-base font-semibold tracking-tight text-foreground sm:text-lg">
                        {item.q}
                      </h3>
                      <span
                        aria-hidden="true"
                        className="self-center transition-transform group-open:rotate-180"
                      >
                        <Chevron className="size-5 text-muted-foreground" />
                      </span>
                      <FaqQuestionIcon />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="px-5 pb-5 text-sm leading-relaxed sm:px-6 sm:pb-6 sm:pl-[4.25rem]"
                    >
                      <div>{item.a}</div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </FaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
