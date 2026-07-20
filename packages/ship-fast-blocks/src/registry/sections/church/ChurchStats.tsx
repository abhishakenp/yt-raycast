import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Watermark } from '#/section-kit/Decor.tsx'
import {
  StatGrid,
  StatItem,
  StatValue,
  StatLabel,
} from '#/section-kit/StatGrid.tsx'
import { Container } from '#/section-kit/Container.tsx'

/**
 * ChurchStats — serene editorial congregation stats ledger for a church or
 * faith-community site. A hairline top-and-bottom bordered band with a giant
 * ghost serif "✦" watermark; the responsive 4-column grid (2-col on mobile)
 * renders each metric as a quiet ledger cell — hairline left rule, faint mono
 * index numeral ("01"–"04"), large serif value, and a tracked mono micro-label.
 * Left-aligned cells give the band gentle asymmetry instead of centered
 * uniformity. Use for attendance, groups, volunteers, years serving, or any
 * metric grid on churches, ministries, nonprofits, or community organization
 * pages. Renders fully with no props via baked-in defaults.
 */
export const ChurchStats = defineCapsule({
  name: 'ChurchStats',
  description:
    'Serene editorial congregation stats ledger for a church or faith-community site: a hairline top-and-bottom bordered band with a giant ghost serif star watermark and a responsive 4-column grid (2-col on mobile) of quiet ledger cells — hairline left rule, faint mono index numeral, large serif value, tracked mono micro-label — left-aligned for gentle asymmetry. Use for attendance, groups, volunteers, years serving, or any metric grid on churches, ministries, nonprofits, or community organization pages.',
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
      <section
        className={cn(
          'relative overflow-hidden border-y border-border py-16 sm:py-20',
          props.className,
        )}
      >
        <Watermark className="-right-6 -top-14 font-serif text-[12rem] font-medium text-foreground/[0.04] sm:text-[16rem]">
          ✦
        </Watermark>
        <Container size="xl" className="relative px-6">
          <StatGrid columns={4} className="gap-x-0 gap-y-10 sm:gap-y-12">
            {items.map((s, i) => {
              const __iv__ = s as { value: string; label: string }
              return (
                <StatItem
                  key={__iv__.label}
                  align="left"
                  className="gap-1.5 border-l border-border pl-5 sm:pl-7"
                >
                  <span
                    aria-hidden="true"
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground/50"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <StatValue
                    fontFamily="serif"
                    weight="medium"
                    size="xl"
                    className="tracking-tight"
                  >
                    {__iv__.value}
                  </StatValue>
                  <StatLabel className="font-mono text-[11px] uppercase tracking-[0.18em]">
                    {__iv__.label}
                  </StatLabel>
                </StatItem>
              )
            })}
          </StatGrid>
        </Container>
      </section>
    )
  },
})
