import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { Spinner as UISpinner } from '#/components/ui/spinner.tsx'

// Leaf primitive: animated loading spinner. Size/color via className
// (e.g. "size-8 text-primary").
export const Spinner = defineCapsule({
  name: 'Spinner',
  description:
    "Animated loading spinner. Size/color with className, e.g. 'size-8 text-primary'.",
  props: z.object({
    className: z.string().optional(),
  }),
  component: ({ props }) => <UISpinner className={props.className} />,
})
