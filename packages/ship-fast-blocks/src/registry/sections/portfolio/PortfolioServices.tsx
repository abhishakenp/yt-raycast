import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { FeatureGrid } from "#/section-kit/FeatureGrid.tsx"

/**
 * PortfolioServices — a "what I do" capability grid for a creative-individual
 * portfolio. Thin configuration over the shared `FeatureGrid` composite: a
 * centered heading above a responsive 3-up grid of service cards, each with an
 * icon tile, a service title, and a short description. Use to outline the
 * disciplines a freelancer or studio offers — art direction, motion, 3D,
 * branding — on a designer, animator, or director personal site. Renders fully
 * with no props via baked-in defaults (six services).
 */
export const PortfolioServices = defineComponent({
  name: "PortfolioServices",
  description:
    "'What I do' capability grid for a creative-individual portfolio built on the shared FeatureGrid composite: a centered heading above a responsive 3-up grid of service cards, each with an icon tile, a service title, and a short description. Use to outline the disciplines a freelancer or studio offers — art direction, motion, 3D, branding, web — on a designer, animator, or director personal site.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Service cards: title + description. */
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const services = props.services?.length
      ? props.services
      : [
          {
            title: "Art Direction",
            description:
              "Setting the visual language for a brand or campaign — mood, palette, type, and motion principles that hold across every touchpoint.",
          },
          {
            title: "Motion Design",
            description:
              "Brand films, product reveals, and title sequences with kinetic typography and cinematic camera work built to perform.",
          },
          {
            title: "3D & CGI",
            description:
              "Photoreal and stylised 3D in C4D, Houdini, and Blender — from fluid sims to full environments rendered with Redshift or Octane.",
          },
          {
            title: "Brand Identity",
            description:
              "Logos, systems, and guidelines that give a product a distinct, ownable presence and scale gracefully across media.",
          },
          {
            title: "Web & Interactive",
            description:
              "Immersive sites and interactive launches that translate the brand world into a fast, responsive on-screen experience.",
          },
          {
            title: "Creative Consulting",
            description:
              "Hands-on direction for in-house teams — from pitch to delivery, helping shape the work and keep the craft high.",
          },
        ]

    const icons = ["✦", "▷", "◈", "❖", "⌘", "✸"]

    return (
      <FeatureGrid
        heading={props.heading ?? "What I do"}
        subheading={
          props.subheading ??
          "A focused set of services for brands and studios that care about craft — from the first concept to the final frame."
        }
        features={services.map((s, i) => ({
          title: s.title,
          description: s.description,
          icon: (
            <span aria-hidden="true" className="text-xl leading-none">
              {icons[i % icons.length]}
            </span>
          ),
        }))}
        className={props.className}
      />
    )
  },
})
