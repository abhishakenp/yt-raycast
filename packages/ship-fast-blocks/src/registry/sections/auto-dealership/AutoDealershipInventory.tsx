import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import {
  AutoLeadActionButton,
  AutoMutationSpinner,
  autoVehicle,
  useSyncAutoVehicles,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { InventoryGrid, InventoryCard } from '#/section-kit/InventoryGrid.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * AutoDealershipInventory — showroom-kinetic featured-inventory grid for an
 * auto dealership / used-car page. An asymmetric header (left-aligned
 * font-black uppercase heading + lead, mono "[ 01 ] Live stock feed" meta on
 * the right) over a giant italic ghost "STOCK" watermark, above a staggered
 * 3-up grid of sharp-cornered vehicle cards — the middle column drops on
 * desktop for kinetic rhythm. Each card has a zoom-on-hover photo with an
 * edge-bleeding skewed badge chip (Certified in inverted foreground,
 * Electric/Hybrid in primary), a mono index numeral, a font-black uppercase
 * year-make-model title, a mono spec line, hairline mono feature chips, and a
 * hairline-ruled footer pairing a giant italic price with a "View Details"
 * action. A skewed hairline "View All" parallelogram button closes the section
 * on a rule line. Cards seed shared search state and their CTAs write Lakebed
 * vehicle-interest leads; View-All routes through section-kit route links. Use
 * as the primary listings / browse-inventory section for dealerships, used-car
 * lots, or EV/hybrid lots. Renders fully with no props via baked-in defaults.
 */
export const AutoDealershipInventory = defineCapsule({
  name: 'AutoDealershipInventory',
  description:
    'Showroom-kinetic featured-inventory grid for an auto dealership / used-car page backed by shared Lakebed vehicle/search state: an asymmetric header (left-aligned font-black uppercase heading and lead, mono live-stock meta right) over a giant italic ghost "STOCK" watermark, above a staggered 3-up grid of sharp-cornered vehicle cards (zoom-on-hover photo with an edge-bleeding skewed Certified/Electric/Hybrid badge chip — electric/hybrid in primary, others inverted — mono index numeral, font-black uppercase year-make-model title, mono spec line, hairline mono feature chips, and a hairline footer pairing a giant italic price with a View Details action), closed by a skewed hairline View-All parallelogram button on a rule line. Cards seed vehicle search and their CTAs write vehicle-interest leads; the View-All button routes through section-kit route links and photos use the alt-driven Image component. Use as the primary listings / browse-inventory section for dealerships, used-car lots, or EV/hybrid lots.',
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
      <section
        className={cn(
          'relative overflow-hidden bg-card py-14 sm:py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-top-2 right-0 italic text-[5rem] sm:text-[8rem] lg:text-[12rem]">
          STOCK
        </Watermark>
        <Container className="relative">
          <div className="mb-10 flex flex-col gap-5 lg:mb-14 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-black uppercase tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag aria-hidden="true" className="shrink-0 lg:pb-1.5">
              [ 01 ] — Live stock feed
            </MonoTag>
          </div>

          <InventoryGrid className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 lg:pb-10">
            {items.map((v, i) => (
              <InventoryCard
                key={v.name}
                className={cn(
                  'rounded-none border-border bg-background transition-all duration-150 hover:-translate-y-0.5 hover:border-primary motion-reduce:transform-none',
                  i % 3 === 1 && 'lg:translate-y-10',
                )}
              >
                <article>
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
                        'absolute -left-1 top-4 inline-block -skew-x-12 py-1 pl-4 pr-3 text-[10px] font-bold uppercase tracking-[0.15em]',
                        v.electric
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-foreground text-background',
                      )}
                    >
                      <span className="inline-block skew-x-12">{v.badge}</span>
                    </span>
                  </div>
                  <div className="space-y-4 p-5 sm:p-6">
                    <div>
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-lg font-black uppercase tracking-tight">
                          {v.name}
                        </h3>
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-[10px] text-muted-foreground/60"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <p className="mt-1 font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
                        {v.specs}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {v.features.map((f) => (
                        <span
                          key={f}
                          className="rounded-none border border-border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-muted-foreground"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between border-t border-border pt-4">
                      <p className="text-2xl font-black italic tracking-tight tabular-nums">
                        {v.price}
                      </p>
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
                        className="font-mono text-[11px] font-semibold uppercase tracking-[0.15em] transition-colors hover:text-primary active:translate-y-px"
                      >
                        View Details →
                      </AutoLeadActionButton>
                    </div>
                  </div>
                </article>
              </InventoryCard>
            ))}
          </InventoryGrid>

          <div className="mt-12 flex items-center gap-6 lg:mt-16">
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <NavbarRouteLink
              className="inline-flex -skew-x-12 items-center justify-center rounded-none border border-foreground px-7 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
              href={viewAll}
            >
              <span className="inline-block skew-x-12">{viewAll}</span>
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
