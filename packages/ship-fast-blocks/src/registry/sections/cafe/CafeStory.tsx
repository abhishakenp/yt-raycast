import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * CafeStory — newsprint feature-article origin story for a cozy cafe / coffee
 * shop page. A mono dateline rail (cap stamp, hairline rule, "No. 03 —
 * Feature" edition label) sits above the serif headline, over a giant serif
 * italic ghost watermark of the cap text. Below, an asymmetric 5:7 editorial
 * grid: the left column stacks two vertically offset photos in kraft-washed
 * hairline frame plates with mono "Fig." caption rows (the second plate
 * offset down and pulled toward the gutter); the right column runs the
 * narrative paragraphs — the first opening with an oversized serif drop cap —
 * and closes with a hairline-ruled founder attribution row (round avatar,
 * name, mono role). No links. Use to present a cafe's origin, values, or team
 * story. Renders fully with no props via baked-in "Little Owl Coffee"
 * defaults.
 */
export const CafeStory = defineCapsule({
  name: 'CafeStory',
  description:
    "Newsprint feature-article origin story for a cozy cafe page: a mono dateline rail (cap stamp, hairline rule, edition label) above a serif headline over a giant serif italic ghost watermark; then an asymmetric 5:7 editorial grid — left column stacks two vertically offset photos in kraft-washed hairline frame plates with mono 'Fig.' caption rows, right column runs narrative paragraphs opening with an oversized serif drop cap and closes with a hairline-ruled founder attribution row (round avatar, name, mono role). No links. Use to present a cafe's origin, values, or team story.",
  props: z.object({
    /** Eyebrow / cap text. */
    cap: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Narrative paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Founder name(s). */
    founderName: z.string().optional(),
    /** Founder role. */
    founderRole: z.string().optional(),
    /** Alt text driving the founder avatar. */
    founderAvatarAlt: z.string().optional(),
    /** Alt text driving the left-top photo. */
    imageAlt1: z.string().optional(),
    /** Alt text driving the left-bottom photo. */
    imageAlt2: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const cap = props.cap ?? 'Our Story'
    const heading = props.heading ?? 'From a dream to your daily ritual'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          "Little Owl Coffee began in 2018 when Marcus Chen and Elena Rodriguez left their corporate jobs to pursue a shared obsession: creating a space where exceptional coffee meets genuine community. They spent six months remodeling a forgotten storefront in Portland's Pearl District, hand-pouring the concrete floors and building the communal tables themselves.",
          'The name "Little Owl" came from the Western Screech-Owl pair that nested in the oak tree outside their first apartment together. Like those owls, we believe in being quietly present, observant, and creating warmth in unexpected places.',
          'Today, we source our beans through direct trade relationships with small farms in Ethiopia, Colombia, and Guatemala. We visit at least two farms each year, building relationships that go beyond transactional. Our head roaster, James, develops profiles that honor the unique characteristics of each origin while making them approachable for everyday enjoyment.',
        ]
    const founderName = props.founderName ?? 'Marcus & Elena'
    const founderRole = props.founderRole ?? 'Founders & Co-owners'
    const founderAvatarAlt =
      props.founderAvatarAlt ??
      'Professional headshot of Marcus Chen, co-owner, a smiling man with glasses and a beard'
    const imageAlt1 =
      props.imageAlt1 ??
      'Portrait of cafe owners in the coffee shop kitchen, smiling while preparing pastries'
    const imageAlt2 =
      props.imageAlt2 ??
      'Coffee shop interior during golden hour, showing warm lighting, potted plants, and communal seating'

    const PhotoPlate = ({
      alt,
      caption,
      className,
    }: {
      alt: string
      caption: string
      className?: string
    }) => (
      <div className={cn('border border-foreground/20 bg-card p-2', className)}>
        <div className="aspect-[3/4] overflow-hidden">
          <Image
            alt={alt}
            w={500}
            h={667}
            loading="lazy"
            className="size-full object-cover"
          />
        </div>
        <div className="flex items-center gap-2 px-0.5 pt-2">
          <MonoTag tone="faint" className="text-[10px]">
            {caption}
          </MonoTag>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
      </div>
    )

    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background pt-24 pb-16 lg:pt-32 lg:pb-24',
          props.className,
        )}
      >
        <Watermark className="top-10 left-[-2%] font-serif text-[5rem] font-medium italic tracking-tight text-foreground/[0.04] sm:text-[8rem] lg:text-[12rem]">
          {cap}
        </Watermark>

        <Container size="xl" className="relative px-6">
          {/* Mono dateline rail. */}
          <div className="flex items-center gap-4">
            <MonoTag>{cap}</MonoTag>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <MonoTag tone="faint" className="hidden sm:inline">
              No. 03 — Feature
            </MonoTag>
          </div>

          <h2 className="mt-6 max-w-3xl font-serif text-4xl font-medium leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            {heading}
          </h2>

          <div className="mt-12 grid gap-12 lg:mt-16 lg:grid-cols-12 lg:gap-14">
            {/* Offset photo plates. */}
            <div className="grid grid-cols-2 items-start gap-4 lg:col-span-5 lg:gap-5">
              <PhotoPlate
                alt={imageAlt1}
                caption="Fig. 01"
                className="-ml-2 sm:ml-0"
              />
              <PhotoPlate
                alt={imageAlt2}
                caption="Fig. 02"
                className="translate-y-8 lg:translate-y-12"
              />
            </div>

            {/* Article column with drop cap + founder byline. */}
            <div className="lg:col-span-7">
              <div className="space-y-5">
                {paragraphs.map((p, i) => (
                  <p
                    key={i}
                    className={cn(
                      'leading-relaxed text-muted-foreground',
                      i === 0 &&
                        'first-letter:float-left first-letter:mr-3 first-letter:font-serif first-letter:text-6xl first-letter:font-medium first-letter:leading-[0.85] first-letter:text-foreground',
                    )}
                  >
                    {p}
                  </p>
                ))}
              </div>
              <div className="mt-8 flex items-center gap-4 border-t border-border pt-6">
                <Image
                  alt={founderAvatarAlt}
                  w={100}
                  h={100}
                  className="size-14 rounded-full object-cover"
                />
                <div>
                  <p className="font-serif text-lg font-medium text-foreground">
                    {founderName}
                  </p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                    {founderRole}
                  </p>
                </div>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span
                  aria-hidden="true"
                  className="hidden font-serif text-xl italic text-muted-foreground/60 sm:inline"
                >
                  ✳
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
