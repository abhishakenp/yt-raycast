import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import {
  NavigationMenu as UINavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "#/components/ui/navigation-menu.tsx"

// Compound primitive: flatten NavigationMenu/List/Item/Trigger/Content/Link.
// Radix Content is collapsed until hover, so for a STATIC visible preview each
// top-level item renders its label as a trigger-styled header with its `links`
// listed inline beneath it (using NavigationMenuLink). Plain items (no links)
// render as a single link styled like a trigger.
export const NavigationMenu = defineComponent({
  name: "NavigationMenu",
  description:
    "Top navigation menu. Each `items` entry is a top-level label; entries with `links` show a labelled list of links (with optional descriptions) inline beneath them.",
  props: z.object({
    items: z
      .array(
        z.object({
          label: z.string(),
          href: z.string().optional(),
          links: z
            .array(
              z.object({
                label: z.string(),
                href: z.string().optional(),
                description: z.string().optional(),
              }),
            )
            .optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            label: "Getting started",
            links: [
              {
                label: "Introduction",
                href: "#",
                description: "Re-usable components built with Tailwind.",
              },
              {
                label: "Installation",
                href: "#",
                description: "How to install dependencies and structure.",
              },
            ],
          },
          { label: "Docs", href: "#" },
          { label: "Pricing", href: "#" },
        ]
    return (
      <UINavigationMenu viewport={false} className={cn("max-w-full", props.className)}>
        <NavigationMenuList className="flex-wrap items-start gap-3">
          {items.map((item, i) => (
            <NavigationMenuItem key={i} className="flex flex-col gap-1">
              {item.links?.length ? (
                <>
                  <span className={cn(navigationMenuTriggerStyle(), "justify-start")}>
                    {item.label}
                  </span>
                  <ul className="grid gap-1 rounded-md border bg-popover p-2 text-popover-foreground">
                    {item.links.map((link, j) => (
                      <li key={j}>
                        <NavigationMenuLink href={link.href ?? "#"}>
                          <span className="text-sm font-medium leading-none">
                            {link.label}
                          </span>
                          {link.description && (
                            <span className="text-sm leading-snug text-muted-foreground">
                              {link.description}
                            </span>
                          )}
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <NavigationMenuLink
                  href={item.href ?? "#"}
                  className={navigationMenuTriggerStyle()}
                >
                  {item.label}
                </NavigationMenuLink>
              )}
            </NavigationMenuItem>
          ))}
        </NavigationMenuList>
      </UINavigationMenu>
    )
  },
})
