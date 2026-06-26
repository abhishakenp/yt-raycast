import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  Tabs as UITabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '#/components/ui/tabs.tsx'

// Compound: flatten Tabs/List/Trigger/Content into items:[{value,label,content}].
// First tab active by default so a panel is visible statically.
export const Tabs = defineComponent({
  name: 'Tabs',
  description:
    "Tabbed panels. items:[{value,label,content?}]. First tab active by default. variant 'line' for underlined tabs.",
  props: z.object({
    items: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        content: z.array(z.any()).optional(),
      }),
    ),
    variant: z.enum(['default', 'line']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => {
    const items = props.items ?? []
    return (
      <UITabs defaultValue={items[0]?.value} className={props.className}>
        <TabsList variant={props.variant}>
          {items.map((it) => (
            <TabsTrigger key={it.value} value={it.value}>
              {it.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {items.map((it) => (
          <TabsContent key={it.value} value={it.value}>
            {renderNode(it.content)}
          </TabsContent>
        ))}
      </UITabs>
    )
  },
})
