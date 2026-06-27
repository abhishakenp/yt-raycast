import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  HoverCard as UIHoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '#/components/ui/hover-card.tsx'

// Overlay: trigger + content shown on hover. Rendered `defaultOpen` so the
// card body is statically visible. `children` render inside the card.
export const HoverCard = defineCapsule({
  name: 'HoverCard',
  description:
    'Card that appears when hovering a trigger. `triggerLabel` is the hover target; children fill the card. Open by default for preview.',
  props: z.object({
    triggerLabel: z.string().optional(),
    children: z.array(z.any()).optional(),
    align: z.enum(['start', 'center', 'end']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIHoverCard defaultOpen>
      <HoverCardTrigger className="cursor-pointer font-medium underline underline-offset-4">
        {props.triggerLabel ?? 'Hover me'}
      </HoverCardTrigger>
      <HoverCardContent align={props.align} className={props.className}>
        {props.children ? renderNode(props.children) : 'Hover card content.'}
      </HoverCardContent>
    </UIHoverCard>
  ),
})
