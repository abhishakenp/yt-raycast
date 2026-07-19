import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { z } from 'zod/v4'

import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

const ScissorsIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <path d="M8.12 8.12 20 20" />
    <path d="M8.12 15.88 20 4" />
  </svg>
)

const DropletIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M12 2.7 6.3 9.2a7.5 7.5 0 1 0 11.4 0Z" />
  </svg>
)

const RazorIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M3 13 13 3l4 4-10 10H3Z" />
    <path d="M14 6l4 4" />
    <path d="M17 9l4 4-3 3" />
  </svg>
)

const SparkleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-6"
    aria-hidden="true"
  >
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
    <path d="m6.3 6.3 2.4 2.4M15.3 15.3l2.4 2.4M17.7 6.3l-2.4 2.4M8.7 15.3l-2.4 2.4" />
  </svg>
)

const ICONS = [
  <ScissorsIcon />,
  <DropletIcon />,
  <RazorIcon />,
  <SparkleIcon />,
]

export const SalonBarberServices = defineCapsule({
  name: 'SalonBarberServices',
  description:
    "Services band for a barbershop or salon, rendered through the shared ServicesGrid as four icon-tiled cards (cuts & fades, color, beard & grooming, styling & treatments). Each card pairs a stroke icon with a short, confident grooming description. Use it directly under the hero to lay out the menu of services on a barbershop, salon, or men's grooming page.",
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const services = props.services?.length
      ? props.services
      : [
          {
            title: 'Haircuts & Fades',
            description:
              'Skin fades, tapers, scissor cuts and classic styles dialed in to your head shape and hair type.',
          },
          {
            title: 'Color & Highlights',
            description:
              'Single-process color, gray blending, and natural-looking highlights applied with a careful, modern hand.',
          },
          {
            title: 'Beard & Grooming',
            description:
              'Hot-towel beard shaping, straight-razor line-ups, and grooming that finishes the whole look.',
          },
          {
            title: 'Styling & Treatments',
            description:
              'Wash, scalp treatments, and product styling so you walk out camera-ready and easy to maintain.',
          },
        ]

    const features = services.map((s, i) => ({
      title: s.title,
      description: s.description,
      icon: ICONS[i % ICONS.length],
    }))

    return (
      <section
        className={cn(
          'bg-background pt-28 pb-20 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <ServicesGrid
            heading={props.heading ?? 'Our Services'}
            subheading={props.subheading ?? 'What we do best'}
            columns={4}
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
