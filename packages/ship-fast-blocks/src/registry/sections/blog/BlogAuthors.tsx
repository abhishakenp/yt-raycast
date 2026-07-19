import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'

/**
 * BlogAuthors — contributor / author cards grid for an editorial blog or
 * publication. A centered SectionHeading (eyebrow + title + subtitle) sits above
 * a responsive 1/2/3-column grid of author cards. Each card shows a round avatar
 * (resolved from a headshot alt description), the contributor's name, their role,
 * a one-line bio, and a routable "View profile" link wired through useNavigate.
 * Use as the contributors / writers / "meet the team" section on blog homepages,
 * magazine about pages, or editorial landing pages.
 */
export const BlogAuthors = defineCapsule({
  name: 'BlogAuthors',
  description:
    "Contributor / author cards grid for an editorial blog or publication: a centered SectionHeading (eyebrow + title + subtitle) above a responsive 1/2/3-column grid of author cards. Each card has a round avatar image resolved from a headshot alt description, the contributor's name, their role, a one-line bio, and a routable 'View profile' link wired through useNavigate. Use as the contributors / writers / meet-the-team section on blog homepages, magazine about pages, or editorial landing pages.",
  props: z.object({
    /** Small uppercase eyebrow label above the title. */
    eyebrow: z.string().optional(),
    /** Section heading text. */
    title: z.string().optional(),
    /** Supporting sentence beneath the title. */
    subtitle: z.string().optional(),
    /** Contributor cards. */
    authors: z
      .array(
        z.object({
          /** Contributor display name (also the navigation target). */
          name: z.string(),
          /** Contributor role / job title. */
          role: z.string(),
          /** One-line bio shown on the card. */
          bio: z.string(),
          /** Alt text driving the avatar headshot image (never a raw src). */
          avatarAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const eyebrow = props.eyebrow ?? 'Contributors'
    const title = props.title ?? 'Meet the writers'
    const subtitle =
      props.subtitle ?? 'The designers and engineers behind our essays.'
    const authors = props.authors?.length
      ? props.authors
      : [
          {
            name: 'Ava Morales',
            role: 'Design Lead',
            bio: 'Writes about typography, interface craft, and the small details that make products feel calm.',
            avatarAlt:
              'professional headshot portrait of a smiling young woman with curly hair',
          },
          {
            name: 'Noah Reeves',
            role: 'Staff Engineer',
            bio: 'Covers edge rendering, performance, and the unglamorous work of keeping systems reliable.',
            avatarAlt:
              'professional headshot portrait of a smiling bearded man in a collared shirt',
          },
          {
            name: 'Sofia Andersson',
            role: 'Product Writer',
            bio: 'Turns messy discovery and user research into clear, useful stories for builders.',
            avatarAlt:
              'professional headshot portrait of a confident blonde woman in business casual attire',
          },
          {
            name: 'Liam Park',
            role: 'Editor',
            bio: "Shapes the publication's voice and edits every essay for clarity before it ships.",
            avatarAlt:
              'professional headshot portrait of a smiling man with glasses and dark hair',
          },
          {
            name: 'Emma Lin',
            role: 'Design Engineer',
            bio: 'Bridges design and code, writing about color, accessibility, and design systems.',
            avatarAlt:
              'professional headshot portrait of a cheerful asian woman with short black hair',
          },
          {
            name: 'Raj Patel',
            role: 'Infrastructure Writer',
            bio: 'Explains real-time systems, CRDTs, and scale in plain language for curious readers.',
            avatarAlt:
              'professional headshot portrait of a smiling indian man in a dark sweater',
          },
        ]

    return (
      <section
        aria-label="Contributors"
        className={cn('py-14', props.className)}
      >
        <Container size="lg">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            subtitle={subtitle}
            align="center"
          />

          <ResponsiveGrid cols="1-2-3" className="mt-10 gap-6">
            {authors.map((author) => (
              <PersonCard
                key={author.name}
                variant="outlined"
                rounded="xl"
                className="p-6"
              >
                <div className="flex items-center gap-4">
                  <Image
                    alt={author.avatarAlt}
                    w={128}
                    h={128}
                    loading="lazy"
                    className="size-16 rounded-full object-cover"
                  />
                  <div className="min-w-0">
                    <PersonCardName className="truncate">
                      {author.name}
                    </PersonCardName>
                    <PersonCardRole>{author.role}</PersonCardRole>
                  </div>
                </div>
                <PersonCardBio className="mt-4 leading-relaxed">
                  {author.bio}
                </PersonCardBio>
                <button
                  type="button"
                  onClick={() => go(author.name)}
                  className="mt-4 inline-flex w-fit items-center text-sm font-semibold text-primary"
                >
                  View profile
                </button>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
