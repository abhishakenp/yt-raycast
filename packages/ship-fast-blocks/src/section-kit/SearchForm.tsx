import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const searchFormVariants = cva('', {
  variants: {
    layout: {
      inline: 'relative',
      row: 'flex flex-col gap-3 sm:flex-row',
    },
  },
  defaultVariants: {
    layout: 'inline',
  },
})

const SearchForm = React.forwardRef<
  HTMLFormElement,
  React.ComponentProps<'form'> &
    VariantProps<typeof searchFormVariants> & { asChild?: boolean }
>(({ className, layout, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'form'
  return (
    <Comp
      data-slot="search-form"
      data-d-role="form"
      className={cn(searchFormVariants({ layout }), className)}
      ref={ref}
      {...props}
    />
  )
})
SearchForm.displayName = 'SearchForm'

const SearchField = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="search-field"
      className={cn('relative', className)}
      ref={ref}
      {...props}
    />
  )
})
SearchField.displayName = 'SearchField'

const SearchFieldIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="search-field-icon"
      className={cn(
        'pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SearchFieldIcon.displayName = 'SearchFieldIcon'

const SearchFieldInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'input'
  return (
    <Comp
      data-slot="search-field-input"
      data-d-role="input"
      className={cn(
        'w-full border border-input bg-background py-4 pl-12 pr-4 text-base text-foreground placeholder-muted-foreground transition-shadow focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SearchFieldInput.displayName = 'SearchFieldInput'

const SearchFieldHint = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="search-field-hint"
      className={cn(
        'absolute inset-y-0 right-0 flex items-center pr-3',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SearchFieldHint.displayName = 'SearchFieldHint'

const SearchSubmit = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="search-submit"
      data-d-role="btn"
      className={cn(
        'inline-flex items-center justify-center bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
SearchSubmit.displayName = 'SearchSubmit'

export {
  SearchForm,
  SearchField,
  SearchFieldIcon,
  SearchFieldInput,
  SearchFieldHint,
  SearchSubmit,
  searchFormVariants,
}
