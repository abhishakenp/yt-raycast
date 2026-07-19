import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

/**
 * PersonCard — shadc­n-style compound component for team / author / speaker /
 * doctor profiles: an avatar + name + role + bio, composed freely by the
 * capsule. The root carries the shared surface tokens via `variant`
 * (bare / plain / outlined / elevated) and a `rounded` axis; the sub-parts
 * (Avatar / Content / Name / Role / Bio) carry only the minimal shared type +
 * spacing tokens and accept className so each capsule can keep its own colour,
 * size, serif face, or extra actions. Compose whatever layout the capsule
 * needs — full-bleed portrait, circular inline avatar, or horizontal byline.
 */
const personCardVariants = cva('flex flex-col rounded-xl', {
  variants: {
    variant: {
      /** No surface — the profile sits directly on the section background. */
      bare: '',
      /** Card fill only, no border. */
      plain: 'overflow-hidden bg-card text-card-foreground',
      /** Bordered card fill. */
      outlined:
        'overflow-hidden border border-border bg-card text-card-foreground',
      /** Shadowed card fill, no border. */
      elevated: 'overflow-hidden bg-card text-card-foreground shadow-sm',
    },
  },
  defaultVariants: {
    variant: 'outlined',
  },
})

export interface PersonCardProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof personCardVariants> {
  asChild?: boolean
}

const PersonCard = React.forwardRef<HTMLElement, PersonCardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'article'
    return (
      <Comp
        ref={ref}
        data-slot="person-card"
        className={cn(personCardVariants({ variant }), className)}
        {...props}
      />
    )
  },
)
PersonCard.displayName = 'PersonCard'

/** Framed avatar image wrapper — square by default; override the aspect. */
const PersonCardAvatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="person-card-avatar"
      className={cn('aspect-square w-full overflow-hidden', className)}
      {...props}
    />
  )
})
PersonCardAvatar.displayName = 'PersonCardAvatar'

/** Padded text region beneath / beside the avatar. */
const PersonCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="person-card-content"
      className={cn('p-5', className)}
      {...props}
    />
  )
})
PersonCardContent.displayName = 'PersonCardContent'

const PersonCardName = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="person-card-name"
      className={cn('font-semibold text-foreground', className)}
      {...props}
    />
  )
})
PersonCardName.displayName = 'PersonCardName'

const PersonCardRole = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="person-card-role"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
PersonCardRole.displayName = 'PersonCardRole'

const PersonCardBio = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="person-card-bio"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
PersonCardBio.displayName = 'PersonCardBio'

export {
  PersonCard,
  PersonCardAvatar,
  PersonCardContent,
  PersonCardName,
  PersonCardRole,
  PersonCardBio,
  personCardVariants,
}
