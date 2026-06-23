import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { FeatureGrid } from "#/section-kit/FeatureGrid.tsx"

/**
 * FlightSimulatorFeatures — a 3-up capability grid for a flight simulator
 * landing page. Thin configuration over the shared `FeatureGrid` composite: a
 * centered heading above token-styled cards, each pairing an aviation line-icon
 * tile with a title and description. Six baked features cover real flight
 * physics, global photoreal scenery, live real-world weather, true-to-life
 * multiplayer ATC, study-level aircraft systems, and VR support. Use to sell the
 * depth of a flight sim, airliner / combat sim, or aviation training title.
 * Renders fully with no props via baked defaults.
 */
const PhysicsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M3 19c4-2 6-6 8-11 1.5 4 4 7 10 8" />
    <path d="M14 5l3-2 1 4" />
  </svg>
)

const SceneryIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M3 12h18" />
    <path d="M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" />
  </svg>
)

const WeatherIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 17a4 4 0 0 1 .5-7.96A5 5 0 0 1 17 9a3.5 3.5 0 0 1 .5 8H7z" />
    <path d="M9 21l-1 1M13 21l-1 1M17 21l-1 1" />
  </svg>
)

const AtcIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M12 2v6" />
    <path d="M9 8h6l1 12H8z" />
    <path d="M5 6a9 9 0 0 1 14 0" />
    <path d="M7.5 8.5a5.5 5.5 0 0 1 9 0" />
  </svg>
)

const SystemsIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 12l4-3" />
    <circle cx="12" cy="12" r="1.5" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
  </svg>
)

const VrIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="2" y="7" width="20" height="10" rx="3" />
    <path d="M9 17l1.5-2.5a2 2 0 0 1 3 0L15 17" />
  </svg>
)

export const FlightSimulatorFeatures = defineComponent({
  name: "FlightSimulatorFeatures",
  description:
    "3-up capability grid for a flight-simulator landing page built on the shared FeatureGrid composite: a centered heading above token-styled cards, each pairing an aviation line-icon tile with a title and description. Six baked features cover real flight physics, global photoreal scenery, live real-world weather, true-to-life multiplayer ATC, study-level aircraft systems, and VR support. Use to sell the depth of a flight sim, airliner / combat sim, or aviation training title.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Feature cards: title + description. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "Built for true-to-life flight"
    const defaults = [
      {
        title: "Real flight physics",
        description:
          "A high-fidelity aerodynamic model simulates lift, drag, and ground effect for every airframe — so a heavy jet handles nothing like a glider.",
        icon: <PhysicsIcon className="size-6" />,
      },
      {
        title: "Global photoreal scenery",
        description:
          "Stream the entire planet in stunning detail, from city skylines and mountain ranges to the bush strip behind your hometown.",
        icon: <SceneryIcon className="size-6" />,
      },
      {
        title: "Live real-world weather",
        description:
          "Fly into the exact conditions happening right now — real winds aloft, pressure, cloud layers, and storm systems pulled from live data.",
        icon: <WeatherIcon className="size-6" />,
      },
      {
        title: "True-to-life multiplayer ATC",
        description:
          "Share busy airspace with thousands of live pilots and talk to real human controllers for authentic clearances and approaches.",
        icon: <AtcIcon className="size-6" />,
      },
      {
        title: "Study-level aircraft systems",
        description:
          "Cold-and-dark startups, modeled failures, and faithful avionics let you fly procedures exactly as the real flight crews do.",
        icon: <SystemsIcon className="size-6" />,
      },
      {
        title: "VR support",
        description:
          "Step into the cockpit in full virtual reality with native headset support, room-scale tracking, and reach-out-and-touch controls.",
        icon: <VrIcon className="size-6" />,
      },
    ]
    const features = props.features?.length
      ? props.features.map((f, i) => ({
          ...f,
          icon: defaults[i % defaults.length].icon,
        }))
      : defaults

    return (
      <FeatureGrid
        heading={heading}
        subheading={props.subheading}
        features={features}
        columns={3}
        className={props.className}
      />
    )
  },
})
