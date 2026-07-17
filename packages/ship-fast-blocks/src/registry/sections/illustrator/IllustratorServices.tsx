import { defineCapsule } from '#/capsules/openui.ts'
import type { ReactNode } from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { FeatureGrid } from '#/section-kit/FeatureGrid.tsx'

/**
 * IllustratorServices — a centered-heading "what I create" services grid for an
 * illustrator / visual-artist portfolio. A serif section title and supporting
 * paragraph sit above a responsive 3-up grid of bordered cards; each card has a
 * rounded tinted icon tile (rotating pastel accent tints) that scales on hover,
 * a serif title, and a descriptive paragraph, with the card border tinting on
 * hover. Use to outline an artist's offerings — children's books, editorial
 * illustration, art prints & products, commissions. Renders fully with no props
 * via baked-in defaults.
 */
export const IllustratorServices = defineCapsule({
  name: 'IllustratorServices',
  description:
    "Centered-heading 'what I create' services grid for an illustrator / visual-artist portfolio: a serif section title and supporting paragraph above a responsive 3-up grid of bordered cards, each with a rounded tinted icon tile (rotating pastel accent tints) that scales on hover, a serif title, and a descriptive paragraph, with the card border tinting on hover. Use to outline an artist's offerings — children's books, editorial illustration, art prints & products, commissions.",
  props: z.object({
    /** Serif section heading. */
    heading: z.string().optional(),
    /** Supporting paragraph under the heading. */
    description: z.string().optional(),
    /** Service cards. */
    items: z
      .array(z.object({ title: z.string(), description: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'What I create'
    const description =
      props.description ??
      "From editorial spreads to children's adventures, each project receives the same careful attention to detail and storytelling."
    const items = props.items?.length
      ? props.items
      : [
          {
            title: "Children's Books",
            description:
              'Full-page illustrations and character designs for picture books and middle-grade stories. Published works include "The Star Collector" and "Where Dragons Sleep."',
          },
          {
            title: 'Editorial Illustration',
            description:
              'Magazine covers, article spot illustrations, and digital features for publications. Recent clients include The Atlantic, Kinfolk, and Afar Magazine.',
          },
          {
            title: 'Art Prints & Products',
            description:
              'Limited edition giclée prints, greeting cards, and stationery. All prints are signed, numbered, and produced on archival-quality paper.',
          },
        ]

    const icons: ReactNode[] = [
      // book
      <svg
        key="book"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>,
      // pencil
      <svg
        key="pencil"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>,
      // image
      <svg
        key="image"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>,
    ]

    return (
      <FeatureGrid
        heading={heading}
        subheading={description}
        features={items.map((item, i) => ({
          ...item,
          icon: icons[i % icons.length],
        }))}
        columns={3}
        className={cn(
          'px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-28',
          props.className,
        )}
      />
    )
  },
})
