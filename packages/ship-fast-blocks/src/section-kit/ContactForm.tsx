import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const contactFormVariants = cva('', {
 variants: {
 variant: {
 default: '',
 card: ' bg-card p-8 lg:p-12',
 'card-dark': ' bg-card p-8 lg:p-12 text-foreground',
 },
 },
 defaultVariants: {
 variant: 'default',
 },
})

const ContactForm = React.forwardRef<
 HTMLFormElement,
 React.ComponentProps<'form'> &
 VariantProps<typeof contactFormVariants> & { asChild?: boolean }>(({ className, variant, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'form'
 return (
 <Comp
 data-slot="contact-form"
 data-d-role="form"className={cn(contactFormVariants({ variant }), className)}
 ref={ref}
 {...props}
 />
 )
})
ContactForm.displayName = 'ContactForm'

const ContactFormField = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="contact-form-field"
 data-d-role="form"className={cn('mb-6', className)}
 ref={ref}
 {...props}
 />
 )
})
ContactFormField.displayName = 'ContactFormField'

const ContactFormLabel = React.forwardRef<
 HTMLLabelElement,
 React.ComponentProps<'label'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'label'
 return (
 <Comp
 data-slot="contact-form-label"
 data-d-role="body"className={cn(
 'mb-2 block text-sm font-medium text-muted-foreground',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ContactFormLabel.displayName = 'ContactFormLabel'

const ContactFormInput = React.forwardRef<
 HTMLInputElement,
 React.ComponentProps<'input'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'input'
 return (
 <Comp
 data-slot="contact-form-input"
 data-d-role="input"className={cn(
 'w-full border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ContactFormInput.displayName = 'ContactFormInput'

const ContactFormSelect = React.forwardRef<
 HTMLSelectElement,
 React.ComponentProps<'select'> & { asChild?: boolean }>(({ className, asChild = false, children, ...props }, ref) => {
 const Comp = asChild ? Slot : 'select'
 return (
 <Comp
 data-slot="contact-form-select"
 data-d-role="input"className={cn(
 'w-full appearance-none border border-input bg-background px-4 py-3 text-foreground transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
 className,
 )}
 ref={ref}
 {...props}>
 {children}
 </Comp>
 )
})
ContactFormSelect.displayName = 'ContactFormSelect'

const ContactFormTextarea = React.forwardRef<
 HTMLTextAreaElement,
 React.ComponentProps<'textarea'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'textarea'
 return (
 <Comp
 data-slot="contact-form-textarea"
 data-d-role="input"className={cn(
 'w-full resize-none border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ContactFormTextarea.displayName = 'ContactFormTextarea'

const ContactFormSubmit = React.forwardRef<
 HTMLButtonElement,
 React.ComponentProps<'button'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'button'
 return (
 <Comp
 data-slot="contact-form-submit"
 data-d-role="btn"className={cn(
 'w-full bg-primary py-3.5 font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
ContactFormSubmit.displayName = 'ContactFormSubmit'

const ContactFormFooter = React.forwardRef<
 HTMLParagraphElement,
 React.ComponentProps<'p'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'p'
 return (
 <Comp
 data-slot="contact-form-footer"
 data-d-role="footer"className={cn('mt-4 text-sm text-muted-foreground', className)}
 ref={ref}
 {...props}
 />
 )
})
ContactFormFooter.displayName = 'ContactFormFooter'

export {
 ContactForm,
 ContactFormField,
 ContactFormLabel,
 ContactFormInput,
 ContactFormSelect,
 ContactFormTextarea,
 ContactFormSubmit,
 ContactFormFooter,
 contactFormVariants,
}
