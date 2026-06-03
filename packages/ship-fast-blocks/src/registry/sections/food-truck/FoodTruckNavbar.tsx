import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * FoodTruckNavbar — fixed, backdrop-blurred top navigation bar for a gourmet
 * food-truck / street-food site. A border-bottomed header pinned to the top with a
 * circular monogram logo tile (brand initials) + brand wordmark on the left,
 * horizontal muted-to-foreground nav links on the right (desktop), a filled pill CTA
 * built from the LAST nav item (e.g. "Book Catering"), and a hamburger menu button on
 * mobile. Every link and CTA routes through useNavigate so PageSwitch can swap pages.
 * Use as the sticky site header for food trucks, street-food vendors, taco/burger/bowl
 * concepts, pop-up kitchens or catering businesses.
 */
export const FoodTruckNavbar = defineComponent({
  name: "FoodTruckNavbar",
  description:
    "Fixed, backdrop-blurred top navigation bar for a gourmet food-truck / street-food site: a border-bottomed header pinned to the top with a circular monogram logo tile (brand initials) and brand wordmark on the left, horizontal muted-to-foreground nav links on the right (desktop), a filled pill CTA built from the LAST nav item (e.g. 'Book Catering'), and a hamburger menu button on mobile. All links and CTAs route through useNavigate. Use as the sticky site header for food trucks, street-food vendors, taco / burger / bowl concepts, pop-up kitchens or catering businesses.",
  props: z.object({
    /** Brand / food-truck name; initials form the monogram. */
    brand: z.string().optional(),
    /** Nav link labels; the LAST item becomes the filled pill CTA. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Curbside Kitchen"
    const nav = props.nav?.length
      ? props.nav
      : ["Menu", "Locations", "Catering", "FAQ", "Book Catering"]
    const lastNav = nav[nav.length - 1]

    const initials = brand
      .split(/\s+/)
      .map((w) => w.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase()

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2"
          >
            <span
              className="grid size-8 place-items-center rounded-full bg-foreground text-xs font-bold text-background"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="text-lg font-semibold tracking-tight">
              {brand}
            </span>
          </button>
          <div className="hidden items-center gap-8 md:flex">
            {nav.slice(0, -1).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(lastNav)}
              className="rounded-full bg-foreground px-4 py-2 text-sm text-background transition-colors hover:bg-foreground/90"
            >
              {lastNav}
            </button>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => go(nav[0])}
            className="p-2 text-muted-foreground md:hidden"
          >
            <svg
              className="size-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </nav>
      </header>
    )
  },
})
