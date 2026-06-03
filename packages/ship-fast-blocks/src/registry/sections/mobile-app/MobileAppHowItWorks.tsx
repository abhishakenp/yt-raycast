import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"

/**
 * MobileAppHowItWorks — a centered-intro, 3-step "how it works" walkthrough on a
 * calm muted band. A centered heading + description sits above a responsive
 * 3-column grid of numbered steps; each step shows a big ghosted two-digit index
 * (01, 02, 03), a title, a short description, and a centered phone-screenshot
 * <Image> beneath. No links. Use as the onboarding / process explainer on a
 * habit tracker, fitness / wellness app, productivity or to-do app, or any
 * consumer app landing page. Renders fully with no props via baked-in defaults.
 */
export const MobileAppHowItWorks = defineComponent({
  name: "MobileAppHowItWorks",
  description:
    "Centered-intro 3-step 'how it works' walkthrough on a calm muted band: a centered heading + description over a responsive 3-column grid of numbered steps, each with a big ghosted two-digit index (01, 02, 03), a title, a short description, and a centered phone-screenshot image beneath. Use as the onboarding / process explainer on a habit tracker, fitness / wellness app, productivity or to-do app, or any consumer app landing page.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "How it works"
    const description =
      props.description ??
      "Get started in less than 60 seconds. No complicated setup, no lengthy onboarding."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Choose your habits",
            description:
              "Pick from 50+ curated templates or create your own. From drinking more water to reading 10 pages—start small.",
            imageAlt:
              "iPhone displaying habit selection screen with colorful habit icons in a grid layout",
          },
          {
            title: "Set your schedule",
            description:
              "Daily, weekdays only, or just twice a week? You decide. We'll remind you only when it matters.",
            imageAlt:
              "Smartphone showing a scheduling app interface with time selection and reminder settings",
          },
          {
            title: "Track & grow",
            description:
              "Check off habits with a tap. Watch your streaks build and celebrate milestones along the way.",
            imageAlt:
              "Smartphone showing habit tracking completion screen with checkmarks and progress statistics",
          },
        ]

    return (
      <section
        className={cn("bg-muted/50 py-20 lg:py-32", props.className)}
        aria-labelledby="mobileapp-steps-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center lg:mb-20">
            <h2
              id="mobileapp-steps-heading"
              className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 lg:gap-12">
            {items.map((step, i) => (
              <div key={step.title} className="relative">
                <div className="mb-4 text-6xl font-bold text-muted-foreground/30">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <h3 className="mb-3 text-xl font-semibold">{step.title}</h3>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
                <Image
                  alt={step.imageAlt}
                  w={300}
                  h={600}
                  loading="lazy"
                  className="mx-auto w-full max-w-[200px] rounded-2xl object-cover shadow-lg"
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
