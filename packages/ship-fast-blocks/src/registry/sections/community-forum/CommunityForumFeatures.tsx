import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * CommunityForumFeatures — capabilities grid for a community-platform / discussion-forum
 * landing page. A centered section heading + description above a responsive 3-column grid
 * of rounded card tiles; each tile has a tinted inline SVG icon, a title, and a description.
 * Cards slightly lift on hover. No links — presentation only. Use as the feature section for
 * community platforms, forums, knowledge bases, or SaaS products showcasing organized topics,
 * search, permissions, real-time updates, insights, and rich text editing.
 */
export const CommunityForumFeatures = defineCapsule({
  name: 'CommunityForumFeatures',
  description:
    'Capabilities grid for a community-platform / discussion-forum landing page: a centered section heading and description above a responsive 3-column grid of rounded card tiles, each with a tinted inline SVG icon, a title, and a description; cards slightly lift on hover. No links — presentation only. Use as the feature section for community platforms, forums, knowledge bases, or SaaS products showcasing organized topics, search, permissions, real-time updates, insights, and rich text editing.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Feature cards: title + description. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Everything you need for thriving discussions'
    const description =
      props.description ??
      'Purpose-built features that make community management effortless and conversations delightful.'
    const items = props.items?.length
      ? props.items
      : [
          {
            title: 'Organized Topics',
            description:
              'Create unlimited categories and subcategories. Keep discussions structured so members can find exactly what they need without endless scrolling.',
          },
          {
            title: 'Powerful Search',
            description:
              'Instant full-text search across all posts, comments, and member profiles. Find that specific conversation from months ago in seconds.',
          },
          {
            title: 'Granular Permissions',
            description:
              'Control who can view, post, moderate, and manage. Create private spaces for premium members or open discussions for everyone.',
          },
          {
            title: 'Real-time Updates',
            description:
              'See new posts and replies instantly without refreshing. Stay in the flow of conversation with live notifications and typing indicators.',
          },
          {
            title: 'Community Insights',
            description:
              'Track engagement metrics, popular topics, member growth, and activity patterns. Make data-driven decisions to nurture your community.',
          },
          {
            title: 'Rich Text Editor',
            description:
              'Compose beautiful posts with markdown support, code blocks, embeds, and file attachments. Express ideas clearly with formatting that just works.',
          },
        ]

    return (
      <section className={cn('py-24 lg:py-28', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{description}</p>
          </div>
          <FeatureGrid features={items} columns={3} />
        </div>
      </section>
    )
  },
})
