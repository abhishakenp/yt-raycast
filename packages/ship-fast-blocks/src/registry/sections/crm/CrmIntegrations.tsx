import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * CrmIntegrations — collapsed-border integrations matrix for a CRM / SaaS
 * landing page. An asymmetric header (left-aligned heading with a tilted
 * primary marker block behind the key word, mono "[ ECOSYSTEM ]" meta right)
 * over a giant ghost "200+" watermark, above a sharp hairline-collapsed
 * 2/4/6-up matrix of square tiles: each cell pairs a sharp grid-glyph chip
 * with an integration name and a mono capability label, washes to muted and
 * gains a primary hairline on hover, and routes through section-kit route
 * links. Use to advertise the ecosystem / app marketplace of a CRM,
 * sales-pipeline or B2B SaaS product. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import {
  IntegrationGrid,
  IntegrationCard,
} from '#/section-kit/IntegrationGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const CrmIntegrations = defineCapsule({
  name: 'CrmIntegrations',
  description:
    'Collapsed-border integrations matrix for a CRM / SaaS landing page: an asymmetric header (marker-highlighted heading left, mono ecosystem meta right) over a giant ghost 200+ watermark, above a sharp hairline-collapsed 2/4/6-up matrix of square tiles, each pairing a sharp grid-glyph chip with an integration name and mono capability label; tiles wash to muted with a primary hairline on hover and route through section-kit route links. Use to advertise the ecosystem / app marketplace of a CRM, sales-pipeline or B2B SaaS product.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Integration tiles. */
    items: z
      .array(
        z.object({
          name: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Integrates with your entire stack'
    const description =
      props.description ??
      'Connect 200+ tools to sync data, automate workflows, and eliminate manual data entry.'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: 'Gmail',
            label: 'Email sync',
          },
          {
            name: 'Slack',
            label: 'Notifications',
          },
          {
            name: 'Calendly',
            label: 'Scheduling',
          },
          {
            name: 'Stripe',
            label: 'Payments',
          },
          {
            name: 'Zapier',
            label: 'Automation',
          },
          {
            name: 'QuickBooks',
            label: 'Accounting',
          },
          {
            name: 'LinkedIn',
            label: 'Prospecting',
          },
          {
            name: 'Microsoft',
            label: 'Office 365',
          },
          {
            name: 'HubSpot',
            label: 'Marketing',
          },
          {
            name: 'Zoom',
            label: 'Video calls',
          },
          {
            name: 'Zendesk',
            label: 'Support',
          },
          {
            name: '+190 more',
            label: 'View all',
          },
        ]
    const headingWords = heading.split(' ')
    const headingLead = headingWords.slice(0, -1).join(' ')
    const headingMark = headingWords.at(-1) ?? ''
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-4 right-0 text-[7rem] sm:text-[10rem] lg:text-[14rem]">
          200+
        </Watermark>
        <Container className="relative">
          {/* Asymmetric header: marker-highlighted heading left, mono meta right. */}
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <div className="max-w-2xl">
              <MonoTag className="mb-4 block">
                Ecosystem
                <span aria-hidden="true" className="text-primary">
                  {' '}
                  · 200+ apps
                </span>
              </MonoTag>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {headingLead}{' '}
                <span className="relative ml-[0.12em] inline-block whitespace-nowrap">
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-[-0.15em] inset-y-[0.05em] rotate-1 bg-primary"
                  />
                  <span className="relative text-primary-foreground">
                    {headingMark}
                  </span>
                </span>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                {description}
              </p>
            </div>
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ connect ] two-way sync
            </p>
          </div>
          <IntegrationGrid
            cols="2-4-6"
            className="gap-0 border-l border-t border-border"
          >
            {items.map((item) => (
              <IntegrationCard
                asChild
                key={item.name}
                className="rounded-none border-0 border-b border-r border-border bg-card p-5 shadow-none transition-colors duration-150 hover:bg-muted/60 sm:p-6"
              >
                <NavbarRouteLink href={item.name}>
                  <span
                    aria-hidden="true"
                    className="mb-3 grid size-9 place-items-center border border-border text-muted-foreground"
                  >
                    <svg
                      className="size-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </span>
                  <span className="text-sm font-semibold tracking-tight text-card-foreground">
                    {item.name}
                  </span>
                  <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {item.label}
                  </span>
                </NavbarRouteLink>
              </IntegrationCard>
            ))}
          </IntegrationGrid>
        </Container>
      </section>
    )
  },
})
