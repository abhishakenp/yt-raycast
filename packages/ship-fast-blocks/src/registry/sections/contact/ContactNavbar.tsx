import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ContactNavbar — glassy sticky top navigation bar for a contact / support page.
 * A blurred, border-bottomed header pinned to the top with a gradient orbit-glyph
 * logo tile + brand name on the left, a horizontal set of nav links in the center
 * (desktop), and a rounded primary CTA on the right. Every link and the CTA route
 * through useNavigate so labels drive page-switching. Use as the sticky site header
 * for SaaS, agency, or startup contact pages. Renders fully with no props via
 * baked-in "Orbit Digital" defaults.
 */
export const ContactNavbar = defineComponent({
  name: "ContactNavbar",
  description:
    "Glassy sticky top navigation bar for a contact / support page: a blurred, border-bottomed header with a gradient orbit-glyph logo tile + brand name on the left, horizontal nav links in the center (desktop), and a rounded primary CTA on the right. Every link and the CTA route through useNavigate. Use as the sticky site header for SaaS, agency, or startup contact pages.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels rendered as center links. */
    nav: z.array(z.string()).optional(),
    /** Target routed to when the brand logo / name is clicked. */
    homeTarget: z.string().optional(),
    /** CTA button label. */
    ctaLabel: z.string().optional(),
    /** Target routed to when the CTA is clicked. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Orbit Digital"
    const nav = props.nav?.length
      ? props.nav
      : ["Home", "Features", "Pricing", "About", "Contact"]
    const homeTarget = props.homeTarget ?? nav[0] ?? "Home"
    const ctaLabel = props.ctaLabel ?? "Get Started"
    const ctaTarget = props.ctaTarget ?? "Contact"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.4)]",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <ellipse cx="12" cy="12" rx="10" ry="4.5" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          "sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md",
          props.className,
        )}
      >
        <nav className="mx-auto flex h-16 max-w-[1160px] items-center justify-between px-6">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
          >
            <LogoMark />
            {brand}
          </button>
          <ul className="hidden items-center gap-8 text-[0.9375rem] font-medium text-muted-foreground md:flex">
            {nav.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  onClick={() => go(label)}
                  className="transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go(ctaTarget)}
            className="rounded-[10px] bg-primary px-5 py-2.5 text-[0.9375rem] font-semibold text-primary-foreground shadow-[0_4px_12px_rgba(0,0,0,0.3)] transition-all hover:-translate-y-px hover:bg-primary/90 hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]"
          >
            {ctaLabel}
          </button>
        </nav>
      </header>
    )
  },
})
