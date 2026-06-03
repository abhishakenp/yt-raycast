import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"
import { useNavigate } from "#/lib/use-navigate.tsx"
import { Image } from "#/lib/img.tsx"

/**
 * MusicArtistAbout — split about-the-band section for a music artist / band
 * page. On the left: an eyebrow, a thin heading, several biography paragraphs,
 * and a row of social-link buttons. On the right: a pair of staggered portrait
 * (3:4) member photos. Warm, airy, editorial indie-folk aesthetic on a soft
 * neutral canvas. Each social routes through useNavigate; photos use the
 * alt-driven Image component. Use as the band-story / about section for
 * musicians, bands, or artist EPK pages. Renders fully with no props via
 * baked-in defaults.
 */
export const MusicArtistAbout = defineComponent({
  name: "MusicArtistAbout",
  description:
    "Split about-the-band section for a music artist / band page: on the left an eyebrow, a thin heading, several biography paragraphs, and a row of social-link buttons; on the right a pair of staggered portrait (3:4) member photos. Warm, airy editorial indie-folk aesthetic on a soft neutral canvas. Each social routes through useNavigate; photos use the alt-driven Image component. Use as the band-story / about section for musicians, singers, bands, or artist EPK pages.",
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
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? "About the Band"
    const heading = props.heading ?? "Velvet Echo"
    const paragraphs = props.paragraphs?.length
      ? props.paragraphs
      : [
          'Formed in 2019 in Portland, Oregon, Velvet Echo brings together three musicians with a shared love for intimate storytelling and acoustic textures. What started as weekly jam sessions in a basement on Hawthorne Boulevard has evolved into a sound that’s been described as "warmth wrapped in melody."',
          "The band—comprising Maya Chen (vocals, guitar), James O'Brien (bass, mandolin), and Sam Torres (drums, piano)—draws influence from the quiet moments of folk, the honesty of Americana, and the spaciousness of ambient music.",
          'Their sophomore album "Northbound" was recorded over two weeks in a converted barn near Mount Hood, with producer David Martinez capturing the songs as live performances to preserve their organic energy.',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ["Instagram", "Twitter", "YouTube", "Spotify"]
    const imageAlt1 =
      props.imageAlt1 ??
      "Maya Chen, lead vocalist and guitarist, performing with acoustic guitar on stage"
    const imageAlt2 =
      props.imageAlt2 ??
      "James O'Brien and Sam Torres, band members playing bass and drums during rehearsal"

    return (
      <section
        className={cn("px-6 py-20 lg:px-8 lg:py-32", props.className)}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
            <div>
              <p className="mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                {eyebrow}
              </p>
              <h2 className="mb-6 text-3xl font-light text-foreground lg:text-5xl">
                {heading}
              </h2>
              <div className="space-y-4 leading-relaxed text-muted-foreground">
                {paragraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-8 flex gap-6">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {social}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                  <Image
                    alt={imageAlt1}
                    w={400}
                    h={533}
                    loading="lazy"
                    className="size-full object-cover"
                  />
                </div>
                <div className="mt-8 aspect-[3/4] overflow-hidden rounded-sm bg-muted">
                  <Image
                    alt={imageAlt2}
                    w={400}
                    h={533}
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
