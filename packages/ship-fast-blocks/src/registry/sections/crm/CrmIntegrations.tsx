import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Card } from '#/section-kit/Card.tsx'

/**
 * CrmIntegrations — centered integrations grid for a CRM / SaaS landing page. A
 * heading + supporting paragraph above a dense responsive (2/4/6-up) grid of
 * bordered tiles, each a soft tinted grid-glyph icon above an integration name
 * and a short capability label; tiles lift on hover and route through
 * useNavigate. Use to advertise the ecosystem / app marketplace of a CRM,
 * sales-pipeline or B2B SaaS product. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  IntegrationGrid,
  IntegrationCard,
} from '#/section-kit/IntegrationGrid.tsx'
export const CrmIntegrations = defineCapsule({
  name: 'CrmIntegrations',
  description:
    'Centered integrations grid for a CRM / SaaS landing page: a heading + supporting paragraph above a dense responsive (2/4/6-up) grid of bordered tiles, each a soft tinted grid-glyph icon above an integration name and a short capability label; tiles lift on hover and route through useNavigate. Use to advertise the ecosystem / app marketplace of a CRM, sales-pipeline or B2B SaaS product.',
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
    const go = useNavigate()
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
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <IntegrationGrid cols="2-4-6" gap="md">
            {items.map((item) => (
              <IntegrationCard asChild key={item.name}>
                <Card
                  asChild
                  variant="default"
                  rounded="lg"
                  padding="md"
                  className="flex flex-col items-center text-center transition-all hover:shadow-md"
                >
                  <button type="button" onClick={() => go(item.name)}>
                    <div className="mb-3 grid size-12 place-items-center rounded-lg bg-primary/10 text-primary">
                      <svg
                        className="size-6"
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
                    </div>
                    <span className="font-medium text-card-foreground">
                      {item.name}
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      {item.label}
                    </span>
                  </button>
                </Card>
              </IntegrationCard>
            ))}
          </IntegrationGrid>
        </Container>
      </section>
    )
  },
})
