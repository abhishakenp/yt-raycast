import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * KidsEducationFaq — native disclosure FAQ accordion for a kids / family
 * learning platform. A centered eyebrow + heading + description intro above a
 * narrow stack of rounded muted <details> rows; each summary shows a question and
 * a chevron that rotates when open, revealing the answer beneath. Uses native
 * details/summary (no JS state). Use to answer common parent questions for
 * kids-education startups, children's e-learning platforms, tutoring services,
 * and family learning apps. Renders fully with no props via baked-in defaults.
 */
export const KidsEducationFaq = defineComponent({
  name: "KidsEducationFaq",
  description:
    "Native disclosure FAQ accordion for a kids / family learning platform: a centered eyebrow + heading + description intro above a narrow stack of rounded muted details rows; each summary shows a question and a chevron that rotates when open, revealing the answer beneath. Uses native details/summary (no JS state). Use to answer common parent questions for kids-education startups, children's e-learning platforms, tutoring services, and family learning apps.",
  props: z.object({
    /** Uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** FAQ entries. */
    items: z
      .array(z.object({ question: z.string(), answer: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "FAQ"
    const heading = props.heading ?? "Common Questions"
    const description =
      props.description ?? "Everything you need to know about WonderLearn."
    const items = props.items?.length
      ? props.items
      : [
          {
            question: "What age range is WonderLearn designed for?",
            answer:
              "WonderLearn is designed for children ages 4 to 12. Activities are organized by skill level and age group, with content ranging from simple pattern recognition for 4-year-olds to more complex coding and science projects for older kids. Each child gets personalized recommendations based on their age and abilities.",
          },
          {
            question: "Can I use WonderLearn on multiple devices?",
            answer:
              "Yes! WonderLearn works on tablets, computers, and smartphones. Your child's progress syncs across all devices, so they can start an activity on a tablet and finish it on a computer. We support iOS, Android, Windows, macOS, and most modern web browsers.",
          },
          {
            question: "How does the 14-day free trial work?",
            answer:
              "Simply sign up for any plan and you'll get full access for 14 days without entering a credit card. If you love it, add payment details to continue. If not, your account automatically converts to the free Starter plan with no charges. You can upgrade or cancel anytime.",
          },
          {
            question: "Is WonderLearn safe for kids?",
            answer:
              "Absolutely. WonderLearn is COPPA-compliant and designed with child safety as our top priority. There are no ads, no external links, no social features, and no data sharing with third parties. All content is curated by education experts and appropriate for children.",
          },
          {
            question: "Do I need to supervise my child?",
            answer:
              "While many activities are designed for independent exploration, we recommend parental involvement, especially for younger children. Some science experiments and craft projects require adult supervision. Parental controls let you set daily time limits and review activity history.",
          },
          {
            question: "Can I cancel my subscription anytime?",
            answer:
              "Yes, you can cancel your subscription at any time from your account settings. When you cancel, you'll continue to have access until the end of your current billing period. Your child's progress is saved, so if you resubscribe later, you can pick up right where you left off.",
          },
        ]

    return (
      <section className={cn("bg-background py-24", props.className)}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-secondary">
              {eyebrow}
            </span>
            <h2 className="mb-6 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <details key={item.question} className="group rounded-2xl bg-muted/40">
                <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                  <h3 className="text-lg font-semibold text-foreground">{item.question}</h3>
                  <span className="transition-transform group-open:rotate-180">
                    <svg className="size-5 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="px-6 pb-6 text-muted-foreground">{item.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
