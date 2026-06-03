import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * MembershipClubFooter — multi-column site footer for a private membership club /
 * exclusive community page. A muted, border-topped band: a wide brand column (thin
 * concentric "compass" club mark + light club name + an about paragraph) beside
 * link columns of text buttons, then a bottom row with a dynamic-year copyright on
 * the left and inline legal links on the right. Brand mark and every link route
 * through useNavigate. Use as the closing footer for members clubs, founders/social
 * clubs, professional networks, curated communities or paid community
 * subscriptions. Renders fully with no props.
 */
export const MembershipClubFooter = defineComponent({
  name: "MembershipClubFooter",
  description:
    "Multi-column site footer for a private membership club / exclusive community page: a muted, border-topped band with a wide brand column (thin concentric 'compass' club mark + light club name + an about paragraph) beside link columns of text buttons, then a bottom row with a dynamic-year copyright on the left and inline legal links on the right. Brand mark and every link route through useNavigate. Use as the closing footer for members clubs, founders/social clubs, professional networks, curated communities or paid community subscriptions.",
  props: z.object({
    /** Brand / club name shown beside the logo mark. */
    brand: z.string().optional(),
    /** Route target fired by the footer brand mark (site home). */
    homeTarget: z.string().optional(),
    about: z.string().optional(),
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "The Guild"
    const homeTarget = props.homeTarget ?? "Benefits"
    const about =
      props.about ??
      "A private membership for people who value depth over breadth. Curated connections, intimate events, and spaces designed for genuine relationships."
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: "Membership",
            links: [
              "Membership Tiers",
              "Benefits",
              "Gift Membership",
              "Corporate Plans",
            ],
          },
          {
            title: "Company",
            links: ["About", "Careers", "Press", "Contact"],
          },
        ]
    const copyright =
      props.copyright ?? "The Guild, Inc. All rights reserved."
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy", "Terms", "Code of Conduct"]

    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className={className}
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2L12 12L19 19" />
      </svg>
    )

    return (
      <footer
        className={cn(
          "w-full border-t border-border bg-muted",
          props.className,
        )}
        role="contentinfo"
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
                aria-label={`${brand} Home`}
              >
                <LogoMark className="size-8 text-foreground" />
                <span className="text-xl font-light tracking-tight text-foreground">
                  {brand}
                </span>
              </button>
              <p className="max-w-sm leading-relaxed text-muted-foreground">
                {about}
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 text-sm font-medium uppercase tracking-wider text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {copyright}
            </p>
            <div className="flex items-center gap-6">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
