import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

const PlaneIcon = ({ className }: { className?: string }) => (
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
    <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l4 4-1.5 3-2-1a.5.5 0 0 0-.6.7l1.7 3 3 1.7a.5.5 0 0 0 .7-.6l-1-2 3-1.5 4 4a.5.5 0 0 0 .8-.5z" />
  </svg>
)

const BedIcon = ({ className }: { className?: string }) => (
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
    <path d="M2 16V6m0 4h20m0 6V10a2 2 0 0 0-2-2H8v4M2 20v-4m20 4v-4" />
    <circle cx="6" cy="11" r="1.5" />
  </svg>
)

const PackageIcon = ({ className }: { className?: string }) => (
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
    <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
    <path d="M3 8l9 5 9-5M12 13v8" />
  </svg>
)

const ShipIcon = ({ className }: { className?: string }) => (
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
    <path d="M3 18a4 4 0 0 0 3 1 4 4 0 0 0 3-1 4 4 0 0 0 3 1 4 4 0 0 0 3-1 4 4 0 0 0 3 1" />
    <path d="M4 13l8-3 8 3-1.5 5H5.5z" />
    <path d="M12 10V4M9 6h6" />
  </svg>
)

export const TravelAgencyServices = defineCapsule({
  name: 'TravelAgencyServices',
  description:
    'Premium services band for the Travel Agency page family. Composes the shared FeatureGrid kit composite into a four-column row covering Flights, Hotels, Packages, and Cruises, each with a token-styled inline icon and a concise benefit-led description. Use to summarize what a travel agency offers beneath the hero. All copy is prop-driven with wanderlust-themed defaults so it renders with no props.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const icons = [
      <PlaneIcon className="size-6 text-primary" />,
      <BedIcon className="size-6 text-primary" />,
      <PackageIcon className="size-6 text-primary" />,
      <ShipIcon className="size-6 text-primary" />,
    ]
    const baseServices = props.services?.length
      ? props.services
      : [
          {
            title: 'Flights',
            description:
              'Best-fare routing in every cabin, with flexible dates and seamless rebooking handled by your dedicated advisor.',
          },
          {
            title: 'Hotels',
            description:
              'Hand-picked boutique stays and five-star resorts, complete with upgrades, late checkout, and exclusive perks.',
          },
          {
            title: 'Packages',
            description:
              'All-in-one itineraries that bundle flights, stays, and experiences into one effortless, beautifully priced trip.',
          },
          {
            title: 'Cruises',
            description:
              "Ocean and river voyages to once-in-a-lifetime ports, curated with the suites and shore excursions you'll love.",
          },
        ]
    const features = baseServices.map((service, index) => ({
      ...service,
      icon: icons[index % icons.length],
    }))
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <FeatureGrid
            heading={props.heading ?? 'Everything for your journey'}
            subheading={
              props.subheading ??
              'One trusted team handling every detail, so you can simply look forward to the destination.'
            }
            features={features}
            columns={4}
          />
        </Container>
      </section>
    )
  },
})
