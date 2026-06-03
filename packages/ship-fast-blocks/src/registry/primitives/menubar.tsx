import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import {
  Menubar as UIMenubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "#/components/ui/menubar.tsx"

// Compound overlay: app-style horizontal menubar. `menus` are the top-level
// triggers, each with its own dropdown `items`. The first menu is opened by
// default (via `defaultValue`) so its content is statically visible.
export const Menubar = defineComponent({
  name: "Menubar",
  description:
    "Horizontal application menu bar. `menus` are top-level menus, each with `items` (variant 'destructive', separator true for a divider, optional shortcut text). First menu opens by default for preview.",
  props: z.object({
    menus: z
      .array(
        z.object({
          label: z.string(),
          items: z.array(
            z.object({
              label: z.string(),
              variant: z.enum(["default", "destructive"]).optional(),
              shortcut: z.string().optional(),
              separator: z.boolean().optional(),
              inset: z.boolean().optional(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const menus = props.menus ?? [
      {
        label: "File",
        items: [
          { label: "New Tab", shortcut: "⌘T" },
          { label: "New Window", shortcut: "⌘N" },
          { label: "Share", separator: true },
          { label: "Print", shortcut: "⌘P" },
        ],
      },
      {
        label: "Edit",
        items: [
          { label: "Undo", shortcut: "⌘Z" },
          { label: "Redo", shortcut: "⇧⌘Z" },
        ],
      },
      {
        label: "View",
        items: [{ label: "Reload" }, { label: "Toggle Fullscreen" }],
      },
    ]
    return (
      <UIMenubar defaultValue={`menu-0`} className={props.className}>
        {menus.map((menu, mi) => (
          <MenubarMenu key={`${menu.label}-${mi}`} value={`menu-${mi}`}>
            <MenubarTrigger>{menu.label}</MenubarTrigger>
            <MenubarContent>
              {menu.items.map((it, i) =>
                it.separator ? (
                  <MenubarSeparator key={`sep-${i}`} />
                ) : (
                  <MenubarItem
                    key={`${it.label}-${i}`}
                    variant={it.variant}
                    inset={it.inset}
                  >
                    {it.label}
                    {it.shortcut && (
                      <MenubarShortcut>{it.shortcut}</MenubarShortcut>
                    )}
                  </MenubarItem>
                ),
              )}
            </MenubarContent>
          </MenubarMenu>
        ))}
      </UIMenubar>
    )
  },
})
