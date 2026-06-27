import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react'
import { useCallback, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon, UserIcon } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu.tsx'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import type { inquiryLakebed } from './inquiry-lakebed.ts'

export type InquiryLakebed = LakebedClientRuntime<typeof inquiryLakebed>

const fieldsFromForm = (form: HTMLFormElement) => {
  const formData = new FormData(form)
  const fields: Record<string, string> = {}

  for (const [key, value] of formData.entries()) {
    fields[key] = String(value)
  }

  return fields
}

export function InquiryMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function useInquirySubmission({
  lakebed,
  source,
  successMessage = 'Thanks. We received your inquiry.',
}: {
  lakebed: InquiryLakebed
  source: string
  successMessage?: string
}) {
  const [submitted, setSubmitted] = useState(false)
  const summary = lakebed.useQuery('inquirySummary')
  const submitInquiry = lakebed.useMutation('submitInquiry')
  const count = summary?.count ?? 0

  const submitForm = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (submitInquiry.isPending) return

      const form = event.currentTarget
      const fields = fieldsFromForm(form)

      void submitInquiry({ fields, source }).then(
        () => {
          setSubmitted(true)
          form.reset()
        },
        () => {},
      )
    },
    [source, submitInquiry],
  )

  return {
    count,
    isPending: submitInquiry.isPending,
    statusText: submitted
      ? `${successMessage} ${count} total ${
          count === 1 ? 'inquiry' : 'inquiries'
        }.`
      : `${count} ${count === 1 ? 'inquiry' : 'inquiries'} received.`,
    submitForm,
  }
}

export function InquiryActionBadge({
  className,
  lakebed,
}: {
  className?: string
  lakebed: InquiryLakebed
}) {
  const summary = lakebed.useQuery('actionSummary')
  const label = summary?.latest?.label

  if (!label) return null

  return (
    <span
      className={cn(
        'hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary lg:inline-flex',
        className,
      )}
    >
      {label}
    </span>
  )
}

export function InquiryActionButton({
  children,
  disabled,
  kind = 'cta',
  label,
  lakebed,
  onRecorded,
  pendingChildren,
  source,
  target,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  children: ReactNode
  kind?: string
  label: string
  lakebed: InquiryLakebed
  onRecorded?: () => void
  pendingChildren?: ReactNode
  source?: string
  target?: string
}) {
  const recordContactAction = lakebed.useMutation('recordContactAction')
  const [isButtonPending, setIsButtonPending] = useState(false)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        setIsButtonPending(true)
        void recordContactAction({ kind, label, source, target }).then(
          () => {
            setIsButtonPending(false)
            onRecorded?.()
          },
          () => setIsButtonPending(false),
        )
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <InquiryMutationSpinner />)
        : children}
    </button>
  )
}

export function InquiryContactSheetButton({
  buttonClassName,
  children,
  description,
  heading,
  kind = 'contact',
  label,
  lakebed,
  source,
  target,
}: {
  buttonClassName?: string
  children?: ReactNode
  description?: string
  heading?: string
  kind?: string
  label: string
  lakebed: InquiryLakebed
  source?: string
  target?: string
}) {
  const [open, setOpen] = useState(false)
  const recordContactAction = lakebed.useMutation('recordContactAction')
  const summary = lakebed.useQuery('actionSummary')
  const title = heading ?? label
  const detail =
    description ?? 'Use this contact option to continue the conversation.'

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label={label}
          onClick={() => {
            void recordContactAction({ kind, label, source, target })
          }}
          className={buttonClassName}
        >
          {children ?? label}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,24rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[24rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
          <SheetDescription>{detail}</SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-5 py-5">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Contact route
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {target ?? label}
            </p>
          </div>
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {summary?.count ?? 0} contact action
            {(summary?.count ?? 0) === 1 ? '' : 's'} captured.
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function InquiryAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Shoo account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: InquiryLakebed
  label?: string
}) {
  const auth = lakebed.useAuth()
  const user = auth.user
  const displayName = user?.displayName ?? 'Guest'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <UserIcon className="size-5" aria-hidden="true" />}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <span className="block truncate">{displayName}</span>
          <span className="block truncate text-xs font-normal text-muted-foreground">
            {user?.email ?? (user?.isGuest ? 'Guest profile' : 'Signed in')}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {auth.isAuthenticated && !user?.isGuest ? (
          <DropdownMenuItem onSelect={() => lakebed.signOut()}>
            Sign out
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onSelect={() => {
              void lakebed.signInWithGoogle()
            }}
          >
            Sign in with Shoo
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function InquiryMobileMenu({
  brand,
  buttonClassName,
  ctaLabel,
  ctaTarget,
  homeTarget,
  lakebed,
  nav,
}: {
  brand: string
  buttonClassName?: string
  ctaLabel: string
  ctaTarget?: string
  homeTarget?: string
  lakebed: InquiryLakebed
  nav: string[]
}) {
  const [open, setOpen] = useState(false)
  const go = useNavigate()

  const navigate = useCallback(
    (target?: string) => {
      setOpen(false)
      go(target)
    },
    [go],
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          type="button"
          aria-label="Open menu"
          className={buttonClassName}
        >
          <MenuIcon className="size-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a contact page section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <button
            type="button"
            onClick={() => navigate(homeTarget ?? nav[0])}
            className="rounded-lg px-3 py-3 text-left text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Home
          </button>
          {nav.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => navigate(item)}
              className="rounded-lg px-3 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              {item}
            </button>
          ))}
          <InquiryActionButton
            lakebed={lakebed}
            label={ctaLabel}
            target={ctaTarget}
            source="mobile menu"
            className="mt-3 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
          >
            {ctaLabel}
          </InquiryActionButton>
        </div>
      </SheetContent>
    </Sheet>
  )
}
