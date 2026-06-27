import { defineCapsule } from '#/capsules/openui.ts'
import * as React from 'react'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '#/components/ui/resizable.tsx'

// Compound primitive: flatten ResizablePanelGroup/ResizablePanel/ResizableHandle
// into a single `panels` array, with a handle inserted between each. Each panel
// holds child content; defaultSize is a flex-basis percentage. orientation
// mirrors react-resizable-panels' Group orientation prop.
export const Resizable = defineCapsule({
  name: 'Resizable',
  description:
    'Resizable split panels with draggable handles between them. Each panel in `panels` holds child content.',
  props: z.object({
    panels: z
      .array(
        z.object({
          content: z.array(z.any()).optional(),
          defaultSize: z.number().optional(),
        }),
      )
      .optional(),
    orientation: z.enum(['horizontal', 'vertical']).optional(),
    withHandle: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const panels =
      props.panels?.length != null && props.panels.length > 0
        ? props.panels
        : [{ content: undefined }, { content: undefined }]
    return (
      <ResizablePanelGroup
        orientation={props.orientation ?? 'horizontal'}
        className={cn('min-h-48 rounded-lg border', props.className)}
      >
        {panels.map((panel, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ResizableHandle withHandle={props.withHandle} />}
            <ResizablePanel defaultSize={panel.defaultSize}>
              <div className="flex h-full items-center justify-center p-6">
                {panel.content ? (
                  renderNode(panel.content)
                ) : (
                  <span className="font-semibold">Panel {i + 1}</span>
                )}
              </div>
            </ResizablePanel>
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    )
  },
})
