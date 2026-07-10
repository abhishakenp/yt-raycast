import { cva } from 'class-variance-authority'

/**
 * Section surface tones — generic, reusable across all section-kit composites.
 * Not domain-specific: "primary" / "muted" / "card" / "default", never
 * "redRetail" / "blueCinema".
 */
export const sectionTone = cva('', {
  variants: {
    tone: {
      default: 'bg-background text-foreground',
      muted: 'bg-muted text-foreground',
      primary: 'bg-primary text-primary-foreground',
      card: 'bg-card text-card-foreground border border-border',
      outline: 'border border-border bg-transparent text-foreground',
    },
  },
  defaultVariants: {
    tone: 'default',
  },
})

/**
 * Alignment variants for section content.
 */
export const sectionAlign = cva('', {
  variants: {
    align: {
      center: 'items-center text-center',
      left: 'items-start text-left',
    },
  },
  defaultVariants: {
    align: 'left',
  },
})

/**
 * Action pill variants — used by all kit composites that render buttons.
 * Mirrors KitAction['variant'] but with full class strings.
 */
export const actionVariants = cva(
  'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline:
          'border border-border bg-background text-foreground hover:bg-muted',
        ghost: 'text-foreground hover:bg-muted',
        invert: 'bg-background text-foreground hover:bg-background/90',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

/**
 * Eyebrow / badge pill — small uppercase label above a heading.
 */
export const eyebrowVariants = cva(
  'inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground',
  {
    variants: {
      variant: {
        default: '',
        pulse: '',
        solid: 'border-transparent bg-primary text-primary-foreground',
        muted: 'border-transparent bg-muted text-muted-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

/**
 * Card surface variants for floating cards / stat cards / rating cards.
 */
export const cardVariants = cva('rounded-xl border border-border shadow-lg', {
  variants: {
    variant: {
      default: 'bg-background text-foreground',
      muted: 'bg-muted text-foreground',
      primary: 'bg-primary text-primary-foreground',
      card: 'bg-card text-card-foreground',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
})

/**
 * Heading size variants.
 */
export const headingVariants = cva('font-bold tracking-tight text-foreground', {
  variants: {
    size: {
      sm: 'text-3xl md:text-4xl',
      md: 'text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl',
      lg: 'text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

/**
 * Trust indicator variants — checkmark chips, badges, inline proof.
 */
export const trustVariants = cva(
  'inline-flex items-center gap-1.5 text-sm text-muted-foreground',
  {
    variants: {
      variant: {
        chip: 'rounded-full border border-border bg-background px-3 py-1',
        inline: '',
        badge: 'rounded-md border border-border bg-muted px-2.5 py-0.5',
      },
    },
    defaultVariants: {
      variant: 'chip',
    },
  },
)
