import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { useAuth, signInWithGoogle, signOut } from '@ship-fast/lakebed/react'

import { Button } from '#/components/ui/button.tsx'
import { cn } from '#/lib/utils.ts'

const signInButtonVariants = cva('', {
  variants: {
    variant: {
      primary: '',
      outline: '',
      ghost: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
  },
})

/**
 * A REAL working sign-in button wired to the site's Shoo/lakebed auth.
 *
 * Guests see a Google-styled "Sign in" pill that kicks off the real OAuth
 * redirect (returning to the current route). Authenticated users see an
 * account chip (avatar + name) that toggles a token-styled dropdown with their
 * email and a working "Sign out" action.
 *
 * This is NOT a dead page-switch button — it replaces the legacy
 * label-based route CTA wherever a generated site needs genuine login.
 */
const SignInButton = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<'div'> &
    VariantProps<typeof signInButtonVariants> & {
      asChild?: boolean
      label?: string
    }
>(({ label, variant, className, asChild = false, ...props }, ref) => {
  const auth = useAuth()
  const [open, setOpen] = React.useState(false)

  const signedIn = auth.isAuthenticated && !auth.isGuest

  const currentRoute = () => {
    if (typeof window === 'undefined') return undefined
    return (
      window.location.pathname + window.location.search + window.location.hash
    )
  }

  if (!signedIn) {
    const buttonVariant =
      variant === 'outline' || variant === 'ghost' ? variant : 'outline'

    const Comp = asChild ? Slot : 'div'
    return (
      <Comp
        ref={ref}
        data-slot="sign-in-button"
        className={cn(signInButtonVariants({ variant }), className)}
        {...props}
      >
        <Button
          type="button"
          variant={buttonVariant}
          size="sm"
          disabled={auth.isLoading}
          onClick={() => {
            void signInWithGoogle({ returnTo: currentRoute() })
          }}
          className="gap-2 rounded-none border-border bg-transparent font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            width="16"
            height="16"
            className="shrink-0"
          >
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.42 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
            />
          </svg>
          {label ?? 'Sign in'}
        </Button>
      </Comp>
    )
  }

  const name = auth.displayName || auth.email || 'Account'
  const avatar = auth.picture
  const initial = (name || '?').trim().charAt(0).toUpperCase() || '?'

  const Comp = asChild ? Slot : 'div'
  return (
    <Comp
      ref={ref}
      data-slot="sign-in-button"
      className={cn('relative', signInButtonVariants({ variant }), className)}
      {...props}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {avatar ? (
          <img
            src={avatar}
            alt=""
            className="h-7 w-7 rounded-full object-cover"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            {initial}
          </span>
        )}
        <span className="max-w-[10rem] truncate">{name}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border border-border bg-background p-1 shadow-lg"
        >
          <div className="truncate px-3 py-2 text-xs text-muted-foreground">
            {auth.email}
          </div>
          <div className="my-1 h-px bg-border" />
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              signOut()
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground transition-colors hover:bg-muted"
          >
            Sign out
          </button>
        </div>
      ) : null}
    </Comp>
  )
})
SignInButton.displayName = 'SignInButton'

export { SignInButton, signInButtonVariants }
