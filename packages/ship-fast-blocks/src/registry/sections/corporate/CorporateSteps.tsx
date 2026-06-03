import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * CorporateSteps — numbered implementation timeline / process section for an
 * enterprise / corporate B2B site. A centered section heading above a responsive
 * 1/2/4-column grid of numbered phase cards; each card shows a circled step
 * number, a title, and a description, with a horizontal connector line between
 * desktop items. Use to present a methodology, onboarding flow, or project
 * roadmap for enterprise software vendors, consultancies, or managed services.
 */
export const CorporateSteps = defineComponent({
  name: "CorporateSteps",
  description:
    "Numbered implementation timeline / process section for an enterprise / corporate B2B site: centered heading above a responsive 1/2/4-column grid of numbered phase cards with circled step numbers, titles, descriptions, and horizontal connector lines between desktop items. Use to present a methodology, onboarding flow, or project roadmap for enterprise software, consultancies, or managed services.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Phase cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? "Implementation in four phases"
    const description =
      props.description ??
      "Our proven methodology ensures seamless deployment with minimal disruption to your operations."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Discovery",
            description:
              "Comprehensive assessment of your current infrastructure, workflows, and business objectives. We identify opportunities and define success metrics.",
          },
          {
            title: "Design",
            description:
              "Custom architecture design tailored to your requirements. Security-first approach with scalability built into every component.",
          },
          {
            title: "Deployment",
            description:
              "Phased rollout with parallel systems during transition. Our team manages the entire process with 24/7 support throughout.",
          },
          {
            title: "Optimization",
            description:
              "Continuous monitoring and refinement post-deployment. Regular reviews ensure maximum ROI and alignment with evolving needs.",
          },
        ]

    return (
      <section className={cn("bg-muted/50 py-20 lg:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 grid size-12 place-items-center rounded-full bg-foreground">
                  <span className="font-semibold text-background">{i + 1}</span>
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                {i < items.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-6 hidden h-px w-full -translate-x-6 bg-border lg:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
