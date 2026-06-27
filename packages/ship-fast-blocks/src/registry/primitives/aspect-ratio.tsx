import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { AspectRatio as UIAspectRatio } from '#/components/ui/aspect-ratio.tsx'

// Constrains children to a fixed width:height ratio. `ratio` is width/height
// (e.g. 16/9 = 1.778). If no children given, renders a muted placeholder box so
// it is visible standalone.
export const AspectRatio = defineCapsule({
  name: 'AspectRatio',
  description:
    'Box that constrains its children to a fixed width/height ratio (e.g. ratio 1.778 for 16:9).',
  props: z.object({
    children: z.array(z.any()).optional(),
    ratio: z.number().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIAspectRatio ratio={props.ratio ?? 16 / 9} className={props.className}>
      {props.children ? (
        renderNode(props.children)
      ) : (
        <div className="flex size-full items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
          {(props.ratio ?? 16 / 9).toFixed(2)}
        </div>
      )}
    </UIAspectRatio>
  ),
})
