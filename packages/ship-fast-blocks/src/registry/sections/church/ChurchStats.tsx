import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'

/**
 * ChurchStats — a bordered congregation stats band for a church or faith-community
 * site. A simple top-and-bottom bordered row with a responsive 4-column grid (2-col
 * on mobile) showing large value + label pairs. Clean, quick-scan, and credibility-building.
 * Use for attendance, groups, volunteers, years serving, or any metric grid on
 * churches, ministries, nonprofits, or community organization pages. Renders fully
 * with no props via baked-in defaults.
 */
export const ChurchStats = defineComponent({
  name: 'ChurchStats',
  description:
    'Bordered congregation stats band for a church or faith-community site: a simple top-and-bottom bordered row with a responsive 4-column grid (2-col on mobile) showing large value + label pairs. Clean, quick-scan, and credibility-building. Use for attendance, groups, volunteers, years serving, or any metric grid on churches, ministries, nonprofits, or community organization pages.',
  props: z.object({
    /** Stat pairs; each has a large value string and a label string. */
    items: z
      .array(z.object({ value: z.string(), label: z.string() }))
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const items = props.items?.length
      ? props.items
      : [
          { value: '2,400+', label: 'Weekly Attendance' },
          { value: '68', label: 'Small Groups' },
          { value: '450+', label: 'Active Volunteers' },
          { value: '37', label: 'Years Serving Portland' },
        ]

    return (
      <section className={cn('border-y border-border py-20', props.className)}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4 lg:gap-12">
            {items.map((s) => (
              <div key={s.label} className="text-center">
                <p className="mb-2 text-4xl font-medium text-foreground lg:text-5xl">
                  {s.value}
                </p>
                <p className="text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
