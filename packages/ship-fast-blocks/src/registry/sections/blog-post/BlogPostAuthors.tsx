import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Image } from '#/lib/img.tsx'
import {
  PersonCard,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
} from '#/section-kit/PersonCard.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * BlogPostAuthors — bespoke "About the author" bio card for the end of an
 * editorial blog article. A narrow reading-column card with a round author
 * avatar, a small eyebrow label, the author name and byline/role, a short bio
 * paragraph, a routable Follow pill button, and small social handle buttons.
 * Uses semantic tokens only. Use as the author bio block at the end of blog
 * posts, journals, magazines, or editorial reading pages.
 */
export const BlogPostAuthors = defineCapsule({
  name: 'BlogPostAuthors',
  description:
    'Bespoke about-the-author bio card for the end of a blog article: a narrow reading-column card with a round author avatar, a small eyebrow label, the author name and byline/role, a short bio paragraph, a routable Follow pill button, and small social handle buttons. Use as the author bio block at the end of blog posts, journals, magazines, or editorial reading pages.',
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
    const go = useNavigate()
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
          <PersonCard variant="outlined" className="rounded-2xl p-8">
            <div className="flex flex-col items-start gap-6 sm:flex-row">
              <Image
                alt={avatarAlt}
                w={160}
                h={160}
                className="size-16 shrink-0 rounded-full object-cover sm:size-20"
              />
              <div className="flex-1">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {eyebrow}
                </p>
                <PersonCardName asChild className="text-lg tracking-tight">
                  <h2>{name}</h2>
                </PersonCardName>
                <PersonCardRole className="mb-4">{role}</PersonCardRole>
                <PersonCardBio className="mb-6 text-base leading-relaxed">
                  {bio}
                </PersonCardBio>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => go(name)}
                    className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    {followLabel}
                  </button>
                  {social.map((item, i) => {
                    const label = typeof item === 'string' ? item : item.label
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => go(label)}
                        className="rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                      >
                        {label}
                      </button>
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
