import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'

/**
 * CafeLocation — visit / location block for a cozy cafe / coffee shop page,
 * on a card-colored band. A centered cap, serif heading, and description above
 * a two-column layout: the left shows address, hours, and contact info tiles
 * (with inline icons), a social row, and a flex-wrap amenities chip row; the
 * right shows a large map image with an overlay "Open in Google Maps" button.
 * Every social link and the map button route through useNavigate. Use for
 * cafes, bakeries, tea houses, or any local business visit block. Renders fully
 * with no props via baked-in defaults.
 */
export const CafeLocation = defineCapsule({
  name: 'CafeLocation',
  description:
    "Visit / location block for a cozy cafe page on a card-colored band: centered cap, serif heading, and description above a two-column layout. Left side shows address, hours, and contact tiles with inline icons; a social row; and a flex-wrap amenities chip row. Right side shows a large map image with an overlay 'Open in Google Maps' button. Social links and the map button route through useNavigate. Use for cafes, bakeries, tea houses, or any local business visit block.",
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
    const go = useNavigate()
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

    const ClockIcon = ({ className }: { className?: string }) => (
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
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    )

    const PhoneIcon = ({ className }: { className?: string }) => (
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
          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
        />
      </svg>
    )

    const ChatIcon = ({ className }: { className?: string }) => (
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
          d="M8.228 9c.549-1.385 2.432-4 6.022-4 2.972 0 4.943 1.818 5.463 4.066l1.756-.395C20.86 1.923 17.373 0 14.25 0c-5.06 0-8.386 3.586-9.44 6.522L8.228 9zm7.052 2.118c-.566 1.385-2.439 4-6.052 4-2.972 0-4.943-1.818-5.463-4.066l-1.756.395C3.14 22.077 6.627 24 9.75 24c5.06 0 8.386-3.586 9.44-6.522l-1.01-2.36z"
        />
      </svg>
    )

    const locationInfo = [
      {
        icon: <MapPin className="size-6" />,
        title: 'Address',
        lines: addressLines,
      },
      {
        icon: <ClockIcon className="size-6" />,
        title: 'Hours',
        lines: hoursLines,
      },
      {
        icon: <PhoneIcon className="size-6" />,
        title: 'Contact',
        lines: [phone, email],
      },
    ]

    return (
      <section className={cn('bg-card py-20 lg:py-32', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-primary">
              {cap}
            </p>
            <h2 className="mb-6 font-serif text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
              {heading}
            </h2>
            <p className="text-muted-foreground">{description}</p>
          </div>

          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="space-y-8">
              <div className="grid gap-8 sm:grid-cols-2">
                {locationInfo.map((info) => (
                  <div key={info.title}>
                    <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                      {info.icon}
                    </div>
                    <h3 className="mb-2 font-serif text-lg font-medium text-foreground">
                      {info.title}
                    </h3>
                    <div className="space-y-1 text-muted-foreground">
                      {info.lines.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}

                <div>
                  <div className="mb-4 grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <ChatIcon className="size-6" />
                  </div>
                  <h3 className="mb-2 font-serif text-lg font-medium text-foreground">
                    Social
                  </h3>
                  <div className="flex gap-4">
                    {socials.map((social) => (
                      <button
                        key={social}
                        type="button"
                        aria-label={social}
                        onClick={() => go(social)}
                        className="text-muted-foreground transition-colors hover:text-primary"
                      >
                        {social}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="border-t border-border pt-8">
                <h4 className="mb-4 font-medium text-foreground">Amenities</h4>
                <div className="flex flex-wrap gap-3">
                  {amenities.map((a) => (
                    <span
                      key={a}
                      className="rounded-full bg-muted px-4 py-2 text-sm text-foreground"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="relative h-full min-h-[400px] overflow-hidden rounded-xl bg-muted">
              <Image
                alt={mapAlt}
                w={1200}
                h={800}
                loading="lazy"
                className="size-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-foreground/40">
                <button
                  type="button"
                  onClick={() => go(mapTarget)}
                  className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-medium text-foreground transition-colors hover:bg-muted"
                >
                  <MapPin className="size-5" />
                  {mapCta}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
