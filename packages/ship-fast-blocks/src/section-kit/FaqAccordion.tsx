import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const faqAccordionVariants = cva('', {
  variants: {
    variant: {
      default: 'space-y-4',
      compact: 'space-y-3',
      wide: 'space-y-6',
      divided: 'divide-y divide-border border-y border-border',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

const FaqAccordion = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof faqAccordionVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      data-slot="faq-accordion"
      className={cn(faqAccordionVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
FaqAccordion.displayName = 'FaqAccordion'

const faqItemVariants = cva('group', {
  variants: {
    variant: {
      bordered: 'rounded-xl border border-border bg-card',
      muted: 'rounded-xl bg-muted/50',
      'bordered-lg': 'rounded-lg border border-border bg-card',
      minimal: 'rounded-lg bg-background',
      divided: 'py-5',
      'open-raised':
        'rounded-xl border border-border bg-muted/40 transition-all open:bg-card open:shadow-sm',
      'overflow-bordered':
        'overflow-hidden rounded-xl border border-border bg-card',
    },
  },
  defaultVariants: {
    variant: 'bordered',
  },
})

const FaqItem = React.forwardRef<
  HTMLDetailsElement,
  React.ComponentProps<'details'> &
    VariantProps<typeof faqItemVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'details'
  return (
    <Comp
      data-slot="faq-item"
      className={cn(faqItemVariants({ variant }), className)}
      ref={ref}
      {...props}
    />
  )
})
FaqItem.displayName = 'FaqItem'

const FaqQuestion = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'summary'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'summary'
  return (
    <Comp
      data-slot="faq-question"
      className={cn(
        'flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
FaqQuestion.displayName = 'FaqQuestion'

const faqQuestionIconVariants = cva(
  'shrink-0 text-muted-foreground transition-transform',
  {
    variants: {
      variant: {
        chevron: 'group-open:rotate-180',
        plus: 'group-open:rotate-45',
        'chevron-badge':
          'flex size-8 items-center justify-center rounded-full d-radius-lock border border-border bg-background group-open:rotate-180',
      },
    },
    defaultVariants: {
      variant: 'chevron',
    },
  },
)

const ChevronIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
)

const PlusIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
)

const FaqQuestionIcon = React.forwardRef<
  HTMLSpanElement,
  React.ComponentProps<'span'> &
    VariantProps<typeof faqQuestionIconVariants> & { asChild?: boolean }
>(({ className, variant, asChild = false, children, ...props }, ref) => {
  const Comp = asChild ? Slot : 'span'
  const icon =
    variant === 'plus' ? (
      <PlusIcon />
    ) : variant === 'chevron-badge' ? (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    ) : (
      <ChevronIcon />
    )
  return (
    <Comp
      data-slot="faq-question-icon"
      className={cn(faqQuestionIconVariants({ variant }), className)}
      ref={ref}
      {...props}
    >
      {children ?? icon}
    </Comp>
  )
})
FaqQuestionIcon.displayName = 'FaqQuestionIcon'

const FaqAnswer = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      data-slot="faq-answer"
      className={cn(
        'px-5 pb-5 text-base leading-relaxed text-muted-foreground',
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
FaqAnswer.displayName = 'FaqAnswer'

export {
  FaqAccordion,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
  FaqAnswer,
  faqAccordionVariants,
  faqItemVariants,
  faqQuestionIconVariants,
}
