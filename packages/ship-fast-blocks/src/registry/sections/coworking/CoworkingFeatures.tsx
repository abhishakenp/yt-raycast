import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { FeatureGrid } from "#/section-kit/FeatureGrid.tsx"

/**
 * CoworkingFeatures — amenity / perks grid for a coworking or shared-workspace
 * page. Thin configuration over the shared `FeatureGrid` composite: a centered
 * heading block above a responsive grid of amenity cards, each with an inline
 * line-icon tile, a short title, and a benefit-led description (fast WiFi,
 * meeting rooms, free coffee, 24/7 access, phone booths, community events). Use
 * to communicate what's included with a membership for coworking spaces, shared
 * offices, flex-office providers, or business centers. Renders fully with no
 * props via bright, modern baked-in defaults.
 */
export const CoworkingFeatures = defineComponent({
  name: "CoworkingFeatures",
  description:
    "Amenity / perks grid for a coworking or shared-workspace page built on the shared FeatureGrid composite: a centered heading block above a responsive grid of amenity cards, each with an inline line-icon tile, a short title, and a benefit-led description (fast WiFi, meeting rooms, free coffee, 24/7 access, phone booths, community events). Use to communicate what's included with a membership for coworking spaces, shared offices, flex-office providers, or business centers.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Amenity cards — each a title + benefit-led description. */
    features: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    /** Grid column count (2, 3, or 4). */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const Wifi = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M5 12.55a11 11 0 0 1 14 0" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
    )
    const Meeting = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
    const Coffee = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    )
    const Clock = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
    const Booth = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.81.36 1.6.7 2.34a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.74-1.74a2 2 0 0 1 2.11-.45c.74.34 1.53.57 2.34.7A2 2 0 0 1 22 16.92z" />
      </svg>
    )
    const Community = (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
        aria-hidden="true"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    )

    const defaults = [
      {
        title: "Lightning-fast WiFi",
        description:
          "Symmetrical gigabit fiber on a dedicated business line, with backup internet so you never drop a call mid-meeting.",
        icon: Wifi,
      },
      {
        title: "Bookable meeting rooms",
        description:
          "Glass-walled rooms for two to twelve, each with a 4K display and easy whiteboards — reserve from the app in seconds.",
        icon: Meeting,
      },
      {
        title: "Unlimited free coffee",
        description:
          "Locally roasted drip, a self-serve espresso bar, fresh tea, and filtered water on tap all day, every day.",
        icon: Coffee,
      },
      {
        title: "24/7 keycard access",
        description:
          "Members come and go on their own schedule with secure fob entry, on-site staff by day, and round-the-clock CCTV.",
        icon: Clock,
      },
      {
        title: "Private phone booths",
        description:
          "Soundproof one-person pods scattered across every floor for focused calls, quick standups, and deep work.",
        icon: Booth,
      },
      {
        title: "Community events",
        description:
          "Weekly lunch-and-learns, member mixers, and workshops that turn neighbors into collaborators and clients.",
        icon: Community,
      },
    ]

    const features = props.features?.length
      ? props.features.map((f, i) => ({
          title: f.title,
          description: f.description,
          icon: defaults[i % defaults.length].icon,
        }))
      : defaults

    return (
      <FeatureGrid
        heading={props.heading ?? "Everything you need to do your best work"}
        subheading={
          props.subheading ??
          "A bright, thoughtfully designed workspace with the amenities that actually move your day forward."
        }
        features={features}
        columns={props.columns ?? 3}
        className={props.className}
      />
    )
  },
})
