import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MarketingAgencyNavbar — sticky, translucent top navigation bar for a growth /
 * digital marketing-agency site. A backdrop-blurred, border-bottomed header
 * pinned to the top with a layered-diamond brand glyph beside the agency name on
 * the left, horizontal nav links plus a rounded pill primary CTA on the right
 * (desktop), and a hamburger menu button on mobile. The last nav item drives the
 * CTA target; every link routes through useNavigate for page-switching. Use as
 * the sticky site header for marketing / growth agencies, SEO / paid-ads shops,
 * lead-gen consultancies, or B2B SaaS growth firms. Renders fully with no props.
 */
export const MarketingAgencyNavbar = defineComponent({
  name: "MarketingAgencyNavbar",
  description:
    "Sticky translucent top navigation bar for a growth / digital marketing-agency site: backdrop-blurred, border-bottomed header pinned to the top with a layered-diamond brand glyph + agency name on the left, horizontal nav links and a rounded pill primary CTA on the right (desktop), and a hamburger menu button on mobile. The last nav item drives the CTA target; links route through useNavigate for page-switching. Use as the sticky site header for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.",
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the pill CTA target. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nexus Growth"
    const nav = props.nav?.length
      ? props.nav
      : ["Services", "Case Studies", "Pricing", "FAQ", "Get Started"]
    const navCta = nav[nav.length - 1]

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <LogoMark className="size-8 text-foreground" />
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
                onClick={() => go(navCta)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {navCta}
              </button>
            </div>
            <button
              type="button"
              aria-label="Menu"
              onClick={() => go(nav[0])}
              className="p-2 text-foreground md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
    )
  },
})
