import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * FoodDeliverySteps — numbered "how it works" band for a food-delivery /
 * restaurant-marketplace site. A centered heading + supporting paragraph above a
 * responsive 3-up grid of centered steps, each led by a large filled circular
 * number badge, then a title and a short description. Use to explain the 1-2-3
 * ordering flow (choose a restaurant, build your order, track and enjoy) for
 * food-delivery apps, restaurant aggregators, or online-ordering platforms.
 * Renders fully with no props via baked-in defaults.
 */
export const FoodDeliverySteps = defineComponent({
  name: "FoodDeliverySteps",
  description:
    "Numbered 'how it works' band for a food-delivery / restaurant-marketplace site: a centered heading + supporting paragraph above a responsive 3-up grid of centered steps, each led by a large filled circular number badge, then a title and a short description. Use to explain the 1-2-3 ordering flow (choose a restaurant, build your order, track and enjoy) for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.",
  props: z.object({
    /** Centered section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Ordered steps (title + description); numbered automatically. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const stepsHeading = props.heading ?? "How it works"
    const stepsDesc =
      props.description ??
      "Getting your favorite food delivered is as easy as 1-2-3."
    const stepItems = props.items?.length
      ? props.items
      : [
          {
            title: "Choose your restaurant",
            description:
              "Browse hundreds of local restaurants filtered by cuisine, price, and delivery time to find your perfect match.",
          },
          {
            title: "Build your order",
            description:
              "Select your dishes, customize toppings and sides, add special instructions, and review your cart.",
          },
          {
            title: "Track and enjoy",
            description:
              "Watch your order from kitchen prep to doorstep delivery in real-time on our live map.",
          },
        ]

    return (
      <section className={cn("py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {stepsHeading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{stepsDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {stepItems.map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-foreground text-2xl font-bold text-background">
                  {i + 1}
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
