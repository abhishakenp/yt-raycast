import type { ReactNode } from "react"
import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * ManufacturingIndustries — an 8-up industries-served grid for a precision-
 * manufacturing site. A left-aligned eyebrow + heading + description intro sits
 * above a responsive four-column grid of bordered cards, each with a tinted
 * rounded icon tile (rotating through chart/primary tokens for a multi-color
 * decorative set), a sector title, a short description and a certification tag.
 * Clean, neutral, industrial. Use to show specialized expertise across critical
 * sectors (aerospace, automotive, energy, medical, defense, robotics,
 * semiconductor, industrial) on machine-shop or fabricator pages. Renders fully
 * with no props via baked-in defaults.
 */
export const ManufacturingIndustries = defineComponent({
  name: "ManufacturingIndustries",
  description:
    "An 8-up industries-served grid for a precision-manufacturing site: a left-aligned eyebrow + heading + description intro above a responsive four-column grid of bordered cards, each with a tinted rounded icon tile (rotating through chart/primary tokens for a multi-color decorative set), a sector title, a short description and a certification tag. Clean, neutral, industrial. Use to show specialized expertise across critical sectors (aerospace, automotive, energy, medical, defense, robotics, semiconductor, industrial) on machine-shop or fabricator pages.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          tag: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? "Industries Served"
    const heading =
      props.heading ?? "Specialized Expertise Across Critical Sectors"
    const description =
      props.description ??
      "We understand the unique requirements, certifications, and quality standards that each industry demands."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Aerospace",
            description:
              "AS9100D & NADCAP certified. Structural components, engine parts, and avionics housings for Boeing, Airbus, and defense contractors.",
            tag: "AS9100D • ITAR Registered",
          },
          {
            title: "Automotive",
            description:
              "EV drivetrain components, suspension parts, and prototype builds for Tesla, Ford, and tier-1 suppliers. IATF 16949 compliant.",
            tag: "IATF 16949 • PPAP Capable",
          },
          {
            title: "Energy & Oil",
            description:
              "Valve components, drilling equipment, and turbine parts. Corrosion-resistant alloys for harsh offshore and downhole environments.",
            tag: "API Compliant • ISO 14001",
          },
          {
            title: "Medical Devices",
            description:
              "Surgical instruments, implant components, and diagnostic equipment. ISO 13485 certified with full cleanroom assembly available.",
            tag: "ISO 13485 • FDA Registered",
          },
          {
            title: "Defense",
            description:
              "Armor systems, weapon components, and tactical equipment. ITAR registered with secure facilities and cleared personnel.",
            tag: "ITAR • DFARS Compliant",
          },
          {
            title: "Robotics",
            description:
              "Precision gears, actuator housings, and frame components. Tight tolerances for smooth motion control and repeatability.",
            tag: '±0.0005" Tolerance',
          },
          {
            title: "Semiconductor",
            description:
              "Chamber components, wafer handling tools, and vacuum systems. UHV-compatible materials with ultra-clean surface finishes.",
            tag: "UHV Compatible • Class 1000",
          },
          {
            title: "Industrial",
            description:
              "Heavy machinery components, conveyor systems, and custom automation equipment. Large format machining and welding services.",
            tag: "24/7 Production",
          },
        ]

    const indIcons: ReactNode[] = [
      <svg key="n0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>,
      <svg key="n1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="n2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg key="n3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>,
      <svg key="n4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
      <svg key="n5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>,
      <svg key="n6" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>,
      <svg key="n7" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>,
    ]
    const indTints = [
      "bg-chart-1/10 text-chart-1",
      "bg-chart-2/10 text-chart-2",
      "bg-chart-4/10 text-chart-4",
      "bg-chart-5/10 text-chart-5",
      "bg-destructive/10 text-destructive",
      "bg-chart-3/10 text-chart-3",
      "bg-primary/10 text-primary",
      "bg-chart-2/10 text-chart-2",
    ]

    return (
      <section className={cn("bg-muted py-20 lg:py-28", props.className)}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {items.map((item, i) => (
              <article
                key={item.title}
                className="rounded-lg border border-border bg-card p-6 shadow-sm"
              >
                <div
                  className={cn(
                    "mb-4 grid size-10 place-items-center rounded-lg",
                    indTints[i % indTints.length],
                  )}
                >
                  {indIcons[i % indIcons.length]}
                </div>
                <h3 className="mb-2 font-semibold text-card-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <span className="text-xs font-medium text-primary">
                  {item.tag}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
