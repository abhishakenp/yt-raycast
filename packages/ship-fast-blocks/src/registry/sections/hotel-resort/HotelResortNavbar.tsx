import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * HotelResortNavbar — fixed, translucent top navigation bar for a luxury
 * hotel / resort & spa site. A backdrop-blurred, border-bottomed header pinned
 * to the top: a circular brand-initial logo mark beside the resort name on the
 * left, a horizontal set of nav links in the center (desktop), and a phone
 * number plus a solid "Book Now" CTA on the right, with a hamburger menu button
 * on mobile. Every link, the phone, and the CTA route through useNavigate so
 * labels can drive page-switching. Use as the sticky site header for hotels,
 * beach or coastal resorts, spa retreats, boutique inns, villas, or wellness
 * destinations. Renders fully with no props via baked-in "Azure Coast" defaults.
 */
export const HotelResortNavbar = defineComponent({
  name: "HotelResortNavbar",
  description:
    "Fixed translucent top navigation bar for a luxury hotel / resort & spa site: backdrop-blurred, border-bottomed header pinned to the top with a circular brand-initial logo mark + resort name on the left, horizontal nav links in the center (desktop), and a phone number plus a solid Book Now CTA on the right, with a hamburger menu button on mobile. Links, phone and CTA route through useNavigate for page-switching. Use as the sticky site header for hotels, beach or coastal resorts, spa retreats, boutique inns, villas, or wellness destinations.",
  props: z.object({
    /** Resort / brand name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Top-level navbar link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Phone number shown on the right (desktop). */
    phone: z.string().optional(),
    /** Solid right-side CTA label. */
    cta: z.string().optional(),
    /** Navigation target the CTA routes to. */
    bookTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Azure Coast"
    const nav = props.nav?.length
      ? props.nav
      : ["Rooms & Suites", "Amenities", "Gallery", "Dining", "Contact"]
    const phone = props.phone ?? "1-800-555-1234"
    const cta = props.cta ?? "Book Now"
    const bookTarget = props.bookTarget ?? "Check Availability"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full font-light",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex h-20 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-3"
            >
              <LogoMark className="size-10 bg-foreground text-lg text-background" />
              <span className="text-xl font-medium tracking-tight">
                {brand}
              </span>
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
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => go(phone)}
                className="hidden text-sm text-muted-foreground lg:block"
              >
                {phone}
              </button>
              <button
                type="button"
                onClick={() => go(bookTarget)}
                className="rounded-md bg-foreground px-6 py-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
              >
                {cta}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 md:hidden"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>
    )
  },
})
