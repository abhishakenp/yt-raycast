import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  ServicesGrid,
  ServiceCard,
  ServiceIcon,
  ServiceTitle,
  ServiceDescription,
} from '#/section-kit/ServicesGrid.tsx'

/**
 * ConsultingServices — Swiss-ledger capabilities index for a
 * management-consulting firm page. A mono "02 / Capabilities" metadata rail
 * with a hairline rule and tabular practice count above an asymmetric header
 * (left-aligned serif heading + lede in a 7-col track), over a giant ghost
 * "02" watermark. Below, a collapsed-border 3-column ledger of service cells
 * sharing hairline rules; each cell carries a mono index numeral with a
 * primary square, a serif title, and a description, and washes to muted on
 * hover. Tokens-only, no links. Use to present consulting offerings —
 * corporate strategy, digital transformation, M&A advisory, operations,
 * organization, risk — or any professional-services capabilities block.
 * Renders fully with no props via six baked-in default services.
 */
export const ConsultingServices = defineCapsule({
  name: 'ConsultingServices',
  description:
    'Swiss-ledger capabilities index for a management-consulting firm page: a mono "02 / Capabilities" metadata rail with hairline rule and tabular practice count above an asymmetric left-aligned serif heading + lede, over a giant ghost "02" watermark; below, a collapsed-border 3-column ledger of service cells sharing hairline rules, each with a mono index numeral + primary square, a serif title, and a description, washing to muted on hover. Tokens-only, no links. Use to present consulting offerings (corporate strategy, digital transformation, M&A advisory, operations, organization, risk) or any professional-services capabilities block.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Comprehensive Consulting Services'
    const description =
      props.description ??
      'From strategy formulation to implementation, we partner with you at every stage of your transformation journey.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Corporate Strategy',
            description:
              'Develop winning strategies that define your competitive position, prioritize growth initiatives, and allocate resources for maximum impact. Our approach combines rigorous analysis with creative problem-solving.',
          },
          {
            title: 'Digital Transformation',
            description:
              'Navigate the digital landscape with confidence. We help organizations leverage technology to reimagine operations, enhance customer experiences, and build new digital business models.',
          },
          {
            title: 'M&A Advisory',
            description:
              'From target identification to post-merger integration, we guide clients through complex transactions. Our team has advised on over 400 deals worth more than $180 billion in total value.',
          },
          {
            title: 'Operations Excellence',
            description:
              'Optimize your end-to-end operations to reduce costs, improve quality, and accelerate delivery. We specialize in supply chain transformation, lean manufacturing, and process automation.',
          },
          {
            title: 'Organization & Change',
            description:
              'Build high-performing organizations and lead successful transformations. We help you redesign structures, develop talent, and manage cultural change to support your strategic objectives.',
          },
          {
            title: 'Risk & Compliance',
            description:
              'Navigate regulatory complexity and protect your enterprise. We help organizations identify, assess, and mitigate risks while ensuring compliance with evolving standards and regulations.',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Watermark className="-left-6 top-6 font-serif text-[9rem] sm:text-[13rem] lg:text-[17rem]">
          02
        </Watermark>

        <Container className="relative">
          <div className="mb-8 flex items-center gap-4">
            <span aria-hidden="true" className="size-2 shrink-0 bg-primary" />
            <MonoTag className="shrink-0">02 / Capabilities</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden tabular-nums sm:inline">
              {String(items.length).padStart(2, '0')} Practices
            </MonoTag>
          </div>

          <div className="grid gap-4 lg:grid-cols-12">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="mb-10 gap-4 sm:mb-14 lg:col-span-7 lg:mb-16"
              titleClassName="font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl"
              subtitleClassName="max-w-xl text-lg text-muted-foreground"
            />
          </div>

          <ServicesGrid
            columns={3}
            className="gap-0 [&>div]:grid-cols-1 [&>div]:gap-0 [&>div]:border-l [&>div]:border-t [&>div]:border-border [&>div]:sm:grid-cols-2 [&>div]:lg:grid-cols-3"
          >
            {items.map((f, i) => {
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
                  className="group relative gap-0 rounded-none border-0 border-b border-r border-border bg-transparent p-6 transition-colors duration-150 hover:bg-muted/40 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-3">
                    <MonoTag className="tabular-nums text-muted-foreground/70">
                      {String(i + 1).padStart(2, '0')}
                    </MonoTag>
                    <span
                      aria-hidden="true"
                      className="size-1.5 bg-primary opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                    />
                  </div>
                  {__iv__.icon && (
                    <ServiceIcon className="mt-5 rounded-none">
                      {__iv__.icon}
                    </ServiceIcon>
                  )}
                  <ServiceTitle className="mt-8 font-serif text-2xl font-bold tracking-tight text-foreground sm:mt-12">
                    {__iv__.title}
                  </ServiceTitle>
                  <ServiceDescription className="mt-3 text-sm leading-relaxed text-muted-foreground">
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
