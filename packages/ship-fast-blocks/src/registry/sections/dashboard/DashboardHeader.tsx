import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { PageHeader, PageHeaderActions } from '#/section-kit/PageHeader.tsx'
import { dashboardLakebed } from './dashboard-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DashboardHeader — a page-title header row for a SaaS admin dashboard. A
 * responsive flex band with a bold title + muted subtitle on the left and two
 * action buttons on the right: an outline secondary action and a gradient indigo
 * primary action (prefixed with a "+"). The primary action writes a shared
 * Lakebed order and the secondary action routes through section-kit route links.
 * Use as the heading row at the top of a dashboard content area — above KPI
 * cards, tables or charts — to label the view and surface its key actions.
 * Renders fully with no props via baked-in "Dashboard" defaults.
 */
export const DashboardHeader = defineCapsule({
  name: 'DashboardHeader',
  description:
    "A page-title header row for a SaaS admin dashboard: a responsive flex band with a bold title + muted subtitle on the left and two action buttons on the right — an outline secondary action and a gradient indigo primary action (prefixed with a '+'). The primary action writes a shared Lakebed order and the secondary action routes through section-kit route links. Use as the heading row at the top of a dashboard content area, above KPI cards, tables or charts, to label the view and surface its key actions.",
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
            'flex flex-col justify-between gap-4 sm:flex-row sm:items-end',
            props.className,
          )}
        >
          <SectionHeading
            title={title}
            subtitle={subtitle}
            align="left"
            titleAs="h1"
            titleClassName="text-2xl font-bold"
            subtitleClassName="text-sm"
            className="gap-1"
          />
          <PageHeaderActions className="flex gap-2">
            <NavbarRouteLink
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
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
              className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition hover:-translate-y-px hover:shadow-md hover:shadow-primary/40 disabled:pointer-events-none disabled:opacity-70"
            >
              {newOrderPending ? 'Adding' : `+ ${primaryAction}`}
            </button>
          </PageHeaderActions>
        </div>
      </PageHeader>
    )
  },
})
