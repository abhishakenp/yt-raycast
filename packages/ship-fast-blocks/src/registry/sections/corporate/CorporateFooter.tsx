import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CorporateFooter — fat multi-column footer for an enterprise / corporate B2B
 * site. A dark inverted section with a 5-column grid: a brand logo + about
 * paragraph + social icons on the left (spanning 2 columns), followed by three
 * link columns, and a bottom copyright / legal bar. Every brand button, link,
 * and social icon routes through useNavigate. Use as the closing site footer for
 * enterprise software vendors, SaaS platforms, consultancies, or any corporate
 * site with extensive navigation.
 */
export const CorporateFooter = defineComponent({
  name: "CorporateFooter",
  description:
    "Fat multi-column footer for an enterprise / corporate B2B site: dark inverted section with a 5-column grid of brand logo + about paragraph + social icons on the left (spanning 2 columns), followed by three titled link columns, plus a bottom copyright/legal bar. Every brand button, link, and social icon routes through useNavigate. Use as the closing site footer for enterprise software, SaaS, consultancies, or any corporate site.",
  props: z.object({
    /** Brand / company name shown in the footer. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    /** About paragraph under the brand. */
    about: z.string().optional(),
    /** Social icon links: label + SVG path. */
    socials: z
      .array(z.object({ label: z.string(), path: z.string() }))
      .optional(),
    /** Footer link columns: title + array of labels. */
    columns: z
      .array(
        z.object({ title: z.string(), links: z.array(z.string()) }),
      )
      .optional(),
    /** Full copyright line. */
    copyright: z.string().optional(),
    /** Legal link labels. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Nexus"
    const homeTarget = props.homeTarget ?? "Solutions"
    const about =
      props.about ??
      "Nexus Enterprise Solutions delivers mission-critical cloud infrastructure and digital transformation services to organizations worldwide."
    const socials = props.socials?.length
      ? props.socials
      : [
          {
            label: "LinkedIn",
            path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
          },
          {
            label: "Twitter",
            path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
          },
          {
            label: "YouTube",
            path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
          },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Solutions",
            links: [
              "Cloud Infrastructure",
              "Security",
              "Data Analytics",
              "Digital Transformation",
              "Managed Services",
            ],
          },
          {
            title: "Company",
            links: [
              "About Us",
              "Careers",
              "Press",
              "Partners",
              "Investor Relations",
            ],
          },
          {
            title: "Resources",
            links: [
              "Documentation",
              "API Reference",
              "Case Studies",
              "Blog",
              "Contact",
            ],
          },
        ]
    const copyright =
      props.copyright ??
      "© 2026 Nexus Enterprise Solutions, Inc. All rights reserved."
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const LogoMark = ({
      className,
      inverse,
    }: {
      className?: string
      inverse?: boolean
    }) => (
      <span
        className={cn(
          "grid place-items-center rounded-lg font-bold",
          inverse
            ? "bg-background text-foreground"
            : "bg-foreground text-background",
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <footer className={cn("bg-foreground py-16 lg:py-20", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-2"
              >
                <LogoMark inverse className="size-8 text-sm" />
                <span className="text-lg font-semibold tracking-tight text-background">
                  {brand}
                </span>
              </button>
              <p className="mb-6 max-w-sm text-sm leading-relaxed text-background/70">
                {about}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social.label}
                    type="button"
                    aria-label={social.label}
                    onClick={() => go(social.label)}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background/70 transition-colors hover:bg-background/20 hover:text-background"
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d={social.path} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-medium text-background">{col.title}</h4>
                <ul className="space-y-3 text-sm">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-background/70 transition-colors hover:text-background"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/10 pt-8 md:flex-row">
            <p className="text-sm text-background/50">{copyright}</p>
            <div className="flex gap-6 text-sm">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-background/50 transition-colors hover:text-background"
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
