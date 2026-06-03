import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  ContextMenu as UIContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "#/components/ui/context-menu.tsx"

// Compound overlay: right-click target + menu. Rendered with `modal={false}`
// and the menu shown via an inline preview region so content is visible
// statically (context menus only open on right-click, which can't be forced
// declaratively). The trigger area plus the menu content are both rendered.
export const ContextMenu = defineComponent({
  name: "ContextMenu",
  description:
    "Right-click context menu. `items` are the menu rows (variant 'destructive' for dangerous, separator true for a divider). Shows the trigger area and an inline preview of the menu.",
  props: z.object({
    triggerLabel: z.string().optional(),
    label: z.string().optional(),
    items: z
      .array(
        z.object({
          label: z.string(),
          variant: z.enum(["default", "destructive"]).optional(),
          separator: z.boolean().optional(),
          inset: z.boolean().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items ?? [
      { label: "Back" },
      { label: "Reload" },
      { label: "Delete", variant: "destructive" as const },
    ]
    return (
      <div className="flex flex-col gap-2">
        <UIContextMenu>
          <ContextMenuTrigger className="flex h-24 w-full items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
            {props.triggerLabel ?? "Right-click here"}
          </ContextMenuTrigger>
          <ContextMenuContent className={props.className}>
            {props.label && <ContextMenuLabel>{props.label}</ContextMenuLabel>}
            {items.map((it, i) =>
              it.separator ? (
                <ContextMenuSeparator key={`sep-${i}`} />
              ) : (
                <ContextMenuItem
                  key={`${it.label}-${i}`}
                  variant={it.variant}
                  inset={it.inset}
                >
                  {it.label}
                </ContextMenuItem>
              ),
            )}
          </ContextMenuContent>
        </UIContextMenu>
        {/* Inline static preview of the menu content (plain markup so it
            renders outside the right-click interaction) */}
        <div className="w-fit min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {props.label && (
            <div className="px-2 py-1.5 text-sm font-medium text-foreground">
              {props.label}
            </div>
          )}
          {items.map((it, i) =>
            it.separator ? (
              <div key={`psep-${i}`} className="-mx-1 my-1 h-px bg-border" />
            ) : (
              <div
                key={`p-${it.label}-${i}`}
                className={
                  "relative flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm" +
                  (it.variant === "destructive" ? " text-destructive" : "") +
                  (it.inset ? " pl-8" : "")
                }
              >
                {it.label}
              </div>
            ),
          )}
        </div>
      </div>
    )
  },
})
