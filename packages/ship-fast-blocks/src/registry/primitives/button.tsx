import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { Button as UIButton } from '#/components/ui/button.tsx'

// Leaf-primitive exemplar: expose the real cva variants verbatim + className.
export const Button = defineComponent({
  name: 'Button',
  description: 'Clickable button. Mirrors shadcn variant/size.',
  props: z.object({
    label: z.string(),
    variant: z
      .enum(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'])
      .optional(),
    size: z.enum(['default', 'xs', 'sm', 'lg']).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => (
    <UIButton
      variant={props.variant}
      size={props.size}
      className={props.className}
    >
      {props.label}
    </UIButton>
  ),
})
