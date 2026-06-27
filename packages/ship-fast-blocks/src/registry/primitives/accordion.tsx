import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Accordion as UIAccordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/ui/accordion.tsx'

// Compound: flatten Accordion/Item/Trigger/Content into items:[{title, content}].
// Renders statically open (defaultValue = first item) so a panel is visible.
export const Accordion = defineCapsule({
  name: 'Accordion',
  description:
    'Vertically stacked collapsible sections. items:[{title,content?}]. First item open by default.',
  props: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        content: z.array(z.any()).optional(),
      }),
    ),
    type: z.enum(['single', 'multiple']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const items = props.items ?? []
    const type = props.type ?? 'single'
    const first = items.length > 0 ? 'item-0' : undefined
    return type === 'multiple' ? (
      <UIAccordion
        type="multiple"
        defaultValue={first ? [first] : []}
        className={props.className}
      >
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{it.title}</AccordionTrigger>
            <AccordionContent>{renderNode(it.content)}</AccordionContent>
          </AccordionItem>
        ))}
      </UIAccordion>
    ) : (
      <UIAccordion
        type="single"
        collapsible
        defaultValue={first}
        className={props.className}
      >
        {items.map((it, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger>{it.title}</AccordionTrigger>
            <AccordionContent>{renderNode(it.content)}</AccordionContent>
          </AccordionItem>
        ))}
      </UIAccordion>
    )
  },
})
