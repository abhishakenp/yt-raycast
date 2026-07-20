import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  FeatureCard,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'

/**
 * VacationRentalFeatures — an editorial-wanderlust amenity ledger for a
 * vacation-rental listing page. An asymmetric mono-eyebrow intro row (extrabold
 * heading left, supporting line right) sits above a sharp-cornered,
 * collapsed-border amenity grid (fast wifi, private pool, full kitchen, free
 * parking, air conditioning, pet-friendly): each cell carries a mono amenity
 * index and inline line-icon, a bold title, and a short description — no icon
 * tiles, hairlines instead of cards. Theme-token only. Use to list the amenities
 * of a vacation rental, beach house, cabin, villa, or boutique short-stay.
 * Renders fully with no props via baked-in defaults.
 */
const WifiIcon = () => (
  <svg
    width="20"
    height="20"
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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
    width="20"
    height="20"
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

const COLS = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
} as const

export const VacationRentalFeatures = defineCapsule({
  name: 'VacationRentalFeatures',
  description:
    'Editorial-wanderlust amenity ledger for a vacation-rental listing page: an asymmetric mono-eyebrow intro row (extrabold heading, supporting line) above a sharp-cornered collapsed-border amenity grid (fast wifi, private pool, full kitchen, free parking, air conditioning, pet-friendly), each cell carrying a mono amenity index and inline line-icon, a bold title and a short description — hairlines instead of icon tiles. Theme-token only. Use to list the amenities of a vacation rental, beach house, cabin, villa, or boutique short-stay.',
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

    const columns = props.columns ?? 3
    const heading = props.heading ?? 'Everything you need'
    const subheading =
      props.subheading ??
      'Thoughtful comforts and modern essentials so you can settle in and truly relax.'

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 grid items-end gap-6 lg:mb-16 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <MonoTag className="mb-4 block">In the home / Amenities</MonoTag>
              <h2 className="text-balance text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {heading}
              </h2>
            </div>
            <p className="text-pretty text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:pb-1">
              {subheading}
            </p>
          </div>

          <div
            className={cn(
              'grid grid-cols-1 border-l border-t border-border',
              COLS[columns],
            )}
          >
            {features.map((f, index) => {
              const __iv__ = f as {
                title: string
                description: string
                icon?: React.ReactNode
                points?: string[]
                cta?: string
                price?: string
                imageAlt?: string
              }
              return (
                <FeatureCard
                  key={__iv__.title}
                  className="gap-0 rounded-none border-0 border-b border-r border-border bg-card p-6 transition-colors duration-150 hover:translate-y-0 hover:border-border hover:bg-muted/40 sm:p-7"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <MonoTag className="text-primary">
                      {String(index + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon ? (
                      <span aria-hidden="true" className="text-foreground/70">
                        {__iv__.icon}
                      </span>
                    ) : null}
                  </div>
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="mt-2 leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
