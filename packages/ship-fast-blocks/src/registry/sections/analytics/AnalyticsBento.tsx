import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  BentoGrid,
  BentoTile,
  BentoTileBody,
  BentoTileTitle,
  BentoTileDescription,
} from '#/section-kit/BentoGrid.tsx'

/**
 * AnalyticsBento — bespoke asymmetric capability bento for an analytics product.
 * A padded section with an optional centered SectionHeading above a responsive
 * grid of token-styled card tiles: one large hero tile spanning two columns and
 * two rows that frames a product screenshot, plus four smaller supporting tiles
 * each carrying a heading and a short description. Sharp, data-forward and
 * marketing-grade. Use to showcase a mix of headline and supporting capabilities
 * on any analytics, BI, or data-product site. Renders fully with no props.
 */
export const AnalyticsBento = defineCapsule({
  name: 'AnalyticsBento',
  description:
    'Bespoke asymmetric capability bento for an analytics product. A padded section with an optional centered SectionHeading above a responsive grid of token-styled card tiles: one large hero tile spanning two columns and two rows that frames a product screenshot, plus four smaller supporting tiles each carrying a heading and a short description. Sharp, data-forward and marketing-grade. Use to showcase a mix of headline and supporting capabilities on any analytics, BI, or data-product site.',
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    subheading: z.string().optional(),
    /** Title for the large hero tile. */
    heroTitle: z.string().optional(),
    /** Description for the large hero tile. */
    heroDescription: z.string().optional(),
    /** Four supporting tiles, each a title + description. */
    tiles: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Built for depth'
    const heading = props.heading ?? 'Go from question to answer in seconds'
    const subheading =
      props.subheading ??
      'Every surface is designed to keep you in flow — explore, drill in, and share without breaking your train of thought.'
    const heroTitle = props.heroTitle ?? 'Explore any metric, instantly'
    const heroDescription =
      props.heroDescription ??
      'Slice by cohort, device, or campaign and watch the chart redraw in real time across billions of rows.'
    const tiles = props.tiles?.length
      ? props.tiles
      : [
          {
            title: 'Funnels',
            description:
              'Pinpoint exactly where users drop and recover step-by-step conversion in one view.',
          },
          {
            title: 'Retention',
            description:
              'Cohort grids reveal who comes back — and the features that keep them.',
          },
          {
            title: 'SQL & API',
            description:
              "Drop to raw SQL or query programmatically when the UI isn't enough.",
          },
          {
            title: 'Governance',
            description:
              'Roles, audit logs, and PII controls keep every team safely on the same data.',
          },
        ]

    return (
      <section className={cn('bg-background py-20 sm:py-24', props.className)}>
        <Container size="xl">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="mb-14"
          />
          <BentoGrid
            cols="1-md-3"
            className="auto-rows-[minmax(0,1fr)] gap-5 md:grid-rows-2"
          >
            <BentoTile
              span="md:col-span-2 md:row-span-2"
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
            >
              <BentoTileBody className="p-7">
                <BentoTileTitle className="text-xl">{heroTitle}</BentoTileTitle>
                <BentoTileDescription className="max-w-md">
                  {heroDescription}
                </BentoTileDescription>
              </BentoTileBody>
              <Image
                alt="analytics explore chart drilldown dashboard"
                w={1200}
                h={680}
                className="mt-auto block w-full flex-1 border-t border-border object-cover"
              />
            </BentoTile>
            {tiles.map((tile) => (
              <BentoTile
                key={tile.title}
                className="flex flex-col rounded-2xl border border-border bg-card p-7"
              >
                <BentoTileTitle className="text-base">
                  {tile.title}
                </BentoTileTitle>
                <BentoTileDescription>{tile.description}</BentoTileDescription>
              </BentoTile>
            ))}
          </BentoGrid>
        </Container>
      </section>
    )
  },
})
