import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '#/lib/utils.ts'
import { Logo, LogoImage, LogoLabel } from './Logo.tsx'
import { NavbarRouteLink } from './SiteNav.tsx'

const SiteFooter = React.forwardRef<
  HTMLElement,
  React.ComponentProps<'footer'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'footer'
  return (
    <Comp
      ref={ref}
      data-slot="site-footer"
      className={cn('border-t border-border bg-muted/30', className)}
      {...props}
    />
  )
})
SiteFooter.displayName = 'SiteFooter'

const FooterContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-content"
      className={cn('mx-auto max-w-7xl px-6 py-12 lg:px-8', className)}
      {...props}
    />
  )
})
FooterContent.displayName = 'FooterContent'

const FooterGrid = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-grid"
      className={cn('grid gap-10 md:grid-cols-4', className)}
      {...props}
    />
  )
})
FooterGrid.displayName = 'FooterGrid'

const FooterBrand = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & {
    asChild?: boolean
    brand?: string
    brandMark?: React.ReactNode
    brandClassName?: string
  }
>(
  (
    { className, asChild = false, brand, brandMark, brandClassName, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="footer-brand"
        className={cn('md:col-span-1', className)}
        {...props}
      >
        <div className="flex items-center gap-2">
          <Logo brand={brand ?? ''}>
            <LogoImage className="size-7" fallback={brandMark} />
            <LogoLabel
              className={cn(
                'text-lg font-semibold text-foreground',
                brandClassName,
              )}
            />
          </Logo>
        </div>
        {props.children}
      </Comp>
    )
  },
)
FooterBrand.displayName = 'FooterBrand'

const FooterTagline = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="footer-tagline"
      className={cn('mt-3 text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FooterTagline.displayName = 'FooterTagline'

const FooterSocial = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-social"
      className={cn('mt-4 flex flex-wrap gap-3', className)}
      {...props}
    />
  )
})
FooterSocial.displayName = 'FooterSocial'

const FooterSocialLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'a'
  return (
    <Comp
      ref={ref}
      data-slot="footer-social-link"
      className={cn(
        'text-sm text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    />
  )
})
FooterSocialLink.displayName = 'FooterSocialLink'

const FooterColumn = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-column"
      className={cn('', className)}
      {...props}
    />
  )
})
FooterColumn.displayName = 'FooterColumn'

const FooterColumnTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentProps<'h3'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'h3'
  return (
    <Comp
      ref={ref}
      data-slot="footer-column-title"
      className={cn('text-sm font-semibold text-foreground', className)}
      {...props}
    />
  )
})
FooterColumnTitle.displayName = 'FooterColumnTitle'

const FooterColumnList = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<'ul'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'ul'
  return (
    <Comp
      ref={ref}
      data-slot="footer-column-list"
      className={cn('mt-3 space-y-2', className)}
      {...props}
    />
  )
})
FooterColumnList.displayName = 'FooterColumnList'

const FooterLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<'a'> & { asChild?: boolean }
>(({ className, asChild = false, href, children, ...props }, ref) => {
  const Comp = asChild ? Slot : NavbarRouteLink
  const routeTarget = href ?? (typeof children === 'string' ? children : '#')
  return (
    <Comp
      ref={ref}
      data-slot="footer-link"
      href={routeTarget}
      className={cn(
        'text-sm text-muted-foreground hover:text-foreground',
        className,
      )}
      {...props}
    >
      {children}
    </Comp>
  )
})
FooterLink.displayName = 'FooterLink'

const FooterBottom = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-bottom"
      className={cn(
        'mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
      {...props}
    />
  )
})
FooterBottom.displayName = 'FooterBottom'

const FooterCopyright = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentProps<'p'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'p'
  return (
    <Comp
      ref={ref}
      data-slot="footer-copyright"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
})
FooterCopyright.displayName = 'FooterCopyright'

const FooterLegal = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> & { asChild?: boolean }
>(({ className, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="footer-legal"
      className={cn('flex flex-wrap gap-4', className)}
      {...props}
    />
  )
})
FooterLegal.displayName = 'FooterLegal'

export {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterColumn,
  FooterColumnTitle,
  FooterColumnList,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
}
