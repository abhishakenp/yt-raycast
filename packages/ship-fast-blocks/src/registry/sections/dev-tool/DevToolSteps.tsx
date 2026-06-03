import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * DevToolSteps — a 3-step "get started in minutes" timeline for a developer
 * tool / API platform. A muted-banded section with a centered heading + intro
 * above a responsive 3-column grid of numbered steps, each with a filled circular
 * brand-colored number badge, a title, and a description, connected by a thin
 * horizontal rule on desktop. Static (no links). Use to explain onboarding /
 * quickstart flow for developer tools, API platforms, or technical SaaS.
 */
export const DevToolSteps = defineComponent({
  name: "DevToolSteps",
  description:
    "3-step 'get started in minutes' timeline for a developer tool / API platform: a muted-banded section with a centered heading + intro above a responsive 3-column grid of numbered steps, each with a filled circular brand-colored number badge, title, and description, connected by a thin horizontal rule on desktop. Use to explain onboarding / quickstart flow for developer tools, API platforms, or technical SaaS.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Get started in minutes"
    const description =
      props.description ??
      "From signup to production in three simple steps. No complex configuration needed."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Create your project",
            description:
              "Sign up free and create a new project. Choose your framework — we support React, Vue, Svelte, Next.js, and more.",
          },
          {
            title: "Install the SDK",
            description:
              "Run npm install @devstack/sdk and initialize with your API key. Auto-generated code for your stack.",
          },
          {
            title: "Deploy to production",
            description:
              "Push your code. We handle scaling, security, and monitoring. Go from localhost to global in seconds.",
          },
        ]

    return (
      <section
        className={cn("bg-muted/40 py-20 lg:py-28", props.className)}
        aria-labelledby="steps-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="steps-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                {i < items.length - 1 ? (
                  <div
                    aria-hidden="true"
                    className="absolute left-12 top-6 -z-10 hidden h-0.5 w-full bg-border md:block"
                  />
                ) : null}
                <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary font-bold text-primary-foreground">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
