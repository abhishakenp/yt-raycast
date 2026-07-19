import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

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

export const TelehealthServices = defineCapsule({
  name: 'TelehealthServices',
  description:
    'Services overview band for a telehealth site, built on the shared ServicesGrid composite. Renders a centered heading and a four-up card grid covering the core virtual-care offerings — Primary Care, Mental Health, Prescriptions, and Urgent Care — each with a calm primary-toned inline icon, a title, and a short description. Cards collapse to two columns and then a single column on smaller screens. Use to summarize what a telehealth provider treats and help visitors self-route to the right service.',
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
      <section className="bg-background pt-28 pb-20 sm:pt-32 sm:pb-24">
        <Container size="xl" className="px-6">
          <ServicesGrid
            heading={heading}
            subheading={subheading}
            columns={4}
            className={props.className}
          >
            {features.map((f) => {
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
