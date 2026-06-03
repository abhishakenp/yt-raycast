import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ComingSoonNavbar — minimal top navigation bar for a "launching soon" / waitlist
 * pre-launch landing page. A clean, airy header with the brand name on the left
 * and two text-link nav items on the right (desktop); the last nav item gets an
 * underlined "active" treatment. Every link routes through useNavigate so labels
 * can drive page-switching. Use as the site header for SaaS waitlists, app
 * pre-launch pages, beta sign-up landers, or any minimal coming-soon page.
 * Renders fully with no props via baked-in "Nexus" defaults.
 */
export const ComingSoonNavbar = defineComponent({
  name: "ComingSoonNavbar",
  description:
    "Minimal top navigation bar for a 'launching soon' / waitlist pre-launch landing page: clean airy header with the brand name on the left and two text-link nav items on the right (desktop), with the last nav item underlined as the active state. Links route through useNavigate for page-switching. Use as the site header for SaaS waitlists, app pre-launch pages, beta sign-up landers, or minimal coming-soon pages.",
  props: z.object({
    /** Brand / product name shown in the navbar. */
    brand: z.string().optional(),
    /** Nav link labels (first is the subtle link, last is the underlined CTA). */
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nexus"
    const links = props.links?.length
      ? props.links
      : ["Features", "Join Waitlist"]

    return (
      <nav
        className={cn(
          "w-full px-4 py-6 sm:px-6 lg:px-8 xl:px-12",
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <button
            type="button"
            onClick={() => go(brand)}
            aria-label={`${brand} Home`}
            className="text-xl font-semibold tracking-tight text-foreground"
          >
            {brand}
          </button>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => go(links[0])}
              className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
            >
              {links[0]}
            </button>
            <button
              type="button"
              onClick={() => go(links[links.length - 1])}
              className="border-b border-foreground text-sm font-medium text-foreground transition-colors hover:border-muted-foreground hover:text-muted-foreground"
            >
              {links[links.length - 1]}
            </button>
          </div>
        </div>
      </nav>
    )
  },
})
