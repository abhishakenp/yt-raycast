import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { Image as BaseImage } from '#/lib/img.tsx'
import { cn } from '#/lib/utils.ts'

// Standalone image primitive. Wraps the ambient-context-aware `Image` from
// lib/img.tsx (alt → stock-photo resolution, inline-edit overrides, multi-src
// carousel) so images are directly addressable OpenUI nodes — required for
// element swaps (e.g. replacing a Text statement with an Image) instead of
// images existing only as `imageAlt` props buried inside section capsules.

export const Image = defineCapsule({
  name: 'Image',
  description:
    'Standalone image. `alt` describes the subject and drives automatic stock-photo resolution; pass an explicit `src` URL to bypass it. Rounded by default via className.',
  props: z.object({
    alt: z.string(),
    src: z.string().optional(),
    w: z.number().optional(),
    h: z.number().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <BaseImage
      alt={props.alt}
      src={props.src?.trim() ? props.src : undefined}
      w={props.w ?? 800}
      h={props.h ?? 600}
      className={cn('h-auto w-full rounded-lg object-cover', props.className)}
    />
  ),
})
