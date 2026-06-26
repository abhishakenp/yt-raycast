import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Calendar as UICalendar } from '#/components/ui/calendar.tsx'

// Data primitive: wraps react-day-picker. Renders statically with a fixed
// default month + a preselected day so it shows standalone (no state wired up).
// `mode` mirrors DayPicker's selection modes; `captionLayout` and `buttonVariant`
// mirror the source props. We branch on mode to satisfy DayPicker's union types.
const defaultMonth = new Date(2026, 4, 1)
const selectedDay = new Date(2026, 4, 15)
const rangeStart = new Date(2026, 4, 9)
const rangeEnd = new Date(2026, 4, 17)

export const Calendar = defineComponent({
  name: 'Calendar',
  description:
    "Month-grid date picker (react-day-picker). Renders a static month with a sample selection. mode 'single' | 'multiple' | 'range'.",
  props: z.object({
    mode: z.enum(['single', 'multiple', 'range']).optional(),
    captionLayout: z
      .enum(['label', 'dropdown', 'dropdown-months', 'dropdown-years'])
      .optional(),
    buttonVariant: z
      .enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'])
      .optional(),
    numberOfMonths: z.number().optional(),
    showOutsideDays: z.boolean().optional(),
    showWeekNumber: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const shared = {
      defaultMonth,
      captionLayout: props.captionLayout,
      buttonVariant: props.buttonVariant,
      numberOfMonths: props.numberOfMonths,
      showOutsideDays: props.showOutsideDays,
      showWeekNumber: props.showWeekNumber,
      className: props.className,
    }
    if (props.mode === 'range') {
      return (
        <UICalendar
          mode="range"
          selected={{ from: rangeStart, to: rangeEnd }}
          {...shared}
        />
      )
    }
    if (props.mode === 'multiple') {
      return (
        <UICalendar
          mode="multiple"
          selected={[selectedDay, rangeEnd]}
          {...shared}
        />
      )
    }
    return <UICalendar mode="single" selected={selectedDay} {...shared} />
  },
})
