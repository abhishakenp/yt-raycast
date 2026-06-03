import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * AgencyNavbar — fixed, translucent top navigation bar for a creative
 * digital-agency / studio site. A blurred, border-bottomed header pinned to the
 * top of the viewport: a gradient brand-initial logo tile beside the studio name
 * on the left, a horizontal set of nav links plus a pill-shaped primary CTA on
 * the right (desktop), and a hamburger menu button on mobile. Every link and the
 * CTA route through useNavigate so labels can drive page-switching. Use as the
 * sticky site header for agencies, design studios, branding/marketing shops,
 * freelance creatives, production houses, or any moody premium landing page.
 * Renders fully with no props via baked-in "Studio Rise" defaults.
 */
export const AgencyNavbar = defineComponent({
  name: "AgencyNavbar",
  description:
    "Fixed translucent top navigation bar for a creative agency / design studio site: backdrop-blurred, border-bottomed header pinned to the top with a gradient brand-initial logo tile + studio name on the left, horizontal nav links and a pill-shaped primary CTA on the right (desktop), and a hamburger menu button on mobile. Links and CTA route through useNavigate for page-switching. Use as the sticky site header for agencies, studios, branding/marketing shops, freelance creatives, or production houses.",
  props: z.object({
    /** Brand / studio name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the CTA target. */
    nav: z.array(z.string()).optional(),
    /** Pill-shaped primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Studio Rise"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Work", "About", "Contact"]
    const cta = props.cta ?? "Start a project"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground",
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
          "fixed inset-x-0 top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <button
            type="button"
            onClick={() => go(nav[0])}
            className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
          >
            <LogoMark className="size-8 text-sm" />
            {brand}
          </button>
          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {nav.slice(0, -1).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => go(label)}
                className="transition-colors hover:text-foreground"
              >
                {label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(nav[nav.length - 1])}
              className="rounded-full bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {cta}
            </button>
          </div>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => go(nav[0])}
            className="p-2 text-muted-foreground md:hidden"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </header>
    )
  },
})
