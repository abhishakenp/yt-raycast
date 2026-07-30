import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '#/lib/utils.ts'

const downloadBandVariants = cva('', {
 variants: {
 variant: {
 primary: 'bg-foreground text-background',
 muted: 'bg-muted text-foreground',
 card: 'border border-border bg-card text-card-foreground',
 },
 },
 defaultVariants: {
 variant: 'primary',
 },
})

const DownloadBand = React.forwardRef<
 HTMLElement,
 React.ComponentProps<'section'> &
 VariantProps<typeof downloadBandVariants> & { asChild?: boolean }>(({ className, variant, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'section'
 return (
 <Comp
 data-slot="download-band"
 className={cn(
 'flex flex-col items-center gap-8',
 downloadBandVariants({ variant }),
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
DownloadBand.displayName = 'DownloadBand'

const DownloadButton = React.forwardRef<
 HTMLAnchorElement,
 React.ComponentProps<'a'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'a'
 return (
 <Comp
 data-slot="download-button"
 data-d-role="btn"className={cn(
 'inline-flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
DownloadButton.displayName = 'DownloadButton'

export { DownloadBand, DownloadButton, downloadBandVariants }
