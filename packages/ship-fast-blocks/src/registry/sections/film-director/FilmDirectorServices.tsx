import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * FilmDirectorServices — a services / capabilities grid for a film director or
 * cinematographer. A left-aligned section header (thin heading + muted lede)
 * above a responsive 1/2/3-column grid of bordered cards, each with a rounded
 * muted icon tile (rotating line-art film, camera, lightbulb, clapper, music,
 * and sliders glyphs), a title, and a short muted description. Use to present
 * production offerings such as commercial direction, cinematography, creative
 * development, documentary, music videos, and post production for filmmakers,
 * directors, DPs, or video production houses.
 */
export const FilmDirectorServices = defineComponent({
  name: "FilmDirectorServices",
  description:
    "Services / capabilities grid for a film director or cinematographer: a left-aligned section header (thin heading + muted lede) above a responsive 1/2/3-column grid of bordered cards, each with a rounded muted icon tile (rotating line-art film, camera, lightbulb, clapper, music, and sliders glyphs), a title, and a short muted description. Use to present production offerings such as commercial direction, cinematography, creative development, documentary, music videos, and post production for filmmakers, directors, DPs, or video production houses.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const servicesHeading = props.heading ?? "Services"
    const servicesDesc =
      props.description ??
      "Full-service video production from concept development through post-production, tailored for commercial, narrative, and documentary projects."
    const serviceItems = props.items?.length
      ? props.items
      : [
          {
            title: "Commercial Direction",
            description:
              "Brand films, product launches, and advertising campaigns that connect with audiences and drive results.",
          },
          {
            title: "Cinematography",
            description:
              "Award-winning DP work for features, shorts, music videos, and high-end commercial productions.",
          },
          {
            title: "Creative Development",
            description:
              "Storyboarding, visual treatment design, and creative consulting from pre-production through delivery.",
          },
          {
            title: "Documentary",
            description:
              "Long and short-form documentary production with journalistic integrity and cinematic vision.",
          },
          {
            title: "Music Videos",
            description:
              "Visual storytelling for artists and labels, from intimate performance pieces to high-concept narratives.",
          },
          {
            title: "Post Production",
            description:
              "Color grading, editing supervision, and delivery for broadcast, theatrical, and digital platforms.",
          },
        ]

    const serviceIcons: ReactNode[] = [
      <svg
        key="film"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>,
      <svg
        key="camera"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>,
      <svg
        key="bulb"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>,
      <svg
        key="clapper"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>,
      <svg
        key="music"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>,
      <svg
        key="edit"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-6"
        aria-hidden="true"
      >
        <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>,
    ]

    return (
      <section className={cn("py-20 md:py-32", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 max-w-2xl">
            <h2 className="mb-4 text-3xl font-light md:text-4xl">
              {servicesHeading}
            </h2>
            <p className="leading-relaxed text-muted-foreground">
              {servicesDesc}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map((item, i) => (
              <div
                key={item.title}
                className="rounded-md border border-border p-6 transition-colors hover:border-muted-foreground"
              >
                <div className="mb-4 grid size-12 place-items-center rounded-md bg-muted text-foreground">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-2 text-lg font-medium">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
