import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import {
  Avatar as UIAvatar,
  AvatarImage,
  AvatarFallback,
  AvatarGroup as UIAvatarGroup,
  AvatarGroupCount,
} from '#/components/ui/avatar.tsx'

// Flatten Avatar/AvatarImage/AvatarFallback into one node. `src` shows an image;
// `fallback` (initials) renders when there is no image. size mirrors shadcn.
export const Avatar = defineCapsule({
  name: 'Avatar',
  description:
    'Circular user avatar. `src` image with `fallback` initials shown when no image. size sm|default|lg.',
  props: z.object({
    fallback: z.string(),
    src: z.string().optional(),
    alt: z.string().optional(),
    size: z.enum(['sm', 'default', 'lg']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIAvatar size={props.size} className={props.className}>
      {props.src && <AvatarImage src={props.src} alt={props.alt} />}
      <AvatarFallback>{props.fallback}</AvatarFallback>
    </UIAvatar>
  ),
})

// Overlapping cluster of avatars with an optional "+N" overflow count.
export const AvatarGroup = defineCapsule({
  name: 'AvatarGroup',
  description:
    'Overlapping cluster of avatars. `items` each {fallback, src?, alt?}; optional `overflow` shows a +N count chip.',
  props: z.object({
    items: z.array(
      z.object({
        fallback: z.string(),
        src: z.string().optional(),
        alt: z.string().optional(),
      }),
    ),
    overflow: z.string().optional(),
    size: z.enum(['sm', 'default', 'lg']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIAvatarGroup className={props.className}>
      {props.items.map((item, i) => (
        <UIAvatar key={i} size={props.size}>
          {item.src && <AvatarImage src={item.src} alt={item.alt} />}
          <AvatarFallback>{item.fallback}</AvatarFallback>
        </UIAvatar>
      ))}
      {props.overflow && <AvatarGroupCount>{props.overflow}</AvatarGroupCount>}
    </UIAvatarGroup>
  ),
})
