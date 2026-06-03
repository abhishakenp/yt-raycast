import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * LinkInBioFooter — a slim, centered copyright footer for a "link in bio" /
 * link-hub page. A single muted line rendering "© {year} {brand}. {note}" as a
 * tappable button that routes home through useNavigate. Calm, light, minimal —
 * meant to close a Linktree/Bento style personal landing page, creator link
 * hub, or freelancer bio link. Renders fully with no props.
 */
export const LinkInBioFooter = defineComponent({
  name: "LinkInBioFooter",
  description:
    "Slim centered copyright footer for a LINK-IN-BIO / link-hub page: a single muted line rendering the current year, the brand/person name, and a short note (e.g. 'All rights reserved.') as a tappable button that routes home through useNavigate. Calm, light, minimal — use to close a Linktree / Bento style personal landing page, creator/influencer link hub, or freelancer bio link.",
  props: z.object({
    /** Brand / person name shown in the copyright line. */
    brand: z.string().optional(),
    /** Trailing note after the brand name. */
    note: z.string().optional(),
    /** Routing key used when the footer line is tapped (home). */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Sarah Chen"
    const note = props.note ?? "All rights reserved."
    const homeTarget = props.homeTarget ?? "Portfolio"

    return (
      <footer
        className={cn(
          "py-8 text-center text-sm text-muted-foreground",
          props.className,
        )}
      >
        <button type="button" onClick={() => go(homeTarget)}>
          © {new Date().getFullYear()} {brand}. {note}
        </button>
      </footer>
    )
  },
})
