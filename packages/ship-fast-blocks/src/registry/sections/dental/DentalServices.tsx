import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
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
    return (
      <section className={cn('bg-background py-24', props.className)}>
        <Container>
          <SectionHeading
            eyebrow={servicesEyebrow}
            title={servicesHeading}
            subtitle={servicesDesc}
            className="mb-16 max-w-3xl gap-0"
            eyebrowClassName="mb-3 inline-block text-xs font-semibold tracking-wider text-primary"
            titleClassName="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            subtitleClassName="text-lg text-muted-foreground"
          />
          <ServicesGrid columns={3}>
            {serviceItems.map((f) => {
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
                <ServiceCard key={__iv__.title}>
                  {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                  <ServiceTitle>{__iv__.title}</ServiceTitle>
                  <ServiceDescription>{__iv__.description}</ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
