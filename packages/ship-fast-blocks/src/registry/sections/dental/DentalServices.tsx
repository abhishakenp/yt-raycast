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
 * DentalServices — 6-up services grid for a dental practice / dentist site. A
 * centered eyebrow + heading + lede intro above a responsive 1-to-3 column grid
 * of soft muted cards, each with a rounded tinted icon tile (rotating through
 * shield / sparkle / implant / smile / crown / alert glyphs), a service title, a
 * description, and a check-marked bullet list; cards lift and brighten on hover.
 * Use as the core services overview for dentists, dental offices,
 * orthodontists, or cosmetic / restorative dental clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
export const DentalServices = defineCapsule({
  name: 'DentalServices',
  description:
    '6-up services grid for a dental practice / dentist site: a centered eyebrow + heading + lede intro above a responsive 1-to-3 column grid of soft muted cards, each with a rounded tinted icon tile (rotating shield / sparkle / implant / smile / crown / alert glyphs), a service title, a description, and a check-marked bullet list; cards lift and brighten on hover. Use as the core services overview for dentists, dental offices, orthodontists, or cosmetic / restorative dental clinics.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: localServiceLakebed,
  component: ({ props, lakebed }) => {
    const servicesEyebrow = props.eyebrow ?? 'Our Services'
    const servicesHeading =
      props.heading ?? 'Comprehensive dental care for your entire family'
    const servicesDesc =
      props.description ??
      'From routine cleanings to advanced cosmetic procedures, we provide a full spectrum of dental services using the latest technology.'
    const serviceItems = props.items?.length
      ? props.items
      : [
          {
            title: 'Preventive Care',
            description:
              'Regular checkups, professional cleanings, fluoride treatments, and dental sealants to keep your smile healthy and catch issues early.',
            points: [
              'Comprehensive exams',
              'Digital X-rays',
              'Oral cancer screenings',
            ],
          },
          {
            title: 'Cosmetic Dentistry',
            description:
              'Transform your smile with veneers, professional whitening, bonding, and smile makeovers designed to boost your confidence.',
            points: [
              'Porcelain veneers',
              'Professional whitening',
              'Invisalign clear aligners',
            ],
          },
          {
            title: 'Dental Implants',
            description:
              'Permanent tooth replacement solutions that look, feel, and function like natural teeth. From single implants to full-arch restorations.',
            points: [
              'Single tooth implants',
              'All-on-4 full arch',
              'Implant-supported bridges',
            ],
          },
          {
            title: 'Orthodontics',
            description:
              'Straighten your teeth with modern orthodontic solutions including Invisalign, ceramic braces, and traditional braces for all ages.',
            points: [
              'Invisalign treatment',
              'Clear ceramic braces',
              'Retainers and night guards',
            ],
          },
          {
            title: 'Restorative Dentistry',
            description:
              'Repair damaged or missing teeth with crowns, bridges, fillings, and dentures crafted to match your natural smile perfectly.',
            points: [
              'CEREC same-day crowns',
              'Tooth-colored fillings',
              'Custom dentures',
            ],
          },
          {
            title: 'Emergency Care',
            description:
              "Dental emergencies can't wait. We offer same-day appointments for toothaches, broken teeth, knocked-out teeth, and other urgent issues.",
            points: [
              'Same-day appointments',
              'Root canal therapy',
              'Tooth extractions',
            ],
          },
        ]
    useSyncLocalServices(
      lakebed,
      serviceItems.map((item) =>
        localServiceItem({
          name: item.title,
          summary: item.description,
        }),
      ),
    )
    const Check = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 0 1 0 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4a1 1 0 0 1 1.414-1.414L8 12.586l7.293-7.293a1 1 0 0 1 1.414 0z"
          clipRule="evenodd"
        />
      </svg>
    )
    const serviceIcons: ReactNode[] = [
      // shield check (preventive)
      <svg
        key="shield"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
      // sparkle (cosmetic)
      <svg
        key="sparkle"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>,
      // implant (lightning/tooth)
      <svg
        key="implant"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M19.428 15.428a2 2 0 0 0-1.022-.547l-2.387-.477a6 6 0 0 0-3.86.517l-.318.158a6 6 0 0 1-3.86.517L6.05 15.21a2 2 0 0 0-1.806.547M8 4h8l-1 1v5.172a2 2 0 0 0 .586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 0 0 9 10.172V5L8 4z" />
      </svg>,
      // smile (ortho)
      <svg
        key="smile"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M14.828 14.828a4 4 0 0 1-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
      // crown/restore
      <svg
        key="restore"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
      </svg>,
      // emergency (alert)
      <svg
        key="emergency"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-7"
        aria-hidden="true"
      >
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>,
    ]
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-wider text-primary">
              {servicesEyebrow}
            </span>
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {servicesHeading}
            </h2>
            <p className="text-lg text-muted-foreground">{servicesDesc}</p>
          </div>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {serviceItems.map((item, i) => (
              <LocalServiceBookingButton
                key={item.title}
                lakebed={lakebed}
                intentLabel={`Book ${item.title}`}
                service={item.title}
                source="services"
                pendingChildren={<LocalServiceMutationSpinner />}
                className="group rounded-2xl border border-transparent bg-muted p-8 text-left transition-all hover:border-border hover:bg-card hover:shadow-xl disabled:pointer-events-none disabled:opacity-70"
              >
                <div className="mb-6 grid size-14 place-items-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  {serviceIcons[i % serviceIcons.length]}
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  {item.description}
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {item.points.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <Check className="size-4 shrink-0 text-primary" />
                      {p}
                    </li>
                  ))}
                </ul>
              </LocalServiceBookingButton>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
