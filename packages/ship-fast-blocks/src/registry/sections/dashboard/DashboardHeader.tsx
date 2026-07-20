import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { PageHeader, PageHeaderActions } from '#/section-kit/PageHeader.tsx'
import { dashboardLakebed } from './dashboard-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DashboardHeader — Swiss-data page-title band for a SaaS admin dashboard. A
 * hairline-bordered header row with an extrabold tight-tracked title + muted
 * subtitle on the left and two square-edged actions on the right: a hairline
 * outline secondary action and a single solid primary action (prefixed with a
 * "+"), both with press feedback and rounded-none precision. The primary
 * action writes a shared Lakebed order and the secondary action routes through
 * section-kit route links. Use as the heading row at the top of a dashboard
 * content area — above KPI cards, tables or charts — to label the view and
 * surface its key actions. Renders fully with no props via baked-in
 * "Dashboard" defaults.
 */
export const DashboardHeader = defineCapsule({
  name: 'DashboardHeader',
  description:
    "Swiss-data page-title band for a SaaS admin dashboard: a hairline-bordered header row with an extrabold tight-tracked title + muted subtitle on the left and two square-edged actions on the right — a hairline outline secondary action and a single solid primary action (prefixed with a '+'), both rounded-none with press feedback. The primary action writes a shared Lakebed order and the secondary action routes through section-kit route links. Use as the heading row at the top of a dashboard content area, above KPI cards, tables or charts, to label the view and surface its key actions.",
  props: z.object({
    /** Page-header heading. */
    title: z.string().optional(),
    /** Page-header subtitle / welcome line. */
    subtitle: z.string().optional(),
    /** Secondary (outline) action label, also used as its route. */
    secondaryAction: z.string().optional(),
    /** Primary (filled) action label, also used as its route. */
    primaryAction: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: dashboardLakebed,
  component: ({ props, lakebed }) => {
    const addOrder = useKeyedLakebedMutation(lakebed, 'addOrder')
    const title = props.title ?? 'Dashboard'
    const subtitle =
      props.subtitle ??
      "Welcome back, Alex. Here's what's happening with your store."
    const secondaryAction = props.secondaryAction ?? 'Export'
    const primaryAction = props.primaryAction ?? 'New Order'
    const newOrderKey = 'dashboard-header:new-order'
    const newOrderPending = addOrder.isPending(newOrderKey)

    return (
      <PageHeader asChild>
        <div
          className={cn(
            'flex flex-col justify-between gap-4 px-4 py-5 sm:flex-row sm:items-end sm:px-6 lg:px-8',
            props.className,
          )}
        >
          <SectionHeading
            title={title}
            subtitle={subtitle}
            align="left"
            titleAs="h1"
            titleClassName="text-2xl font-extrabold tracking-tight md:text-2xl"
            subtitleClassName="text-sm md:text-sm"
            className="gap-1"
          />
          <PageHeaderActions className="flex gap-2">
            <NavbarRouteLink
              className="inline-flex items-center justify-center rounded-none border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-muted active:translate-y-px"
              href={secondaryAction}
            >
              {secondaryAction}
            </NavbarRouteLink>
            <button
              type="button"
              aria-busy={newOrderPending}
              disabled={newOrderPending}
              onClick={() => {
                const now = new Date()
                void addOrder.run(newOrderKey, {
                  amount: '$0.00',
                  customer: 'New Customer',
                  date: now.toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  }),
                  orderId: `#${Math.floor(now.getTime() / 1000)}`,
                  product: 'Manual order',
                  status: 'Processing',
                  statusTone: 'sky',
                })
              }}
              className="inline-flex items-center justify-center rounded-none bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
            >
              {newOrderPending ? 'Adding' : `+ ${primaryAction}`}
            </button>
          </PageHeaderActions>
        </div>
      </PageHeader>
    )
  },
})
