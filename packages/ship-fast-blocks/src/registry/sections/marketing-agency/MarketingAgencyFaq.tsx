import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * MarketingAgencyFaq — a native expandable FAQ accordion. A centered eyebrow +
 * heading + description above a narrow stack of bordered, muted `<details>` rows;
 * each summary shows a question with a chevron that rotates when open, revealing
 * the answer below and raising the row to a card surface. Uses no JS state. Use
 * to answer common questions for a marketing / growth agency, SaaS, or service
 * business. Renders fully with no props.
 */
export const MarketingAgencyFaq = defineComponent({
  name: "MarketingAgencyFaq",
  description:
    "Native expandable FAQ accordion: a centered eyebrow + heading + description above a narrow stack of bordered, muted <details> rows; each summary shows a question with a chevron that rotates when open, revealing the answer and raising the row to a card surface. Uses no JS state. Use to answer common questions about timelines, contracts, ad spend, reporting, and industries for a marketing / growth agency, SaaS, or service business.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "FAQ"
    const heading = props.heading ?? "Frequently Asked Questions"
    const description =
      props.description ??
      "Everything you need to know about working with Nexus Growth."
    const items = props.items?.length
      ? props.items
      : [
          {
            q: "How quickly can I expect to see results?",
            a: "Most clients see meaningful improvements within 60-90 days. Paid campaigns often show results within 2-4 weeks, while SEO typically takes 3-6 months for significant ranking improvements. We set clear milestone expectations during onboarding.",
          },
          {
            q: "Do I need to sign a long-term contract?",
            a: "No. All our plans are month-to-month with a 30-day cancellation notice. We believe in earning your business every month through results, not legal obligations. Enterprise clients may opt for annual agreements with pricing benefits.",
          },
          {
            q: "What's included in the ad spend?",
            a: "Our fees are separate from your actual ad spend (what you pay to Google, Meta, etc.). The ad spend limits in our pricing refer to how much we can effectively manage within that tier. You maintain ownership of all ad accounts and assets.",
          },
          {
            q: "How do you report on progress?",
            a: "All clients get access to a real-time dashboard showing key metrics. We also provide weekly email updates and monthly video calls to review performance, discuss learnings, and plan next month's priorities. Enterprise clients get custom reporting.",
          },
          {
            q: "Do you work with agencies or white-label?",
            a: "Yes, we offer white-label partnerships for marketing agencies, web design firms, and consultants who want to offer performance marketing to their clients. Contact us for partner pricing and case studies from successful partnerships.",
          },
          {
            q: "What industries do you specialize in?",
            a: "We have deep expertise in B2B SaaS, e-commerce, fintech, healthcare, and professional services. While we can work with any industry, these are where we've generated the most consistent, outsized results for our clients.",
          },
        ]

    return (
      <section className={cn("bg-background py-24", props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              {eyebrow}
            </p>
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>
          <div className="space-y-4">
            {items.map((item) => (
              <details
                key={item.q}
                className="group rounded-xl border border-border bg-muted transition-all open:bg-card open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <span className="font-medium text-foreground">{item.q}</span>
                  <span className="transition-transform group-open:rotate-180">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="size-5 text-muted-foreground"
                      aria-hidden="true"
                    >
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">
                  <p>{item.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
