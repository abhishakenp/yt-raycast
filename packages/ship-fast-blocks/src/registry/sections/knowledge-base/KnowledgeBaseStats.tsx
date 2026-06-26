import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * KnowledgeBaseStats — compact stats band for a help center on a raised card
 * surface with top/bottom borders. A centered 2-up (mobile) / 4-up (desktop)
 * grid of big numeric values over small muted labels — e.g. help articles,
 * video tutorials, monthly readers and self-service rate. Calm, light,
 * editorial; purely presentational (no links). Use between content sections of
 * a knowledge base, support portal or docs site to signal depth and trust.
 * Renders fully with no props via baked-in defaults.
 */
export const KnowledgeBaseStats = defineComponent({
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
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {items.map((s) => (
              <div key={s.label}>
                <div className="mb-1 text-3xl font-semibold text-foreground sm:text-4xl">
                  {s.value}
                </div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
