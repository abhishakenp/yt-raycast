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
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * MusicArtistAbout — split about-the-band section for a music artist / band
 * page. On the left: an eyebrow, a thin heading, several biography paragraphs,
 * and a row of social-link buttons. On the right: a pair of staggered portrait
 * (3:4) member photos. Warm, airy, editorial indie-folk aesthetic on a soft
 * neutral canvas. Each social routes through section-kit route links; photos use the
 * alt-driven Image component. Use as the band-story / about section for
 * musicians, bands, or artist EPK pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistAbout = defineCapsule({
  name: 'MusicArtistAbout',
  description:
    'Split about-the-band section for a music artist / band page: on the left an eyebrow, a thin heading, several biography paragraphs, and a row of social-link buttons; on the right a pair of staggered portrait (3:4) member photos. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. Each social routes through section-kit route links; photos use the alt-driven Image component. Use as the band-story / about section for musicians, singers, bands, or artist EPK pages.',
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

    return (
      <AboutSection
        className={cn(
          'px-6 pt-28 pb-20 lg:px-8 lg:pt-32 lg:pb-28',
          props.className,
        )}
      >
        <Container size="lg">
          <AboutGrid>
            <AboutContent>
              <AboutEyebrow className="mb-4 text-muted-foreground">
                {eyebrow}
              </AboutEyebrow>
              <AboutHeading className="mb-6 font-sans text-3xl font-light lg:text-5xl">
                {heading}
              </AboutHeading>
              <AboutBody>
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </AboutBody>
              <div className="mt-8 flex gap-6">
                {socials.map((social) => (
                  <NavbarRouteLink
                    key={social}
                    aria-label={social}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                    href={social}
                  >
                    {social}
                  </NavbarRouteLink>
                ))}
              </div>
            </AboutContent>
            <div>
              <AboutMedia>
                <AboutImageTile className="rounded-sm bg-muted">
                  <Image
                    alt={imageAlt1}
                    w={400}
                    h={533}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </AboutImageTile>
                <AboutImageTile offset className="rounded-sm bg-muted">
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
