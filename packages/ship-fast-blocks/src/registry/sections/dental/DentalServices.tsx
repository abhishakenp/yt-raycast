import { defineCapsule } from '#/capsules/openui.ts'
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
 * DentalServices — collapsed-border services ledger for a dental practice /
 * dentist site. An asymmetric header (left-aligned mono eyebrow + heading +
 * lede, mono index meta on the right) above a hairline collapsed-border 1-to-3
 * column grid of square cells. Each cell carries a zero-padded mono index
 * numeral, a service title, a description, a hairline-divided tick list of
 * inclusions (primary tick dashes), and a quiet square outline "Book Now"
 * button that inverts to the foreground color on hover with press feedback.
 * Use as the core services overview for dentists, dental offices,
 * orthodontists, or cosmetic / restorative dental clinics.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
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
    'Collapsed-border services ledger for a dental practice / dentist site: an asymmetric header (left-aligned mono eyebrow + heading + lede, mono index meta right) above a hairline collapsed-border 1-to-3 column grid of square cells, each with a zero-padded mono index numeral, a service title, a description, a hairline-divided tick list of inclusions, and a quiet square outline Book-Now button that inverts on hover. Use as the core services overview for dentists, dental offices, orthodontists, or cosmetic / restorative dental clinics.',
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
      <section
        className={cn('bg-background py-20 sm:py-24 lg:py-28', props.className)}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow={servicesEyebrow}
              title={servicesHeading}
              subtitle={servicesDesc}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(serviceItems.length).padStart(2, '0')} / index
            </MonoTag>
          </div>
          <ServicesGrid columns={3} className="gap-0">
            <div className="col-span-full grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
              {serviceItems.map((f, i) => {
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
                  <ServiceCard
                    key={__iv__.title}
                    className="gap-4 rounded-none border-0 border-b border-r border-border bg-background p-6 sm:p-8"
                  >
                    <MonoTag aria-hidden="true" tone="faint">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon && <ServiceIcon>{__iv__.icon}</ServiceIcon>}
                    <ServiceTitle className="text-xl font-bold tracking-tight">
                      {__iv__.title}
                    </ServiceTitle>
                    <ServiceDescription className="leading-relaxed">
                      {__iv__.description}
                    </ServiceDescription>
                    {__iv__.points?.length ? (
                      <ul className="mt-1 divide-y divide-border border-y border-border">
                        {__iv__.points.map((point) => (
                          <li
                            key={point}
                            className="flex items-center gap-3 py-2.5 text-sm text-muted-foreground"
                          >
                            <span
                              aria-hidden="true"
                              className="h-px w-3.5 shrink-0 bg-primary"
                            />
                            {point}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                    <LocalServiceBookingButton
                      lakebed={lakebed}
                      intentLabel={__iv__.title}
                      service={__iv__.title}
                      source="services"
                      aria-label={__iv__.title}
                      pendingChildren={<LocalServiceMutationSpinner />}
                      className="mt-auto inline-flex w-fit items-center justify-center rounded-none border border-foreground/25 bg-transparent px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                    >
                      Book Now
                    </LocalServiceBookingButton>
                  </ServiceCard>
                )
              })}
            </div>
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
