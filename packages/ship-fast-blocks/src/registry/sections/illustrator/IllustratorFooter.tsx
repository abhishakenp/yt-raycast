import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * IllustratorFooter — a multi-column dark site footer for an illustrator /
 * visual-artist portfolio. A foreground-colored band with inverted type: a
 * wide brand column (serif wordmark, bio blurb, copyright) beside two link
 * columns (navigation + information), with a hairline-divided bottom row
 * holding two small notes. Every link and the wordmark route through
 * useNavigate. Use as the closing footer for illustrator and creative
 * portfolios. Renders fully with no props via baked-in "Mira Chen" defaults.
 */
export const IllustratorFooter = defineComponent({
  name: "IllustratorFooter",
  description:
    "Multi-column dark site footer for an illustrator / visual-artist portfolio: a foreground-colored band with inverted type holding a wide brand column (serif wordmark, bio blurb, copyright) beside two link columns (navigation + information), with a hairline-divided bottom row of two small notes. Links and the wordmark route through useNavigate. Use as the closing footer for illustrator and creative portfolios.",
  props: z.object({
    /** Artist / brand name shown as the serif wordmark. */
    brand: z.string().optional(),
    /** Navigation target for the wordmark click. */
    homeTarget: z.string().optional(),
    /** Bio blurb under the wordmark. */
    description: z.string().optional(),
    /** Copyright line. */
    copyright: z.string().optional(),
    /** Navigation column heading. */
    navHeading: z.string().optional(),
    /** Navigation column links. */
    navLinks: z.array(z.string()).optional(),
    /** Information column heading. */
    infoHeading: z.string().optional(),
    /** Information column links. */
    infoLinks: z.array(z.string()).optional(),
    /** Small note on the bottom-left. */
    noteLeft: z.string().optional(),
    /** Small note on the bottom-right. */
    noteRight: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Mira Chen"
    const homeTarget = props.homeTarget ?? "Work"
    const description =
      props.description ??
      "Independent illustrator creating whimsical art for children's books, editorial features, and collectors worldwide. Based in Portland, Oregon."
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand} Illustration. All rights reserved.`
    const navHeading = props.navHeading ?? "Navigation"
    const navLinks = props.navLinks?.length
      ? props.navLinks
      : ["Portfolio", "Shop", "About", "Contact"]
    const infoHeading = props.infoHeading ?? "Information"
    const infoLinks = props.infoLinks?.length
      ? props.infoLinks
      : ["Licensing", "Shipping & Returns", "Privacy Policy", "Terms of Service"]
    const noteLeft = props.noteLeft ?? "Designed with care in Portland, OR"
    const noteRight = props.noteRight ?? "Made with paper, paint & pixels"

    return (
      <footer
        className={cn(
          "bg-foreground px-4 py-12 text-background sm:px-6 sm:py-16 lg:px-8",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-8 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 font-serif text-2xl"
              >
                {brand}
              </button>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-background/60">
                {description}
              </p>
              <p className="text-sm text-background/40">{copyright}</p>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-medium">{navHeading}</h4>
              <ul className="space-y-2 text-sm text-background/60">
                {navLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="mb-4 text-sm font-medium">{infoHeading}</h4>
              <ul className="space-y-2 text-sm text-background/60">
                {infoLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 sm:flex-row">
            <p className="text-xs text-background/40">{noteLeft}</p>
            <p className="text-xs text-background/40">{noteRight}</p>
          </div>
        </div>
      </footer>
    )
  },
})
