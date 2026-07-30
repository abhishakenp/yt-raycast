import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const FormField = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp ref={ref} data-slot="form-field" data-d-role="form"className={className} {...props} />
  )
})
FormField.displayName = 'FormField'

const FormFieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<'label'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'label'
  return (
    <Comp
      ref={ref}
      data-slot="form-field-label"
      data-d-role="form"className={cn('mb-2 block text-sm font-medium', className)}
      {...props}
    />
  )
})
FormFieldLabel.displayName = 'FormFieldLabel'

const formFieldControlVariants = cva('', {
  variants: {
    as: {
      input: '',
      select: 'appearance-none',
      textarea: 'resize-none',
    },
  },
  defaultVariants: { as: 'input' },
})

const FormFieldControl = React.forwardRef<
  HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
  Omit<
    React.InputHTMLAttributes<HTMLInputElement> &
      React.SelectHTMLAttributes<HTMLSelectElement> &
      React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    'as'
  > &
    VariantProps<typeof formFieldControlVariants> & {
      as?: 'input' | 'select' | 'textarea'
      asChild?: boolean
      options?: string[]
    }
>(({ className, as = 'input', asChild = false, options, ...props }, ref) => {
  if (as === 'select') {
    return (
      <select
        ref={ref as React.Ref<HTMLSelectElement>}
        data-slot="form-field-control"
        data-d-role="form"className={cn(formFieldControlVariants({ as }), className)}
        {...(props as React.SelectHTMLAttributes<HTMLSelectElement>)}
      >
        {(options ?? []).map((opt) => (
          <option key={opt} className="bg-background">
            {opt}
          </option>
        ))}
      </select>
    )
  }
  if (as === 'textarea') {
    return (
      <textarea
        ref={ref as React.Ref<HTMLTextAreaElement>}
        data-slot="form-field-control"
        data-d-role="form"className={cn(formFieldControlVariants({ as }), className)}
        {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
      />
    )
  }
  return (
    <input
      ref={ref as React.Ref<HTMLInputElement>}
      data-slot="form-field-control"
      data-d-role="form"className={cn(formFieldControlVariants({ as }), className)}
      {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
    />
  )
})
FormFieldControl.displayName = 'FormFieldControl'

export { FormField, FormFieldLabel, FormFieldControl, formFieldControlVariants }
