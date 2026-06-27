import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { ScrollArea as UIScrollArea } from '#/components/ui/scroll-area.tsx'

// Leaf-ish primitive: a fixed-size scrollable viewport around `children`.
// `height` constrains the box so its content scrolls; defaults keep it visible
// standalone. Orientation mirrors the ScrollBar prop in the source.
const heightMap = {
  sm: 'h-32',
  md: 'h-48',
  lg: 'h-72',
  xl: 'h-96',
} as const

export const ScrollArea = defineCapsule({
  name: 'ScrollArea',
  description:
    'Fixed-height scrollable container with a styled scrollbar. Put overflowing content in children.',
  props: z.object({
    children: z.array(z.any()).optional(),
    height: z.enum(['sm', 'md', 'lg', 'xl']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIScrollArea
      className={cn(
        heightMap[props.height ?? 'md'],
        'w-full rounded-md border p-4',
        props.className,
      )}
    >
      {props.children ? (
        renderNode(props.children)
      ) : (
        <div className="space-y-2 text-sm">
          {Array.from({ length: 12 }, (_, i) => (
            <p key={i}>Scrollable item {i + 1}</p>
          ))}
        </div>
      )}
    </UIScrollArea>
  ),
})
