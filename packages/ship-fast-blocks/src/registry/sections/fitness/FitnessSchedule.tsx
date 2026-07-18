import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  DataTable,
  DataHeader,
  DataBody,
  DataRow,
  DataTableCell,
} from '#/section-kit/DataTable.tsx'

/**
 * FitnessSchedule — scrollable weekly class-schedule table for a gym or fitness
 * studio, on a muted card-surface band. A centered heading + lead paragraph above a
 * horizontally-scrollable table with a Time column and one column per day, row-hover
 * highlight, dashed empty slots dimmed, and a centered color-dot legend underneath.
 * Renders fully on zero args. Use to publish a weekly timetable on gyms, fitness
 * studios, yoga / pilates / boxing / spin studios, or class-booking sites.
 */
import { Container } from '#/section-kit/Container.tsx'
export const FitnessSchedule = defineCapsule({
  name: 'FitnessSchedule',
  description:
    'Scrollable weekly class-schedule table for a gym or fitness studio on a muted card-surface band: a centered heading and lead paragraph above a horizontally-scrollable table with a Time column and one column per day, row-hover highlight, dashed empty slots dimmed, and a centered color-dot legend underneath. Use to publish a weekly timetable / class calendar on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios and class-booking sites.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    days: z.array(z.string()).optional(),
    rows: z
      .array(
        z.object({
          time: z.string(),
          slots: z.array(z.string()).optional(),
        }),
      )
      .optional(),
    legend: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const scheduleHeading = props.heading ?? 'Weekly Schedule'
    const scheduleDesc =
      props.description ??
      'Book classes up to 7 days in advance through our app. Walk-ins welcome when space permits.'
    const scheduleDays = props.days?.length
      ? props.days
      : [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ]
    const scheduleRows = props.rows?.length
      ? props.rows
      : [
          {
            time: '6:00 AM',
            slots: ['HIIT', 'Cycle', 'Strength', 'HIIT', 'Cycle', '—', '—'],
          },
          {
            time: '7:30 AM',
            slots: [
              'Yoga Flow',
              'Strength',
              'Power Yoga',
              'Strength',
              'Yoga Flow',
              'Strength',
              'Yoga Flow',
            ],
          },
          {
            time: '9:00 AM',
            slots: [
              'Pilates',
              'Boxing',
              'Pilates',
              'Boxing',
              'Pilates',
              'HIIT',
              'Cycle',
            ],
          },
          {
            time: '12:00 PM',
            slots: [
              'Lunch HIIT',
              'Yoga',
              'Lunch HIIT',
              'Yoga',
              'Lunch HIIT',
              'Open Gym',
              'Open Gym',
            ],
          },
          {
            time: '5:30 PM',
            slots: ['Strength', 'Cycle', 'HIIT', 'Cycle', 'Strength', '—', '—'],
          },
          {
            time: '6:45 PM',
            slots: [
              'Boxing',
              'Power Yoga',
              'Boxing',
              'Power Yoga',
              '—',
              '—',
              '—',
            ],
          },
          {
            time: '8:00 PM',
            slots: [
              'Restorative Yoga',
              'Open Gym',
              'Restorative Yoga',
              'Open Gym',
              '—',
              '—',
              '—',
            ],
          },
        ]
    const scheduleLegend = props.legend?.length
      ? props.legend
      : ['HIIT', 'Strength', 'Cycle', 'Yoga', 'Pilates', 'Boxing']
    const legendDots = [
      'bg-foreground',
      'bg-foreground/70',
      'bg-foreground/55',
      'bg-muted-foreground',
      'bg-muted-foreground/60',
      'bg-foreground/85',
    ]
    return (
      <section className={cn('bg-card py-20 lg:py-28', props.className)}>
        <Container>
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="mb-4 text-3xl font-semibold text-foreground md:text-4xl">
              {scheduleHeading}
            </h2>
            <p className="text-muted-foreground">{scheduleDesc}</p>
          </div>

          <div className="overflow-x-auto">
            <DataTable className="w-full min-w-[800px] text-sm">
              <table className="w-full text-sm">
                <DataHeader asChild>
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-4 py-4 text-left font-medium text-muted-foreground">
                        Time
                      </th>
                      {scheduleDays.map((day) => (
                        <th
                          key={day}
                          className="px-4 py-4 text-left font-medium text-foreground"
                        >
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                </DataHeader>
                <DataBody asChild>
                  <tbody>
                    {scheduleRows.map((row) => (
                      <DataRow asChild key={row.time}>
                        <tr className="hover:bg-muted">
                          <DataTableCell className="px-4 py-4 font-medium text-foreground">
                            {row.time}
                          </DataTableCell>
                          {(row.slots ?? []).map((slot, i) => (
                            <DataTableCell
                              key={`${row.time}-${i}`}
                              className={cn(
                                'px-4 py-4',
                                slot === '—'
                                  ? 'text-muted-foreground/60'
                                  : 'text-muted-foreground',
                              )}
                            >
                              {slot}
                            </DataTableCell>
                          ))}
                        </tr>
                      </DataRow>
                    ))}
                  </tbody>
                </DataBody>
              </table>
            </DataTable>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground">
            {scheduleLegend.map((label, i) => (
              <span key={label} className="flex items-center gap-2">
                <span
                  className={cn(
                    'size-3 rounded-full',
                    legendDots[i % legendDots.length],
                  )}
                />{' '}
                {label}
              </span>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
