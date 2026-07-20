import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  LocationBlock,
  LocationMap,
  LocationHours,
  LocationContact,
} from '#/section-kit/LocationBlock.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * CafeLocation — newsprint visitor's-ledger location block for a cozy cafe /
 * coffee shop page on a kraft-toned muted wash. A mono dateline rail (cap
 * stamp, hairline rule, edition label) above an asymmetric 7:5 pairing of the
 * serif heading with the right-aligned description. Below, an asymmetric 5:7
 * split: the left column runs a hairline-ruled directory ledger — Address,
 * Hours, Contact, and Social rows, each led by a mono uppercase label column —
 * followed by a row of square dashed stamp chips for amenities; the right
 * column frames the large map image in a hairline photo plate with a mono
 * caption row and a sharp square "Open in Google Maps" overlay button. Every
 * social link and the map button route through section-kit route links. Use
 * for cafes, bakeries, tea houses, or any local business visit block. Renders
 * fully with no props via baked-in defaults.
 */
export const CafeLocation = defineCapsule({
  name: 'CafeLocation',
  description:
    "Newsprint visitor's-ledger location block for a cozy cafe page on a kraft-toned muted wash: a mono dateline rail above an asymmetric 7:5 serif heading + right-aligned description pairing; below, an asymmetric 5:7 split with a hairline-ruled directory ledger on the left (Address, Hours, Contact, Social rows each led by a mono uppercase label column, then square dashed amenity stamp chips) and the large map image on the right framed in a hairline photo plate with a mono caption row and a sharp square overlay button. Social links and the map button route through section-kit route links. Use for cafes, bakeries, tea houses, or any local business visit block.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Address lines (shown in the Address tile). */
    addressLines: z.array(z.string()).optional(),
    /** Hours lines (shown in the Hours tile). */
    hoursLines: z.array(z.string()).optional(),
    /** Phone number (shown in the Contact tile). */
    phone: z.string().optional(),
    /** Email (shown in the Contact tile). */
    email: z.string().optional(),
    /** Social link labels (shown in the Social tile). */
    socials: z.array(z.string()).optional(),
    /** Amenity chip labels. */
    amenities: z.array(z.string()).optional(),
    /** Alt text driving the map image. */
    mapAlt: z.string().optional(),
    /** Map overlay button label. */
    mapCta: z.string().optional(),
    /** Navigation target for the map overlay button. */
    mapTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'Visit Us'
    const heading = props.heading ?? 'Find your spot'
    const description =
      props.description ??
      "In the heart of Portland's Pearl District. Street parking available, bike friendly, and steps from the Streetcar."
    const addressLines = props.addressLines?.length
      ? props.addressLines
      : ['1242 NW Glisan Street', 'Portland, OR 97209']
    const hoursLines = props.hoursLines?.length
      ? props.hoursLines
      : [
          'Monday – Friday: 7am – 7pm',
          'Saturday – Sunday: 8am – 6pm',
          'Holiday hours may vary',
        ]
    const phone = props.phone ?? '(503) 555-0192'
    const email = props.email ?? 'hello@littleowlcoffee.com'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Facebook']
    const amenities = props.amenities?.length
      ? props.amenities
      : [
          'Free WiFi',
          'Outdoor Seating',
          'Dog Friendly',
          'Wheelchair Accessible',
          'Bike Parking',
          'Work-Friendly',
        ]
    const mapAlt =
      props.mapAlt ??
      'Aerial map view showing Portland Pearl District with NW Glisan Street location marked, surrounded by city blocks and streets'
    const mapCta = props.mapCta ?? 'Open in Google Maps'
    const mapTarget = props.mapTarget ?? 'Location'

    const MapPin = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    )

    const LedgerRow = ({
      label,
      children,
    }: {
      label: string
      children: React.ReactNode
    }) => (
      <div className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-foreground/15 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
        <MonoTag className="pt-0.5">{label}</MonoTag>
        <div>{children}</div>
      </div>
    )

    return (
      <section
        className={cn(
          'bg-muted/40 pt-24 pb-16 lg:pt-32 lg:pb-24',
          props.className,
        )}
      >
        <Container size="xl" className="px-6">
          <div className="flex items-center gap-4">
            <MonoTag>{cap}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden sm:inline">
              The Directory
            </MonoTag>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-12 lg:items-end lg:gap-10">
            <h2 className="font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl lg:col-span-7">
              {heading}
            </h2>
            <p className="max-w-md text-base leading-relaxed text-muted-foreground lg:col-span-5 lg:justify-self-end lg:text-right">
              {description}
            </p>
          </div>

          <LocationBlock className="mt-12 grid gap-12 border-0 bg-transparent lg:mt-16 lg:grid-cols-12 lg:gap-14">
            {/* Directory ledger. */}
            <div className="lg:col-span-5">
              <div className="border-t border-foreground/15">
                <LedgerRow label="Address">
                  <div className="space-y-0.5 text-foreground">
                    {addressLines.map((line, i) => (
                      <p key={i} className="font-serif text-lg">
                        {line}
                      </p>
                    ))}
                  </div>
                </LedgerRow>
                <LedgerRow label="Hours">
                  <LocationHours className="space-y-1 text-muted-foreground">
                    {hoursLines.map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </LocationHours>
                </LedgerRow>
                <LedgerRow label="Contact">
                  <LocationContact className="space-y-1 text-muted-foreground">
                    <p>{phone}</p>
                    <p>{email}</p>
                  </LocationContact>
                </LedgerRow>
                <LedgerRow label="Social">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    {socials.map((social) => (
                      <NavbarRouteLink
                        key={social}
                        aria-label={social}
                        className="border-b border-foreground/30 pb-0.5 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
                        href={social}
                      >
                        {social}
                      </NavbarRouteLink>
                    ))}
                  </div>
                </LedgerRow>
              </div>

              {/* Amenity stamp chips. */}
              <div className="mt-8">
                <MonoTag tone="faint">Amenities</MonoTag>
                <div className="mt-3 flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <span
                      key={a}
                      className={cn(
                        'inline-flex items-center border border-dashed border-foreground/30 bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-foreground',
                        i % 3 === 1 && 'rotate-[0.6deg]',
                        i % 3 === 2 && '-rotate-[0.6deg]',
                      )}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map plate. */}
            <div className="lg:col-span-7">
              <div className="border border-foreground/20 bg-card p-2.5">
                <LocationMap className="relative aspect-[3/2] h-auto min-h-0 overflow-hidden rounded-none">
                  <Image
                    alt={mapAlt}
                    w={1200}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                    <NavbarRouteLink
                      className="inline-flex items-center gap-2 border border-background bg-background px-6 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
                      href={mapTarget}
                    >
                      <MapPin className="size-4" />
                      {mapCta}
                    </NavbarRouteLink>
                  </div>
                </LocationMap>
                <div className="flex items-center gap-2 px-1 pt-2.5 pb-0.5">
                  <MonoTag tone="faint" className="text-[10px]">
                    Fig. 03 — The Map
                  </MonoTag>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                </div>
              </div>
            </div>
          </LocationBlock>
        </Container>
      </section>
    )
  },
})
