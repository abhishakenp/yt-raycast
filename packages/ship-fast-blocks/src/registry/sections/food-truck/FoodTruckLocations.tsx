import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { LocationBlock, LocationHours } from '#/section-kit/LocationBlock.tsx'
import {
  LocationList,
  LocationItem,
  LocationCard,
} from '#/section-kit/LocationList.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FoodTruckLocations — a sticker-poster weekly LOCATIONS schedule for a food-truck site.
 * On a muted band under a giant ghost "OPEN" watermark, a mono index eyebrow + extrabold
 * slab heading + intro sits above a collapsed-border 3-up ledger of day slabs, each with a
 * rotating chart-tinted square rubber-stamp initial tile, the day name + mono neighborhood,
 * and a mono key/value list of address, times and notes. A full-width inverted banner with
 * a slanted clip-path seam beneath promotes private-events availability with an info icon
 * and a hard-bordered slab CTA (press feedback) that routes through section-kit route links.
 * Use as the schedule / where-to-find-us section for food trucks, street-food vendors or
 * pop-up kitchens that rotate locations.
 */
export const FoodTruckLocations = defineCapsule({
  name: 'FoodTruckLocations',
  description:
    'Sticker-poster weekly LOCATIONS schedule for a food-truck site: on a muted band under a giant ghost "OPEN" watermark, a mono index eyebrow + extrabold slab heading + intro above a collapsed-border 3-up ledger of day slabs, each with a rotating chart-tinted square rubber-stamp initial tile, the day name + mono neighborhood, and a mono key/value list of address, times and notes; a full-width inverted banner with a slanted clip-path seam beneath promotes private-events availability with an info icon and a hard-bordered slab CTA that routes through section-kit route links. Use as the schedule / where-to-find-us section for food trucks, street-food vendors, taco trucks or pop-up kitchens that rotate locations across a city.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    days: z
      .array(
        z.object({
          initial: z.string(),
          day: z.string(),
          area: z.string(),
          rows: z.array(z.object({ label: z.string(), value: z.string() })),
        }),
      )
      .optional(),
    bannerTitle: z.string().optional(),
    bannerNote: z.string().optional(),
    bannerCta: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const locEyebrow = props.eyebrow ?? 'Weekly Schedule'
    const locHeading = props.heading ?? 'Find the Truck'
    const locDesc =
      props.description ??
      "We rotate through LA's best neighborhoods. Check our live location tracker on Instagram."
    const locDays = props.days?.length
      ? props.days
      : [
          {
            initial: 'M',
            day: 'Monday',
            area: 'Downtown Arts District',
            rows: [
              { label: 'Location', value: 'Traction Ave & 3rd' },
              { label: 'Time', value: '11:00 AM – 2:30 PM' },
              { label: 'Evening', value: '5:00 – 9:00 PM' },
            ],
          },
          {
            initial: 'T',
            day: 'Tuesday',
            area: 'Culver City',
            rows: [
              { label: 'Location', value: 'Culver Steps Plaza' },
              { label: 'Time', value: '11:00 AM – 2:30 PM' },
              { label: 'Evening', value: '5:30 – 8:30 PM' },
            ],
          },
          {
            initial: 'W',
            day: 'Wednesday',
            area: 'Santa Monica',
            rows: [
              { label: 'Location', value: 'Main St & Ocean Park' },
              { label: 'Time', value: '11:00 AM – 3:00 PM' },
              { label: 'Evening', value: '5:00 – 8:00 PM' },
            ],
          },
          {
            initial: 'T',
            day: 'Thursday',
            area: 'Silver Lake',
            rows: [
              { label: 'Location', value: 'Sunset Junction' },
              { label: 'Time', value: '11:30 AM – 2:30 PM' },
              { label: 'Evening', value: '6:00 – 10:00 PM' },
            ],
          },
          {
            initial: 'F',
            day: 'Friday',
            area: 'DTLA Financial District',
            rows: [
              { label: 'Location', value: '7th & Figueroa' },
              { label: 'Time', value: '11:00 AM – 2:30 PM' },
              { label: 'Evening', value: '5:00 – 9:00 PM' },
            ],
          },
          {
            initial: 'S',
            day: 'Saturday',
            area: 'Smorgasburg LA',
            rows: [
              { label: 'Location', value: 'Row DTLA' },
              { label: 'Time', value: '10:00 AM – 4:00 PM' },
              { label: 'Note', value: 'All day event' },
            ],
          },
        ]
    const locBannerTitle = props.bannerTitle ?? 'Sunday: Private Events Only'
    const locBannerNote = props.bannerNote ?? 'Available for catering bookings'
    const locBannerCta = props.bannerCta ?? 'Book Us'

    // Rotating accent tokens for decorative day tiles (no raw palette).
    const dayAccents = [
      'bg-chart-1/15 text-chart-1',
      'bg-chart-2/15 text-chart-2',
      'bg-chart-3/15 text-chart-3',
      'bg-chart-4/15 text-chart-4',
      'bg-chart-5/15 text-chart-5',
      'bg-primary/10 text-primary',
    ]

    return (
      <LocationBlock
        className={cn(
          'relative overflow-hidden rounded-none border-0 bg-muted px-6 pt-24 pb-20',
          props.className,
        )}
      >
        <Watermark className="-right-6 top-8 text-[7rem] sm:text-[12rem] lg:text-[17rem]">
          OPEN
        </Watermark>
        <LocationList>
          <Container size="lg" className="relative">
            <SectionHeading
              eyebrow={`02 / ${locEyebrow}`}
              title={locHeading}
              subtitle={locDesc}
              align="left"
              eyebrowClassName="font-mono uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="text-4xl font-extrabold tracking-tighter md:text-5xl"
              subtitleClassName="max-w-lg"
              className="mb-12 items-start text-left"
            />

            <ResponsiveGrid className="md:grid-cols-3 gap-0 border-l-2 border-t-2 border-foreground">
              {locDays.map((d, i) => (
                <LocationItem key={d.day}>
                  <LocationCard className="h-full rounded-none border-b-2 border-r-2 border-foreground bg-card p-6 shadow-none">
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={cn(
                          'grid size-11 -rotate-3 place-items-center rounded-none border-2 border-foreground font-extrabold',
                          dayAccents[i % dayAccents.length],
                        )}
                      >
                        {d.initial}
                      </div>
                      <div>
                        <h3 className="font-extrabold tracking-tight">
                          {d.day}
                        </h3>
                        <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                          {d.area}
                        </p>
                      </div>
                    </div>
                    <LocationHours className="space-y-2 border-t-2 border-dashed border-foreground/20 pt-3 text-sm">
                      {(d.rows ?? []).map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-4"
                        >
                          <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-right font-bold tabular-nums">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </LocationHours>
                  </LocationCard>
                </LocationItem>
              ))}
            </ResponsiveGrid>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 border-2 border-foreground bg-foreground p-6 pt-9 text-background [clip-path:polygon(0_1.25rem,100%_0,100%_100%,0_100%)] md:flex-row md:pt-6">
              <div className="flex items-center gap-4">
                <div className="grid size-12 rotate-2 place-items-center rounded-none border-2 border-background bg-background/10">
                  <svg
                    className="size-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="font-extrabold tracking-tight">
                    {locBannerTitle}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-background/70">
                    {locBannerNote}
                  </p>
                </div>
              </div>
              <NavbarRouteLink
                className="rounded-none border-2 border-background bg-background px-6 py-2.5 font-bold uppercase tracking-wide text-foreground transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0] hover:shadow-background active:translate-y-px active:shadow-none"
                href={locBannerCta}
              >
                {locBannerCta}
              </NavbarRouteLink>
            </div>
          </Container>
        </LocationList>
      </LocationBlock>
    )
  },
})
