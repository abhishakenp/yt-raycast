import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Separator as UISeparator } from '#/components/ui/separator.tsx'

// Leaf primitive: a thin divider line. orientation mirrors radix/shadcn.
export const Separator = defineComponent({
  name: 'Separator',
  description:
    "Thin divider line. orientation 'horizontal' (default) or 'vertical'.",
  props: z.object({
    orientation: z.enum(['horizontal', 'vertical']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UISeparator orientation={props.orientation} className={props.className} />
  ),
})
