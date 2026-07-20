import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  DataTable,
  DataHeader,
  DataBody,
  DataRow,
  DataTableCell,
} from '#/section-kit/DataTable.tsx'
import {
  dashboardLakebed,
  type DashboardOrderRecord,
} from './dashboard-lakebed.ts'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
type DashboardDisplayRow = {
  amount?: string
  customer?: string
  date?: string
  dbId?: string
  destination?: string
  eta?: string
  id?: string
  location?: string
  priority?: string
  product?: string
  robot?: string
  status?: string
  statusTone?: 'emerald' | 'sky' | 'amber' | 'red' | string
  task?: string
}

/**
 * DashboardOrdersTable — Swiss-data recent-orders ledger for a SaaS admin
 * dashboard. A rounded-none hairline-framed card: a header row (title +
 * subtitle and square mono uppercase toolbar buttons whose icon is chosen
 * from the label — download for Export, funnel otherwise), a dense hairline
 * table (mono order id, a customer cell with a square monogram chip, product,
 * tabular date, tabular amount, a square mono status chip with a matching
 * square tick — data-viz tokens, destructive for cancelled — and a
 * row-actions kebab) and a pagination footer (mono tabular summary + square
 * Prev / numbered / Next buttons, the active page ink-inverted, "Prev"
 * disabled). Toolbar buttons and pagination route through section-kit route
 * links; Lakebed-backed row actions update order status in the shared
 * dashboard state. Use below the KPI / chart band to list latest
 * transactions, orders, invoices or any recent records. Renders fully with no
 * props via baked-in default orders.
 */
export const DashboardOrdersTable = defineCapsule({
  name: 'DashboardOrdersTable',
  description:
    "Swiss-data recent-orders ledger for a SaaS admin dashboard: a rounded-none hairline-framed card with a header row (title + subtitle and square mono uppercase toolbar buttons whose icon is chosen from the label — download for Export, funnel otherwise), a dense hairline table (mono order id, customer cell with a square monogram chip, product, tabular date, tabular amount, a square mono status chip with matching square tick — data-viz tokens, destructive for cancelled — and a row-actions kebab) and a pagination footer (mono tabular summary + square Prev / numbered / Next buttons, active page ink-inverted, 'Prev' disabled). Toolbar buttons and pagination route through section-kit route links; Lakebed-backed row actions update order status in shared dashboard state. Use below the KPI / chart band to list latest transactions, orders, invoices or any recent records.",
  props: z.object({
    /** Table heading. */
    title: z.string().optional(),
    /** Table subtitle. */
    subtitle: z.string().optional(),
    /** Secondary toolbar button labels (e.g. Filter, Export), also used as routes. */
    actions: z.array(z.string()).optional(),
    /** Table column headers; an empty-string column right-aligns (used for the actions cell). */
    columns: z.array(z.string()).optional(),
    /** Route navigated to from row actions and pagination buttons. */
    rowTarget: z.string().optional(),
    rows: z
      .array(
        z.object({
          id: z.string().optional(),
          customer: z.string().optional(),
          robot: z.string().optional(),
          location: z.string().optional(),
          product: z.string().optional(),
          task: z.string().optional(),
          destination: z.string().optional(),
          date: z.string().optional(),
          eta: z.string().optional(),
          amount: z.string().optional(),
          priority: z.string().optional(),
          status: z.string().optional(),
          statusTone: z.enum(['emerald', 'sky', 'amber', 'red']).optional(),
        }),
      )
      .optional(),
    /** Pagination footer summary text. */
    summary: z.string().optional(),
    /** Pagination page labels (the "1" entry renders as the active page; "Prev" renders disabled). */
    pages: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  lakebed: dashboardLakebed,
  component: ({ props, lakebed }) => {
    const storedOrders = (lakebed.useQuery('orders') ??
      []) as DashboardOrderRecord[]
    const setOrderStatus = useKeyedLakebedMutation(lakebed, 'setOrderStatus')
    const title = props.title ?? 'Recent Orders'
    const subtitle = props.subtitle ?? 'Latest transactions from your store'
    const actions = props.actions?.length ? props.actions : ['Filter', 'Export']
    const columns = props.columns?.length
      ? props.columns
      : ['Order ID', 'Customer', 'Product', 'Date', 'Amount', 'Status', '']
    const rowTarget = props.rowTarget ?? 'Orders'
    const fallbackRows: DashboardDisplayRow[] = props.rows?.length
      ? props.rows
      : [
          {
            id: '#4921',
            customer: 'Sarah Chen',
            product: 'Wireless Headphones Pro',
            date: 'May 31, 2026',
            amount: '$249.00',
            status: 'Completed',
            statusTone: 'emerald' as const,
          },
          {
            id: '#4920',
            customer: 'James Wilson',
            product: 'Mechanical Keyboard',
            date: 'May 31, 2026',
            amount: '$189.50',
            status: 'Shipped',
            statusTone: 'sky' as const,
          },
          {
            id: '#4919',
            customer: 'Priya Patel',
            product: 'USB-C Docking Station',
            date: 'May 30, 2026',
            amount: '$129.99',
            status: 'Processing',
            statusTone: 'amber' as const,
          },
          {
            id: '#4918',
            customer: 'Marcus Johnson',
            product: ' 4K Monitor 27"',
            date: 'May 30, 2026',
            amount: '$449.00',
            status: 'Shipped',
            statusTone: 'sky' as const,
          },
          {
            id: '#4917',
            customer: 'Emma Davis',
            product: 'Ergonomic Chair',
            date: 'May 29, 2026',
            amount: '$349.00',
            status: 'Completed',
            statusTone: 'emerald' as const,
          },
          {
            id: '#4916',
            customer: 'Li Wei',
            product: 'Webcam 4K Pro',
            date: 'May 29, 2026',
            amount: '$199.00',
            status: 'Cancelled',
            statusTone: 'red' as const,
          },
        ]
    const rows: DashboardDisplayRow[] = storedOrders.length
      ? storedOrders.map((order) => ({
          amount: order.amount,
          customer: order.customer,
          date: order.date,
          dbId: order.id,
          id: order.orderId || order.id,
          product: order.product,
          status: order.status,
          statusTone: order.statusTone,
        }))
      : fallbackRows.map((row) => ({ ...row, dbId: '' }))
    const summary =
      props.summary ??
      (storedOrders.length
        ? `Showing ${storedOrders.length} live order${storedOrders.length === 1 ? '' : 's'}`
        : 'Showing 1–6 of 1,247 orders')
    const pages = props.pages?.length
      ? props.pages
      : ['Prev', '1', '2', '3', 'Next']

    // ── Square status chips (hairline border + tick, data-viz tokens). ──
    const statusTones: Record<string, { pill: string; dot: string }> = {
      emerald: {
        pill: 'border-chart-1/30 bg-chart-1/5 text-chart-1',
        dot: 'bg-chart-1',
      },
      sky: {
        pill: 'border-chart-2/30 bg-chart-2/5 text-chart-2',
        dot: 'bg-chart-2',
      },
      amber: {
        pill: 'border-chart-4/40 bg-chart-4/10 text-chart-4',
        dot: 'bg-chart-4',
      },
      red: {
        pill: 'border-destructive/30 bg-destructive/5 text-destructive',
        dot: 'bg-destructive',
      },
    }

    return (
      <Card
        variant="default"
        className={cn('rounded-none overflow-hidden', props.className, 'p-0')}
      >
        <div className="flex flex-col justify-between gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:p-5">
          <SectionHeading
            title={title}
            subtitle={subtitle}
            align="left"
            titleClassName="text-sm font-semibold tracking-tight md:text-sm"
            subtitleClassName="text-xs md:text-xs"
            className="gap-0.5"
          />
          <div className="flex gap-2">
            {actions.map((action) => (
              <NavbarRouteLink
                key={action}
                className="inline-flex items-center gap-1.5 rounded-none border border-border bg-card px-3 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground active:translate-y-px"
                href={action}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {action.toLowerCase().includes('export') ||
                  action.toLowerCase().includes('download') ? (
                    <>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </>
                  ) : (
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  )}
                </svg>
                {action}
              </NavbarRouteLink>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <DataTable className="w-full overflow-hidden rounded-none border-0 text-left text-sm">
            <table className="w-full text-left text-sm">
              <DataHeader asChild className="bg-transparent">
                <thead>
                  <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        className={cn(
                          'px-4 py-2.5 font-medium',
                          col === '' && 'text-right',
                        )}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
              </DataHeader>
              <DataBody asChild>
                <tbody className="divide-y divide-border">
                  {rows.map((row, index) => {
                    const id = row.id ?? `R-${index + 1}`
                    const customer =
                      row.customer ??
                      row.robot ??
                      row.location ??
                      row.destination ??
                      'Record'
                    const product =
                      row.product ??
                      row.task ??
                      row.destination ??
                      row.priority ??
                      'Task'
                    const date = row.date ?? row.eta ?? ''
                    const amount = row.amount ?? row.priority ?? ''
                    const status = row.status ?? 'Active'
                    const tone =
                      statusTones[row.statusTone ?? 'sky'] ?? statusTones.sky
                    const initial = customer.charAt(0).toUpperCase()
                    const rowActionKey = `complete:${row.dbId || id}`
                    const rowPending = setOrderStatus.isPending(rowActionKey)
                    return (
                      <DataRow key={id} asChild>
                        <tr className="transition-colors">
                          <DataTableCell className="px-4 py-3 font-mono text-xs font-medium tabular-nums text-foreground">
                            {id}
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <span className="grid size-6 shrink-0 place-items-center rounded-none border border-border bg-muted font-mono text-[10px] font-semibold text-foreground">
                                {initial}
                              </span>
                              <span className="text-foreground/80">
                                {customer}
                              </span>
                            </div>
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3 text-muted-foreground">
                            {product}
                          </DataTableCell>
                          <DataTableCell className="whitespace-nowrap px-4 py-3 tabular-nums text-muted-foreground">
                            {date}
                          </DataTableCell>
                          <DataTableCell className="whitespace-nowrap px-4 py-3 font-medium tabular-nums text-foreground">
                            {amount}
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3">
                            <span
                              className={cn(
                                'inline-flex items-center gap-1.5 rounded-none border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]',
                                tone.pill,
                              )}
                            >
                              <span
                                className={cn(
                                  'inline-block size-1.5',
                                  tone.dot,
                                )}
                              />
                              {status}
                            </span>
                          </DataTableCell>
                          <DataTableCell className="px-4 py-3 text-right">
                            {row.dbId ? (
                              <button
                                type="button"
                                aria-label={`Actions for ${id}`}
                                aria-busy={rowPending}
                                disabled={rowPending}
                                onClick={() => {
                                  void setOrderStatus.run(rowActionKey, {
                                    id: row.dbId ?? '',
                                    status: 'Completed',
                                    statusTone: 'emerald',
                                  })
                                }}
                                className="rounded-none text-muted-foreground transition-colors duration-150 hover:text-foreground active:translate-y-px"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </button>
                            ) : (
                              <NavbarRouteLink
                                href={rowTarget}
                                aria-label={`Actions for ${id}`}
                                className="rounded-none text-muted-foreground transition-colors duration-150 hover:text-foreground active:translate-y-px"
                              >
                                <svg
                                  width="16"
                                  height="16"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  aria-hidden="true"
                                >
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="19" cy="12" r="1" />
                                  <circle cx="5" cy="12" r="1" />
                                </svg>
                              </NavbarRouteLink>
                            )}
                          </DataTableCell>
                        </tr>
                      </DataRow>
                    )
                  })}
                </tbody>
              </DataBody>
            </table>
          </DataTable>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
          <p className="font-mono text-[11px] tabular-nums text-muted-foreground">
            {summary}
          </p>
          <div className="flex gap-1">
            {pages.map((label) => {
              const isActive = label === '1'
              const disabled = label.toLowerCase() === 'prev'
              return disabled ? (
                <span
                  key={label}
                  aria-disabled="true"
                  className={cn(
                    'rounded-none border px-2.5 py-1.5 font-mono text-[11px] tabular-nums transition-colors',
                    'cursor-not-allowed border-border bg-card text-muted-foreground/40',
                  )}
                >
                  {label}
                </span>
              ) : (
                <NavbarRouteLink
                  key={label}
                  className={cn(
                    'rounded-none border px-2.5 py-1.5 font-mono text-[11px] tabular-nums transition-colors duration-150 active:translate-y-px',
                    isActive
                      ? 'border-foreground bg-foreground text-background'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                  href={rowTarget}
                >
                  {label}
                </NavbarRouteLink>
              )
            })}
          </div>
        </div>
      </Card>
    )
  },
})
