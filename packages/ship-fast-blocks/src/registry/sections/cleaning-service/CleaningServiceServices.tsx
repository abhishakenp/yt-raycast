import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LocalServiceBookingButton,
  LocalServiceMutationSpinner,
  localServiceItem,
  useSyncLocalServices,
} from '../local-service/local-service-interactions.tsx'
import { localServiceLakebed } from '../local-service/local-service-lakebed.ts'

/**
 * CleaningServiceServices — a 6-up cleaning-services capabilities grid for a home-cleaning / maid-service landing page. A centered section heading + lead paragraph above a responsive 1/2/3-column grid of clickable service cards; each card has a rounded icon tile (cycling through inline line-icons), a title, a description, and a from-price line. Cards gain a border highlight and lift shadow on hover, and each routes through useNavigate on click. Use for "what we do" / services blocks for residential cleaning companies, maid services, housekeeping platforms, or local home-service brands. Renders fully with no props via six baked-in default services.
 */
import { Container } from '#/section-kit/Container.tsx'
export const CleaningServiceServices = defineCapsule({
  name: 'CleaningServiceServices',
  description:
    "A 6-up cleaning-services capabilities grid for a home-cleaning / maid-service landing page: centered heading and lead paragraph above a responsive 1/2/3-column grid of clickable service cards, each with a rounded icon tile (cycling inline line-icons), title, description, and from-price line. Cards gain border highlight and lift shadow on hover; each routes through useNavigate on click. Use for 'what we do' services blocks for residential cleaning, maid services, housekeeping, or local home-service brands.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title + description + from-price. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          price: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Services designed around your life'
    const description =
      props.description ??
      'From one-time deep cleans to recurring maintenance, we have a service that fits your schedule and budget.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Standard Cleaning',
            description:
              'Perfect for weekly or bi-weekly maintenance. Includes dusting, vacuuming, mopping, bathroom sanitization, and kitchen wipe-down.',
            price: 'From $129 per visit',
          },
          {
            title: 'Deep Cleaning',
            description:
              'Intensive cleaning for neglected spaces. Inside appliances, baseboards, light fixtures, window sills, and detailed scrubbing of every surface.',
            price: 'From $249 per visit',
          },
          {
            title: 'Move-In/Move-Out',
            description:
              'Comprehensive cleaning for transitions. Cabinets, closets, appliances, and every nook cleaned to ensure your deposit return or fresh start.',
            price: 'From $349 per visit',
          },
          {
            title: 'Post-Construction',
            description:
              'Specialized cleaning after renovations. Dust removal, paint spot cleaning, debris disposal, and polishing of newly installed fixtures.',
            price: 'From $399 per visit',
          },
          {
            title: 'Same-Day Service',
            description:
              'Urgent cleaning when you need it most. Last-minute bookings available for unexpected guests, events, or emergencies within 4 hours.',
            price: 'From $199 per visit',
          },
          {
            title: 'Eco-Friendly Cleaning',
            description:
              'Plant-based, non-toxic products safe for children and pets. HEPA filtration vacuums and sustainable practices for health-conscious homes.',
            price: 'From $159 per visit',
          },
        ]
    useSyncLocalServices(
      lakebed,
      items.map((item) =>
        localServiceItem({
          name: item.title,
          price: item.price,
          summary: item.description,
        }),
      ),
    )
    const serviceIcons: ReactNode[] = [
      <svg
        key="home"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h6" />
      </svg>,
      <svg
        key="bolt"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>,
      <svg
        key="calendar"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
      <svg
        key="building"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>,
      <svg
        key="clock"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>,
      <svg
        key="shield-check"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>,
    ]
    return (
      <section className={cn('bg-background py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {items.map((item, i) => (
              <LocalServiceBookingButton
                key={item.title}
                lakebed={lakebed}
                intentLabel={`Book ${item.title}`}
                service={item.title}
                source="services"
                pendingChildren={<LocalServiceMutationSpinner />}
                className="group rounded-2xl border border-border bg-muted/40 p-8 text-left transition-all hover:border-primary/30 hover:shadow-lg disabled:pointer-events-none disabled:opacity-70"
              >
                <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <p className="font-semibold text-primary">{item.price}</p>
              </LocalServiceBookingButton>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
