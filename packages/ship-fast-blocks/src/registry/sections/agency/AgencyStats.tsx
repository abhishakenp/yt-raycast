import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * AgencyStats — split stats / about band for a creative digital-agency page. A
 * two-column layout: on the left a heading, an about/intro paragraph, and a
 * 2x2 grid of big metric figures each with a left accent rule; on the right a
 * 4:3 alt-driven showcase photo wrapped in a soft glowing gradient halo and a
 * token border. Tokens-only, no links. Use for an agency's "by the numbers" /
 * about-with-stats section, team credibility band, or any metric-led narrative
 * paired with a feature image. Renders fully with no props via baked-in defaults.
 */
export const AgencyStats = defineCapsule({
  name: 'AgencyStats',
  description:
    "Split stats / about band for a creative digital-agency page: a two-column layout with a heading, about/intro paragraph and a 2x2 grid of big metric figures (each with a left accent rule) on the left, and a 4:3 alt-driven showcase photo wrapped in a soft glowing gradient halo with a token border on the right. Tokens-only, no links. Use for an agency's 'by the numbers' / about-with-stats section, team credibility band, or any metric-led narrative paired with a feature image.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** About / intro paragraph under the heading. */
    description: z.string().optional(),
    /** Alt text driving the showcase photo. */
    imageAlt: z.string().optional(),
    /** Metric figures: value + label. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Numbers that speak volumes.'
    const description =
      props.description ??
      'We are a tight-knit collective of strategists, designers, and engineers obsessed with quality. Every metric below reflects our commitment to outcomes over outputs.'
    const imageAlt =
      props.imageAlt ?? 'Creative agency team collaboration in studio'
    const items = props.items?.length
      ? props.items
      : [
          { value: '$400M+', label: 'Revenue generated for clients' },
          { value: '12', label: 'Countries served' },
          { value: '24h', label: 'Average response time' },
          { value: '0', label: 'Boring projects taken' },
        ]

    return (
      <section className={cn('pt-28 pb-24 lg:pt-32 lg:pb-28', props.className)}>
        <Container size="xl" className="px-6 lg:px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="mb-8 text-4xl font-bold tracking-tight sm:text-5xl">
                {heading}
              </h2>
              <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
                {description}
              </p>
              <StatGrid columns={2}>
                {items.map((s) => {
                  const __iv__ = s as { value: string; label: string }
                  return (
                    <StatItem key={__iv__.label} align={'left'} accentBorder>
                      <StatValue size={'large'}>{__iv__.value}</StatValue>
                      <StatLabel>{__iv__.label}</StatLabel>
                    </StatItem>
                  )
                })}
              </StatGrid>
            </div>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-accent/20 blur-2xl"
              />
              <Image
                alt={imageAlt}
                w={800}
                h={600}
                loading="lazy"
                className="relative aspect-[4/3] w-full rounded-2xl border border-border object-cover"
              />
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
