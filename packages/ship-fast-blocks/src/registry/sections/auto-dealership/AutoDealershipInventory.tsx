import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  AutoLeadActionButton,
  AutoMutationSpinner,
  autoVehicle,
  useSyncAutoVehicles,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'

/**
 * AutoDealershipInventory — featured-inventory card grid for an auto dealership
 * / used-car page. A centered heading + lead over a responsive 3-up grid of
 * vehicle cards: each card has a zoom-on-hover photo with a corner badge
 * (Certified / Electric / Hybrid — electric/hybrid tinted differently),
 * year-make-model title, a mileage / transmission / drivetrain spec line,
 * feature chips (Leather, Navigation, Autopilot…), and a price + "View Details"
 * footer. A centered "View All" button sits below the grid. Cards seed shared
 * search state and their CTAs write Lakebed vehicle-interest leads; View-All
 * routes through useNavigate. Use as the primary listings /
 * browse-inventory section for dealerships, used-car lots, or EV/hybrid lots.
 * Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipInventory = defineCapsule({
  name: 'AutoDealershipInventory',
  description:
    'Featured-inventory card grid for an auto dealership / used-car page backed by shared Lakebed vehicle/search state: a centered heading and lead over a responsive 3-up grid of vehicle cards (zoom-on-hover photo with a Certified/Electric/Hybrid corner badge, year-make-model title, mileage / transmission / drivetrain spec line, feature chips like Leather/Navigation/Autopilot, and a price + View Details footer), plus a centered View-All button below. Cards seed vehicle search and their CTAs write vehicle-interest leads; the View-All button routes through useNavigate and photos use the alt-driven Image component. Use as the primary listings / browse-inventory section for dealerships, used-car lots, or EV/hybrid lots.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Label for the centered View-All button below the grid. */
    viewAll: z.string().optional(),
    /** Vehicle cards. */
    items: z
      .array(
        z.object({
          name: z.string(),
          specs: z.string(),
          price: z.string(),
          badge: z.string(),
          electric: z.boolean().optional(),
          features: z.array(z.string()),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const heading = props.heading ?? 'Featured Inventory'
    const description =
      props.description ??
      'Browse our hand-picked selection of certified pre-owned vehicles. Every car passes a 150-point inspection.'
    const viewAll = props.viewAll ?? 'View All 200+ Vehicles'
    const items = props.items?.length
      ? props.items
      : [
          {
            name: '2022 BMW 330i',
            specs: '28,450 miles · Automatic · RWD',
            price: '$38,995',
            badge: 'Certified',
            features: ['Leather', 'Navigation', 'Sunroof'],
            imageAlt: 'Black BMW 3 Series sedan front three-quarter view',
          },
          {
            name: '2021 Mercedes C300',
            specs: '35,200 miles · Automatic · AWD',
            price: '$41,500',
            badge: 'Certified',
            features: ['Premium Audio', 'Heated Seats', 'Blind Spot'],
            imageAlt:
              'White Mercedes-Benz C-Class luxury sedan in showroom lighting',
          },
          {
            name: '2023 Tesla Model 3',
            specs: '12,800 miles · Auto · Long Range',
            price: '$42,995',
            badge: 'Electric',
            electric: true,
            features: ['Autopilot', 'Glass Roof', '358 mi Range'],
            imageAlt:
              'Tesla Model 3 electric vehicle in pearl white exterior finish',
          },
          {
            name: '2022 Lexus RX 350',
            specs: '41,000 miles · Automatic · AWD',
            price: '$45,750',
            badge: 'Certified',
            features: ['Mark Levinson', 'Panoramic Roof', 'Safety+'],
            imageAlt: 'Lexus RX SUV in silver metallic paint on paved driveway',
          },
          {
            name: '2021 Audi A4 Premium',
            specs: '32,600 miles · Automatic · AWD',
            price: '$36,995',
            badge: 'Certified',
            features: ['Virtual Cockpit', 'LED Lights', 'Quattro'],
            imageAlt: 'Audi A4 sedan in dark blue exterior color profile view',
          },
          {
            name: '2023 Toyota RAV4 Hybrid',
            specs: '18,900 miles · CVT · AWD',
            price: '$34,250',
            badge: 'Hybrid',
            electric: true,
            features: ['40 MPG', 'CarPlay', 'Adaptive Cruise'],
            imageAlt:
              'Toyota RAV4 hybrid compact SUV in white with black roof rails',
          },
        ]
    useSyncAutoVehicles(
      lakebed,
      items.map((vehicle) =>
        autoVehicle({
          badge: vehicle.badge,
          imageAlt: vehicle.imageAlt,
          name: vehicle.name,
          price: vehicle.price,
          specs: vehicle.specs,
        }),
      ),
    )

    return (
      <section className={cn('bg-card py-16 lg:py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold tracking-tight sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((v) => (
              <article
                key={v.name}
                className="group overflow-hidden rounded-lg border border-border bg-muted transition-colors hover:border-foreground/30"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    alt={v.imageAlt}
                    w={600}
                    h={450}
                    loading="lazy"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span
                    className={cn(
                      'absolute left-4 top-4 rounded px-2 py-1 text-xs font-medium',
                      v.electric
                        ? 'bg-chart-2 text-primary-foreground'
                        : 'bg-primary text-primary-foreground',
                    )}
                  >
                    {v.badge}
                  </span>
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <h3 className="text-lg font-semibold">{v.name}</h3>
                    <p className="text-sm text-muted-foreground">{v.specs}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {v.features.map((f) => (
                      <span
                        key={f}
                        className="rounded bg-secondary px-2 py-1 text-xs text-secondary-foreground"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-4">
                    <p className="text-2xl font-semibold">{v.price}</p>
                    <AutoLeadActionButton
                      lakebed={lakebed}
                      action="vehicle_interest"
                      label="View Details"
                      intentKey={`vehicle:${v.name}`}
                      source="inventory"
                      vehicle={v.name}
                      pendingChildren={
                        <>
                          <AutoMutationSpinner />
                          Sending
                        </>
                      }
                      className="text-sm font-medium transition-colors hover:text-muted-foreground"
                    >
                      View Details →
                    </AutoLeadActionButton>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(viewAll)}
              className="inline-flex items-center justify-center rounded-md border border-border bg-card px-6 py-3 text-base font-medium text-foreground transition-colors hover:bg-accent"
            >
              {viewAll}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
