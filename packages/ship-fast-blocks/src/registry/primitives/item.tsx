import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  Item as UIItem,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from '#/components/ui/item.tsx'

// Compound primitive: a list row with optional leading media, title/description,
// and trailing actions. variant/size/media-variant enums mirror cva exactly.
export const Item = defineComponent({
  name: 'Item',
  description:
    'List row with title, optional description, optional leading media slot and trailing actions slot. variant default|outline|muted, size default|sm.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    media: z.array(z.any()).optional(),
    mediaVariant: z.enum(['default', 'icon', 'image']).optional(),
    actions: z.array(z.any()).optional(),
    variant: z.enum(['default', 'outline', 'muted']).optional(),
    size: z.enum(['default', 'sm']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIItem
      variant={props.variant}
      size={props.size}
      className={props.className}
    >
      {props.media && (
        <ItemMedia variant={props.mediaVariant}>
          {renderNode(props.media)}
        </ItemMedia>
      )}
      <ItemContent>
        <ItemTitle>{props.title}</ItemTitle>
        {props.description && (
          <ItemDescription>{props.description}</ItemDescription>
        )}
      </ItemContent>
      {props.actions && <ItemActions>{renderNode(props.actions)}</ItemActions>}
    </UIItem>
  ),
})

// Compound primitive: a vertical list of Items (children) with optional separators.
export const ItemList = defineComponent({
  name: 'ItemList',
  description:
    'Vertical list grouping several Item rows (children). Set separated for dividers between rows.',
  props: z.object({
    children: z.array(z.any()).optional(),
    separated: z.boolean().optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <ItemGroup className={props.className}>
      {props.separated && <ItemSeparator />}
      {renderNode(props.children)}
    </ItemGroup>
  ),
})
