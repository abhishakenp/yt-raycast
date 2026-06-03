import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * NewsFooter — fat multi-column footer for a news / editorial publication. On a
 * muted bordered-top surface: a five-column grid where the first column holds a
 * newspaper-glyph logo + publication name, a tagline and a row of social links,
 * followed by four link columns (Sections / Company / Support / Legal). A bottom
 * bar carries an auto-updating copyright line and a row of legal links. The
 * brand button, every link, social and legal item route through useNavigate. Use
 * as the closing footer of a newspaper, magazine or publication homepage.
 * Renders fully with no props via baked-in "The Chronicle" defaults.
 */
export const NewsFooter = defineComponent({
  name: "NewsFooter",
  description:
    "Fat multi-column footer for a news / editorial publication on a muted bordered-top surface: a five-column grid where the first column holds a newspaper-glyph logo + publication name, a tagline and a row of social links, followed by four link columns (Sections / Company / Support / Legal), with a bottom bar carrying an auto-updating copyright line and a row of legal links. The brand button, links, socials and legal items route through useNavigate. Use as the closing footer of a newspaper, magazine or publication homepage.",
  props: z.object({
    /** Publication / masthead name shown beside the logo. */
    brand: z.string().optional(),
    /** Tagline under the brand. */
    tagline: z.string().optional(),
    /** Link columns. */
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social link labels. */
    socials: z.array(z.string()).optional(),
    /** Copyright line (auto-generated from brand + year if omitted). */
    copyright: z.string().optional(),
    /** Legal links in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "The Chronicle"
    const tagline =
      props.tagline ??
      "Independent journalism since 1923. Committed to truth, accuracy, and the public interest."
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: "Sections",
            links: [
              "World News",
              "Politics",
              "Business",
              "Technology",
              "Science",
              "Health",
            ],
          },
          {
            heading: "Company",
            links: [
              "About Us",
              "Careers",
              "Code of Ethics",
              "Press Center",
              "Advertise",
            ],
          },
          {
            heading: "Support",
            links: [
              "Help Center",
              "Contact Us",
              "Subscription",
              "Accessibility",
              "Apps",
            ],
          },
          {
            heading: "Legal",
            links: [
              "Privacy Policy",
              "Terms of Service",
              "Cookie Policy",
              "Your Privacy Choices",
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ["Twitter", "Facebook", "LinkedIn", "Instagram"]
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}. All rights reserved.`
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy", "Terms", "Cookies", "Sitemap"]
    const homeTarget = props.homeTarget ?? "News"

    const Masthead = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M7 8h10M7 12h10M7 16h6" />
      </svg>
    )

    return (
      <footer
        className={cn("border-t border-border bg-muted", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-4 lg:col-span-1">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <Masthead className="size-6 text-foreground" />
                <span className="text-lg font-bold text-foreground">
                  {brand}
                </span>
              </button>
              <p className="mb-4 text-sm text-muted-foreground">{tagline}</p>
              <div className="flex items-center gap-3">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="rounded-md p-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-semibold text-foreground">
                  {col.heading}
                </h4>
                <ul className="space-y-2 text-sm">
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

          {/* Bottom bar */}
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">{copyright}</p>
            <div className="flex items-center gap-6 text-sm">
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
