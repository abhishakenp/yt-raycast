import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'

/**
 * CloudInfraGallery — terminal-industrial showcase gallery for a cloud-
 * infrastructure / developer-platform SaaS landing page. An asymmetric header
 * (left-aligned heading + description, mono meta line right) above a staggered
 * grid of square-cornered figure cards (2-col mobile, 3-col desktop; middle
 * column shifted down on desktop). Each figure is an alt-driven Image with a
 * mono `fig.` index chip stamped in the top-left and a mono uppercase caption
 * bar along the bottom; images zoom slightly on hover. Tokens-only. Renders
 * fully on zero arguments.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'
export const CloudInfraGallery = defineCapsule({
  name: 'CloudInfraGallery',
  description:
    'Terminal-industrial showcase gallery for a cloud-infrastructure / developer-platform SaaS landing page: an asymmetric header (left heading plus description, mono meta right) above a staggered grid of square-cornered figure cards (2-col mobile, 3-col desktop with the middle column shifted down). Each figure is an alt-driven Image with a mono fig-index chip in the top-left and a mono uppercase caption bar; images zoom on hover. Tokens-only. Use for portfolio, showcase, or proof-of-work galleries on cloud hosting, IaaS, PaaS, or developer-tooling sites.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Gallery items: alt, title, caption. */
    items: z
      .array(
        z.object({
          alt: z.string(),
          title: z.string(),
          caption: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Built for developers, by developers'
    const description =
      props.description ??
      'See how teams use CloudShift to build, deploy, and scale their applications worldwide.'
    const items = props.items?.length
      ? props.items
      : [
          {
            alt: 'Team of software developers collaborating at a modern desk with multiple monitors showing code',
            title: 'Real-time collaboration tools',
            caption: 'Shared terminals and live code reviews',
          },
          {
            alt: 'Server room with rows of blinking LED lights on network equipment racks',
            title: 'Global data centers',
            caption: '35 regions with sub-20ms latency',
          },
          {
            alt: 'Analytics dashboard showing traffic graphs and performance metrics on a laptop screen',
            title: 'Observability dashboard',
            caption: 'Real-time metrics and alerting',
          },
          {
            alt: 'Diverse engineering team meeting in a modern office discussing architecture diagrams',
            title: 'Team workflows',
            caption: 'RBAC and environment management',
          },
          {
            alt: 'Close-up of circuit board with microprocessors and electronic components',
            title: 'Bare metal performance',
            caption: 'Dedicated instances when you need them',
          },
          {
            alt: 'Developer working late at night with code editor and terminal windows on large curved monitor',
            title: 'Developer experience first',
            caption: 'CLI, SDKs, and IDE integrations',
          },
        ]
    return (
      <section
        className={cn(
          'overflow-hidden py-14 sm:py-20 lg:py-28',
          props.className,
        )}
      >
        <Container>
          <div className="mb-10 flex flex-col gap-4 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl"
              subtitleClassName="text-base sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ archive ] field records
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:pb-8"
            >
              {items.map((img, i) => {
                const __iv__ = img as {
                  alt: string
                  caption?: string
                  title?: string
                  location?: string
                }
                return (
                  <GalleryTile
                    key={__iv__.alt}
                    className={cn(
                      'rounded-none border-border',
                      i % 3 === 1 && 'lg:translate-y-8',
                    )}
                  >
                    <GalleryTileImage alt={__iv__.alt} />
                    <span
                      aria-hidden="true"
                      className="absolute left-0 top-0 bg-foreground px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-background"
                    >
                      fig.{`0${i + 1}`.slice(-2)}
                    </span>
                    {__iv__.caption && (
                      <GalleryTileCaption className="border-t border-border bg-background/90 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                        {__iv__.caption}
                      </GalleryTileCaption>
                    )}
                  </GalleryTile>
                )
              })}
            </GalleryGridItems>
          </GalleryGrid>
        </Container>
      </section>
    )
  },
})
