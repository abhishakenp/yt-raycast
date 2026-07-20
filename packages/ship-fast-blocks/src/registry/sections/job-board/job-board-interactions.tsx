import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
import { Loader2Icon, MenuIcon } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '#/components/ui/sheet.tsx'
import { cn } from '#/lib/utils.ts'
import type {
  jobBoardLakebed,
  JobBoardActionInput,
  JobBoardApplicationInput,
  JobBoardCatalogInput,
  JobBoardSearchInput,
} from './job-board-lakebed.ts'
import {
  AccountDropdown,
  AccountDropdownTrigger,
  AccountDropdownContent,
  AccountDropdownLabel,
  AccountDropdownSeparator,
  AccountDropdownSignOut,
  AccountDropdownUnauthenticated,
} from '#/section-kit/AccountDropdown.tsx'
import {
  CommandSearch,
  CommandSearchTrigger,
  CommandSearchContent,
  CommandSearchInput,
  CommandSearchList,
  CommandSearchEmpty,
  CommandSearchGroup,
} from '#/section-kit/CommandSearch.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export type JobBoardLakebed = LakebedClientRuntime<typeof jobBoardLakebed>

export function jobBoardCatalogItem({
  badge,
  company,
  description,
  logoAlt,
  posted,
  role,
  tags,
}: JobBoardCatalogInput): JobBoardCatalogInput {
  return {
    badge: badge ?? '',
    company: company ?? '',
    description: description ?? '',
    logoAlt: logoAlt ?? '',
    posted: posted ?? '',
    role,
    tags: tags ?? '',
  }
}

export function JobBoardMutationSpinner({ className }: { className?: string }) {
  return (
    <Loader2Icon
      className={cn('size-4 animate-spin', className)}
      aria-hidden="true"
    />
  )
}

export function JobBoardActionButton({
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
  lakebed: JobBoardLakebed
  pendingChildren?: ReactNode
  source?: string
}) {
  const recordJobBoardAction = useKeyedLakebedMutation(
    lakebed,
    'recordJobBoardAction',
  )
  const key = `${source ?? 'job-board'}\u0000${action}`
  const isButtonPending = recordJobBoardAction.isPending(key)
  const input: JobBoardActionInput =
    source === undefined ? { action } : { action, source }

  return (
    <button
      {...buttonProps}
      type={type}
      aria-busy={isButtonPending}
      disabled={disabled || isButtonPending}
      onClick={() => {
        void recordJobBoardAction.run(key, input).catch(() => {})
      }}
    >
      {isButtonPending
        ? (pendingChildren ?? <JobBoardMutationSpinner />)
        : children}
    </button>
  )
}

export function useSyncJobBoardCatalog(
  lakebed: JobBoardLakebed,
  items: JobBoardCatalogInput[],
) {
  const syncJobs = lakebed.useMutation('syncJobs')
  const syncJobsRef = useRef(syncJobs)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => jobBoardCatalogItem(item)),
    [itemKey],
  )

  useEffect(() => {
    syncJobsRef.current = syncJobs
  }, [syncJobs])

  useEffect(() => {
    if (!stableItems.length) return
    void syncJobsRef.current({ items: stableItems })
  }, [stableItems])
}

export function useJobBoardSearch(lakebed: JobBoardLakebed) {
  const state = lakebed.useQuery('jobBoardState')
  const setJobSearch = lakebed.useMutation('setJobSearch')

  const submitSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setJobSearch.isPending) return

      const form = event.currentTarget
      const formData = new FormData(form)
      const input: JobBoardSearchInput = {
        filter: 'All Jobs',
        location: String(formData.get('location') ?? ''),
        query: String(formData.get('query') ?? ''),
      }

      void setJobSearch(input)
    },
    [setJobSearch],
  )

  const chooseSearch = useCallback(
    (input: JobBoardSearchInput) => {
      if (setJobSearch.isPending) return
      void setJobSearch(input)
    },
    [setJobSearch],
  )

  return {
    chooseSearch,
    isPending: setJobSearch.isPending,
    state,
    submitSearch,
  }
}

export function useJobBoardActions(lakebed: JobBoardLakebed) {
  const state = lakebed.useQuery('jobBoardState')
  const applyToJob = lakebed.useMutation('applyToJob')
  const loadMoreJobs = lakebed.useMutation('loadMoreJobs')

  const apply = useCallback(
    async (input: JobBoardApplicationInput) => {
      if (applyToJob.isPending) return
      await applyToJob(input)
    },
    [applyToJob],
  )

  const loadMore = useCallback(async () => {
    if (loadMoreJobs.isPending) return
    await loadMoreJobs(3)
  }, [loadMoreJobs])

  return {
    apply,
    applicationCount: state?.applicationCount ?? 0,
    applications: state?.applications ?? [],
    applyPending: applyToJob.isPending,
    loadMore,
    loadMorePending: loadMoreJobs.isPending,
    state,
  }
}

export function JobBoardSearchButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Search',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: JobBoardLakebed
  label?: string
}) {
  const jobSearch = useJobBoardSearch(lakebed)
  const catalog = lakebed.useQuery('jobCatalog') ?? []

  return (
    <CommandSearch
      search={{
        items: catalog,
        getKey: (job) => job.id,
        getValue: (job) => `${job.role} ${job.company} ${job.tags}`,
        onSelect: (job) =>
          jobSearch.chooseSearch({
            filter: 'All Jobs',
            location: '',
            query: job.role,
          }),
      }}
    >
      <CommandSearchTrigger className={buttonClassName} aria-label={label}>
        {children}
      </CommandSearchTrigger>
      <CommandSearchContent
        title="Search jobs"
        description="Search the generated job catalog."
        className="rounded-none border-border"
      >
        <CommandSearchInput placeholder="Search jobs..." />
        <CommandSearchList>
          <CommandSearchEmpty>No jobs found.</CommandSearchEmpty>
          <CommandSearchGroup
            heading="Jobs"
            className="[&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-item]]:rounded-none"
          >
            {(job) => (
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{job.role}</p>
                <p className="truncate font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                  {[job.company, job.tags].filter(Boolean).join(' · ')}
                </p>
              </div>
            )}
          </CommandSearchGroup>
        </CommandSearchList>
      </CommandSearchContent>
    </CommandSearch>
  )
}

export function JobBoardAccountButton({
  buttonClassName,
  children,
  lakebed,
  label = 'Account',
}: {
  buttonClassName?: string
  children?: ReactNode
  lakebed: JobBoardLakebed
  label?: string
}) {
  return (
    <AccountDropdown auth={lakebed}>
      <AccountDropdownTrigger aria-label={label} className={buttonClassName}>
        {children}
      </AccountDropdownTrigger>
      <AccountDropdownContent className="rounded-none border-border">
        <AccountDropdownLabel />
        <AccountDropdownSeparator />
        <AccountDropdownSignOut className="rounded-none" />
      </AccountDropdownContent>
      <AccountDropdownUnauthenticated />
    </AccountDropdown>
  )
}

export function JobBoardMobileMenu({
  brand,
  buttonClassName,
  children,
  homeTarget,
  label = 'Open menu',
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
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button type="button" aria-label={label} className={buttonClassName}>
          {children ?? <MenuIcon className="size-5" aria-hidden="true" />}
        </button>
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-[min(100%,22rem)] rounded-none border-l border-border bg-background p-0 text-foreground shadow-none sm:max-w-[22rem]"
      >
        <SheetHeader className="border-b border-border px-5 py-4 text-left">
          <SheetTitle className="text-base font-semibold tracking-tight">
            {brand}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to job-board sections.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col divide-y divide-border px-3 py-2">
          <NavbarRouteLink
            className="rounded-none px-3 py-3.5 text-left font-mono text-xs uppercase tracking-[0.14em] text-foreground transition-colors hover:bg-muted active:translate-y-px"
            href={homeTarget ?? nav[0]}
            onClick={() => setOpen(false)}
          >
            Home
          </NavbarRouteLink>
          {nav.map((item) => (
            <NavbarRouteLink
              key={item}
              className="rounded-none px-3 py-3.5 text-left font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:translate-y-px"
              href={item}
              onClick={() => setOpen(false)}
            >
              {item}
            </NavbarRouteLink>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
