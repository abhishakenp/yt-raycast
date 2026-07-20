import { defineCapsule } from '#/capsules/openui.ts'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'
import { z } from 'zod/v4'

export const SalonBarberGallery = defineCapsule({
  name: 'SalonBarberGallery',
  description:
    "Portfolio gallery for a barbershop or salon rendered as a vintage-lite editorial plate wall. An asymmetric header (mono index eyebrow + serif heading left, mono count right) sits over a faint serif ghost watermark, above a staggered grid of hairline-framed photo plates — each alt-driven image carries a mono 'Fig. 0N' caption row with a hairline rule and its serif caption — that offset vertically for an editorial rhythm. Use it lower on a barbershop, salon, or men's grooming page to build trust with real-looking cut, style, and interior proof.",
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    images: z
      .array(z.object({ alt: z.string(), caption: z.string().optional() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'The Work'
    const description = props.description ?? 'Recent cuts & styles'
    const images = props.images?.length
      ? props.images
      : [
          {
            alt: 'barber finishing a crisp skin fade haircut on a young man in a modern barbershop',
            caption: 'Skin fade',
          },
          {
            alt: 'close up of a sharp beard line-up and hot towel shave with straight razor',
            caption: 'Beard line-up',
          },
          {
            alt: 'textured modern quiff hairstyle styled with matte product on a male client',
            caption: 'Textured quiff',
          },
          {
            alt: 'natural blonde highlights and color blend on layered salon haircut',
            caption: 'Color & highlights',
          },
          {
            alt: 'classic pompadour haircut with tight taper on the sides in a barbershop chair',
            caption: 'Classic pompadour',
          },
          {
            alt: 'interior of a stylish barbershop with leather chairs vintage mirrors and warm lighting',
            caption: 'Our shop',
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-muted/30 pt-24 pb-24 lg:pt-28 lg:pb-32',
          props.className,
        )}
      >
        <Watermark className="top-10 right-[-3%] font-serif text-[7rem] italic tracking-tight text-foreground/[0.04] sm:text-[11rem] lg:text-[15rem]">
          Portfolio
        </Watermark>

        <Container className="relative">
          <div className="flex flex-col gap-5 border-b border-foreground/15 pb-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-xl">
              <MonoTag tone="primary">{description}</MonoTag>
              <h2 className="mt-3 font-serif text-4xl font-medium tracking-tight text-foreground sm:text-5xl">
                {heading}
              </h2>
            </div>
            <MonoTag aria-hidden="true" tone="faint" className="shrink-0">
              {String(images.length).padStart(2, '0')} / plates
            </MonoTag>
          </div>

          {/* Staggered hairline-framed plate wall. */}
          <div className="mt-12 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-3 lg:gap-x-6">
            {images.map((img, i) => {
              const __iv__ = img as {
                alt: string
                caption?: string
                title?: string
                location?: string
              }
              return (
                <figure
                  key={__iv__.alt}
                  className={cn(
                    'group border border-foreground/20 bg-card p-2 transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[6px_6px_0_0] hover:shadow-foreground/10',
                    i % 3 === 1 && 'lg:translate-y-10',
                    i % 3 === 2 && 'lg:translate-y-4',
                  )}
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <Image
                      alt={__iv__.alt}
                      w={800}
                      h={1000}
                      loading="lazy"
                      className="size-full object-cover grayscale transition-[filter] duration-300 group-hover:grayscale-0"
                    />
                  </div>
                  <figcaption className="flex items-center gap-2.5 px-1 pt-2.5 pb-0.5">
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                      Fig. {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      aria-hidden="true"
                      className="h-px flex-1 bg-foreground/15"
                    />
                    {__iv__.caption ? (
                      <span className="shrink-0 font-serif text-sm italic text-foreground">
                        {__iv__.caption}
                      </span>
                    ) : null}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </Container>
      </section>
    )
  },
})
