import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DashboardOrdersTable — a recent-orders data table card for a SaaS admin
 * dashboard. A bordered card with a header (title + subtitle and a row of
 * toolbar buttons whose icon is chosen from the label — download for Export,
 * funnel otherwise), a responsive table (order id, a customer cell with a
 * gradient initial avatar, product, date, amount, a colored status pill with a
 * matching dot, and a row-actions kebab) and a pagination footer (summary text +
 * Prev / numbered / Next buttons, with "1" active and "Prev" disabled). Toolbar
 * buttons, row actions and pagination route through useNavigate. Use below the
 * KPI / chart band to list latest transactions, orders, invoices or any recent
 * records. Renders fully with no props via baked-in default orders.
 */
export const DashboardOrdersTable = defineComponent({
  name: "DashboardOrdersTable",
  description:
    "A recent-orders data table card for a SaaS admin dashboard: a bordered card with a header (title + subtitle and toolbar buttons whose icon is chosen from the label — download for Export, funnel otherwise), a responsive table (order id, customer cell with a gradient initial avatar, product, date, amount, a colored status pill with a matching dot, and a row-actions kebab) and a pagination footer (summary text + Prev / numbered / Next buttons, '1' active, 'Prev' disabled). Toolbar buttons, row actions and pagination route through useNavigate. Use below the KPI / chart band to list latest transactions, orders, invoices or any recent records.",
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
          statusTone: z.enum(["emerald", "sky", "amber", "red"]).optional(),
        }),
      )
      .optional(),
    /** Pagination footer summary text. */
    summary: z.string().optional(),
    /** Pagination page labels (the "1" entry renders as the active page; "Prev" renders disabled). */
    pages: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const title = props.title ?? "Recent Orders"
    const subtitle = props.subtitle ?? "Latest transactions from your store"
    const actions = props.actions?.length ? props.actions : ["Filter", "Export"]
    const columns = props.columns?.length
      ? props.columns
      : ["Order ID", "Customer", "Product", "Date", "Amount", "Status", ""]
    const rowTarget = props.rowTarget ?? "Orders"
    const rows = props.rows?.length
      ? props.rows
      : [
          {
            id: "#4921",
            customer: "Sarah Chen",
            product: "Wireless Headphones Pro",
            date: "May 31, 2026",
            amount: "$249.00",
            status: "Completed",
            statusTone: "emerald" as const,
          },
          {
            id: "#4920",
            customer: "James Wilson",
            product: "Mechanical Keyboard",
            date: "May 31, 2026",
            amount: "$189.50",
            status: "Shipped",
            statusTone: "sky" as const,
          },
          {
            id: "#4919",
            customer: "Priya Patel",
            product: "USB-C Docking Station",
            date: "May 30, 2026",
            amount: "$129.99",
            status: "Processing",
            statusTone: "amber" as const,
          },
          {
            id: "#4918",
            customer: "Marcus Johnson",
            product: ' 4K Monitor 27"',
            date: "May 30, 2026",
            amount: "$449.00",
            status: "Shipped",
            statusTone: "sky" as const,
          },
          {
            id: "#4917",
            customer: "Emma Davis",
            product: "Ergonomic Chair",
            date: "May 29, 2026",
            amount: "$349.00",
            status: "Completed",
            statusTone: "emerald" as const,
          },
          {
            id: "#4916",
            customer: "Li Wei",
            product: "Webcam 4K Pro",
            date: "May 29, 2026",
            amount: "$199.00",
            status: "Cancelled",
            statusTone: "red" as const,
          },
        ]
    const summary = props.summary ?? "Showing 1–6 of 1,247 orders"
    const pages = props.pages?.length
      ? props.pages
      : ["Prev", "1", "2", "3", "Next"]

    // ── Status pill tints. ──
    const statusTones: Record<string, { pill: string; dot: string }> = {
      emerald: { pill: "bg-chart-1/10 text-chart-1", dot: "bg-chart-1" },
      sky: { pill: "bg-chart-2/10 text-chart-2", dot: "bg-chart-2" },
      amber: { pill: "bg-chart-4/15 text-chart-4", dot: "bg-chart-4" },
      red: { pill: "bg-destructive/10 text-destructive", dot: "bg-destructive" },
    }

    return (
      <div
        className={cn(
          "overflow-hidden rounded-xl border border-border bg-card",
          props.className,
        )}
      >
        <div className="flex flex-col justify-between gap-3 border-b border-border/60 p-5 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-semibold text-foreground">{title}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          </div>
          <div className="flex gap-2">
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                onClick={() => go(action)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-xs font-medium text-muted-foreground transition hover:bg-muted"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {action.toLowerCase().includes("export") ||
                  action.toLowerCase().includes("download") ? (
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
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-5 py-3 font-semibold",
                      col === "" && "text-right",
                    )}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {rows.map((row, index) => {
                const id = row.id ?? `R-${index + 1}`
                const customer = row.customer ?? row.robot ?? row.location ?? row.destination ?? "Record"
                const product = row.product ?? row.task ?? row.destination ?? row.priority ?? "Task"
                const date = row.date ?? row.eta ?? ""
                const amount = row.amount ?? row.priority ?? ""
                const status = row.status ?? "Active"
                const tone = statusTones[row.statusTone ?? "sky"]
                const initial = customer.charAt(0).toUpperCase()
                return (
                  <tr
                    key={id}
                    className="transition-colors hover:bg-muted/60"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary/70 to-primary text-[0.625rem] font-bold text-primary-foreground">
                          {initial}
                        </span>
                        <span className="text-foreground/80">
                          {customer}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {product}
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">
                      {date}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-foreground">
                      {amount}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium",
                          tone.pill,
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block size-2 rounded-full",
                            tone.dot,
                          )}
                        />
                        {status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        type="button"
                        aria-label={`Actions for ${id}`}
                        onClick={() => go(rowTarget)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3">
          <p className="text-xs text-muted-foreground">{summary}</p>
          <div className="flex gap-1">
            {pages.map((label) => {
              const isActive = label === "1"
              const disabled = label.toLowerCase() === "prev"
              return (
                <button
                  key={label}
                  type="button"
                  disabled={disabled}
                  onClick={() => go(rowTarget)}
                  className={cn(
                    "rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                    isActive
                      ? "border-primary/20 bg-primary/10 text-primary"
                      : disabled
                        ? "cursor-not-allowed border-border bg-card text-muted-foreground/50"
                        : "border-border bg-card text-muted-foreground hover:bg-muted",
                  )}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  },
})
