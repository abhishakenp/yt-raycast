import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { UserIcon } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog.tsx'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar.tsx'
import { Button } from '#/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import { cn } from '#/lib/utils.ts'

type AccountDropdownUser = {
  displayName?: string
  email?: string
  isGuest?: boolean
  picture?: string
  provider?: string
} | null

type AccountDropdownAuthState = {
  user: AccountDropdownUser
  isAuthenticated: boolean
  isLoading?: boolean
}

type AccountDropdownAuth = {
  useAuth: () => AccountDropdownAuthState
  signOut: () => void
  signInWithGoogle: () => void
}

type AccountDropdownContextValue = {
  auth: AccountDropdownAuth
  authState: AccountDropdownAuthState
  isAuthed: boolean
}

const AccountDropdownContext =
  React.createContext<AccountDropdownContextValue | null>(null)

function useAccountDropdownContext() {
  const ctx = React.useContext(AccountDropdownContext)
  if (!ctx) {
    throw new Error(
      'AccountDropdown sub-components must be used within <AccountDropdown>',
    )
  }
  return ctx
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function AccountDropdown({
  auth,
  children,
  ...props
}: { auth: AccountDropdownAuth } & React.ComponentProps<typeof DropdownMenu>) {
  const authState = auth.useAuth()
  const isAuthed = authState.isAuthenticated && !authState.user?.isGuest
  return (
    <AccountDropdownContext.Provider value={{ auth, authState, isAuthed }}>
      {isAuthed ? (
        <DropdownMenu data-slot="account-dropdown" {...props}>
          {children}
        </DropdownMenu>
      ) : (
        <div data-slot="account-dropdown" className="inline-flex">
          {children}
        </div>
      )}
    </AccountDropdownContext.Provider>
  )
}
AccountDropdown.displayName = 'AccountDropdown'

const AccountDropdownTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
  const { authState, isAuthed } = useAccountDropdownContext()
  const user = authState.user

  if (!isAuthed) {
    if (asChild) {
      return (
        <Slot ref={ref} className={className} {...props}>
          {children}
        </Slot>
      )
    }
    return null
  }

  const trigger = asChild ? (
    <Slot ref={ref} className={className} {...props}>
      {children}
    </Slot>
  ) : (
    <button
      ref={ref}
      data-slot="account-dropdown-trigger"
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-full transition-opacity hover:opacity-80',
        className,
      )}
      {...props}
    >
      {children ?? (
        <Avatar size="sm">
          {user?.picture ? (
            <AvatarImage
              src={user.picture}
              alt={user?.displayName ?? 'Account'}
            />
          ) : null}
          <AvatarFallback>
            {user?.displayName ? (
              initialsFromName(user.displayName)
            ) : (
              <UserIcon className="size-4" aria-hidden="true" />
            )}
          </AvatarFallback>
        </Avatar>
      )}
    </button>
  )
  return <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
})
AccountDropdownTrigger.displayName = 'AccountDropdownTrigger'

const AccountDropdownContent = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuContent>,
  React.ComponentProps<typeof DropdownMenuContent>
>(({ className, align = 'end', ...props }, ref) => {
  const { isAuthed } = useAccountDropdownContext()
  if (!isAuthed) return null
  return (
    <DropdownMenuContent
      ref={ref}
      data-slot="account-dropdown-content"
      align={align}
      className={cn('w-56 rounded-none border-border shadow-lg', className)}
      {...props}
    />
  )
})
AccountDropdownContent.displayName = 'AccountDropdownContent'

const AccountDropdownLabel = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuLabel>,
  React.ComponentProps<typeof DropdownMenuLabel>
>(({ className, children, ...props }, ref) => {
  const { authState } = useAccountDropdownContext()
  const user = authState.user
  return (
    <DropdownMenuLabel
      ref={ref}
      data-slot="account-dropdown-label"
      className={className}
      {...props}
    >
      {children ?? (
        <>
          <span
            aria-hidden="true"
            className="mb-1 block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
          >
            Account
          </span>
          <span className="block truncate">{user?.displayName ?? 'Guest'}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? (user?.isGuest ? 'Guest profile' : 'Signed in')}
          </span>
        </>
      )}
    </DropdownMenuLabel>
  )
})
AccountDropdownLabel.displayName = 'AccountDropdownLabel'

const AccountDropdownSeparator = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuSeparator>,
  React.ComponentProps<typeof DropdownMenuSeparator>
>(({ className, ...props }, ref) => (
  <DropdownMenuSeparator
    ref={ref}
    data-slot="account-dropdown-separator"
    className={className}
    {...props}
  />
))
AccountDropdownSeparator.displayName = 'AccountDropdownSeparator'

const AccountDropdownItem = React.forwardRef<
  React.ComponentRef<typeof DropdownMenuItem>,
  React.ComponentProps<typeof DropdownMenuItem>
>(({ className, ...props }, ref) => (
  <DropdownMenuItem
    ref={ref}
    data-slot="account-dropdown-item"
    className={cn('rounded-none active:translate-y-px', className)}
    {...props}
  />
))
AccountDropdownItem.displayName = 'AccountDropdownItem'

const AccountDropdownSignOut = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentProps<typeof DropdownMenuItem>, 'asChild'> & {
    className?: string
    title?: string
    description?: string
    confirmLabel?: string
    cancelLabel?: string
  }
>(
  (
    {
      className,
      title = 'Sign out',
      description = 'Are you sure you want to sign out of your account?',
      confirmLabel = 'Sign out',
      cancelLabel = 'Cancel',
      children,
      ...props
    },
    ref,
  ) => {
    const { auth } = useAccountDropdownContext()
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <DropdownMenuItem
            ref={ref}
            data-slot="account-dropdown-signout"
            className={cn(
              'cursor-pointer rounded-none text-destructive transition-colors focus:bg-destructive/10 focus:text-destructive active:translate-y-px',
              className,
            )}
            onSelect={(event) => event.preventDefault()}
            {...props}
          >
            {children ?? 'Sign out'}
          </DropdownMenuItem>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-none border-border shadow-lg">
          <AlertDialogHeader>
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription>{description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-none active:translate-y-px">
              {cancelLabel}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="rounded-none active:translate-y-px"
              onClick={() => auth.signOut()}
            >
              {confirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
)
AccountDropdownSignOut.displayName = 'AccountDropdownSignOut'

const AccountDropdownUnauthenticated = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<'button'> & { asChild?: boolean }
>(({ className, asChild = false, children, ...props }, ref) => {
  const { isAuthed, auth, authState } = useAccountDropdownContext()
  if (isAuthed) return null

  if (asChild) {
    return (
      <Slot ref={ref} className={className} {...props}>
        {children}
      </Slot>
    )
  }

  return (
    <Button
      ref={ref}
      data-slot="account-dropdown-unauthenticated"
      variant="outline"
      size="sm"
      // Neutral mono-metadata chip: matches the shared design-language grammar
      // (square, mono micro-label, flood-invert hover) across every category
      // instead of the old glossy primary pill that ignored page languages.
      className={cn(
        'gap-2 rounded-none border-border bg-transparent font-mono text-[11px] font-semibold uppercase tracking-[0.15em] text-foreground transition-colors duration-150 hover:bg-foreground hover:text-background active:translate-y-px',
        className,
      )}
      disabled={authState.isLoading}
      onClick={() => void auth.signInWithGoogle()}
      {...props}
    >
      {children ?? 'Sign in'}
    </Button>
  )
})
AccountDropdownUnauthenticated.displayName = 'AccountDropdownUnauthenticated'

export {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownItem,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
}
