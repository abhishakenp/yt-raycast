import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Sheet as UISheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { Button } from '#/components/ui/button.tsx'

// Overlay: flatten Sheet parts into one node. side mirrors the real prop.
// Rendered open by default so the panel content is visible.
export const Sheet = defineCapsule({
  name: 'Sheet',
  description:
    'Side panel that slides in from an edge. side top|right|bottom|left. Has a title, description, body (children) and footer. Open by default in preview.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    children: z.array(z.any()).optional(),
    footer: z.array(z.any()).optional(),
    side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
    triggerLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UISheet defaultOpen>
      <SheetTrigger asChild>
        <Button variant="outline">{props.triggerLabel ?? 'Open'}</Button>
      </SheetTrigger>
      <SheetContent side={props.side} className={props.className}>
        <SheetHeader>
          <SheetTitle>{props.title}</SheetTitle>
          {props.description && (
            <SheetDescription>{props.description}</SheetDescription>
          )}
        </SheetHeader>
        {props.children && (
          <div className="px-4">{renderNode(props.children)}</div>
        )}
        {props.footer && <SheetFooter>{renderNode(props.footer)}</SheetFooter>}
      </SheetContent>
    </UISheet>
  ),
})
