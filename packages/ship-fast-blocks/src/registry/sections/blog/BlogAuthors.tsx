import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BlogAuthors — newsprint "byline desk" contributor grid for an editorial
 * blog or publication. An asymmetric masthead header (mono "Masthead" tag,
 * serif heading, supporting line against a hairline column rule) sits on a
 * heavy double rule above a staggered 1/2/3-column grid of byline cards —
 * middle-column cards drop down a step on desktop for a broken-grid rhythm.
 * Each hairline card opens with a mono "№ 01" index rule, then a grayscale
 * round portrait (color returns on hover), the contributor's serif name,
 * their mono small-caps role, a one-line bio, and an underlined mono "View
 * profile" link wired through section-kit route links. Use as the
 * contributors / writers / meet-the-team section on blog homepages, magazine
 * about pages, or editorial landing pages.
 */
export const BlogAuthors = defineCapsule({
  name: 'BlogAuthors',
  description:
    "Newsprint 'byline desk' contributor grid for an editorial blog or publication: an asymmetric masthead header (mono Masthead tag, serif heading, supporting line on a hairline column rule) over a heavy double rule, above a staggered 1/2/3-column grid of byline cards whose middle column drops a step on desktop. Each hairline card opens with a mono '№ 01' index rule, then a grayscale round portrait that regains color on hover, the contributor's serif name, mono small-caps role, one-line bio, and an underlined mono 'View profile' link wired through section-kit route links. Use as the contributors / writers / meet-the-team section on blog homepages, magazine about pages, or editorial landing pages.",
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
        className={cn('bg-background py-16', props.className)}
      >
        <Container size="lg">
          {/* Asymmetric masthead header on a heavy double rule. */}
          <div className="flex flex-col gap-3 border-b-2 border-foreground pb-4 shadow-[0_3px_0_-2px] shadow-border sm:flex-row sm:items-end sm:justify-between sm:gap-8">
            <div className="flex items-baseline gap-4">
              <MonoTag tone="faint" className="shrink-0">
                {eyebrow}
              </MonoTag>
              <h2 className="font-serif text-3xl font-black tracking-tight text-foreground sm:text-4xl">
                {title}
              </h2>
            </div>
            <p className="max-w-xs border-l border-border pl-4 text-sm leading-snug text-muted-foreground sm:border-l-0 sm:border-r sm:pb-1 sm:pl-0 sm:pr-4 sm:text-right">
              {subtitle}
            </p>
          </div>

          <ResponsiveGrid
            cols="1-2-3"
            className="mt-10 gap-x-6 gap-y-8 lg:gap-y-6"
          >
            {authors.map((author, i) => (
              <PersonCard
                key={author.name}
                variant="outlined"
                className={cn(
                  'group border-border bg-background p-6 transition-colors duration-200 hover:border-foreground/50',
                  // Mobile ledger stagger: alternate cards indent off-axis.
                  i % 2 === 1 ? 'ml-6 sm:ml-0' : 'mr-6 sm:mr-0',
                  // Broken-grid stagger: the middle desktop column drops a step.
                  i % 3 === 1 && 'lg:translate-y-8',
                )}
              >
                {/* Mono index rule. */}
                <div className="flex items-baseline gap-3 border-b border-border pb-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60">
                    № {String(i + 1).padStart(2, '0')}
                  </span>
                  <span aria-hidden="true" className="h-px flex-1 bg-border" />
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">
                    {author.role.split(' ')[0]}
                  </span>
                </div>
                <div className="mt-5 flex items-center gap-4">
                  <Image
                    alt={author.avatarAlt}
                    w={128}
                    h={128}
                    loading="lazy"
                    className="size-16 shrink-0 rounded-full border border-foreground/25 object-cover grayscale transition-[filter] duration-500 group-hover:grayscale-0"
                  />
                  <div className="min-w-0">
                    <PersonCardName className="truncate font-serif text-lg font-black tracking-tight">
                      {author.name}
                    </PersonCardName>
                    <PersonCardRole className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em]">
                      {author.role}
                    </PersonCardRole>
                  </div>
                </div>
                <PersonCardBio className="mt-4 leading-relaxed">
                  {author.bio}
                </PersonCardBio>
                <NavbarRouteLink
                  className="mt-4 inline-flex w-fit items-center border-b border-foreground pb-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors hover:border-primary hover:text-primary active:translate-y-px"
                  href={author.name}
                >
                  View profile
                </NavbarRouteLink>
              </PersonCard>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
