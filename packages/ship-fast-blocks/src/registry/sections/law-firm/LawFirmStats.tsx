import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { ResponsiveGrid } from '#/section-kit/index.ts'

/**
 * LawFirmStats — a dark full-width stats band on the primary surface. A
 * responsive 2-up / 4-up row of credential metrics, each a large serif value
 * above a tracked-uppercase muted label. High-contrast, restrained,
 * authoritative editorial aesthetic. Use between content sections on law-firm,
 * attorney, consulting or professional-services pages to surface firm
 * credentials (attorneys, years in practice, transactions closed, success rate).
 * Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
export const LawFirmStats = defineCapsule({
  name: 'LawFirmStats',
  description:
    'Dark full-width stats band on the primary surface: a responsive 2-up / 4-up row of credential metrics, each a large serif value above a tracked-uppercase muted label. High-contrast, restrained, authoritative editorial aesthetic. Use between content sections on law-firm, attorney, consulting, accounting or professional-services pages to surface firm credentials such as number of attorneys, years in practice, transactions closed and success rate.',
  props: z.object({
    items: z
      .array(
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          {
            value: '34',
            label: 'Attorneys',
          },
          {
            value: '37',
            label: 'Years in Practice',
          },
          {
            value: '$2.4B',
            label: 'Transactions Closed',
          },
          {
            value: '94%',
            label: 'Success Rate',
          },
        ]
    return (
      <section
        className={cn(
          'bg-primary py-20 text-primary-foreground',
          props.className,
        )}
      >
        <Container>
          <ResponsiveGrid
            cols="2-lg-4"
            gap="lg"
            className="text-center lg:gap-12"
          >
            {items.map((s) => (
              <div key={s.label}>
                <p className="mb-2 font-serif text-5xl lg:text-6xl">
                  {s.value}
                </p>
                <p className="text-sm uppercase tracking-widest text-primary-foreground/70">
                  {s.label}
                </p>
              </div>
            ))}
          </ResponsiveGrid>
        </Container>
      </section>
    )
  },
})
