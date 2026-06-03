import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { Button } from "#/components/ui/button.tsx"
import {
  DropdownMenu as UIDropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "#/components/ui/dropdown-menu.tsx"

// Compound overlay: flatten trigger + content + items into one node.
// Rendered `defaultOpen` so the menu list is statically visible.
export const DropdownMenu = defineComponent({
  name: "DropdownMenu",
  description:
    "Button that opens a menu of actions. `items` are the menu rows (set variant 'destructive' for dangerous actions, separator true for a divider). Open by default for preview.",
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
      { label: "Profile" },
      { label: "Settings" },
      { label: "Log out", variant: "destructive" as const },
    ]
    return (
      <UIDropdownMenu defaultOpen>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">{props.triggerLabel ?? "Open menu"}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className={props.className}>
          {props.label && <DropdownMenuLabel>{props.label}</DropdownMenuLabel>}
          {items.map((it, i) =>
            it.separator ? (
              <DropdownMenuSeparator key={`sep-${i}`} />
            ) : (
              <DropdownMenuItem
                key={`${it.label}-${i}`}
                variant={it.variant}
                inset={it.inset}
              >
                {it.label}
              </DropdownMenuItem>
            ),
          )}
        </DropdownMenuContent>
      </UIDropdownMenu>
    )
  },
})
