import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  FeatureGrid,
  FeatureCard,
  FeatureIcon,
  FeatureTitle,
  FeatureDescription,
} from '#/section-kit/FeatureGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { cn } from '#/lib/utils.ts'

const ICONS = {
  wellness: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 14c1.5-1.5 3-3.3 3-5.5A4.5 4.5 0 0 0 12 5.5 4.5 4.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 11h4l2-3 3 6 2-3h4"
      />
    </svg>
  ),
  dental: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 5.5C9.5 3 5 3.5 5 8c0 3 1 5 1.5 8 .3 1.7.8 4 2 4s1.2-2.5 1.5-4c.2-1 .5-2 2-2s1.8 1 2 2c.3 1.5.3 4 1.5 4s1.7-2.3 2-4c.5-3 1.5-5 1.5-8 0-4.5-4.5-5-7-2.5Z"
      />
    </svg>
  ),
  surgery: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.5 3.5 18 7 7.5 17.5 4 18l.5-3.5L14.5 3.5Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 21l4-1M16 8l4 4-2 2-4-4"
      />
    </svg>
  ),
  emergency: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
      className="size-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M22 12h-4l-3 7-4-14-3 7H2"
      />
    </svg>
  ),
} as const

type IconKey = keyof typeof ICONS

const DEFAULT_SERVICES: {
  title: string
  description: string
  icon: IconKey
}[] = [
  {
    title: 'Wellness Exams',
    description:
      'Gentle head-to-tail checkups, vaccinations, and preventive care to keep your best friend healthy and happy for years to come.',
    icon: 'wellness',
  },
  {
    title: 'Dental Care',
    description:
      'Professional cleanings and oral exams that protect those precious smiles and prevent painful problems before they start.',
    icon: 'dental',
  },
  {
    title: 'Surgery',
    description:
      'Safe, modern surgical procedures — from spays and neuters to soft-tissue care — with attentive monitoring at every step.',
    icon: 'surgery',
  },
  {
    title: 'Emergency Care',
    description:
      'When the unexpected happens, our caring team is ready with prompt, compassionate treatment to get your pet back on their paws.',
    icon: 'emergency',
  },
]

export const PetVeterinaryServices = defineCapsule({
  name: 'PetVeterinaryServices',
  description:
    'Warm friendly-clinical services band for a veterinary clinic site, composing the FeatureGrid kit composite into a staggered grid of chunky rounded-none service cards with confident hard offset shadows. An asymmetric header (left-aligned heading + lede, mono index meta on the right) sits above cards that each pair a zero-padded mono index numeral and a friendly round icon tile with a service name and a reassuring description — Wellness Exams, Dental Care, Surgery, and Emergency Care by default; alternate cards drop a step on desktop for a playful stagger and the first card carries a rotated rounded-full "same day" sticker. Accepts a public `services` prop to override the offering list. Use it to show pet parents the breadth of compassionate care available in a scannable, trust-building layout.',
  props: z.object({
    heading: z.string().optional(),
    subheading: z.string().optional(),
    services: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          icon: z
            .enum(['wellness', 'dental', 'surgery', 'emergency'])
            .optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Caring services for every companion'
    const subheading =
      props.subheading ??
      'From routine wellness to urgent help, our compassionate team is here for every wag, purr, and tail.'
    const services = props.services?.length ? props.services : DEFAULT_SERVICES

    const features = services.map((s) => ({
      title: s.title,
      description: s.description,
      icon: s.icon ? ICONS[s.icon as IconKey] : ICONS.wellness,
    }))

    return (
      <section
        className={
          'bg-background py-20 sm:py-24' +
          (props.className ? ' ' + props.className : '')
        }
      >
        <Container size="xl" className="px-6">
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0"
              titleClassName="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.05]"
              subtitleClassName="mt-4 text-base text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(features.length).padStart(2, '0')} / services
            </MonoTag>
          </div>
          <FeatureGrid columns={4}>
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
                <FeatureCard
                  key={__iv__.title}
                  className={cn(
                    'relative gap-4 rounded-none border-2 border-foreground/15 p-6 shadow-[6px_6px_0_0] shadow-foreground/15 transition-transform duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-foreground/15 motion-reduce:transform-none',
                    i % 2 === 1 && 'lg:translate-y-6',
                  )}
                >
                  {i === 0 ? (
                    <span
                      aria-hidden="true"
                      className="absolute -right-2 -top-3 -rotate-6 rounded-full border-2 border-foreground bg-background px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-[2px_2px_0_0] shadow-primary/40"
                    >
                      same day
                    </span>
                  ) : null}
                  <MonoTag aria-hidden="true" tone="faint">
                    {String(i + 1).padStart(2, '0')}
                  </MonoTag>
                  {__iv__.icon && (
                    <FeatureIcon className="size-12 rounded-full bg-primary/10">
                      {__iv__.icon}
                    </FeatureIcon>
                  )}
                  <FeatureTitle className="text-lg font-bold tracking-tight">
                    {__iv__.title}
                  </FeatureTitle>
                  <FeatureDescription className="leading-relaxed">
                    {__iv__.description}
                  </FeatureDescription>
                </FeatureCard>
              )
            })}
          </FeatureGrid>
        </Container>
      </section>
    )
  },
})
