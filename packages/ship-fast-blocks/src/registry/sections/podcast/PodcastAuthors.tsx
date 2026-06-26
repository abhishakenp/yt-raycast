import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'

export const PodcastAuthors = defineComponent({
  name: 'PodcastAuthors',
  description:
    "Host roster section for a podcast site, rendering a responsive grid of warm token-styled host cards. Each card pairs a rounded avatar image with the host's name, role, a short bio, and a row of social pills. Use it to introduce the people behind a podcast and give listeners a face and voice to connect with.",
  props: z.object({
    /** Small uppercase eyebrow above the heading. */
    eyebrow: z.string().optional(),
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    subheading: z.string().optional(),
    /** Host cards: name, role, bio, avatar alt, optional social labels. */
    hosts: z
      .array(
        z.object({
          name: z.string(),
          role: z.string(),
          bio: z.string(),
          avatarAlt: z.string(),
          socials: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Your hosts'
    const heading = props.heading ?? 'Meet your hosts'
    const subheading =
      props.subheading ??
      'The voices behind every transmission — three people who love sound as much as the stories it carries.'
    const hosts = props.hosts?.length
      ? props.hosts
      : [
          {
            name: 'Mara Delacroix',
            role: 'Host & Investigative Journalist',
            bio: "Mara has chased stories across three continents and brings a reporter's instinct for the human thread inside every episode. She steers each conversation with warmth and a relentless curiosity.",
            avatarAlt:
              'warm studio headshot of a smiling woman journalist with curly hair, soft amber lighting',
            socials: ['Twitter', 'Instagram', 'LinkedIn'],
          },
          {
            name: 'Theo Iwasaki',
            role: 'Producer & Sound Designer',
            bio: 'Theo shapes the static into signal, sculpting the textures, scoring, and quiet moments that make the show feel intimate. He believes the best edit is the one you never notice.',
            avatarAlt:
              'warm studio headshot of a calm man sound engineer wearing headphones, golden lamp glow',
            socials: ['Twitter', 'Instagram'],
          },
          {
            name: 'Priya Anand',
            role: 'Music Supervisor',
            bio: 'Priya curates the moods between the words, hunting down the perfect cue to land an emotional beat. Her crate-digging gives every episode its unmistakable warm, lo-fi heartbeat.',
            avatarAlt:
              'warm studio headshot of a joyful woman music curator beside a record shelf, cozy backlight',
            socials: ['Instagram', 'Spotify', 'LinkedIn'],
          },
        ]

    return (
      <section
        className={cn(
          'bg-background py-20 text-foreground lg:py-28',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <SectionHeading
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
          />
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {hosts.map((host, i) => (
              <article
                key={`${host.name}-${i}`}
                className="rounded-2xl border border-border bg-card p-8 text-card-foreground"
              >
                <Image
                  alt={host.avatarAlt}
                  w={96}
                  h={96}
                  loading="lazy"
                  className="size-24 rounded-full object-cover"
                />
                <h3 className="mt-6 text-lg font-bold text-foreground">
                  {host.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-primary">
                  {host.role}
                </p>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {host.bio}
                </p>
                {host.socials?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {host.socials.map((social, j) => (
                      <span
                        key={`${social}-${j}`}
                        className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                      >
                        {social}
                      </span>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
