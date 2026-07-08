import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * FashionStoreLookbook — editorial Lookbook masonry gallery for a minimalist
 * fashion store. A subtle muted-band section with a split intro (eyebrow +
 * serif heading on the left, right-aligned description on the right) above a
 * mixed-span 2-to-3 column masonry grid of look tiles — each a portrait image
 * with an overlaid uppercase look label and optional serif title, sized as
 * feature (2x2), wide (2-wide) or small — closed by an outlined "Explore Full
 * Lookbook" CTA. Every tile and CTA routes through useNavigate and imagery
 * uses the alt-driven Image component. Use to present a seasonal editorial
 * lookbook for clothing brands, boutiques, or lifestyle commerce.
 */
export const FashionStoreLookbook = defineCapsule({
  name: 'FashionStoreLookbook',
  description:
    "Editorial Lookbook masonry gallery for a minimalist fashion store: a subtle muted-band section with a split intro (eyebrow + serif heading on the left, right-aligned description on the right) above a mixed-span 2-to-3 column masonry grid of look tiles — each a portrait image with an overlaid uppercase look label and optional serif title, sized as feature (2x2), wide (2-wide) or small — closed by an outlined 'Explore Full Lookbook' CTA. Every tile and CTA routes through useNavigate and imagery uses the alt-driven Image component. Use to present a seasonal editorial lookbook for clothing brands, boutiques, or lifestyle commerce.",
  props: z.object({
    eyebrow: z.string().optional(),
    heading: z.string().optional(),
    description: z.string().optional(),
    cta: z.string().optional(),
    items: z
      .array(
        z.object({
          look: z.string(),
          title: z.string().optional(),
          imageAlt: z.string(),
          /** Layout span: "feature" (2x2), "wide" (2 wide), or "small". */
          size: z.enum(['feature', 'wide', 'small']).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const lookbookEyebrow = props.eyebrow ?? 'Spring/Summer 2025'
    const lookbookHeading = props.heading ?? 'The Lookbook'
    const lookbookDesc =
      props.description ??
      'An editorial exploration of neutral palettes, sculptural silhouettes, and the quiet confidence of minimal dressing. Shot on location in Copenhagen.'
    const lookbookCta = props.cta ?? 'Explore Full Lookbook'
    const lookbookItems = props.items?.length
      ? props.items
      : [
          {
            look: 'Look 01',
            title: 'The Monochrome Edit',
            size: 'feature' as const,
            imageAlt:
              'Editorial fashion photograph of model in all-black ensemble standing in stark white hallway',
          },
          {
            look: 'Look 02',
            size: 'small' as const,
            imageAlt:
              'Detail shot of layered neutral clothing textures, beige and cream fabrics',
          },
          {
            look: 'Look 03',
            size: 'small' as const,
            imageAlt:
              'Fashion photograph of model in oversized beige trench coat on city street',
          },
          {
            look: 'Look 04',
            title: 'The Everyday Essential',
            size: 'wide' as const,
            imageAlt:
              'Two models walking side by side in minimalist neutral outfits, editorial street style',
          },
          {
            look: 'Look 05',
            size: 'small' as const,
            imageAlt:
              'Model in flowing cream dress captured mid-movement against concrete architecture',
          },
          {
            look: 'Look 06',
            size: 'small' as const,
            imageAlt:
              'Close-up editorial detail of linen fabric texture and natural light',
          },
          {
            look: 'Look 07',
            size: 'small' as const,
            imageAlt:
              'Model in structured blazer and wide trousers, power dressing editorial',
          },
        ]

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    const lookbookSpan = (size?: 'feature' | 'wide' | 'small') => {
      if (size === 'feature') return 'col-span-2 row-span-2 aspect-[4/5]'
      if (size === 'wide') return 'col-span-2 aspect-[16/9]'
      return 'aspect-[3/4]'
    }

    return (
      <section
        aria-label="Lookbook gallery"
        className={cn('bg-muted py-20 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 grid items-start gap-8 lg:grid-cols-2 lg:gap-12">
            <div>
              <p className={cn(eyebrowCls, 'mb-3')}>{lookbookEyebrow}</p>
              <h2 className="font-serif text-4xl font-normal sm:text-5xl lg:text-6xl">
                {lookbookHeading}
              </h2>
            </div>
            <div className="lg:pt-8 lg:text-right">
              <p className="max-w-md text-muted-foreground lg:ml-auto">
                {lookbookDesc}
              </p>
            </div>
          </div>

          <ResponsiveGrid cols="2-lg-3" gap="sm" className="lg:gap-6">
            {lookbookItems.map((item) => (
              <button
                key={item.look}
                type="button"
                onClick={() => go(item.title ?? item.look)}
                className={cn(
                  'group relative overflow-hidden text-left',
                  lookbookSpan(item.size),
                )}
              >
                <Image
                  alt={item.imageAlt}
                  w={1200}
                  h={1500}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div
                  className={cn(
                    'absolute text-background',
                    item.size === 'feature' || item.size === 'wide'
                      ? 'bottom-6 left-6'
                      : 'bottom-4 left-4',
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.2em]">
                    {item.look}
                  </p>
                  {item.title ? (
                    <p className="mt-1 font-serif text-xl">{item.title}</p>
                  ) : null}
                </div>
              </button>
            ))}
          </ResponsiveGrid>

          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => go(lookbookCta)}
              className="inline-flex items-center border border-foreground px-8 py-4 text-sm font-medium tracking-wide text-foreground transition-colors hover:bg-foreground hover:text-background"
            >
              {lookbookCta}
            </button>
          </div>
        </div>
      </section>
    )
  },
})
