import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Button } from '#/components/ui/button.tsx'
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '#/components/ui/tooltip.tsx'

// Overlay: small label shown on hover/focus of a trigger. Rendered `defaultOpen`
// (inside a Provider) so the tooltip bubble is statically visible.
export const Tooltip = defineComponent({
  name: 'Tooltip',
  description:
    'Small floating label attached to a trigger. `content` is the tooltip text; `triggerLabel` labels the trigger button. Open by default for preview.',
  props: z.object({
    content: z.string(),
    triggerLabel: z.string().optional(),
    side: z.enum(['top', 'right', 'bottom', 'left']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <TooltipProvider>
      <UITooltip defaultOpen>
        <TooltipTrigger asChild>
          <Button variant="outline">{props.triggerLabel ?? 'Hover'}</Button>
        </TooltipTrigger>
        <TooltipContent side={props.side} className={props.className}>
          {props.content}
        </TooltipContent>
      </UITooltip>
    </TooltipProvider>
  ),
})
