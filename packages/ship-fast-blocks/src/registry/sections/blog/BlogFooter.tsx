import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogFooter — slim multi-link footer for an editorial blog / publication.
 * A single bordered-top row (stacks on mobile): the publication name on the left,
 * a set of utility/legal links in the center, and an auto-updating copyright line
 * on the right. Every link and the brand button route through useNavigate. Use as
 * the closing site footer for blogs, magazines, newsrooms, or content hubs.
 */
export const BlogFooter = defineComponent({
  name: "BlogFooter",
  description:
    "Slim multi-link footer for an editorial blog or publication: a single bordered-top row (stacks on mobile) with the publication name on the left, a set of utility/legal links in the center, and an auto-updating copyright line on the right. Every link and the brand button route through useNavigate. Use as the closing site footer for blogs, magazines, newsrooms, or content hubs.",
  props: z.object({
    /** Brand / publication name shown in the footer. */
    brand: z.string().optional(),
    /** Legal / utility link labels. */
    links: z.array(z.string()).optional(),
    /** Copyright string; defaults to `© <year> <brand>`. */
    copyright: z.string().optional(),
    /** Navigation target for the brand name button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Form & Function"
    const links = props.links?.length
      ? props.links
      : ["Privacy", "Terms", "RSS", "Contact"]
    const copyright =
      props.copyright ?? `© ${new Date().getFullYear()} ${brand}`
    const homeTarget = props.homeTarget ?? "Home"

    return (
      <footer
        className={cn(
          "mt-auto border-t border-border py-10",
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="font-bold tracking-tight text-foreground"
          >
            {brand}
          </button>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-[1.125rem] gap-y-2 text-[0.9rem] text-muted-foreground"
          >
            {links.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => go(link)}
                className="transition-colors hover:text-foreground"
              >
                {link}
              </button>
            ))}
          </nav>
          <div className="text-[0.85rem] text-muted-foreground">
            {copyright}
          </div>
        </div>
      </footer>
    )
  },
})
