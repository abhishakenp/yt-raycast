import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'

/**
 * FashionStoreAbout — image-forward brand-philosophy band for a luxury fashion
 * store. An asymmetric 5:7 split with a narrower text column (mono kicker +
 * multi-line serif heading + body paragraphs + a hairline-topped three-stat
 * ledger with serif figures and mono labels) beside a wider staggered 2x2
 * collage of mixed portrait / square photographs, sharp-edged with an offset
 * second column. All imagery uses the alt-driven Image component. Use to tell
 * the brand story and craftsmanship of clothing brands, boutiques, or
 * sustainable apparel labels.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  AboutSection,
  AboutGrid,
  AboutContent,
  AboutBody,
} from '#/section-kit/AboutSection.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
export const FashionStoreAbout = defineCapsule({
  name: 'FashionStoreAbout',
  description:
    'Image-forward brand-philosophy band for a luxury fashion store: an asymmetric 5:7 split with a narrower text column (mono kicker + multi-line serif heading + body paragraphs + a hairline-topped three-stat ledger with serif figures and mono labels) beside a wider staggered 2x2 collage of mixed portrait / square photographs, sharp-edged with an offset second column. All imagery uses the alt-driven Image component. Use to tell the brand story, philosophy and craftsmanship of clothing brands, boutiques, or sustainable apparel labels.',
  props: z.object({
    eyebrow: z.string().optional(),
    headingLines: z.array(z.string()).optional(),
    paragraphs: z.array(z.string()).optional(),
    stats: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
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
          {
            value: '12',
            label: 'Countries',
          },
          {
            value: '48hr',
            label: 'Global Shipping',
          },
          {
            value: '100%',
            label: 'Sustainable',
          },
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
      'font-mono text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground'
    return (
      <AboutSection
        aria-label="Our philosophy"
        className={cn('pt-28 pb-20 lg:pt-32 lg:pb-28', props.className)}
      >
        <Container>
          <AboutGrid className="items-start lg:grid-cols-[5fr_7fr] lg:gap-16">
            <AboutContent className="space-y-0">
              <div className="mb-4 flex items-center gap-4">
                <p className={eyebrowCls}>{aboutEyebrow}</p>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
              </div>
              <h2 className="mb-8 font-serif text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                {aboutHeadingLines.map((line, i) => (
                  <span key={line}>
                    {line}
                    {i < aboutHeadingLines.length - 1 ? <br /> : null}
                  </span>
                ))}
              </h2>
              <AboutBody className="space-y-6 leading-relaxed text-muted-foreground">
                {aboutParagraphs.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </AboutBody>
              <div className="mt-10 border-t border-border pt-10">
                <ResponsiveGrid cols="3" className="gap-6">
                  {aboutStats.map((s) => (
                    <div key={s.label}>
                      <p className="font-serif text-3xl font-normal text-foreground tabular-nums">
                        {s.value}
                      </p>
                      <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {s.label}
                      </p>
                    </div>
                  ))}
                </ResponsiveGrid>
              </div>
            </AboutContent>
            <ResponsiveGrid cols="2" className="gap-4">
              <div className="space-y-4">
                <div className="relative aspect-[3/4] overflow-hidden rounded-none bg-muted">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute left-3 top-3 z-10 font-mono text-[10px] uppercase tracking-[0.2em] text-background/80"
                  >
                    Fig. 01
                  </span>
                  <Image
                    alt={aboutImageAlts[0] ?? 'Fashion brand boutique interior'}
                    w={800}
                    h={1000}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="aspect-square overflow-hidden rounded-none bg-muted">
                  <Image
                    alt={aboutImageAlts[1] ?? 'Garment craftsmanship detail'}
                    w={800}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
              </div>
              <div className="space-y-4 pt-10">
                <div className="aspect-square overflow-hidden rounded-none bg-muted">
                  <Image
                    alt={aboutImageAlts[2] ?? 'Natural fabric rolls in studio'}
                    w={800}
                    h={800}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="aspect-[3/4] overflow-hidden rounded-none bg-muted">
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
            </ResponsiveGrid>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
