import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NoCodeFooter — rich multi-column footer on a card surface with a top border.
 * A 2-to-5 column grid: a wide brand column (inverse cube-glyph logo tile +
 * brand name, a short description, and round social-initial buttons) beside
 * several link columns, then a bordered bottom row with an auto-updating
 * copyright line and a set of legal links. The brand button and every link
 * route through useNavigate. Use as the closing site footer for a no-code
 * builder, SaaS, or product landing page. Renders fully with no props.
 */
export const NoCodeFooter = defineComponent({
  name: "NoCodeFooter",
  description:
    "Rich multi-column footer on a card surface with a top border: a 2-to-5 column grid with a wide brand column (inverse cube-glyph logo tile + brand name, a short description, and round social-initial buttons) beside several link columns, then a bordered bottom row with an auto-updating copyright line and a set of legal links. The brand button and every link route through useNavigate. Use as the closing site footer for a no-code / app-builder SaaS or product landing page.",
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Short description under the brand. */
    description: z.string().optional(),
    /** Link columns (title + links). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social network labels (rendered as round initial buttons). */
    socials: z.array(z.string()).optional(),
    /** Copyright line (defaults to brand + current year). */
    copyright: z.string().optional(),
    /** Legal / utility link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Buildr"
    const description =
      props.description ??
      "The no-code platform that empowers anyone to build beautiful, functional apps without writing code."
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Product",
            links: [
              "Features",
              "Templates",
              "Pricing",
              "Integrations",
              "Changelog",
            ],
          },
          {
            title: "Company",
            links: ["About", "Blog", "Careers", "Press", "Partners"],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "Help Center",
              "Community",
              "Contact",
              "Status",
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ["Twitter", "GitHub", "LinkedIn"]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Cookies"]
    const homeTarget = props.homeTarget ?? "Features"

    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </span>
    )

    return (
      <footer
        className={cn("border-t border-border bg-card py-16", props.className)}
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <LogoMark className="size-8" />
                <span className="text-xl font-semibold">{brand}</span>
              </button>
              <p className="mb-4 max-w-xs text-muted-foreground">
                {description}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-card-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
