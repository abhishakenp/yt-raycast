import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  Drawer as UIDrawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '#/components/ui/drawer.tsx'
import { Button } from '#/components/ui/button.tsx'

// Overlay (vaul): flatten Drawer parts into one node. direction mirrors the
// real prop. Rendered open by default so the panel content is visible.
export const Drawer = defineComponent({
  name: 'Drawer',
  description:
    'Drawer panel that slides from an edge (vaul). direction top|right|bottom|left. Has title, description, body (children) and footer. Open by default in preview.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    children: z.array(z.any()).optional(),
    footer: z.array(z.any()).optional(),
    direction: z.enum(['top', 'right', 'bottom', 'left']).optional(),
    triggerLabel: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIDrawer defaultOpen direction={props.direction ?? 'bottom'}>
      <DrawerTrigger asChild>
        <Button variant="outline">{props.triggerLabel ?? 'Open'}</Button>
      </DrawerTrigger>
      <DrawerContent className={props.className}>
        <DrawerHeader>
          <DrawerTitle>{props.title}</DrawerTitle>
          {props.description && (
            <DrawerDescription>{props.description}</DrawerDescription>
          )}
        </DrawerHeader>
        {props.children && (
          <div className="px-4">{renderNode(props.children)}</div>
        )}
        {props.footer && (
          <DrawerFooter>{renderNode(props.footer)}</DrawerFooter>
        )}
      </DrawerContent>
    </UIDrawer>
  ),
})
