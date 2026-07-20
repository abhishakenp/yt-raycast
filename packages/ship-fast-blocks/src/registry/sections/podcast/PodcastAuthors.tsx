import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

export const PodcastAuthors = defineCapsule({
  name: 'PodcastAuthors',
  description:
    "Host roster section for a podcast site, rendering a responsive grid of square hard-shadowed host cards. Each card carries a mono host-index numeral, a square avatar image, the host's name, a mono uppercase role, a short bio, and a row of hairline mono social chips. Use it to introduce the people behind a podcast and give listeners a face and voice to connect with.",
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
        <Container size="lg" className="px-6 lg:px-6">
          <SectionHeading
            align="left"
            eyebrow={eyebrow}
            title={heading}
            subtitle={subheading}
            className="max-w-3xl"
            eyebrowClassName="font-mono tracking-[0.2em]"
            titleClassName="text-3xl font-extrabold tracking-tight md:text-4xl"
          />
          <ResponsiveGrid cols="1-md-3" className="mt-14">
            {hosts.map((host, i) => (
              <PersonCard
                key={`${host.name}-${i}`}
                variant="outlined"
                className="p-8 rounded-none border-foreground/20 transition-[transform,border-color,box-shadow] duration-150 hover:-translate-y-0.5 hover:border-foreground hover:shadow-[8px_8px_0_0] hover:shadow-foreground/10 motion-reduce:transform-none"
              >
                <div className="flex items-start justify-between gap-4">
                  <Image
                    alt={host.avatarAlt}
                    w={96}
                    h={96}
                    loading="lazy"
                    className="size-20 rounded-none border border-border object-cover"
                  />
                  <span
                    aria-hidden="true"
                    className="font-mono text-3xl font-extrabold tabular-nums leading-none text-foreground/15"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <PersonCardName className="mt-6 text-lg font-extrabold tracking-tight">
                  {host.name}
                </PersonCardName>
                <PersonCardRole className="mt-2 font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                  {host.role}
                </PersonCardRole>
                <PersonCardBio className="mt-4 leading-6">
                  {host.bio}
                </PersonCardBio>
                {host.socials?.length ? (
                  <div className="mt-6 flex flex-wrap gap-2 border-t border-border pt-4">
                    {host.socials.map((social, j) => (
                      <span
                        key={`${social}-${j}`}
                        className="rounded-none border border-border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground"
                      >
                        {social}
                      </span>
                    ))}
                  </div>
                ) : null}
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
