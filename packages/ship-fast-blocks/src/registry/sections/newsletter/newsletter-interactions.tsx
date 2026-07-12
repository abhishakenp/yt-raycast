import type { FormEvent, ReactNode } from 'react'
import { useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { MenuIcon } from 'lucide-react'

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
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from '#/section-kit/index.ts'
import type { newsletterLakebed } from './newsletter-lakebed.ts'

export type NewsletterLakebed = LakebedClientRuntime<typeof newsletterLakebed>

export function NewsletterSubscribeForm({
  buttonClassName,
  buttonLabel,
  className,
  emailLabel = 'Email address',
  inputClassName,
  lakebed,
  pendingLabel = 'Subscribing',
  placeholder,
  source,
  statusClassName,
  successMessage,
}: {
  buttonClassName?: string
  buttonLabel: string
  className?: string
  emailLabel?: string
  inputClassName?: string
  lakebed: NewsletterLakebed
  pendingLabel?: ReactNode
  placeholder: string
  source?: string
  statusClassName?: string
  successMessage?: string
}) {
  const [email, setEmail] = useState('')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const summary = lakebed.useQuery('subscriberSummary')
  const subscribe = lakebed.useMutation('subscribe')
  const count = summary?.count ?? 0

  const submit = (event) => {
    event.preventDefault()
    const nextEmail = email.trim()
    if (!nextEmail || subscribe.isPending) return

    void subscribe({ email: nextEmail, source }).then(
      () => {
        setSubmittedEmail(nextEmail)
        setEmail('')
      },
      () => {},
    )
  }

  return (
    <>
      <form onSubmit={submit} className={className}>
        <label className="sr-only">{emailLabel}</label>
        <input
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.currentTarget.value)}
          placeholder={placeholder}
          aria-label={emailLabel}
          className={inputClassName}
        />
        <button
          type="submit"
          aria-busy={subscribe.isPending}
          disabled={subscribe.isPending}
          className={buttonClassName}
        >
          {subscribe.isPending ? pendingLabel : buttonLabel}
        </button>
      </form>
      <p
        className={cn(
          'mt-4 text-[0.8rem] text-muted-foreground',
          statusClassName,
        )}
      >
        {submittedEmail
          ? (successMessage ??
            `You're subscribed as ${submittedEmail}. ${count} reader${
              count === 1 ? '' : 's'
            } joined.`)
          : `${count} reader${count === 1 ? '' : 's'} subscribed.`}
      </p>
    </>
  )
}

export function NewsletterSubscribeDrawer({
  buttonClassName,
  buttonLabel,
  lakebed,
  placeholder = 'you@example.com',
  source,
}: {
  buttonClassName?: string
  buttonLabel: string
  lakebed: NewsletterLakebed
  placeholder?: string
  source?: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" className={buttonClassName}>
          {buttonLabel}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,24rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[24rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-serif text-xl">
            Join the newsletter
          </SheetTitle>
          <SheetDescription>
            Get the next issue as soon as it is published.
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-5">
          <NewsletterSubscribeForm
            lakebed={lakebed}
            source={source ?? buttonLabel}
            buttonLabel={buttonLabel}
            pendingLabel="Subscribing..."
            placeholder={placeholder}
            className="flex flex-col gap-3"
            inputClassName="min-h-11 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground"
            buttonClassName="inline-flex min-h-11 items-center justify-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-60"
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function NewsletterAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: NewsletterLakebed
  label?: string
}) {
  return (
    <AccountDropdown auth={lakebed}>
      <AccountDropdownTrigger aria-label={label} className={buttonClassName}>
        {children}
      </AccountDropdownTrigger>
      <AccountDropdownContent>
        <AccountDropdownLabel />
        <AccountDropdownSeparator />
        <AccountDropdownSignOut />
      </AccountDropdownContent>
      <AccountDropdownUnauthenticated />
    </AccountDropdown>
  )
}

export function NewsletterMobileMenu({
  brand,
  buttonClassName,
  homeTarget,
  nav,
}: {
  brand: string
  buttonClassName?: string
  homeTarget?: string
  nav: string[]
}) {
  const [open, setOpen] = useState(false)
  const go = useNavigate()

  const navigate = (target?) => {
    setOpen(false)
    go(target)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label="Menu" className={buttonClassName}>
          <MenuIcon className="size-5" aria-hidden="true" />
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-serif text-lg">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a newsletter section.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-1 px-3 py-4">
          <button
            type="button"
            onClick={() => navigate(homeTarget ?? brand)}
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
