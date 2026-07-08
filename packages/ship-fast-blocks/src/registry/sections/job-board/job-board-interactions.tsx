import type { ButtonHTMLAttributes, FormEvent, ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'
import { useKeyedLakebedMutation } from '@ship-fast/lakebed/react'
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
} from '#/section-kit/index.ts'

export type JobBoardLakebed = LakebedClientRuntime<typeof jobBoardLakebed>

type JobCatalogItem = NonNullable<
  ReturnType<typeof jobBoardLakebed.queries.jobCatalog>
>[number]

export const jobBoardCatalogItem = ({
  badge,
  company,
  description,
  logoAlt,
  posted,
  role,
  tags,
}: JobBoardCatalogInput): JobBoardCatalogInput => ({
  badge: badge ?? '',
  company: company ?? '',
  description: description ?? '',
  logoAlt: logoAlt ?? '',
  posted: posted ?? '',
  role,
  tags: tags ?? '',
})

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
    (event: FormEvent<HTMLFormElement>) => {
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
  const [open, setOpen] = useState(false)
  const jobSearch = useJobBoardSearch(lakebed)
  const catalog = lakebed.useQuery('jobCatalog') ?? []

  const chooseJob = (job: JobCatalogItem) => {
    jobSearch.chooseSearch({
      filter: 'All Jobs',
      location: '',
      query: job.role,
    })
    setOpen(false)
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
        title="Search jobs"
        description="Search the generated job catalog."
      >
        <CommandInput placeholder="Search jobs..." />
        <CommandList>
          <CommandEmpty>No jobs found.</CommandEmpty>
          <CommandGroup heading="Jobs">
            {catalog.map((job) => (
              <CommandItem
                key={job.id}
                value={`${job.role} ${job.company} ${job.tags}`}
                onSelect={() => chooseJob(job)}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{job.role}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[job.company, job.tags].filter(Boolean).join(' · ')}
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
      <AccountDropdownContent>
        <AccountDropdownLabel />
        <AccountDropdownSeparator />
        <AccountDropdownSignOut />
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
  const go = useNavigate()

  const navigate = (target?: string) => {
    setOpen(false)
    go(target)
  }

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
          <SheetTitle className="text-base font-semibold">{brand}</SheetTitle>
          <SheetDescription className="sr-only">
            Navigate to job-board sections.
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
