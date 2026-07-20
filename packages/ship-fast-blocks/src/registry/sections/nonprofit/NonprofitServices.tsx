import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

import { Container } from '#/section-kit/Container.tsx'

/**
 * NonprofitServices — warm mission-editorial programs ledger for a nonprofit /
 * charity / NGO page. An asymmetric header (left-aligned mono eyebrow + serif
 * heading + lede, mono program-count meta on the right) sits above a
 * collapsed-border ledger grid built on the shared `ServicesGrid` composite:
 * each hairline cell shares rules with its neighbours and carries a zero-padded
 * mono index numeral, a quiet line-icon in a square hairline tile, a serif
 * program title (Clean Water, Education, Food Security, Healthcare, …), and a
 * short, warm mission blurb. Restrained, human, trustworthy. Use to show the
 * core programs, causes, or focus areas a nonprofit, foundation, or humanitarian
 * organization runs. Renders fully with no props via baked-in "Roots of Hope"
 * program defaults.
 */
function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

export const NonprofitServices = defineCapsule({
  name: 'NonprofitServices',
  description:
    'Warm mission-editorial programs ledger for a nonprofit / charity / NGO page built on the shared ServicesGrid composite: an asymmetric header (left-aligned mono eyebrow + serif heading + lede, mono program-count meta right) above a collapsed-border ledger grid whose hairline cells each carry a zero-padded mono index numeral, a quiet line-icon in a square hairline tile, a serif program title (Clean Water, Education, Food Security, Healthcare, …), and a short warm mission blurb. Restrained, human, trustworthy. Use to show the core programs, causes, or focus areas a nonprofit, foundation, or humanitarian organization runs.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting line under the heading. */
    subheading: z.string().optional(),
    /** Program / cause cards: title + description. */
    programs: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Where your support goes'
    const subheading =
      props.subheading ??
      'Every gift fuels community-led programs that meet people where they are — and help them build a future they choose.'

    const icons = [
      'M12 22c4-4 7-7.5 7-11a7 7 0 0 0-14 0c0 3.5 3 7 7 11z', // water drop
      'M22 10L12 5 2 10l10 5 10-5zM6 12v5c0 1 3 3 6 3s6-2 6-3v-5', // education / cap
      'M12 2a3 3 0 0 0-3 3c0 2 3 5 3 5s3-3 3-5a3 3 0 0 0-3-3zM4 14c0 4 4 8 8 8s8-4 8-8', // food / grain
      'M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z', // health / heart
    ]

    const programs = props.programs?.length
      ? props.programs
      : [
          {
            title: 'Clean Water',
            description:
              'We dig wells and build sustainable water systems so families have safe water close to home — for good.',
          },
          {
            title: 'Education',
            description:
              'Classrooms, books, and teacher training give children the tools to learn, dream, and lift their whole community.',
          },
          {
            title: 'Food Security',
            description:
              'From emergency meals to seeds and farming know-how, we help families grow lasting nourishment and stability.',
          },
          {
            title: 'Healthcare',
            description:
              'Mobile clinics, vaccines, and trained local health workers bring essential care to places it rarely reaches.',
          },
        ]

    const features = programs.map((p, i) => ({
      title: p.title,
      description: p.description,
      icon: <Icon d={icons[i % icons.length]} className="size-6" />,
    }))

    return (
      <section
        className={cn(
          'bg-background pt-24 pb-20 lg:pt-28 lg:pb-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between lg:mb-16">
            <SectionHeading
              align="left"
              eyebrow="Our programs"
              title={heading}
              subtitle={subheading}
              className="max-w-2xl gap-0"
              eyebrowClassName="mb-4 inline-block font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground"
              titleClassName="mb-4 font-serif text-3xl font-medium tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.08]"
              subtitleClassName="text-base leading-relaxed text-muted-foreground sm:text-lg"
            />
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 md:pb-1"
            >
              {String(features.length).padStart(2, '0')} / programs
            </MonoTag>
          </div>
          <ServicesGrid
            columns={4}
            className="gap-0 [&>div]:grid [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border"
          >
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
                  className="gap-4 rounded-none border-b border-r border-border bg-transparent p-6 transition-colors hover:bg-muted/40 sm:p-8"
                >
                  <div className="flex items-center justify-between">
                    <MonoTag aria-hidden="true" tone="faint">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    {__iv__.icon && (
                      <ServiceIcon className="size-10 rounded-none border border-border bg-transparent text-foreground/70">
                        {__iv__.icon}
                      </ServiceIcon>
                    )}
                  </div>
                  <ServiceTitle className="font-serif text-xl font-medium tracking-tight">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="leading-relaxed">
                    {__iv__.description}
                  </ServiceDescription>
                </ServiceCard>
              )
            })}
          </ServicesGrid>
        </Container>
      </section>
    )
  },
})
