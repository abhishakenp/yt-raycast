import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import {
  Empty as UIEmpty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from '#/components/ui/empty.tsx'

// Flatten Empty/EmptyHeader/EmptyMedia/EmptyTitle/EmptyDescription/EmptyContent
// into one node. `title` + `description` form the header; `media` slot holds an
// icon/illustration (mediaVariant mirrors shadcn: default|icon); `children` is
// the content area (e.g. a Button to act on the empty state).
export const Empty = defineComponent({
  name: 'Empty',
  description:
    'Empty-state placeholder with title, description, optional media icon slot and content (children) for an action.',
  props: z.object({
    title: z.string(),
    description: z.string().optional(),
    media: z.array(z.any()).optional(),
    mediaVariant: z.enum(['default', 'icon']).optional(),
    children: z.array(z.any()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props, renderNode }) => (
    <UIEmpty className={props.className}>
      <EmptyHeader>
        {props.media && (
          <EmptyMedia variant={props.mediaVariant}>
            {renderNode(props.media)}
          </EmptyMedia>
        )}
        <EmptyTitle>{props.title}</EmptyTitle>
        {props.description && (
          <EmptyDescription>{props.description}</EmptyDescription>
        )}
      </EmptyHeader>
      {props.children && (
        <EmptyContent>{renderNode(props.children)}</EmptyContent>
      )}
    </UIEmpty>
  ),
})
