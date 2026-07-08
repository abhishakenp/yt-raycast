import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon, SearchIcon } from 'lucide-react'

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '#/components/ui/command.tsx'
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
import type {
  PublicationArticleInput,
  publicationLakebed,
} from './publication-lakebed.ts'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from '#/section-kit/index.ts'

export type PublicationLakebed = LakebedClientRuntime<typeof publicationLakebed>

type PublicationArticle = ReturnType<
  typeof publicationLakebed.queries.articleCatalog
>[number]

export const publicationArticle = ({
  author,
  category,
  date,
  excerpt,
  target,
  title,
}: PublicationArticleInput): PublicationArticleInput => ({
  author: author ?? '',
  category: category ?? '',
  date: date ?? '',
  excerpt: excerpt ?? '',
  target: target ?? title,
  title,
})

export function PublicationMutationSpinner({
  className,
}: {
  className?: string
}) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function useSyncPublicationArticles(
  lakebed: PublicationLakebed,
  articles: PublicationArticleInput[],
) {
  const syncArticles = lakebed.useMutation('syncArticles')
  const syncArticlesRef = useRef(syncArticles)
  const articleKey = useMemo(() => JSON.stringify(articles), [articles])
  const stableArticles = useMemo(
    () => articles.map((article) => publicationArticle(article)),
    [articleKey],
  )

  useEffect(() => {
    syncArticlesRef.current = syncArticles
  }, [syncArticles])

  useEffect(() => {
    if (!stableArticles.length) return
    void syncArticlesRef.current({ articles: stableArticles })
  }, [stableArticles])
}

export function PublicationSubscribeForm({
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
  lakebed: PublicationLakebed
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
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

export function PublicationSubscribeDrawer({
  buttonClassName,
  buttonLabel,
  lakebed,
  placeholder = 'you@example.com',
  source,
}: {
  buttonClassName?: string
  buttonLabel: string
  lakebed: PublicationLakebed
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
            Join the publication
          </SheetTitle>
          <SheetDescription>
            Get new articles and briefings as soon as they are published.
          </SheetDescription>
        </SheetHeader>
        <div className="px-5 py-5">
          <PublicationSubscribeForm
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

export function PublicationAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: PublicationLakebed
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

export function PublicationSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search articles',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: PublicationLakebed
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const go = useNavigate()
  const recordSearch = lakebed.useMutation('recordSearch')
  const articles = lakebed.useQuery('articleCatalog') ?? []

  const chooseArticle = (article: PublicationArticle) => {
    setOpen(false)
    void recordSearch({
      articleTitle: article.title,
      query: article.title,
      source: 'navbar search',
    })
    go(article.target || article.title)
  }

  return (
    <>
      <button
        type="button"
        aria-label={label}
        onClick={() => setOpen(true)}
        className={buttonClassName}
      >
        {children ?? <SearchIcon className="size-5" aria-hidden="true" />}
      </button>
      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search articles"
        description="Search the generated publication catalog."
      >
        <CommandInput placeholder="Search articles..." />
        <CommandList>
          <CommandEmpty>No articles found.</CommandEmpty>
          <CommandGroup heading="Articles">
            {articles.map((article) => (
              <CommandItem
                key={article.id}
                value={`${article.title} ${article.category} ${article.author} ${article.excerpt}`}
                onSelect={() => chooseArticle(article)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {article.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[article.category, article.author, article.date]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}

export function PublicationActionButton({
  action,
  children,
  disabled,
  lakebed,
  pendingChildren,
  source,
  type = 'button',
  ...buttonProps
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'onClick'> & {
  action: string
  children: ReactNode
  lakebed: PublicationLakebed
  pendingChildren?: ReactNode
  source?: string
}) {
  const recordPublicationAction = lakebed.useMutation('recordPublicationAction')
  const [isButtonPending, setIsButtonPending] = useState(false)

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        setIsButtonPending(true)
        void recordPublicationAction({ action, source }).then(
          () => setIsButtonPending(false),
          () => setIsButtonPending(false),
        )
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <PublicationMutationSpinner />)
        : children}
    </button>
  )
}

export function PublicationMobileMenu({
  brand,
  buttonClassName,
  children,
  homeTarget,
  label = 'Menu',
  nav,
}: {
  brand: string
  buttonClassName?: string
  children?: ReactNode
  homeTarget?: string
  label?: string
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
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] border-l border-border bg-background p-0 text-foreground sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="font-serif text-lg">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to a publication section.
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
        </div>
      </SheetContent>
    </Sheet>
  )
}
