import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import {
  PortfolioGrid,
  PortfolioItem,
  PortfolioMedia,
  PortfolioCaption,
} from '#/section-kit/PortfolioGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PortfolioWork — editorial staggered-plate project gallery for a
 * creative-individual portfolio. A left-aligned heading block (mono index +
 * uppercase label, giant clamp extrabold title, lead paragraph) over a faint
 * "WORK" ghost watermark, above a responsive grid of clickable project plates
 * set on a staggered ±translate rhythm. Each plate is a sharp rounded-none
 * card with a hairline offset frame peeking behind it, a 16:10 alt-driven
 * thumbnail that desaturates by default and zooms + regains color on hover, a
 * mono index numeral cropped into the top-left corner, a title, a short blurb,
 * and a row of mono rounded-none tool/tag chips; the whole plate lifts on hover
 * and presses down on click. Every plate routes through section-kit route
 * links. Use to showcase a designer, motion or 3D artist, or director's
 * reel-style projects, case studies, or featured work. Renders fully with no
 * props via six baked-in default projects.
 */
export const PortfolioWork = defineCapsule({
  name: 'PortfolioWork',
  description:
    "Editorial staggered-plate project gallery for a creative-individual portfolio: a left-aligned heading block (mono index + uppercase label, giant clamp extrabold title, lead paragraph) over a faint 'WORK' ghost watermark, above a responsive grid of clickable project plates on a staggered ±translate rhythm. Each plate is a sharp rounded-none card with a hairline offset frame behind it, a 16:10 alt-driven thumbnail that desaturates by default and zooms + regains color on hover, a mono index numeral cropped into the corner, a title, a short blurb, and a row of mono rounded-none tool/tag chips; the plate lifts on hover and presses down on click. Plates route through section-kit route links. Use to showcase a designer, motion or 3D artist, or director's reel-style projects, case studies, or featured work.",
  props: z.object({
    /** Small uppercase section label. */
    label: z.string().optional(),
    /** Section heading. */
    title: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Project cards: title, blurb, tool tags, image alt. */
    items: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          tags: z.array(z.string()),
          alt: z.string().describe('short description of the project still'),
        }),
      )
      .optional(),
    /** Navigation target when a project card is clicked. */
    cardTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Selected Work'
    const title = props.title ?? 'Projects that pushed boundaries'
    const description =
      props.description ??
      'A curated set of brand films, product launches, and title sequences built over the last three years.'
    const cardTarget = props.cardTarget ?? 'Work'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Neon Drift',
            description:
              'Launch film for a cyberpunk racing title. High-speed camera logic, volumetric neons, and procedural city layouts built in C4D and rendered with Redshift.',
            tags: ['C4D', 'Redshift', 'Brand Film'],
            alt: 'Neon Drift cyberpunk racing game brand film with neon-lit vehicles',
          },
          {
            title: 'Aether',
            description:
              'Product reveal for a flagship noise-canceling headphone. Fluid sculpting, spectral lighting, and a restrained material palette in Houdini and Octane.',
            tags: ['Houdini', 'Octane', 'Product'],
            alt: 'Aether abstract fluid sculptural forms for a luxury audio brand',
          },
          {
            title: 'Pulse',
            description:
              'Main title for a sci-fi thriller series. Kinetic typography, procedural corridor generation, and aggressive camera motion in Blender and After Effects.',
            tags: ['Blender', 'After Effects', 'Title Sequence'],
            alt: 'Pulse kinetic typography and dark corridors for a streaming title sequence',
          },
          {
            title: 'Meridian',
            description:
              'Keynote opener for a cloud infrastructure platform. Real-time environmental storytelling with Lumen, Nanite, and cinematic sequencing in Unreal Engine 5.',
            tags: ['Unreal Engine 5', 'Real-Time', 'Keynote'],
            alt: 'Meridian vast architectural landscape rendered in Unreal Engine 5',
          },
          {
            title: 'Chromatica',
            description:
              'Music video for an electronic artist. Particle sims, iridescent shaders, and beat-synced camera cuts driven by X-Particles and C4D.',
            tags: ['C4D', 'X-Particles', 'Music Video'],
            alt: 'Chromatica iridescent particle fields for an electronic music video',
          },
          {
            title: 'Silica',
            description:
              'Commercial for a sustainable architecture practice. Brutalist form language, natural daylighting, and restrained camera choreography in Blender and Redshift.',
            tags: ['Blender', 'Redshift', 'Commercial'],
            alt: 'Silica brutalist concrete forms for a sustainable architecture firm',
          },
        ]

    // Column-phased vertical stagger keeps the grid editorial, not uniform.
    const stagger = ['', 'md:translate-y-10', 'md:translate-y-5']

    return (
      <section
        className={cn('relative overflow-hidden pt-28 pb-24', props.className)}
        aria-labelledby="portfolio-work-heading"
      >
        <Watermark className="-top-6 right-0 text-[7rem] sm:text-[11rem] lg:text-[15rem]">
          Work
        </Watermark>
        <Container size="xl" className="relative max-w-[1200px] px-6 lg:px-6">
          <SectionHeading
            align="left"
            eyebrow={`01 · ${label}`}
            title={title}
            subtitle={description}
            className="mb-16 max-w-2xl gap-0"
            titleId="portfolio-work-heading"
            eyebrowClassName="mb-4 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground"
            titleClassName="text-[clamp(1.9rem,4.5vw,3rem)] font-extrabold leading-[1.02] tracking-tighter"
            subtitleClassName="mt-4 max-w-[560px] text-[1.05rem] leading-relaxed text-muted-foreground"
          />

          <PortfolioGrid cols="1-2-3" className="gap-x-6 gap-y-10">
            {items.map((item, i) => (
              <div
                key={item.title}
                className={cn('relative', stagger[i % stagger.length])}
              >
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-border"
                />
                <Card
                  asChild
                  variant="default"
                  className="group relative block overflow-hidden rounded-none border-2 border-foreground bg-background p-0 text-left text-foreground transition-all duration-150 hover:-translate-y-1 active:translate-x-[2px] active:translate-y-[2px]"
                >
                  <PortfolioItem asChild>
                    <NavbarRouteLink href={cardTarget}>
                      <PortfolioMedia
                        aspect="16-10"
                        className="rounded-none border-b-2 border-foreground bg-gradient-to-br from-muted to-card"
                      >
                        <Image
                          alt={item.alt}
                          w={1200}
                          h={750}
                          loading="lazy"
                          className="h-full w-full object-cover opacity-90 grayscale transition-all duration-700 group-hover:scale-105 group-hover:opacity-100 group-hover:grayscale-0"
                        />
                        <span
                          aria-hidden="true"
                          className="absolute left-0 top-0 bg-foreground px-2.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-background"
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                      </PortfolioMedia>
                      <PortfolioCaption className="p-6">
                        <h3 className="mb-1.5 text-xl font-bold tracking-tight">
                          {item.title}
                        </h3>
                        <p className="text-sm leading-[1.6] text-muted-foreground">
                          {item.description}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {item.tags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-none border border-border bg-transparent px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </PortfolioCaption>
                    </NavbarRouteLink>
                  </PortfolioItem>
                </Card>
              </div>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
