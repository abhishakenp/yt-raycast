import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

export const TelehealthSteps = defineComponent({
  name: "TelehealthSteps",
  description:
    "Bespoke, token-styled 'how it works' band for a telehealth site. Opens with a centered SectionHeading, then lays out a three-column numbered step grid (a primary number badge, a title, and a short description) walking a new patient from sign-up to treatment: create your account, connect with a doctor, and get your treatment plan. Steps stack vertically on small screens. Use to reduce friction and reassure first-time visitors that getting care is simple.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    steps: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Care in three simple steps"
    const subheading =
      props.subheading ??
      "No paperwork, no waiting rooms — just a few minutes between you and a doctor."
    const steps = props.steps?.length
      ? props.steps
      : [
          {
            title: "Create your account",
            description:
              "Tell us a little about yourself and what you need help with — it takes under two minutes.",
          },
          {
            title: "Connect with a doctor",
            description:
              "Match with a board-certified provider and meet over secure video, often within minutes.",
          },
          {
            title: "Get your treatment plan",
            description:
              "Receive a personalized plan, prescriptions, and follow-up care delivered straight to you.",
          },
        ]

    return (
      <section className={cn("bg-muted/30 py-20 sm:py-24", props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading title={heading} subtitle={subheading} />
          <ol className="mt-14 grid gap-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <li key={`${step.title}-${i}`} className="flex flex-col items-start gap-4">
                <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    )
  },
})
