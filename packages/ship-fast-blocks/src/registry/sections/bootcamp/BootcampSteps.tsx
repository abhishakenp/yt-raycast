import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * BootcampSteps — 4-step "how it works" admissions path for a coding bootcamp /
 * career-school landing page. A centered eyebrow, heading and description
 * above a responsive 4-column grid of numbered step cards; each card features a
 * large numbered circle in primary, a step title, and a description. Horizontal
 * connector lines appear between steps on desktop (lg). Use to explain the
 * application-to-placement journey for bootcamps, academies, or cohort-based
 * education programs.
 */
export const BootcampSteps = defineComponent({
  name: "BootcampSteps",
  description:
    "4-step 'how it works' admissions path for a coding bootcamp / career-school landing page: centered eyebrow, heading and description above a responsive 4-column grid of numbered step cards. Each card has a large numbered circle in primary, a step title, and a description. Horizontal connector lines appear between steps on desktop. Use to explain the application-to-placement journey for bootcamps, academies, or cohort-based education programs.",
  props: z.object({
    /** Section eyebrow label. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Steps: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stepsEyebrow = props.eyebrow ?? "How It Works"
    const stepsHeading = props.heading ?? "Your path to a tech career"
    const stepsDesc =
      props.description ??
      "From application to job offer — we support you every step of the way."
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: "Apply Online",
            description:
              "Complete our 15-minute application. No prior experience required — just logical thinking and determination.",
          },
          {
            title: "Admission Call",
            description:
              "Chat with our admissions team about your goals. We ensure the program is right for your career aspirations.",
          },
          {
            title: "Complete Bootcamp",
            description:
              "16 weeks of intensive, hands-on learning. Daily standups, code reviews, and 1:1 mentorship sessions.",
          },
          {
            title: "Land Your Job",
            description:
              "Work with our career team to land interviews. Average graduate salary: $78,000 — $95,000 first year.",
          },
        ]

    return (
      <section
        className={cn("bg-muted/40 py-20 lg:py-32", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center lg:mb-20">
            <span className="mb-4 inline-block text-xs font-semibold uppercase tracking-wider text-primary">
              {stepsEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold sm:text-4xl">
              {stepsHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{stepsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {stepItems.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-6 grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
                {i < stepItems.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="absolute left-full top-6 hidden h-px w-full bg-border lg:block"
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
