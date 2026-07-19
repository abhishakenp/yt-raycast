import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
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
 * FoodTruckLocations — a weekly LOCATIONS schedule section for a food-truck site. On a
 * subtle muted band, a centered eyebrow + heading + intro sits above a 3-up responsive
 * grid of day cards, each with a rotating chart-tinted initial tile, the day name +
 * neighborhood, and a key/value list of address, times and notes. A full-width inverted
 * banner beneath promotes private-events availability with an info icon and a pill CTA
 * that routes through section-kit route links. Use as the schedule/where-to-find-us section for food
 * trucks, street-food vendors or pop-up kitchens that rotate locations.
 */
export const FoodTruckLocations = defineCapsule({
  name: 'FoodTruckLocations',
  description:
    'Weekly LOCATIONS schedule section for a food-truck site: on a subtle muted band, a centered eyebrow + heading + intro above a 3-up responsive grid of day cards, each with a rotating chart-tinted initial tile, the day name + neighborhood, and a key/value list of address, times and notes; a full-width inverted banner beneath promotes private-events availability with an info icon and a pill CTA that routes through section-kit route links. Use as the schedule / where-to-find-us section for food trucks, street-food vendors, taco trucks or pop-up kitchens that rotate locations across a city.',
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
        className={cn('bg-muted px-6 pt-28 pb-20 border-0', props.className)}
      >
        <LocationList>
          <Container size="lg">
            <SectionHeading
              eyebrow={locEyebrow}
              title={locHeading}
              subtitle={locDesc}
              align="center"
              eyebrowClassName="text-muted-foreground tracking-widest"
              titleClassName="text-3xl font-bold md:text-4xl"
              subtitleClassName="mx-auto max-w-lg"
              className="mb-16"
            />

            <ResponsiveGrid className="md:grid-cols-3 gap-6">
              {locDays.map((d, i) => (
                <LocationItem key={d.day}>
                  <LocationCard>
                    <div className="mb-4 flex items-center gap-3">
                      <div
                        className={cn(
                          'grid size-12 place-items-center rounded-lg font-bold',
                          dayAccents[i % dayAccents.length],
                        )}
                      >
                        {d.initial}
                      </div>
                      <div>
                        <h3 className="font-semibold">{d.day}</h3>
                        <p className="text-sm text-muted-foreground">
                          {d.area}
                        </p>
                      </div>
                    </div>
                    <LocationHours className="space-y-2 text-sm">
                      {(d.rows ?? []).map((row) => (
                        <div
                          key={row.label}
                          className="flex justify-between gap-4"
                        >
                          <span className="text-muted-foreground">
                            {row.label}
                          </span>
                          <span className="text-right font-medium">
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </LocationHours>
                  </LocationCard>
                </LocationItem>
              ))}
            </ResponsiveGrid>

            <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-xl bg-foreground p-6 text-background md:flex-row">
              <div className="flex items-center gap-4">
                <div className="grid size-12 place-items-center rounded-lg bg-background/10">
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
                  <p className="font-semibold">{locBannerTitle}</p>
                  <p className="text-sm text-background/70">{locBannerNote}</p>
                </div>
              </div>
              <NavbarRouteLink
                className="rounded-full bg-background px-6 py-2 font-medium text-foreground transition-colors hover:bg-background/90"
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
