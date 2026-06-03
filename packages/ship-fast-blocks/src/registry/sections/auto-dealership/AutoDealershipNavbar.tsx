import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AutoDealershipNavbar — sticky, blurred top navigation bar for an auto
 * dealership / used-car site. A border-bottomed header pinned to the top with a
 * wordmark brand button on the left, a horizontal set of nav links in the
 * center (desktop), and a phone-number link plus a solid primary "Book Test
 * Drive" CTA on the right. Every nav link, the phone, and the CTA route through
 * useNavigate so labels can drive page-switching. Use as the sticky site header
 * for car dealerships, used-car lots, certified pre-owned sellers, auto sales
 * groups, or EV/hybrid showrooms. Renders fully with no props via baked-in
 * "Meridian Motors" defaults.
 */
export const AutoDealershipNavbar = defineComponent({
  name: "AutoDealershipNavbar",
  description:
    "Sticky backdrop-blurred top navigation bar for an auto dealership / used-car site: a border-bottomed header pinned to the top with a wordmark brand button on the left, horizontal nav links in the center (desktop), and a phone-number link plus a solid primary 'Book Test Drive' CTA on the right. Nav links, phone, and CTA route through useNavigate for page-switching. Use as the sticky site header for car dealerships, used-car lots, certified pre-owned sellers, auto sales groups, or EV/hybrid showrooms.",
  props: z.object({
    /** Dealership brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Nav link labels; the first item also drives the brand/home target. */
    nav: z.array(z.string()).optional(),
    /** Phone number shown as a routable link (desktop). */
    phone: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Meridian Motors"
    const nav = props.nav?.length
      ? props.nav
      : ["Inventory", "Financing", "About", "Reviews", "FAQ"]
    const phone = props.phone ?? "(555) 0127-456"
    const cta = props.cta ?? "Book Test Drive"

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl"
            >
              {brand}
            </button>
            <div className="hidden items-center gap-8 md:flex">
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
            </div>
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(phone)}
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {phone}
              </button>
              <button
                type="button"
                onClick={() => go(cta)}
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {cta}
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
