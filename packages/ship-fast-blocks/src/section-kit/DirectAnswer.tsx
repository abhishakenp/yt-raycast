import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'

const DirectAnswer = React.forwardRef<
 HTMLDivElement,
 React.ComponentProps<'div'> & { asChild?: boolean }>(({ className, asChild = false, ...props }, ref) => {
 const Comp = asChild ? Slot : 'div'
 return (
 <Comp
 data-slot="direct-answer"
 data-d-role="body"className={cn(
 ' border-l-4 border-primary bg-muted/30 p-6',
 className,
 )}
 ref={ref}
 {...props}
 />
 )
})
DirectAnswer.displayName = 'DirectAnswer'

export { DirectAnswer }
