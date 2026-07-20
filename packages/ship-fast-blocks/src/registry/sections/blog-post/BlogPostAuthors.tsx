import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * BlogPostAuthors — newsprint byline-ledger "About the author" card for the
 * end of an editorial blog article. A sharp hairline card in the reading
 * column, opened by a mono eyebrow rail (label — hairline rule — "№ 01"
 * index): inside, a square grayscale author portrait framed over an offset
 * hairline outline sits beside the serif bold author name, a mono role
 * stamp, a serif bio paragraph, and an action row — a square solid-ink Follow
 * button with press feedback plus square hairline social chips that invert on
 * hover. Uses semantic tokens only. Use as the author bio block at the end of
 * blog posts, journals, magazines, or editorial reading pages.
 */
export const BlogPostAuthors = defineCapsule({
  name: 'BlogPostAuthors',
  description:
    "Newsprint byline-ledger about-the-author card for the end of a blog article: a sharp hairline card in the reading column opened by a mono eyebrow rail (label — hairline rule — '№ 01' index), with a square grayscale author portrait framed over an offset hairline outline beside the serif bold author name, a mono role stamp, a serif bio paragraph, a square solid-ink Follow button with press feedback, and square hairline social chips that invert on hover. Use as the author bio block at the end of blog posts, journals, magazines, or editorial reading pages.",
  props: z.object({
    /** Small eyebrow label above the author name. */
    eyebrow: z.string().optional(),
    /** Author name. */
    name: z.string().optional(),
    /** Author byline / role line. */
    role: z.string().optional(),
    /** Short bio paragraph. */
    bio: z.string().optional(),
    /** Alt text for the author avatar image. */
    avatarAlt: z.string().optional(),
    /** Follow button label. */
    followLabel: z.string().optional(),
    /** Social handles — either strings or { label, href? } objects. */
    social: z
      .array(
        z.union([
          z.string(),
          z.object({
            label: z.string(),
            href: z.string().optional(),
          }),
        ]),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'About the author'
    const name = props.name ?? 'Jordan Avery'
    const role = props.role ?? 'Staff Writer · Engineering'
    const bio =
      props.bio ??
      'Jordan writes about the craft of building durable software and the teams behind it. Over a decade shipping systems at startups and large platforms, with a soft spot for clear writing and quiet codebases.'
    const avatarAlt =
      props.avatarAlt ??
      'Professional headshot of Jordan Avery, a software engineer with a warm, thoughtful expression'
    const followLabel = props.followLabel ?? 'Follow'
    const social = props.social ?? ['@jordanavery', 'Newsletter']

    return (
      <section className={cn('bg-background py-16 lg:py-24', props.className)}>
        <Container size="sm" className="px-6 lg:px-6">
          <PersonCard
            variant="outlined"
            className="rounded-none border-foreground/25 bg-transparent p-6 sm:p-8"
          >
            {/* Mono eyebrow rail: label — hairline — ledger index. */}
            <div className="mb-6 flex items-center gap-4">
              <MonoTag className="shrink-0 text-foreground">{eyebrow}</MonoTag>
              <span
                aria-hidden="true"
                className="h-px flex-1 bg-foreground/20"
              />
              <MonoTag
                aria-hidden="true"
                className="shrink-0 text-muted-foreground/60"
              >
                № 01
              </MonoTag>
            </div>

            <div className="flex flex-col items-start gap-6 sm:flex-row sm:gap-8">
              <div className="relative shrink-0">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 translate-x-2 translate-y-2 border border-border"
                />
                <Image
                  alt={avatarAlt}
                  w={160}
                  h={160}
                  className="relative size-20 rounded-none border border-foreground/25 object-cover grayscale sm:size-24"
                />
              </div>
              <div className="flex-1">
                <PersonCardName
                  asChild
                  className="font-serif text-2xl font-bold tracking-tight"
                >
                  <h2>{name}</h2>
                </PersonCardName>
                <PersonCardRole className="mb-4 mt-1 font-mono text-[11px] uppercase tracking-[0.16em]">
                  {role}
                </PersonCardRole>
                <PersonCardBio className="mb-6 font-serif text-base leading-relaxed">
                  {bio}
                </PersonCardBio>
                <div className="flex flex-wrap items-center gap-3">
                  <NavbarRouteLink
                    className="rounded-none bg-foreground px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-background transition-colors hover:bg-foreground/85 active:translate-y-px"
                    href={name}
                  >
                    {followLabel}
                  </NavbarRouteLink>
                  {social.map((item, i) => {
                    const label = typeof item === 'string' ? item : item.label
                    return (
                      <NavbarRouteLink
                        key={i}
                        className="rounded-none border border-foreground/25 px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground transition-colors hover:bg-foreground hover:text-background active:translate-y-px"
                        href={label}
                      >
                        {label}
                      </NavbarRouteLink>
                    )
                  })}
                </div>
              </div>
            </div>
          </PersonCard>
        </Container>
      </section>
    )
  },
})
