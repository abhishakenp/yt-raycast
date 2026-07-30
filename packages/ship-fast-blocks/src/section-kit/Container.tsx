import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * Container — the centered, gutter-padded content wrapper that ~hundreds of
 * section capsules hand-roll as `mx-auto max-w-* px-4 sm:px-6 lg:px-8`.
 *
 * `size` sets the max width (monotonic: sm < 4xl < md < lg < xl):
 * - sm  → max-w-3xl (focused content, FAQ)
 * - 4xl → max-w-4xl (narrow content, newsletters)
 * - md  → max-w-5xl (forms, CTAs)
 * - lg  → max-w-6xl (narrower sections)
 * - xl  → max-w-7xl (default, standard page width)
 *
 * The horizontal gutter (`px-4 sm:px-6 lg:px-8`) is baked in; override via
 * `className` (twMerge resolves conflicts) for the rare bespoke gutter.
 */
const containerVariants = cva('mx-auto w-full px-4 sm:px-6 lg:px-8', {
  variants: {
    size: {
      sm: 'max-w-3xl',
      md: 'max-w-5xl',
      lg: 'max-w-6xl',
      xl: 'max-w-7xl',
      '4xl': 'max-w-4xl',
    },
  },
  defaultVariants: {
    size: 'xl',
  },
})

export interface ContainerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {
  asChild?: boolean
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="container"
        data-d-role="container"className={cn(containerVariants({ size }), className)}
        {...props}
      />
    )
  },
)
Container.displayName = 'Container'

export { Container, containerVariants }
