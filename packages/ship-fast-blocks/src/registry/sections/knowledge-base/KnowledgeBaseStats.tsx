import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {} from '#/section-kit/index.ts'

import { Container } from '#/section-kit/Container.tsx'
import { StatGrid } from '#/section-kit/StatGrid.tsx'

/**
 * KnowledgeBaseStats — compact stats band for a help center on a raised card
 * surface with top/bottom borders. A centered 2-up (mobile) / 4-up (desktop)
 * grid of big numeric values over small muted labels — e.g. help articles,
 * video tutorials, monthly readers and self-service rate. Calm, light,
 * editorial; purely presentational (no links). Use between content sections of
 * a knowledge base, support portal or docs site to signal depth and trust.
 * Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseStats = defineCapsule({
  name: 'KnowledgeBaseStats',
  description:
    'Compact stats band for a help center on a raised card surface with top/bottom borders: a centered 2-up (mobile) / 4-up (desktop) grid of big numeric values over small muted labels — e.g. help articles, video tutorials, monthly readers and self-service rate. Calm, light, editorial and purely presentational. Use between content sections of a knowledge base, support portal or docs site to signal depth and trust.',
  props: z.object({
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '234', label: 'Help Articles' },
          { value: '48', label: 'Video Tutorials' },
          { value: '2.4M', label: 'Monthly Readers' },
          { value: '94%', label: 'Self-Service Rate' },
        ]

    return (
      <section
        className={cn(
          'border-y border-border bg-card py-12 sm:py-16',
          props.className,
        )}
        aria-label="Help center statistics"
      >
        <Container>
          <StatGrid
            stats={items}
            columns={4}
            gap="wide"
            align="center"
            weight="semibold"
            size="default"
          />
        </Container>
      </section>
    )
  },
})
