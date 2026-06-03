import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * BlogPostFooter — multi-column publication footer for an editorial blog post
 * detail page. A bordered-top block with a brand name + description on the left
 * (spanning two columns), followed by labeled link columns, then a bottom row
 * with an auto-updating copyright line and legal links. The brand button and
 * every link route through useNavigate. Use as the closing site footer for
 * blogs, magazines, journals, or editorial publications.
 */
export const BlogPostFooter = defineComponent({
  name: "BlogPostFooter",
  description:
    "Multi-column publication footer for an editorial blog post detail page: a bordered-top block with a brand name + description on the left (spanning two columns), followed by labeled link columns, then a bottom row with an auto-updating copyright line and legal links. The brand button and every link route through useNavigate. Use as the closing site footer for blogs, magazines, journals, or editorial publications.",
  props: z.object({
    /** Publication / brand name shown in the footer. */
    brand: z.string().optional(),
    /** Brand description / blurb on the left. */
    blurb: z.string().optional(),
    /** Labelled link columns. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels on the bottom right. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? "Studio Journal"
    const blurb =
      props.blurb ??
      "A publication for designers who care about craft. Exploring the intersection of aesthetics, strategy, and human-centered product development."
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: "Explore",
            links: ["All Articles", "Topics", "Authors", "Podcast"],
          },
          {
            heading: "Connect",
            links: ["Twitter", "LinkedIn", "YouTube", "RSS Feed"],
          },
        ]
    const note = props.note ?? "All rights reserved."
    const legal = props.legal?.length
      ? props.legal
      : ["Privacy Policy", "Terms of Service"]
    const homeTarget = props.homeTarget ?? brand

    return (
      <footer
        className={cn("border-t border-border py-12 lg:py-16", props.className)}
      >
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 block text-xl font-semibold tracking-tight text-foreground"
              >
                {brand}
              </button>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                {blurb}
              </p>
            </div>
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 text-sm font-semibold uppercase tracking-wide text-foreground">
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
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} {brand}. {note}
            </p>
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
