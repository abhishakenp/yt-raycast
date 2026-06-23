import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { Image } from "#/lib/img.tsx"
import { SectionHeading } from "#/section-kit/SectionHeading.tsx"

export const WebinarAuthors = defineComponent({
  name: "WebinarAuthors",
  description:
    "Speaker lineup band for a webinar or virtual event: a SectionHeading over a responsive grid of speaker cards, each with a rounded avatar photograph, name, role, company, and a short credibility-building bio. Use to introduce the presenters and establish authority on a webinar registration page.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    speakers: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          company: z.string(),
          bio: z.string(),
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Speakers"
    const heading = props.heading ?? "Meet the speakers"
    const subheading =
      props.subheading ??
      "Operators who have scaled SaaS products through the exact inflection points we'll cover."
    const speakers = props.speakers?.length
      ? props.speakers
      : [
          {
            name: "Dana Whitfield",
            role: "VP of Growth",
            company: "Catalyst Labs",
            bio: "Built and led growth teams across three SaaS scale-ups, taking two from $1M to $20M ARR.",
            avatarAlt:
              "professional headshot of a confident woman in business attire smiling at camera",
          },
          {
            name: "Marcus Reyes",
            role: "Head of Product",
            company: "Northwind",
            bio: "Product leader focused on activation and retention loops; previously shipped onboarding for a top PLG company.",
            avatarAlt:
              "professional headshot of a smiling man with short dark hair in a collared shirt",
          },
          {
            name: "Priya Sharma",
            role: "Founder & CEO",
            company: "Loop Analytics",
            bio: "Two-time founder who has raised across seed to Series B and obsesses over pricing and packaging.",
            avatarAlt:
              "professional headshot of a woman with long hair wearing a blazer against a neutral background",
          },
        ]

    return (
      <section className={cn("bg-background py-20 text-foreground lg:py-28", props.className)}>
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionHeading eyebrow={eyebrow} title={heading} subtitle={subheading} />

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((speaker, i) => (
              <div
                key={`${speaker.name}-${i}`}
                className="flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center text-card-foreground"
              >
                <Image
                  alt={speaker.avatarAlt}
                  w={160}
                  h={160}
                  loading="lazy"
                  className="size-20 rounded-full object-cover"
                />
                <h3 className="mt-5 text-lg font-semibold text-foreground">{speaker.name}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{speaker.role}</p>
                <p className="text-sm text-muted-foreground">{speaker.company}</p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">{speaker.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
