import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import {
  AboutSection,
  AboutGrid,
  AboutContent,
  AboutBody,
  AboutMedia,
  AboutEyebrow,
  AboutHeading,
  AboutImageTile,
} from '#/section-kit/AboutSection.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * MusicArtistAbout — asymmetric 7:5 about-the-band band for a music artist /
 * band page. On the left: a mono metadata rail (label — hairline rule — "BIO"
 * index), a giant extrabold uppercase tight-tracked heading, several biography
 * paragraphs (first opening with an oversized drop cap), and a row of rotated
 * mono ticket-stub social links. On the right: a pair of staggered hard-bordered
 * portrait (3:4) member photos, the first over a primary-tinted offset frame.
 * All behind a giant ghost watermark of the band's initial. Bold poster
 * aesthetic driven entirely by theme tokens (flips light/dark); binary
 * rounded-none radius. Each social routes through section-kit route links; photos
 * use the alt-driven Image component. Use as the band-story / about section for
 * musicians, bands, or artist EPK pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistAbout = defineCapsule({
  name: 'MusicArtistAbout',
  description:
    'Asymmetric 7:5 about-the-band band for a music artist / band page: on the left a mono metadata rail (label — hairline rule — index), a giant extrabold uppercase tight-tracked heading, several biography paragraphs (first opening with an oversized drop cap), and a row of rotated mono ticket-stub social links; on the right a pair of staggered hard-bordered portrait (3:4) member photos, the first over a primary-tinted offset frame, all behind a giant ghost watermark of the band initial. Bold poster aesthetic driven entirely by theme tokens (flips light/dark); binary rounded-none radius. Each social routes through section-kit route links; photos use the alt-driven Image component. Use as the band-story / about section for musicians, singers, bands, or artist EPK pages.',
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Thin-weight section heading (often the band name). */
    heading: z.string().optional(),
    /** Biography paragraphs. */
    paragraphs: z.array(z.string()).optional(),
    /** Social link labels. */
    socials: z.array(z.string()).optional(),
    /** Alt text for the first (upper-left) portrait photo. */
    imageAlt1: z.string().optional(),
    /** Alt text for the second (lower-right) portrait photo. */
    imageAlt2: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'About the Band'
    const heading = props.heading ?? 'Velvet Echo'
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          'Formed in 2019 in Portland, Oregon, Velvet Echo brings together three musicians with a shared love for intimate storytelling and acoustic textures. What started as weekly jam sessions in a basement on Hawthorne Boulevard has evolved into a sound that’s been described as "warmth wrapped in melody."',
          "The band—comprising Maya Chen (vocals, guitar), James O'Brien (bass, mandolin), and Sam Torres (drums, piano)—draws influence from the quiet moments of folk, the honesty of Americana, and the spaciousness of ambient music.",
          'Their sophomore album "Northbound" was recorded over two weeks in a converted barn near Mount Hood, with producer David Martinez capturing the songs as live performances to preserve their organic energy.',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Twitter', 'YouTube', 'Spotify']
    const imageAlt1 =
      props.imageAlt1 ??
      'Maya Chen, lead vocalist and guitarist, performing with acoustic guitar on stage'
    const imageAlt2 =
      props.imageAlt2 ??
      "James O'Brien and Sam Torres, band members playing bass and drums during rehearsal"

    const watermark = heading.trim().charAt(0) || 'M'

    return (
      <AboutSection
        className={cn(
          'relative overflow-hidden px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-16 -left-6 select-none font-extrabold uppercase leading-none tracking-tighter text-foreground/[0.04] text-[13rem] sm:text-[18rem] lg:text-[24rem]"
        >
          {watermark}
        </span>

        <Container size="lg" className="relative">
          <AboutGrid className="items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <AboutContent className="space-y-0 lg:col-span-7">
              <div className="flex items-center gap-4">
                <AboutEyebrow className="mb-0 font-mono text-[11px] font-normal uppercase tracking-[0.22em] text-muted-foreground">
                  {eyebrow}
                </AboutEyebrow>
                <span aria-hidden="true" className="h-px flex-1 bg-border" />
                <span
                  aria-hidden="true"
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground"
                >
                  Bio
                </span>
              </div>
              <AboutHeading className="mb-6 mt-6 font-sans text-4xl font-extrabold uppercase leading-[0.9] tracking-tighter text-foreground sm:text-5xl lg:text-6xl">
                {heading}
              </AboutHeading>
              <AboutBody className="space-y-0">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className={cn(
                      'leading-relaxed text-muted-foreground',
                      i === 0 &&
                        'first-letter:float-left first-letter:mr-3 first-letter:text-6xl first-letter:font-extrabold first-letter:leading-[0.8] first-letter:tracking-tight first-letter:text-foreground',
                      i > 0 && 'mt-5',
                    )}
                  >
                    {paragraph}
                  </p>
                ))}
              </AboutBody>
              <div className="mt-8 flex flex-wrap gap-3">
                {socials.map((social, i) => (
                  <NavbarRouteLink
                    key={social}
                    aria-label={social}
                    className={cn(
                      'inline-flex items-center rounded-full border border-foreground bg-background px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px',
                      i % 2 === 0 ? '-rotate-2' : 'rotate-1',
                    )}
                    href={social}
                  >
                    {social}
                  </NavbarRouteLink>
                ))}
              </div>
            </AboutContent>

            <div className="lg:col-span-5">
              <AboutMedia className="gap-4">
                <div className="relative">
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 translate-x-3 translate-y-3 border-2 border-primary/30 bg-primary/5"
                  />
                  <AboutImageTile className="relative rounded-none border-2 border-foreground bg-muted">
                    <Image
                      alt={imageAlt1}
                      w={400}
                      h={533}
                      loading="lazy"
                      className="size-full object-cover"
                    />
                  </AboutImageTile>
                </div>
                <AboutImageTile
                  offset
                  className="rounded-none border-2 border-foreground bg-muted"
                >
                  <Image
                    alt={imageAlt2}
                    w={400}
                    h={533}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </AboutImageTile>
              </AboutMedia>
            </div>
          </AboutGrid>
        </Container>
      </AboutSection>
    )
  },
})
