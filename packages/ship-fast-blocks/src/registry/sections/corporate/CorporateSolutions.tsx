import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { SolutionGrid, SolutionCard } from '#/section-kit/SolutionGrid.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { cn } from '#/lib/utils.ts'
/**
 * CorporateSolutions — Swiss-corporate solutions ledger for a corporate B2B
 * homepage. An asymmetric 5/7 header split (left-aligned heading on the left,
 * lede pushed to the offset right column above a hairline rule) over a
 * collapsed-border 1/2/3-column ledger of square-edged solution cells. Each
 * cell shares hairline rules with its neighbors and carries a mono primary
 * index label ("01"), a giant ghost numeral watermark, an ink icon tile
 * (rotating inline SVGs), a title, a description, and an underlined
 * "Learn more" link with press feedback. Use to present enterprise offerings
 * (cloud infrastructure, security, analytics, transformation, managed
 * services, risk) on SaaS, IT, or consultancy sites.
 */
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const CorporateSolutions = defineCapsule({
  name: 'CorporateSolutions',
  description:
    "Swiss-corporate solutions ledger for a corporate B2B homepage: an asymmetric 5/7 header split (heading left, lede in the offset right column above a hairline rule) over a collapsed-border 1/2/3-column ledger of square-edged cells, each with a mono primary index label, a giant ghost numeral watermark, an ink icon tile (rotating inline SVGs), a title, description, and an underlined 'Learn more' link with press feedback. Use to present enterprise offerings on SaaS, IT, or consultancy sites. All card links route through section-kit route links.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Solution cards: title + description. */
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
    const heading = props.heading ?? 'Enterprise solutions built for scale'
    const description =
      props.description ??
      'Comprehensive infrastructure and software solutions designed to meet the security, compliance, and performance demands of global enterprises.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Cloud Infrastructure',
            description:
              'Multi-cloud orchestration platform supporting AWS, Azure, and GCP with unified management, cost optimization, and automated scaling.',
          },
          {
            title: 'Security & Compliance',
            description:
              'Enterprise-grade security with zero-trust architecture, continuous compliance monitoring, and automated threat detection and response.',
          },
          {
            title: 'Data Analytics',
            description:
              'Real-time analytics platform with AI-powered insights, predictive modeling, and custom dashboards for executive decision-making.',
          },
          {
            title: 'Digital Transformation',
            description:
              'End-to-end transformation consulting, legacy modernization, and agile implementation to accelerate your digital journey.',
          },
          {
            title: 'Managed Services',
            description:
              '24/7 operations center with dedicated teams for monitoring, incident response, and proactive system optimization.',
          },
          {
            title: 'Risk Management',
            description:
              'Comprehensive risk assessment frameworks, business continuity planning, and disaster recovery with industry-leading RTOs.',
          },
        ]
    const solutionIcons: ReactNode[] = [
      // cloud / server
      <svg
        key="cloud"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="18" height="6" rx="2" />
        <rect x="3" y="15" width="18" height="6" rx="2" />
        <line x1="7" y1="6" x2="7" y2="6" />
        <line x1="7" y1="18" x2="7" y2="18" />
      </svg>,
      // shield / lock
      <svg
        key="shield"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 018 0v4" />
      </svg>,
      // analytics / chart
      <svg
        key="chart"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="6" y1="20" x2="6" y2="13" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="18" y1="20" x2="18" y2="9" />
      </svg>,
      // transformation / refresh
      <svg
        key="refresh"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>,
      // managed services / team
      <svg
        key="team"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="9" cy="7" r="3" />
        <path d="M2 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" />
        <path d="M17 11a3 3 0 000-6" />
        <path d="M22 21v-2a4 4 0 00-3-3.87" />
      </svg>,
      // risk / verified shield
      <svg
        key="risk"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016A11.955 11.955 0 0112 2.944z" />
        <path d="M9 12l2 2 4-4" />
      </svg>,
    ]
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
    )
    return (
      <section className={cn('bg-background py-16 lg:py-28', props.className)}>
        <Container>
          <div className="mb-10 grid gap-6 border-b border-border pb-8 sm:mb-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-5">
              <span
                aria-hidden="true"
                className="mb-4 block font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
              >
                02 / Solutions
              </span>
              <SectionHeading
                align="left"
                title={heading}
                className="gap-0"
                titleClassName="text-3xl font-semibold tracking-tight sm:text-4xl"
              />
            </div>
            <p className="text-lg leading-relaxed text-muted-foreground lg:col-span-6 lg:col-start-7 lg:self-end">
              {description}
            </p>
          </div>
          <SolutionGrid
            cols="1-md-2-3"
            className="grid gap-0 border-l border-t border-border"
          >
            {items.map((item, i) => (
              <SolutionCard
                key={item.title}
                className="relative overflow-hidden rounded-none border-b border-l-0 border-r border-t-0 border-border bg-background p-6 transition-colors duration-150 hover:bg-muted/40 sm:p-8"
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-1 -top-3 select-none font-mono text-7xl font-bold tabular-nums leading-none text-foreground/[0.05]"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="mb-6 font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="mb-6 mt-4 grid size-11 place-items-center rounded-none bg-foreground text-background">
                  {solutionIcons[i % solutionIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-foreground">
                  {item.title}
                </h3>
                <p className="mb-5 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <NavbarRouteLink
                  className="mt-auto inline-flex w-fit items-center gap-1 text-sm font-medium text-foreground underline decoration-primary decoration-2 underline-offset-4 transition-all duration-150 hover:text-muted-foreground active:translate-y-px"
                  href={item.title}
                >
                  Learn more
                  <ArrowRight className="size-4" />
                </NavbarRouteLink>
              </SolutionCard>
            ))}
          </SolutionGrid>
        </Container>
      </section>
    )
  },
})
