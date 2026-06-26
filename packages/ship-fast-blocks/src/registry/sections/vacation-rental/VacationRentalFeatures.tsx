import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * VacationRentalFeatures — an amenities grid for a vacation-rental listing page.
 * Thin configuration over the shared `FeatureGrid` composite: an "Everything you
 * need" heading above a responsive grid of amenity cards (fast wifi, private
 * pool, full kitchen, free parking, air conditioning, pet-friendly), each with a
 * line-icon tile, a title, and a short description. Theme-token only. Use to list
 * the amenities of a vacation rental, beach house, cabin, villa, or boutique
 * short-stay. Renders fully with no props via baked-in defaults.
 */
const WifiIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12.55a11 11 0 0 1 14 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
)

const PoolIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 12h20" />
    <path d="M5 12V5a2 2 0 0 1 2-2c1.5 0 2 1 2 2" />
    <path d="M15 12V5a2 2 0 0 1 2-2c1.5 0 2 1 2 2" />
    <path d="M2 18c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1 1.5-1 3-1" />
  </svg>
)

const KitchenIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M3 11h18" />
    <path d="M12 11V3" />
    <path d="M8 7c0-2 1.8-4 4-4s4 2 4 4" />
    <path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </svg>
)

const ParkingIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
  </svg>
)

const AcIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 2v20" />
    <path d="m4.93 4.93 14.14 14.14" />
    <path d="m19.07 4.93-14.14 14.14" />
    <path d="M2 12h20" />
  </svg>
)

const PetIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="11" cy="4" r="2" />
    <circle cx="18" cy="8" r="2" />
    <circle cx="20" cy="16" r="2" />
    <path d="M9 10a5 5 0 0 1 5 5v3.5a3.5 3.5 0 0 1-6.84 1.045Q6.52 17.48 4.46 16.84A3.5 3.5 0 0 1 5.5 10Z" />
  </svg>
)

const ICONS = {
  wifi: <WifiIcon />,
  pool: <PoolIcon />,
  kitchen: <KitchenIcon />,
  parking: <ParkingIcon />,
  ac: <AcIcon />,
  pet: <PetIcon />,
} as const

export const VacationRentalFeatures = defineComponent({
  name: 'VacationRentalFeatures',
  description:
    'Amenities grid for a vacation-rental listing page built on the shared FeatureGrid composite: an Everything you need heading above a responsive grid of amenity cards (fast wifi, private pool, full kitchen, free parking, air conditioning, pet-friendly), each with a line-icon tile, a title, and a short description. Theme-token only. Use to list the amenities of a vacation rental, beach house, cabin, villa, or boutique short-stay.',
  props: z.object({
    /** Section heading above the amenities grid. */
    heading: z.string().optional(),
    /** Supporting subheading under the heading. */
    subheading: z.string().optional(),
    /** Amenity cards: title + description, plus an optional icon key. */
    features: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z
            .enum(['wifi', 'pool', 'kitchen', 'parking', 'ac', 'pet'])
            .optional(),
        }),
      )
      .optional(),
    /** Column count for the responsive grid. */
    columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const raw = props.features?.length
      ? props.features
      : [
          {
            title: 'Fast wifi',
            description:
              'Gigabit fiber throughout the home — stream, video-call, or work from the deck without a hitch.',
            icon: 'wifi' as const,
          },
          {
            title: 'Private pool',
            description:
              'A heated infinity pool with loungers and uninterrupted views of the bay.',
            icon: 'pool' as const,
          },
          {
            title: 'Full kitchen',
            description:
              'A chef-grade kitchen with everything you need to cook in, from espresso to fresh-caught dinners.',
            icon: 'kitchen' as const,
          },
          {
            title: 'Free parking',
            description:
              'Two dedicated spots in the private drive — no permits, no street hunting.',
            icon: 'parking' as const,
          },
          {
            title: 'Air conditioning',
            description:
              'Whole-home climate control keeps every room cool and comfortable through summer.',
            icon: 'ac' as const,
          },
          {
            title: 'Pet-friendly',
            description:
              'Bring the whole family — well-behaved pets are warmly welcome at no extra charge.',
            icon: 'pet' as const,
          },
        ]

    const features = raw.map((f) => ({
      title: f.title,
      description: f.description,
      icon: f.icon ? ICONS[f.icon] : undefined,
    }))

    return (
      <FeatureGrid
        heading={props.heading ?? 'Everything you need'}
        subheading={
          props.subheading ??
          'Thoughtful comforts and modern essentials so you can settle in and truly relax.'
        }
        features={features}
        columns={props.columns ?? 3}
        className={props.className}
      />
    )
  },
})
