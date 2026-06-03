import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * JobBoardLogos — a compact "trusted by" social-proof strip for a job-board /
 * careers site. A subtle muted band with a small uppercase eyebrow heading above
 * a responsive grid of wordmark company names rendered as muted text that
 * brighten on hover; each routes through useNavigate. Use directly below a hero
 * to establish credibility on job boards, hiring marketplaces, recruiting
 * platforms or any marketing page that wants a logo cloud. Renders fully with no
 * props.
 */
export const JobBoardLogos = defineComponent({
  name: "JobBoardLogos",
  description:
    "Compact 'trusted by' social-proof strip for a job-board / careers site: a subtle muted band with a small uppercase eyebrow heading above a responsive grid of wordmark company names rendered as muted text that brighten on hover; each routes through useNavigate. Use directly below a hero to establish credibility on job boards, hiring marketplaces, recruiting platforms or any marketing page that wants a logo cloud.",
  props: z.object({
    /** Eyebrow heading above the logo grid. */
    heading: z.string().optional(),
    /** Company wordmark labels. */
    companies: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading =
      props.heading ?? "Trusted by leading companies worldwide"
    const companies = props.companies?.length
      ? props.companies
      : ["Stripe", "Notion", "Figma", "Shopify", "Webflow", "Linear"]

    return (
      <section
        className={cn(
          "border-b border-border bg-muted/40 py-12",
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wide text-muted-foreground">
            {heading}
          </p>
          <div className="grid grid-cols-2 items-center gap-8 opacity-70 sm:grid-cols-3 md:grid-cols-6">
            {companies.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => go(c)}
                className="flex items-center justify-center text-lg font-semibold tracking-tight text-muted-foreground transition-colors hover:text-foreground"
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
