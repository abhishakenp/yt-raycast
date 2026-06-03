import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * CrowdfundingFooter — a 4-column closing footer for a crowdfunding / campaign
 * landing page. A bg-foreground footer with a decorative leaf/sparkle brand
 * mark + campaign name and a tagline in the first cell, multiple link columns,
 * a "Connect" cell of first-letter social icon buttons, and a bottom row with a
 * copyright note and legal links. All buttons route through useNavigate. Use as
 * the site footer for a Kickstarter/Indiegogo-style raise, pre-order, product
 * launch, fundraiser, or maker/hardware campaign.
 */
export const CrowdfundingFooter = defineComponent({
  name: "CrowdfundingFooter",
  description:
    "A 4-column closing footer for a crowdfunding / campaign landing page: a bg-foreground footer with a decorative leaf/sparkle brand mark + campaign name and a tagline in the first cell, multiple link columns, a 'Connect' cell of first-letter social icon buttons, and a bottom row with a copyright note and legal links. All buttons route through useNavigate. Use as the site footer for a Kickstarter/Indiegogo-style raise, pre-order, product launch, fundraiser, or maker/hardware campaign.",
  props: z.object({
    /** Brand / campaign name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Tagline paragraph under the brand. */
    tagline: z.string().optional(),
    /** Multi-column footer link groups. */
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Heading above the social icon buttons. */
    connectHeading: z.string().optional(),
    /** Social network names for first-letter icon buttons. */
    socials: z.array(z.string()).optional(),
    /** Copyright / note text line. */
    note: z.string().optional(),
    /** Legal link labels in the bottom row. */
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "EcoBrush"
    const footerTagline =
      props.tagline ??
      "The first electric toothbrush designed to return to the earth. Sustainable oral care without compromise."
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            heading: "Campaign",
            links: ["Our Story", "Features", "Rewards", "FAQ"],
          },
          {
            heading: "Company",
            links: ["About Us", "Sustainability Report", "Press Kit", "Contact"],
          },
        ]
    const connectHeading = props.connectHeading ?? "Connect"
    const footerSocials = props.socials?.length
      ? props.socials
      : ["Instagram", "Twitter", "YouTube"]
    const footerNote =
      props.note ?? "© 2026 EcoBrush Inc. All rights reserved."
    const footerLegal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service", "Cookie Policy"]

    const LeafMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          "grid place-items-center rounded-full bg-primary text-primary-foreground",
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
          <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      </span>
    )

    return (
      <footer
        className={cn("bg-foreground py-16 text-background/70", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <LeafMark className="size-8" />
                <span className="text-xl font-semibold text-background">
                  {brand}
                </span>
              </div>
              <p className="text-sm leading-relaxed">{footerTagline}</p>
            </div>
            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-medium text-background">
                  {col.heading}
                </h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
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
            ))}
            <div>
              <h4 className="mb-4 font-medium text-background">
                {connectHeading}
              </h4>
              <div className="flex gap-4">
                {footerSocials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-lg bg-background/10 text-background transition-colors hover:bg-background/20"
                  >
                    <span className="text-xs font-semibold">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm">{footerNote}</p>
            <div className="flex gap-6 text-sm">
              {footerLegal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
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
