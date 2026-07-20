import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'

const ICONS = [
  // Primary Care — stethoscope
  <svg
    key="primary-care"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M4 2v6a4 4 0 0 0 8 0V2" />
    <path d="M8 12v3a5 5 0 0 0 10 0v-1" />
    <circle cx="19" cy="11" r="2" />
  </svg>,
  // Mental Health — brain/heart
  <svg
    key="mental-health"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 21s-7-4.5-9-9a4.5 4.5 0 0 1 9-2 4.5 4.5 0 0 1 9 2c-2 4.5-9 9-9 9Z" />
  </svg>,
  // Prescriptions — pill
  <svg
    key="prescriptions"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    <path d="m8.5 8.5 7 7" />
  </svg>,
  // Urgent Care — plus shield
  <svg
    key="urgent-care"
    xmlns="http://www.w3.org/2000/svg"
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
    <path d="M12 8v6M9 11h6" />
  </svg>,
]

/**
 * TelehealthServices — calm clinical + warmth collapsed-border services ledger
 * for a telehealth site, built on the shared ServicesGrid composite. An
 * asymmetric header (left-aligned heading + lede, mono index meta on the right)
 * above a hairline collapsed-border 1-to-2-to-4 column grid of square cells;
 * each cell pairs a zero-padded mono index numeral with a quiet primary-toned
 * inline icon, a service title, and a short description of a core virtual-care
 * offering (Primary Care, Mental Health, Prescriptions, Urgent Care).
 * Tokens-only, no links. Precise yet warm, telemedicine aesthetic. Use to
 * summarize what a telehealth provider treats and help visitors self-route to
 * the right service.
 */
export const TelehealthServices = defineCapsule({
  name: 'TelehealthServices',
  description:
    'Calm clinical + warmth collapsed-border services ledger for a telehealth site, built on the shared ServicesGrid composite: an asymmetric header (left-aligned heading + lede, mono index meta right) above a hairline collapsed-border 1-to-2-to-4 column grid of square cells, each pairing a zero-padded mono index numeral with a quiet primary-toned inline icon, a service title, and a short description of a core virtual-care offering (Primary Care, Mental Health, Prescriptions, Urgent Care). Tokens-only, no links. Precise yet warm, telemedicine aesthetic. Use to summarize what a telehealth provider treats and help visitors self-route to the right service.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Care for whatever comes up'
    const subheading =
      props.subheading ??
      'From everyday checkups to last-minute concerns, our providers are ready when you are.'
    const services = props.services?.length
      ? props.services
      : [
          {
            title: 'Primary Care',
            description:
              'Routine checkups, chronic condition management, and ongoing guidance from a doctor who knows your history.',
          },
          {
            title: 'Mental Health',
            description:
              'Confidential video sessions with licensed therapists and psychiatrists, on a schedule that fits your life.',
          },
          {
            title: 'Prescriptions',
            description:
              'Get new prescriptions or refills sent straight to your preferred pharmacy after a quick virtual visit.',
          },
          {
            title: 'Urgent Care',
            description:
              'Fast, on-demand care for colds, infections, and minor injuries — typically seen in under 15 minutes.',
          },
        ]

    const features = services.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: ICONS[i % ICONS.length],
    }))

    return (
      <section
        className={cn('bg-muted/40 py-20 sm:py-24 lg:py-28', props.className)}
        aria-labelledby="telehealth-services-heading"
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              titleId="telehealth-services-heading"
              className="max-w-2xl gap-0"
              titleClassName="mb-4 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(features.length).padStart(2, '0')} / index
            </MonoTag>
          </div>

          <ServicesGrid columns={4} className="gap-0">
            <div className="col-span-full grid grid-cols-1 border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f, i) => {
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
                    <div className="flex items-center justify-between">
                      <MonoTag aria-hidden="true" tone="faint">
                        {String(i + 1).padStart(2, '0')}
                      </MonoTag>
                      {__iv__.icon && (
                        <ServiceIcon className="rounded-none bg-primary/10">
                          {__iv__.icon}
                        </ServiceIcon>
                      )}
                    </div>
                    <ServiceTitle className="text-xl font-bold tracking-tight">
                      {__iv__.title}
                    </ServiceTitle>
                    <ServiceDescription className="leading-relaxed">
                      {__iv__.description}
                    </ServiceDescription>
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
