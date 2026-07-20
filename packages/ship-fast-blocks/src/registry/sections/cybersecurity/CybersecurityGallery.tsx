import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  GalleryGrid,
  GalleryGridItems,
  GalleryTile,
  GalleryTileImage,
  GalleryTileCaption,
} from '#/section-kit/GalleryGrid.tsx'

/**
 * CybersecurityGallery — terminal-stealth surveillance dossier. A light
 * section opening with a hairline mono meta rule ("SURFACE DOSSIER" + tabular
 * figure count) above an asymmetric header (left-aligned heading + lede, mono
 * "[ SINGLE PANE ]" tag right). Screens render as a square-edged,
 * collapsed-border evidence grid with a deliberately broken rhythm — the first
 * tile spans two columns like a lead exhibit. Each tile is an alt-driven
 * screenshot (subtle zoom on hover) captioned by a hairline-topped mono
 * "FIG.0X / title" label bar over the short description. Tiles route through
 * section-kit route links. Use to showcase product surfaces / dashboards for
 * cybersecurity vendors, SOC/MDR providers, or any visual B2B security SaaS.
 * Renders fully with no props via baked-in platform-view defaults.
 */
export const CybersecurityGallery = defineCapsule({
  name: 'CybersecurityGallery',
  description:
    "Terminal-stealth surveillance dossier gallery: a light section with a mono meta rule and asymmetric left-aligned header above a square-edged, collapsed-border evidence grid whose first tile spans two columns; each alt-driven screenshot zooms subtly on hover and is captioned by a hairline-topped mono 'FIG.0X / title' bar over its description, routing through section-kit route links. Use to showcase product surfaces / dashboards for cybersecurity vendors, SOC/MDR providers, or any visual B2B security SaaS.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** Gallery cards (title doubles as image alt + nav target). */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Platform overview'
    const description =
      props.description ??
      'Unified security management from a single pane of glass'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Threat Intelligence Dashboard',
            description:
              'Real-time global threat map with attack vector analysis and severity scoring.',
          },
          {
            title: 'Vulnerability Management',
            description:
              'Continuous scanning with prioritized remediation recommendations.',
          },
          {
            title: 'Incident Response',
            description:
              'Automated playbooks with team collaboration and audit trails.',
          },
          {
            title: 'Cloud Security Posture',
            description:
              'Multi-cloud configuration monitoring with auto-remediation.',
          },
          {
            title: 'Zero Trust Network',
            description:
              'Micro-segmentation with identity-based access controls.',
          },
          {
            title: 'Compliance Reports',
            description:
              'Automated evidence collection for SOC 2, ISO 27001, and more.',
          },
        ]

    return (
      <section
        className={cn('bg-background py-16 sm:py-20 lg:py-24', props.className)}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground sm:mb-10">
            <span className="flex items-center gap-3">
              <span aria-hidden="true" className="size-2 bg-primary" />
              Surface dossier
            </span>
            <span aria-hidden="true" className="tabular-nums">
              {String(items.length).padStart(2, '0')} figures
            </span>
          </div>
          <div className="mb-10 flex flex-col gap-6 sm:mb-14 md:flex-row md:items-end md:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-3"
              titleClassName="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
              subtitleClassName="max-w-xl text-base text-muted-foreground sm:text-lg"
            />
            <p
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              [ single pane ]
            </p>
          </div>
          <GalleryGrid>
            <GalleryGridItems
              columns={3}
              className="gap-0 border-l border-t border-border"
            >
              {items
                .map((item) => ({
                  alt: item.title,
                  caption: item.description,
                }))
                .map((img, i) => {
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
                        'rounded-none border-0 border-b border-r border-border',
                        i % 2 === 0 && 'lg:col-span-2 lg:aspect-[8/3]',
                      )}
                    >
                      <GalleryTileImage alt={__iv__.alt} />
                      <GalleryTileCaption className="rounded-none border-t border-border bg-background/90 px-4 py-3">
                        <span
                          aria-hidden="true"
                          className="block font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground tabular-nums"
                        >
                          fig.{String(i + 1).padStart(2, '0')} / {__iv__.alt}
                        </span>
                        {__iv__.caption && (
                          <span className="mt-1 block text-sm leading-snug text-foreground">
                            {__iv__.caption}
                          </span>
                        )}
                      </GalleryTileCaption>
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
