import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraStats — split stats / trust band for a cloud-infrastructure / developer-
 * platform SaaS landing page. Left side: a heading, description paragraph, and a
 * vertical list of trust badges (each with an icon tile + title + subtitle). Right
 * side: a 2x2 grid of big metric tiles. Tokens-only. Renders fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CloudInfraStats = defineCapsule({
  name: 'CloudInfraStats',
  description:
    'Split stats / trust band for a cloud-infrastructure / developer-platform SaaS landing page: left side carries a heading, a description paragraph, and a vertical list of trust badges (each with an icon tile, title, and subtitle); right side is a 2x2 grid of big metric value tiles. Tokens-only. Use for credibility, social-proof, and KPI bands on cloud hosting, IaaS, PaaS, serverless, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Trust badges: title + subtitle. */
    badges: z
      .array(
        z.object({
          title: z.string(),
          subtitle: z.string(),
        }),
      )
      .optional(),
    /** Big metric figures: value + label. */
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by thousands of engineering teams'
    const description =
      props.description ??
      'From startups to Fortune 500s, teams rely on CloudShift for mission-critical infrastructure. Our platform processes billions of requests daily across 35 global regions.'
    const badges = props.badges?.length
      ? props.badges
      : [
          {
            title: '99.99% Uptime SLA',
            subtitle: 'Backed by financial credits',
          },
          {
            title: 'SOC 2 Type II Certified',
            subtitle: 'GDPR and HIPAA compliant',
          },
        ]
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '12K+',
            label: 'Active deployments',
          },
          {
            value: '35',
            label: 'Global regions',
          },
          {
            value: '50B+',
            label: 'Requests/month',
          },
          {
            value: '<20ms',
            label: 'Edge latency',
          },
        ]
    const icons: ReactNode[] = [
      <svg
        key="sla"
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
        key="soc2"
        className="size-6"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm0 0V5a4 4 0 00-8 0v4h8z" />
      </svg>,
    ]
    return (
      <section className={cn('py-20 lg:py-28', props.className)}>
        <Container>
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="mb-6 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {heading}
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                {description}
              </p>
              <div className="space-y-4">
                {badges.map((badge, i) => (
                  <div key={badge.title} className="flex items-center gap-3">
                    <div className="grid size-12 place-items-center rounded-lg bg-chart-2/15 text-chart-2">
                      {icons[i % icons.length]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {badge.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {badge.subtitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {items.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl bg-muted/60 p-8 text-center"
                >
                  <p className="mb-2 text-4xl font-semibold text-foreground sm:text-5xl">
                    {s.value}
                  </p>
                  <p className="text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
