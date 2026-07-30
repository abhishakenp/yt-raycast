import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const CompanyInfo = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="company-info"
 data-d-role="body"className={cn(' border border-border bg-card p-8', className)}
 ref={ref}
 {...props}
 />
 )
})
CompanyInfo.displayName = 'CompanyInfo'

export { CompanyInfo }
