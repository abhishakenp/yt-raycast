import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MarketplaceFooter — a slim, single-row marketplace footer on a subtle muted
 * band. A top-bordered bar centers a brand logo tile + name button on the left,
 * a copyright line in the middle, and a wrapping row of legal/help links on the
 * right (stacks on mobile, splits across on desktop). Clean, neutral, light
 * e-commerce aesthetic. The brand button and every link route through
 * useNavigate. Use as the closing site footer for online marketplaces,
 * multi-vendor or maker/artisan platforms, handmade/craft stores, and retail
 * aggregators.
 */
export const MarketplaceFooter = defineComponent({
  name: "MarketplaceFooter",
  description:
    "Slim, single-row marketplace footer on a subtle muted band: a top-bordered bar centers a brand logo tile + name button on the left, a copyright line in the middle, and a wrapping row of legal/help links on the right (stacks on mobile, splits across on desktop). Clean, neutral, light e-commerce aesthetic. The brand button and every link route through useNavigate. Use as the closing site footer for online marketplaces, multi-vendor or maker/artisan platforms, handmade/craft stores, and retail aggregators.",
  props: z.object({
    /** Brand / marketplace name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button. */
    homeTarget: z.string().optional(),
    /** Trailing copyright note after the year + brand. */
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "MarketHub"
    const homeTarget = props.homeTarget ?? "Categories"
    const footerNote = props.note ?? "All rights reserved."
    const footerLinks = props.links?.length
      ? props.links
      : ["Privacy", "Terms", "Help Center", "Sell on MarketHub"]

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-primary font-bold text-primary-foreground",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <footer
        className={cn(
          "border-t border-border bg-muted/40 py-10",
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:px-6 md:flex-row lg:px-8">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <LogoMark className="size-6 text-xs" />
            {brand}
          </button>
          <div>
            © {new Date().getFullYear()} {brand}. {footerNote}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {footerLinks.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => go(link)}
                className="transition-colors hover:text-foreground"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    )
  },
})
