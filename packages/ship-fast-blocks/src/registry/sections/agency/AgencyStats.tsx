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
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * AgencyStats — inverted neo-brutalist proof band for a creative
 * digital-agency page. A full foreground-on-background inversion band whose
 * top edge cuts in on a slanted clip-path seam (neighbor-independent), with a
 * giant ghost asterisk watermark. Asymmetric 5:7 split: heading, mono "03 /
 * By the numbers" index and intro paragraph on the left; on the right the
 * alt-driven showcase photo as a tilted sticker plate with a 2px background
 * border, a hard primary offset shadow and a mono caption strip. Below, a
 * collapsed-border grid of stat cells, each with a giant slab tabular
 * numeral, a mono uppercase label and a small primary tick mark. Tokens-only,
 * no links. Use for an agency's "by the numbers" / about-with-stats section,
 * team credibility band, or any metric-led narrative paired with a feature
 * image. Renders fully with no props via baked-in defaults.
 */
export const AgencyStats = defineCapsule({
  name: 'AgencyStats',
  description:
    "Inverted neo-brutalist proof band for a creative digital-agency page: a foreground-on-background inversion band with a slanted clip-path top seam and giant ghost asterisk watermark, an asymmetric 5:7 split (heading, mono index and intro left; tilted sticker photo plate with 2px border, hard primary offset shadow and mono caption right), and a collapsed-border grid of stat cells with giant slab tabular numerals, mono uppercase labels and primary tick marks. Tokens-only, no links. Use for an agency's 'by the numbers' / about-with-stats section, team credibility band, or any metric-led narrative paired with a feature image.",
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
      <section
        className={cn(
          // Slanted top seam: the inversion band cuts in on a diagonal,
          // independent of whichever section sits above it.
          'relative overflow-hidden bg-foreground pb-14 pt-20 text-background [clip-path:polygon(0_0,100%_3rem,100%_100%,0_100%)] sm:pb-20 sm:pt-28 lg:pb-28 lg:pt-36',
          props.className,
        )}
      >
        <Watermark className="-bottom-16 -left-8 -rotate-12 text-[14rem] text-background/[0.05] sm:text-[22rem]">
          *
        </Watermark>
        <Container size="xl" className="relative px-6">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-center lg:gap-14">
            <div className="lg:col-span-5">
              <MonoTag tone="inverted" className="text-background/50">
                03 / By the numbers
              </MonoTag>
              <SectionHeading
                align="left"
                title={heading}
                subtitle={description}
                className="mt-4 gap-4"
                titleClassName="text-4xl font-black uppercase leading-[0.95] tracking-tighter text-background sm:text-5xl"
                subtitleClassName="text-base leading-relaxed text-background/70 sm:text-lg"
              />
            </div>
            <div className="lg:col-span-7">
              <div className="relative w-[calc(100%+1rem)] -translate-x-2 rotate-1 border-2 border-background bg-background shadow-[8px_8px_0_0] shadow-primary sm:w-full sm:translate-x-0">
                <Image
                  alt={imageAlt}
                  w={800}
                  h={600}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover"
                />
                <div className="flex items-center justify-between gap-4 border-t-2 border-foreground bg-background px-4 py-2.5">
                  <MonoTag className="truncate text-[10px] text-foreground/70">
                    {imageAlt}
                  </MonoTag>
                  <MonoTag
                    aria-hidden="true"
                    className="shrink-0 text-[10px] text-foreground/40"
                  >
                    fig. 03
                  </MonoTag>
                </div>
              </div>
            </div>
          </div>

          <StatGrid
            columns={4}
            className="mt-12 grid-cols-2 gap-0 border-2 border-background/30 sm:mt-16 lg:grid-cols-4"
          >
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className={cn(
                    'gap-2 border-background/30 p-5 sm:p-7',
                    i % 2 === 0 && 'border-r-2 lg:border-r-2',
                    i < items.length - 2 && 'border-b-2 lg:border-b-0',
                    i % 4 !== 3 && 'lg:border-r-2',
                    i % 4 === 3 && 'lg:border-r-0',
                  )}
                >
                  <StatValue className="mb-0 text-[clamp(2.25rem,4.5vw,4rem)] font-black leading-none tracking-tighter text-background tabular-nums">
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[10px] uppercase tracking-[0.18em] text-background/60 sm:text-[11px]">
                    {__iv__.label}
                  </StatLabel>
                  <span
                    aria-hidden="true"
                    className="mt-1 flex items-center gap-1"
                  >
                    <span className="h-1.5 w-6 bg-primary" />
                    <span className="h-1.5 w-1.5 bg-background/30" />
                  </span>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
