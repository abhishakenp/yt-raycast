import { z } from "zod/v4"
import { defineComponent } from "@openuidev/react-lang"
import { cn } from "#/lib/utils.ts"

/**
 * YogaStudioSchedule — weekly class-schedule grid for a yoga-studio page. A
 * clean background band with a centered heading + intro above a responsive set
 * of day columns, each listing its classes with name, time, and teacher. Use to
 * show a studio's weekly timetable so visitors can find a class that fits their
 * routine. Renders fully with no props via baked-in defaults.
 */
export const YogaStudioSchedule = defineComponent({
  name: "YogaStudioSchedule",
  description:
    "Weekly class-schedule grid for a yoga-studio page: a clean band with a centered heading + intro above a responsive set of day columns, each listing its classes with name, time, and teacher. Use to show a studio's weekly timetable so visitors can find a class that fits their routine.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting intro under the heading. */
    subheading: z.string().optional(),
    /** Day columns, each with an ordered list of classes. */
    days: z
      .array(
        z.object({
          day: z.string(),
          classes: z.array(
            z.object({
              name: z.string(),
              time: z.string(),
              teacher: z.string(),
            }),
          ),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? "This week at the studio"
    const subheading =
      props.subheading ??
      "Drop in to any class on the schedule — no experience required."
    const days = props.days?.length
      ? props.days
      : [
          {
            day: "Monday",
            classes: [
              { name: "Slow Flow", time: "7:00 AM", teacher: "Ava" },
              { name: "Vinyasa Flow", time: "12:00 PM", teacher: "Noah" },
              { name: "Restorative", time: "6:30 PM", teacher: "Mia" },
            ],
          },
          {
            day: "Tuesday",
            classes: [
              { name: "Hot Power", time: "6:30 AM", teacher: "Leo" },
              { name: "Yin & Stretch", time: "5:30 PM", teacher: "Ava" },
            ],
          },
          {
            day: "Wednesday",
            classes: [
              { name: "Vinyasa Flow", time: "8:00 AM", teacher: "Noah" },
              { name: "Meditation", time: "12:15 PM", teacher: "Mia" },
              { name: "Slow Flow", time: "6:00 PM", teacher: "Ava" },
            ],
          },
          {
            day: "Thursday",
            classes: [
              { name: "Hot Power", time: "6:30 AM", teacher: "Leo" },
              { name: "Restorative", time: "7:00 PM", teacher: "Mia" },
            ],
          },
          {
            day: "Friday",
            classes: [
              { name: "Vinyasa Flow", time: "7:30 AM", teacher: "Noah" },
              { name: "Yin & Stretch", time: "5:30 PM", teacher: "Ava" },
            ],
          },
          {
            day: "Saturday",
            classes: [
              { name: "Community Flow", time: "9:00 AM", teacher: "Leo" },
              { name: "Slow Flow", time: "11:00 AM", teacher: "Mia" },
            ],
          },
        ]

    return (
      <section
        className={cn("bg-background py-20 lg:py-28", props.className)}
        aria-labelledby="yoga-schedule-heading"
      >
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <h2
              id="yoga-schedule-heading"
              className="mb-4 text-3xl font-bold text-foreground sm:text-4xl"
            >
              {heading}
            </h2>
            <p className="text-lg text-muted-foreground">{subheading}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {days.map((day) => (
              <div
                key={day.day}
                className="rounded-2xl border border-border bg-card p-5 text-card-foreground"
              >
                <h3 className="border-b border-border pb-3 text-sm font-semibold uppercase tracking-wide text-foreground">
                  {day.day}
                </h3>
                <ul className="mt-4 space-y-4">
                  {day.classes.map((cls) => (
                    <li
                      key={`${cls.name}-${cls.time}`}
                      className="flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {cls.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          with {cls.teacher}
                        </div>
                      </div>
                      <span className="whitespace-nowrap text-xs font-medium text-accent">
                        {cls.time}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  },
})
