import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * ManufacturingProcess — a numbered quote-to-delivery process band for a
 * precision-manufacturing site. A centered eyebrow + heading + description intro
 * sits above a horizontal five-column step row, each step a numbered foreground
 * circle with title and copy joined by connector lines on desktop, followed by a
 * bordered lead-time stats panel (three big numbers). Clean, neutral,
 * industrial. Use to explain the workflow from CAD upload to shipping on
 * machine-shop, fabricator or contract-manufacturer pages. Renders fully with no
 * props via baked-in defaults.
 */
export const ManufacturingProcess = defineComponent({
  name: "ManufacturingProcess",
  description:
    "A numbered quote-to-delivery process band for a precision-manufacturing site: a centered eyebrow + heading + description intro above a horizontal five-column step row (each step a numbered foreground circle with title and copy joined by connector lines on desktop), followed by a bordered lead-time stats panel with three big numbers. Clean, neutral, industrial. Use to explain the workflow from CAD upload to shipping on machine-shop, fabricator or contract-manufacturer pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Our Process"
    const heading =
      props.heading ?? "From Quote to Delivery in Five Steps"
    const description =
      props.description ??
      "Our streamlined workflow ensures clear communication, on-time delivery, and parts that meet your exact specifications."
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: "Upload & Quote",
            description:
              "Submit CAD files (STEP, IGES, SolidWorks) through our secure portal. Receive detailed quote within 24 hours.",
          },
          {
            title: "DFM Review",
            description:
              "Our engineers review for manufacturability, suggest cost optimizations, and confirm materials and finishes.",
          },
          {
            title: "Production",
            description:
              "Parts enter our production queue. Real-time status updates via customer portal with photos at key stages.",
          },
          {
            title: "Inspection",
            description:
              "100% dimensional inspection with CMM. FAIR documentation, material certs, and test reports included.",
          },
          {
            title: "Ship & Support",
            description:
              "Carefully packaged and shipped worldwide. Engineering support for assembly questions or design revisions.",
          },
        ]
    const stats = props.stats?.length
      ? props.stats
      : [
          { value: "24hr", label: "Standard Quote Turnaround" },
          { value: "2-3 Days", label: "Prototype Lead Time" },
          { value: "2-4 Weeks", label: "Production Lead Time" },
        ]

    return (
      <section
        className={cn("bg-background py-20 lg:py-28", props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-5">
            {steps.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4 grid size-12 place-items-center rounded-full bg-foreground text-lg font-semibold text-background">
                    {i + 1}
                  </div>
                  <h3 className="mb-2 font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {i < steps.length - 1 && (
                  <div className="absolute left-full top-6 hidden h-px w-full -translate-x-1/2 bg-border md:block" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-16 rounded-lg border border-border bg-muted p-8">
            <div className="grid gap-8 text-center md:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="text-3xl font-semibold text-foreground">
                    {s.value}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
