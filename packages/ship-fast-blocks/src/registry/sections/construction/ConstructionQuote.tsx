import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"

/**
 * ConstructionQuote — dark "request a free estimate" lead-capture form for a
 * construction / general contractor page. A centered heading on a dark band
 * above a functional multi-field form (name, email, phone, project type, budget,
 * timeline, project details) with a submit button that routes through
 * useNavigate, plus a privacy disclaimer. Use as the closing conversion
 * section for construction firms, contractors, builders, or any service
 * business collecting project inquiries. Renders fully with no props via
 * baked-in defaults.
 */
export const ConstructionQuote = defineComponent({
  name: "ConstructionQuote",
  description:
    "Dark 'request a free estimate' lead-capture form for a construction / general contractor page: a centered heading on a dark band above a functional multi-field form (name, email, phone, project type, budget, timeline, project details) with a submit button that routes through useNavigate, plus a privacy disclaimer. Use as the closing conversion section for construction firms, contractors, builders, or any service business collecting project inquiries.",
  props: z.object({
    /** Form section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Privacy disclaimer below the submit button. */
    disclaimer: z.string().optional(),
    /** Project-type options for the select dropdown. */
    projectTypes: z.array(z.string()).optional(),
    /** Budget-range options for the select dropdown. */
    budgets: z.array(z.string()).optional(),
    /** Timeline options for the select dropdown. */
    timelines: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const heading = props.heading ?? "Ready to start your project?"
    const description =
      props.description ??
      "Get a free, no-obligation estimate. We'll respond within 24 hours."
    const submitLabel = props.submit ?? "Request Free Estimate"
    const disclaimer =
      props.disclaimer ??
      "By submitting, you agree to our privacy policy. We'll never share your information."
    const projectTypes = props.projectTypes?.length
      ? props.projectTypes
      : [
          "Select a project type",
          "Kitchen Remodel",
          "Bathroom Remodel",
          "Home Addition",
          "Custom Home",
          "Commercial Building",
          "Whole Home Renovation",
          "Other",
        ]
    const budgets = props.budgets?.length
      ? props.budgets
      : [
          "Select budget range",
          "$50,000 - $100,000",
          "$100,000 - $250,000",
          "$250,000 - $500,000",
          "$500,000 - $1,000,000",
          "$1,000,000+",
        ]
    const timelines = props.timelines?.length
      ? props.timelines
      : [
          "Select timeline",
          "ASAP",
          "Within 3 months",
          "Within 6 months",
          "Within 1 year",
          "Just planning",
        ]

    const inputCls =
      "w-full rounded-lg border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/30"

    return (
      <section className={cn("bg-foreground py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-background sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-background/60">{description}</p>
          </div>

          <form
            className="rounded-xl bg-card p-8 shadow-xl lg:p-12"
            onSubmit={(e) => {
              e.preventDefault()
              go(submitLabel)
            }}
          >
            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="con-quote-name"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Full Name
                </label>
                <input
                  id="con-quote-name"
                  type="text"
                  required
                  placeholder="John Smith"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="con-quote-email"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Email Address
                </label>
                <input
                  id="con-quote-email"
                  type="email"
                  required
                  placeholder="john@example.com"
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="con-quote-phone"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Phone Number
                </label>
                <input
                  id="con-quote-phone"
                  type="tel"
                  required
                  placeholder="(206) 555-1234"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="con-quote-type"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Project Type
                </label>
                <select
                  id="con-quote-type"
                  required
                  className={cn(inputCls, "appearance-none")}
                >
                  {projectTypes.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6 grid gap-6 md:grid-cols-2">
              <div>
                <label
                  htmlFor="con-quote-budget"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Estimated Budget
                </label>
                <select
                  id="con-quote-budget"
                  required
                  className={cn(inputCls, "appearance-none")}
                >
                  {budgets.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="con-quote-timeline"
                  className="mb-2 block text-sm font-medium text-foreground/80"
                >
                  Desired Timeline
                </label>
                <select
                  id="con-quote-timeline"
                  required
                  className={cn(inputCls, "appearance-none")}
                >
                  {timelines.map((opt) => (
                    <option key={opt} className="bg-background">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label
                htmlFor="con-quote-message"
                className="mb-2 block text-sm font-medium text-foreground/80"
              >
                Project Details
              </label>
              <textarea
                id="con-quote-message"
                rows={4}
                placeholder="Tell us about your project, goals, and any specific requirements..."
                className={cn(inputCls, "resize-none")}
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-foreground py-4 text-lg font-semibold text-background transition-colors hover:bg-foreground/90"
            >
              {submitLabel}
            </button>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              {disclaimer}
            </p>
          </form>
        </div>
      </section>
    )
  },
})
