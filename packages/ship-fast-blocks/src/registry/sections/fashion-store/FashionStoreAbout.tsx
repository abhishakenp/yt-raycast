import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FashionStoreAbout — split brand-philosophy / about band for a minimalist
 * fashion store. A two-column layout with a text column (eyebrow + multi-line
 * serif heading + body paragraphs + a top-bordered three-stat trio) beside a
 * staggered 2x2 image collage of mixed portrait / square photographs with an
 * offset second column. All imagery uses the alt-driven Image component. Use
 * to tell the brand story and craftsmanship of clothing brands, boutiques,
 * or sustainable apparel labels.
 */
export const FashionStoreAbout = defineCapsule({
  name: 'FashionStoreAbout',
  description:
    'Split brand-philosophy / about band for a minimalist fashion store: a two-column layout with a text column (eyebrow + multi-line serif heading + body paragraphs + a top-bordered three-stat trio) beside a staggered 2x2 image collage of mixed portrait / square photographs with an offset second column. All imagery uses the alt-driven Image component. Use to tell the brand story, philosophy and craftsmanship of clothing brands, boutiques, or sustainable apparel labels.',
  props: z.object({
    eyebrow: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    paragraphs: z.array(z.string()).optional(),
    stats: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    imageAlts: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const aboutEyebrow = props.eyebrow ?? 'Our Philosophy'
    const aboutHeadingLines = props.headingLines?.length
      ? props.headingLines
      : ['Thoughtfully', 'Designed', 'Timelessly']
    const aboutParagraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          'Founded in 2019, NOIRE began with a simple conviction: that exceptional quality and timeless design should be accessible to everyone. We believe in the power of a well-curated wardrobe — pieces that transcend seasons and trends.',
          "Every garment in our collection is crafted with intention. We partner with ateliers across Italy, Portugal, and Japan who share our commitment to ethical production and uncompromising quality. From fabric selection to final stitch, we obsess over the details so you don't have to.",
          'Our collections are designed around the concept of modular dressing — a cohesive palette of neutrals that work together seamlessly. Build your wardrobe with pieces that complement each other, season after season.',
        ]
    const aboutStats = props.stats?.length
      ? props.stats
      : [
          { value: '12', label: 'Countries' },
          { value: '48hr', label: 'Global Shipping' },
          { value: '100%', label: 'Sustainable' },
        ]
    const aboutImageAlts = props.imageAlts?.length
      ? props.imageAlts
      : [
          'Interior of NOIRE flagship boutique with minimalist display and neutral color palette',
          'Close-up of hands working on garment construction in atelier, craftsmanship detail',
          'Natural fabric rolls in muted earth tones stored in modern fashion studio',
          'Fashion design sketches and fabric samples on clean white desk',
        ]

    const eyebrowCls =
      'text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground'

    return (
      <section
        aria-label="Our philosophy"
        className={cn('py-20 lg:py-32', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className={cn(eyebrowCls, 'mb-4')}>{aboutEyebrow}</p>
              <h2 className="mb-8 font-serif text-4xl font-normal leading-tight sm:text-5xl lg:text-6xl">
                {aboutHeadingLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < aboutHeadingLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <div className="space-y-6 text-muted-foreground">
                {aboutParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
              <div className="mt-10 border-t border-border pt-10">
                <div className="grid grid-cols-3 gap-8">
                  {aboutStats.map((s) => (
                    <div key={s.label}>
                      <p className="font-serif text-3xl text-foreground">
                        {s.value}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    alt={aboutImageAlts[0] ?? 'Fashion brand boutique interior'}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden">
                  <Image
                    alt={aboutImageAlts[1] ?? 'Garment craftsmanship detail'}
                    w={800}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-8">
                <div className="aspect-square overflow-hidden">
                  <Image
                    alt={aboutImageAlts[2] ?? 'Natural fabric rolls in studio'}
                    w={800}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden">
                  <Image
                    alt={
                      aboutImageAlts[3] ??
                      'Fashion design sketches and fabric samples'
                    }
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    )
  },
})
