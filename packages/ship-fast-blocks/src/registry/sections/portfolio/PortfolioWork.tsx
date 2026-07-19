import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
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

/**
 * PortfolioWork — selected-work / project gallery for a dark creative portfolio.
 * A heading block (cyan uppercase label, big display title, lead paragraph) above
 * a responsive 3-up grid of clickable project cards: each card has a 16:10
 * alt-driven thumbnail that zooms on hover, a title, a short blurb, and a row of
 * tool/tag chips, all on a raised card surface that lifts and gains a cyan glow
 * on hover. Every card routes through useNavigate. Use to showcase a 3D artist,
 * motion designer, or director's reel-style projects, case studies, or featured
 * work. Renders fully with no props via six baked-in default projects.
 */
export const PortfolioWork = defineCapsule({
  name: 'PortfolioWork',
  description:
    "Selected-work / project gallery for a dark creative portfolio: a heading block (cyan uppercase label, big display title, lead paragraph) above a responsive 3-up grid of clickable project cards. Each card has a 16:10 alt-driven thumbnail that zooms on hover, a title, a short blurb, and a row of tool/tag chips, on a raised card surface that lifts and gains a cyan glow on hover. Cards route through useNavigate. Use to showcase a 3D artist, motion designer, or director's reel-style projects, case studies, or featured work.",
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
    const go = useNavigate()
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

    return (
      <section
        className={cn('pt-28 pb-24', props.className)}
        aria-labelledby="portfolio-work-heading"
      >
        <Container size="xl" className="max-w-[1200px] px-6 lg:px-6">
          <SectionHeading
            align="left"
            eyebrow={label}
            title={title}
            subtitle={description}
            className="mb-14 gap-0"
            titleId="portfolio-work-heading"
            eyebrowClassName="text-xs font-semibold uppercase tracking-[0.12em] text-primary"
            titleClassName="text-[clamp(1.8rem,4vw,2.8rem)] font-bold leading-[1.15] tracking-[-0.02em]"
            subtitleClassName="max-w-[560px] text-[1.05rem] text-muted-foreground"
          />

          <PortfolioGrid cols="1-2-3" className="gap-6">
            {items.map((item) => (
              <Card
                asChild
                key={item.title}
                variant="default"
                className="group relative block overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_24px_64px_rgba(0,0,0,0.55)] rounded-2xl p-0"
              >
                <PortfolioItem type="button" onClick={() => go(cardTarget)}>
                  <PortfolioMedia
                    aspect="16-10"
                    className="bg-gradient-to-br from-muted to-card"
                  >
                    <Image
                      alt={item.alt}
                      w={1200}
                      h={750}
                      loading="lazy"
                      className="h-full w-full object-cover opacity-85 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
                    />
                  </PortfolioMedia>
                  <PortfolioCaption className="p-6">
                    <h3 className="mb-1.5 text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-[1.6] text-muted-foreground">
                      {item.description}
                    </p>
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-border bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </PortfolioCaption>
                </PortfolioItem>
              </Card>
            ))}
          </PortfolioGrid>
        </Container>
      </section>
    )
  },
})
