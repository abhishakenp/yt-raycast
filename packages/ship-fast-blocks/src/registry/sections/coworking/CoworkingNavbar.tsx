import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CoworkingNavbar — sticky top navigation with brand mark, nav links, and dual
 * CTAs for a coworking / workspace site. Translated-light with border-bottom
 * backdrop-blur; brand tile + name on the left, horizontal text links in the
 * center, and a secondary + primary CTA pair on the right (desktop) plus a
 * hamburger on mobile. Home button routes to brand; nav links route through
 * useNavigate; the mobile menu button routes to the first nav item.
 * Use as the sticky header for coworking spaces, shared offices, flex-office
 * platforms, or any membership-driven workspace brand.
 */
export const CoworkingNavbar = defineComponent({
  name: "CoworkingNavbar",
  description:
    "Sticky top navigation bar for a coworking / workspace site: backdrop-blurred, border-bottomed header with a rounded brand-initial logo tile + workspace name on the left, horizontal nav links in the center, a secondary + primary CTA pair on the right (desktop), and a hamburger menu on mobile. All links route through useNavigate. Use as the sticky site header for coworking spaces, shared offices, flex-office platforms, or workspace membership pages.",
  props: z.object({
    /** Brand / workspace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Top navbar link labels routing through useNavigate. */
    nav: z.array(z.string()).optional(),
    /** Small secondary CTA label on the right. */
    secondaryCta: z.string().optional(),
    /** Primary pill CTA label on the right. */
    primaryCta: z.string().optional(),
    /** Navigation target for the brand logo button. Defaults to brand name. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Northside"
    const nav = props.nav?.length
      ? props.nav
      : ["Spaces", "Amenities", "Pricing", "Gallery", "FAQ"]
    const secondaryCta = props.secondaryCta ?? "Book a Tour"
    const primaryCta = props.primaryCta ?? "Get Started"
    const homeTarget = props.homeTarget ?? brand

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-semibold text-primary-foreground",
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
          "sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm",
          props.className,
        )}
      >
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-sm" />
              <span className="text-lg font-semibold text-foreground">
                {brand}
              </span>
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
                onClick={() => go(secondaryCta)}
                className="hidden items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80 sm:inline-flex"
              >
                {secondaryCta}
              </button>
              <button
                type="button"
                onClick={() => go(primaryCta)}
                className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {primaryCta}
              </button>
              <button
                type="button"
                aria-label="Open menu"
                onClick={() => go(nav[0])}
                className="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              >
                <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
