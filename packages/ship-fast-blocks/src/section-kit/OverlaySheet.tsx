'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import {
 Sheet,
 SheetTrigger,
 SheetContent,
 SheetHeader,
 SheetFooter,
 SheetTitle,
 SheetDescription,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'

/**
 * OverlaySheet — shared, generic chrome for the side-drawer overlays that
 * vertical `*-interactions.tsx` families hand-rolled 14× (cart, mobile nav,
 * booking, subscribe, history). It wraps the base `#/components/ui/sheet.tsx`
 * primitives with the canonical redesigned chrome (square hairline panel, mono
 * micro-label eyebrow, hairline-divided ledger body) so the STYLE lives in ONE
 * place. Each family composes these and keeps its OWN full-stack lakebed wiring
 * (cart mutations vs booking vs subscribe are different features — the chrome
 * merges, the wiring does not).
 *
 * Follows the base sheet.tsx idiom (function components + `data-slot` +
 * `cn(...)` className merge) rather than the forwardRef ProductCard idiom, so
 * these read like the primitives they wrap. Every part forwards native props
 * and merges `className` last (twMerge wins), so callers stay byte-identical to
 * their pre-extraction markup by passing their exact deviations.
 */

const overlaySheetContentVariants = cva(
 'border-l border-border bg-background p-0 text-foreground',
 {
 variants: {
 // `drawer` = the canonical square hairline drawer (nav/subscribe/history):
 // no glow, explicit rounded-none. `panel` keeps the base sheet shadow
 // (e.g. the cart, which deliberately floats with the base ).
 variant: {
 drawer: 'rounded-none shadow-none',
 panel: '',
 },
 size: {
 sm: 'w-[min(100%,22rem)] sm:max-w-[22rem]',
 md: 'w-[min(100%,24rem)] sm:max-w-[24rem]',
 },
 },
 defaultVariants: { variant: 'drawer', size: 'sm' },
 },
)

function OverlaySheet(props: React.ComponentProps<typeof Sheet>) {
 return <Sheet {...props} />
}

function OverlaySheetTrigger(props: React.ComponentProps<typeof SheetTrigger>) {
 return <SheetTrigger {...props} />
}

function OverlaySheetContent({
 className,
 variant,
 size,
 ...props
}: React.ComponentProps<typeof SheetContent> &
 VariantProps<typeof overlaySheetContentVariants>) {
 return (
 <SheetContent
 data-slot="overlay-sheet-content"
 data-d-role="container"className={cn(overlaySheetContentVariants({ variant, size }), className)}
 {...props}
 />
 )
}

function OverlaySheetHeader({
 className,
 ...props
}: React.ComponentProps<'div'>) {
 return (
 <SheetHeader
 data-slot="overlay-sheet-header"
 className={cn('border-b border-border px-5 py-4 text-left', className)}
 {...props}
 />
 )
}

function OverlaySheetEyebrow({
 className,
 ...props
}: React.ComponentProps<'span'>) {
 return (
 <span
 data-slot="overlay-sheet-eyebrow"
 data-d-role="eyebrow"aria-hidden="true"
 className={cn(
 'font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-[11px]',
 className,
 )}
 {...props}
 />
 )
}

function OverlaySheetTitle(props: React.ComponentProps<typeof SheetTitle>) {
 return <SheetTitle data-slot="overlay-sheet-title" data-d-role="heading"{...props} />
}

function OverlaySheetDescription(
 props: React.ComponentProps<typeof SheetDescription>,
) {
 return <SheetDescription data-slot="overlay-sheet-description" data-d-role="body"{...props} />
}

function OverlaySheetBody({
 className,
 ...props
}: React.ComponentProps<'div'>) {
 return (
 <div
 data-slot="overlay-sheet-body"
 data-d-role="body"className={cn('flex flex-col divide-y divide-border', className)}
 {...props}
 />
 )
}

function OverlaySheetFooter({
 className,
 ...props
}: React.ComponentProps<'div'>) {
 return (
 <SheetFooter
 data-slot="overlay-sheet-footer"
 data-d-role="footer"className={cn('border-t border-border px-5 py-4', className)}
 {...props}
 />
 )
}

function OverlaySheetClose({
 children,
 className,
 ...props
}: React.ComponentProps<'button'>) {
 return (
 <button
 type="button"
 data-slot="overlay-sheet-close"
 className={cn(
 'inline-flex size-8 shrink-0 items-center justify-center rounded-none border border-border text-lg leading-none text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px',
 className,
 )}
 {...props}>
 {children ?? '×'}
 </button>
 )
}

export {
 OverlaySheet,
 OverlaySheetTrigger,
 OverlaySheetContent,
 OverlaySheetHeader,
 OverlaySheetEyebrow,
 OverlaySheetTitle,
 OverlaySheetDescription,
 OverlaySheetBody,
 OverlaySheetFooter,
 OverlaySheetClose,
 overlaySheetContentVariants,
}
