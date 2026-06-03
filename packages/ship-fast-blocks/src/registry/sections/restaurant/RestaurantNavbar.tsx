import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { CalendarCheck, Soup } from "lucide-react"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * RestaurantNavbar — blurred, translucent cream sticky header for a warm,
 * upscale food brand (ramen shop, izakaya, noodle bar, bistro, cafe). A
 * backdrop-blurred, border-bottomed bar pinned to the top: a bowl-icon serif
 * brand logo on the left, a horizontal set of nav links in the center
 * (desktop), and a "Reserve a Table" calendar CTA on the right that collapses
 * to a compact button on mobile. The logo and every nav item / CTA route
 * through useNavigate so labels can drive page-switching. Use as the sticky
 * site header for cozy premium restaurants where reservations matter. Renders
 * fully with no props via baked-in "Kaze Ramen" defaults.
 */
export const RestaurantNavbar = defineComponent({
  name: "RestaurantNavbar",
  description:
    "Blurred translucent cream sticky header for a warm, upscale food brand (ramen shop, izakaya, noodle bar, bistro, cafe): a backdrop-blurred, border-bottomed bar pinned to the top with a bowl-icon serif brand logo on the left, horizontal nav links in the center (desktop), and a 'Reserve a Table' calendar CTA on the right that collapses to a compact button on mobile. The logo, nav items, and CTA all route through useNavigate for page-switching. Use as the sticky site header for cozy premium restaurants, sushi counters, or any inviting food brand where reservations matter.",
  props: z.object({
    /** Brand / restaurant name shown beside the bowl logo. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (match real route labels for nav to switch pages). */
    nav: z.array(z.string()).optional(),
    /** Reserve-a-table CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Kaze Ramen"
    const nav = props.nav?.length
      ? props.nav
      : ["Our Story", "Menu", "Gallery", "Hours & Location"]
    const cta = props.cta ?? "Reserve a Table"

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border/60 bg-background/90 backdrop-blur-md backdrop-saturate-150",
          props.className,
        )}
      >
        <div className="mx-auto flex h-[72px] w-[min(1200px,92vw)] items-center justify-between">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2.5 font-serif text-2xl font-bold tracking-tight"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
            >
              <Soup className="size-4.5" />
            </span>
            {brand}
          </button>

          <nav className="hidden items-center gap-8 md:flex">
            {nav.map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => go(cta)}
            className="hidden items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:-translate-y-px hover:bg-primary/90 md:inline-flex"
          >
            <CalendarCheck className="size-4" />
            {cta}
          </button>

          <button
            type="button"
            onClick={() => go(cta)}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 md:hidden"
          >
            {cta}
          </button>
        </div>
      </header>
    )
  },
})
