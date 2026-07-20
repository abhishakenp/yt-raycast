import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { ArticleGrid } from '#/section-kit/ArticleGrid.tsx'
import {
  StoryCard,
  StoryCardImage,
  StoryCardImageContainer,
  StoryCardMeta,
  StoryCardTitle,
  StoryCardExcerpt,
  StoryCardFooter,
  StoryCardBody,
} from '#/section-kit/StoryCard.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * NewsletterIssues — newsprint-lite archive grid for an editorial newsletter. A
 * hairline meta rail (a primary square + mono "The Archive" label, a mono issue
 * count) tops a left-aligned serif heading + lede; then a staggered 1/2/3-column
 * grid of square (rounded-none) hairline story cards — each with a 16:10 grayscale
 * cover photo that colors and zooms on hover, a mono tabular issue-number ·
 * dateline row, a serif title, a short blurb, and a "Read issue" link with a
 * trailing arrow, lifting onto a hard offset shadow on hover; a square outlined
 * "View all" button with press feedback closes the section. Clean paper-toned
 * surface with restrained newspaper structure. Covers use the alt-driven Image
 * component; titles, read links, and the view-all button route through
 * section-kit route links. Use to showcase a back-catalog for newsletters,
 * publications, blogs, or content creators. Renders fully with no props via
 * baked-in defaults.
 */
export const NewsletterIssues = defineCapsule({
  name: 'NewsletterIssues',
  description:
    "Newsprint-lite archive grid for an editorial newsletter: a hairline meta rail (a primary square + mono 'The Archive' label, a mono issue count) above a left-aligned serif heading + lede, then a staggered 1/2/3-column grid of square hairline story cards, each with a 16:10 grayscale cover photo that colors and zooms on hover, a mono tabular issue-number-and-dateline row, a serif title, a short blurb, and a 'Read issue' link with a trailing arrow, lifting onto a hard offset shadow on hover; a square outlined 'View all' button with press feedback closes the section. Clean paper-toned surface with restrained newspaper structure. Covers use the alt-driven Image component; titles, read links, and the view-all button route through section-kit route links. Use to showcase a back-catalog for newsletters, publications, blogs, or content creators.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting lede under the heading. */
    description: z.string().optional(),
    /** Label + target of the centered view-all button. */
    viewAll: z.string().optional(),
    /** Read-link label inside each card. */
    readLabel: z.string().optional(),
    /** Archive items shown as cards. */
    items: z
      .array(
        z.object({
          number: z.string(),
          date: z.string(),
          title: z.string(),
          blurb: z.string(),
          imageAlt: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Recent Issues'
    const description =
      props.description ??
      'A selection of our most-read essays from the past few months.'
    const viewAll = props.viewAll ?? 'View All 156 Issues'
    const readLabel = props.readLabel ?? 'Read issue'
    const items = props.items?.length
      ? props.items
      : [
          {
            number: 'Issue #156',
            date: 'May 25, 2026',
            title: 'The Art of Digital Slowing',
            blurb:
              'On the paradox of building tools for focus in an age of infinite distraction—and why the answer might not be another app.',
            imageAlt:
              'minimal workspace desk with open notebook, coffee cup, and soft natural morning light',
          },
          {
            number: 'Issue #155',
            date: 'May 18, 2026',
            title: 'When AI Writes the Code',
            blurb:
              'What happens to craft when the tools get too good? A meditation on writing, coding, and the value of struggle.',
            imageAlt:
              'futuristic humanoid robot arm reaching toward glowing light representing AI and human interaction',
          },
          {
            number: 'Issue #154',
            date: 'May 11, 2026',
            title: 'The Remote Work Bet',
            blurb:
              "Five years in, the data is finally clear. What we got right, what we lost, and where we're headed next.",
            imageAlt:
              'diverse group of colleagues collaborating around a table with laptops in a modern office space',
          },
          {
            number: 'Issue #153',
            date: 'May 4, 2026',
            title: 'Writing as Thinking',
            blurb:
              'The lost art of using prose to clarify thought. Why the best product minds I know are obsessive note-takers.',
            imageAlt:
              'vintage typewriter with blank page representing the craft of thoughtful writing',
          },
          {
            number: 'Issue #152',
            date: 'April 27, 2026',
            title: 'Privacy After the Breach',
            blurb:
              'A personal account of having my data leaked—and the broader implications for how we build trust online.',
            imageAlt:
              'cybersecurity concept with digital lock and binary code overlay on dark background',
          },
          {
            number: 'Issue #151',
            date: 'April 20, 2026',
            title: 'The Cult of Productivity',
            blurb:
              'Why optimizing every moment might be making us miserable. A case for intentional inefficiency.',
            imageAlt:
              'serene mountain landscape at golden hour representing the search for meaning and perspective',
          },
        ]

    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
      </svg>
    )

    return (
      <section className={cn('py-16 md:py-24 lg:py-28', props.className)}>
        <Container size="lg">
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag className="flex items-center gap-3 tracking-[0.25em]">
              <span aria-hidden="true" className="size-1.5 bg-primary" />
              The Archive
            </MonoTag>
            <MonoTag className="tracking-[0.25em]">156 Issues</MonoTag>
          </div>

          <SectionHeading
            title={heading}
            subtitle={description}
            align="left"
            titleClassName="font-serif text-3xl font-medium sm:text-4xl"
            subtitleClassName="max-w-2xl text-lg"
            className="mb-12 max-w-3xl gap-4 md:mb-16"
          />

          <ArticleGrid
            cols="1-md-2-3"
            className="lg:gap-8 lg:[&>*:nth-child(3n-1)]:mt-10"
          >
            {items.map((issue) => (
              <StoryCard
                key={`${issue.number}:${issue.title}`}
                variant="bordered"
                className="rounded-none border-border bg-card text-card-foreground shadow-none transition-[transform,box-shadow] duration-200 hover:-translate-y-1 hover:border-foreground/40 hover:shadow-[8px_8px_0_0] hover:shadow-foreground/10"
                asChild
              >
                <NavbarRouteLink href={issue.title}>
                  <StoryCardImageContainer>
                    <StoryCardImage
                      alt={issue.imageAlt}
                      w={600}
                      h={375}
                      className="aspect-[16/10] grayscale transition-[filter,transform] duration-500 group-hover:grayscale-0"
                      variant="bordered"
                    />
                    <StoryCardMeta>
                      {
                        <div className="mb-3 flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground tabular-nums">
                          <span>{issue.number}</span>
                          <span
                            aria-hidden="true"
                            className="h-3 w-px bg-border"
                          />
                          <span>{issue.date}</span>
                        </div>
                      }
                    </StoryCardMeta>
                  </StoryCardImageContainer>
                  <StoryCardBody className="border-t border-border p-6">
                    <StoryCardTitle className="font-serif text-xl font-medium">
                      {issue.title}
                    </StoryCardTitle>
                    <StoryCardExcerpt>{issue.blurb}</StoryCardExcerpt>
                    <StoryCardFooter>
                      {
                        <span className="mt-4 inline-flex items-center font-mono text-[11px] font-medium uppercase tracking-[0.15em] text-foreground transition-colors group-hover:text-muted-foreground">
                          {readLabel}
                          <ArrowRight className="ml-1.5 size-4" />
                        </span>
                      }
                    </StoryCardFooter>
                  </StoryCardBody>
                </NavbarRouteLink>
              </StoryCard>
            ))}
          </ArticleGrid>

          <div className="mt-14 text-center">
            <NavbarRouteLink
              className="inline-flex items-center justify-center rounded-none border border-foreground/70 px-7 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.15em] text-foreground transition-[transform,background-color,color] duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
              href={viewAll}
            >
              {viewAll}
              <ArrowRight className="ml-2 size-4" />
            </NavbarRouteLink>
          </div>
        </Container>
      </section>
    )
  },
})
