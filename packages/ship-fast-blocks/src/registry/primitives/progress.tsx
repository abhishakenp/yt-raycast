import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Progress as UIProgress } from '#/components/ui/progress.tsx'

// Leaf primitive: horizontal progress bar. `value` is 0..100; defaults to a
// visible value so it renders statically.
export const Progress = defineComponent({
  name: 'Progress',
  description: 'Horizontal progress bar. `value` 0-100.',
  props: z.object({
    value: z.number().min(0).max(100).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIProgress value={props.value ?? 60} className={props.className} />
  ),
})
