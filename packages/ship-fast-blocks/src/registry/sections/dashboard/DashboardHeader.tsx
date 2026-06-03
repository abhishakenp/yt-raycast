import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * DashboardHeader — a page-title header row for a SaaS admin dashboard. A
 * responsive flex band with a bold title + muted subtitle on the left and two
 * action buttons on the right: an outline secondary action and a gradient indigo
 * primary action (prefixed with a "+"). Both actions route through useNavigate.
 * Use as the heading row at the top of a dashboard content area — above KPI
 * cards, tables or charts — to label the view and surface its key actions.
 * Renders fully with no props via baked-in "Dashboard" defaults.
 */
export const DashboardHeader = defineComponent({
  name: "DashboardHeader",
  description:
    "A page-title header row for a SaaS admin dashboard: a responsive flex band with a bold title + muted subtitle on the left and two action buttons on the right — an outline secondary action and a gradient indigo primary action (prefixed with a '+'). Both actions route through useNavigate. Use as the heading row at the top of a dashboard content area, above KPI cards, tables or charts, to label the view and surface its key actions.",
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
  component: ({ props }) => {
    const go = useNavigate()
    const title = props.title ?? "Dashboard"
    const subtitle =
      props.subtitle ??
      "Welcome back, Alex. Here's what's happening with your store."
    const secondaryAction = props.secondaryAction ?? "Export"
    const primaryAction = props.primaryAction ?? "New Order"

    return (
      <div
        className={cn(
          "flex flex-col justify-between gap-4 sm:flex-row sm:items-end",
          props.className,
        )}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => go(secondaryAction)}
            className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            {secondaryAction}
          </button>
          <button
            type="button"
            onClick={() => go(primaryAction)}
            className="rounded-lg bg-gradient-to-br from-primary to-primary/80 px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/30 transition hover:-translate-y-px hover:shadow-md hover:shadow-primary/40"
          >
            + {primaryAction}
          </button>
        </div>
      </div>
    )
  },
})
