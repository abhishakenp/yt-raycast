import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { Image } from '#/lib/img.tsx'
import { Card } from '#/section-kit/Card.tsx'
import { FilterChip } from '#/section-kit/FilterChip.tsx'
import { JobList, JobItem } from '#/section-kit/JobList.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import {
  jobBoardCatalogItem,
  useJobBoardActions,
  useJobBoardSearch,
  useSyncJobBoardCatalog,
} from './job-board-interactions.tsx'

/**
 * JobBoardJobs — a classified-ads ledger of featured job listings for a
 * job-board / careers site. An asymmetric hairline header (serif heading +
 * description left, mono "view all" clear action right), a row of sharp-cornered
 * stamp filter chips, then a hairline-divided collapsed-border stack of listing
 * rows — each with an index numeral, a sharp company logo thumbnail, the role
 * title, an optional rotated New/Featured stamp, a mono company + location line,
 * mono tabular skill/salary stamp tags, a clamped description, a mono posted-date
 * and a sharp Apply stamp button — closing with a centered mono "load more"
 * stamp. Filters read/write shared Lakebed search state, applications are
 * recorded, and load-more changes the visible job count. Use as the primary
 * listings feed on job boards, hiring marketplaces or talent networks. Renders
 * fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { Watermark } from '#/section-kit/Decor.tsx'
export const JobBoardJobs = defineCapsule({
  name: 'JobBoardJobs',
  description:
    'Classified-ads ledger of featured job listings for a job-board / careers site: an asymmetric hairline header (serif heading and description left, mono view-all clear action right), a row of sharp-cornered stamp filter chips, then a hairline-divided collapsed-border stack of listing rows — each with an index numeral, a sharp company logo thumbnail, the role title, an optional rotated New/Featured stamp, a mono company + location line, mono tabular skill/salary stamp tags, a clamped description, a mono posted-date and a sharp Apply stamp button — closing with a centered mono load-more stamp. The feed reacts to shared Lakebed search criteria from JobBoardHero, filters write the same search state, Apply records applications, and Load more updates visible count. Use as the primary listings feed on job boards, hiring marketplaces or talent networks.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Supporting description under the heading. */
    description: z.string().optional(),
    /** "View all" arrow link label. */
    viewAll: z.string().optional(),
    /** Pill filter chip labels (first renders active). */
    filters: z.array(z.string()).optional(),
    /** Bottom "load more" button label. */
    loadMore: z.string().optional(),
    /** Per-card Apply button label. */
    applyLabel: z.string().optional(),
    /** Job cards. */
    items: z
      .array(
        z.object({
          role: z.string(),
          company: z.string(),
          logoAlt: z.string(),
          tags: z.array(z.string()),
          description: z.string(),
          posted: z.string(),
          badge: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: jobBoardLakebed,
  component: ({ props, lakebed }) => {
    const jobSearch = useJobBoardSearch(lakebed)
    const jobActions = useJobBoardActions(lakebed)
    const [pendingRole, setPendingRole] = useState('')
    const heading = props.heading ?? 'Featured jobs'
    const description =
      props.description ?? 'Hand-picked opportunities from top companies'
    const viewAll = props.viewAll ?? 'View all 12,483 jobs'
    const loadMore = props.loadMore ?? 'Load more jobs'
    const applyLabel = props.applyLabel ?? 'Apply Now'
    const filters = props.filters?.length
      ? props.filters
      : ['All Jobs', 'Remote', 'Engineering', 'Design', 'Full-time', 'Contract']
    const items = props.items?.length
      ? props.items
      : [
          {
            role: 'Senior Frontend Engineer',
            company: 'Stripe — San Francisco, CA or Remote',
            logoAlt: 'Stripe company logo mark',
            tags: ['React', 'TypeScript', 'Remote', '$140k–$190k'],
            description:
              'Join our payments platform team building the future of internet commerce. Work on high-scale systems processing billions in transactions annually.',
            posted: '2 days ago',
            badge: 'New',
          },
          {
            role: 'Product Designer',
            company: 'Notion — New York, NY (Hybrid)',
            logoAlt: 'Notion productivity app logo mark',
            tags: ['Figma', 'Design Systems', 'Hybrid', '$120k–$160k'],
            description:
              'Shape the future of connected workspaces. Design intuitive features that help millions of users organize their work and lives.',
            posted: '4 days ago',
          },
          {
            role: 'Engineering Manager',
            company: 'Figma — San Francisco, CA or Remote',
            logoAlt: 'Figma collaborative design tool logo mark',
            tags: ['Leadership', 'TypeScript', 'Remote', '$180k–$240k'],
            description:
              'Lead a team of 8-10 engineers building the multiplayer editing experience. Drive technical strategy and mentorship.',
            posted: '1 week ago',
          },
          {
            role: 'Senior Backend Engineer',
            company: 'Shopify — Toronto, ON or Remote',
            logoAlt: 'Shopify e-commerce platform logo mark',
            tags: ['Ruby on Rails', 'MySQL', 'Remote', '$130k–$175k'],
            description:
              'Build commerce infrastructure used by millions of merchants worldwide. Scale systems handling peak loads during Black Friday and flash sales.',
            posted: '3 days ago',
            badge: 'Featured',
          },
          {
            role: 'Full Stack Developer',
            company: 'Linear — Remote (Global)',
            logoAlt: 'Linear project management tool logo mark',
            tags: ['React', 'GraphQL', 'Remote', '$150k–$200k'],
            description:
              'Help build the future of issue tracking and project management. Work across the stack to deliver fast, keyboard-first experiences.',
            posted: '5 days ago',
          },
          {
            role: 'Developer Relations Engineer',
            company: 'Vercel — Remote (US)',
            logoAlt: 'Vercel deployment platform logo mark',
            tags: ['Next.js', 'Community', 'Remote', '$110k–$150k'],
            description:
              'Educate and inspire developers building on the Next.js ecosystem. Create content, speak at events, and build meaningful community connections.',
            posted: '1 week ago',
          },
        ]
    const syncedJobs = items.map((job) =>
      jobBoardCatalogItem({
        ...job,
        tags: job.tags.join(' '),
      }),
    )
    useSyncJobBoardCatalog(lakebed, syncedJobs)
    const activeFilter = jobActions.state?.filter ?? 'All Jobs'
    const activeLocation = jobActions.state?.location.toLowerCase() ?? ''
    const activeQuery = jobActions.state?.query.toLowerCase() ?? ''
    const visibleCount = jobActions.state?.visibleCount ?? 3
    const appliedRoles = new Set(
      jobActions.applications.map((application) => application.role),
    )
    const matchesSearch = (job: (typeof items)[number]) => {
      const haystack = [job.role, job.company, job.description, ...job.tags]
        .join(' ')
        .toLowerCase()
      const locationMatches =
        !activeLocation || job.company.toLowerCase().includes(activeLocation)
      const queryMatches = !activeQuery || haystack.includes(activeQuery)
      const filterMatches =
        activeFilter === 'All Jobs' ||
        haystack.includes(activeFilter.toLowerCase())
      return locationMatches && queryMatches && filterMatches
    }
    const matchingItems = items.filter(matchesSearch)
    const visibleItems = matchingItems.slice(0, visibleCount)
    const ArrowRight = ({ className }: { className?: string }) => (
      <svg
        className={className}
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    )
    return (
      <section
        className={cn(
          'relative overflow-hidden bg-background py-16 lg:py-24',
          props.className,
        )}
      >
        <Watermark className="-right-4 top-8 font-serif text-[7rem] sm:text-[10rem] lg:text-[13rem]">
          WANTED
        </Watermark>
        <Container className="relative">
          <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              align="left"
              title={heading}
              subtitle={description}
              className="max-w-2xl gap-2"
              titleClassName="font-serif text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
              subtitleClassName="text-muted-foreground"
            />
            <button
              type="button"
              onClick={() =>
                jobSearch.chooseSearch({
                  filter: 'All Jobs',
                  location: '',
                  query: '',
                })
              }
              className="inline-flex shrink-0 items-center gap-2 border-b border-foreground pb-0.5 text-left font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors hover:text-muted-foreground active:translate-y-px sm:text-right"
            >
              {viewAll}
              <ArrowRight className="size-3.5" />
            </button>
          </div>

          <div className="mb-6 flex flex-wrap gap-2">
            {filters.map((filter, i) => {
              const isActive =
                activeFilter === filter || (i === 0 && !activeFilter)
              return (
                <FilterChip
                  key={filter}
                  active={isActive}
                  variant={isActive ? 'solid' : 'muted'}
                  className="rounded-none border border-foreground/60 font-mono text-[11px] uppercase tracking-[0.1em] transition-[background-color,transform] active:translate-y-px"
                  onClick={() =>
                    jobSearch.chooseSearch({
                      filter,
                      location: filter === 'Remote' ? 'Remote' : '',
                      query: '',
                    })
                  }
                >
                  {filter}
                </FilterChip>
              )
            })}
          </div>

          <p
            className="mb-5 font-mono text-xs text-muted-foreground"
            aria-live="polite"
          >
            {matchingItems.length} matching job
            {matchingItems.length === 1 ? '' : 's'}
            {jobActions.applicationCount
              ? ` · ${jobActions.applicationCount} application${jobActions.applicationCount === 1 ? '' : 's'} started`
              : ''}
          </p>

          <JobList className="gap-0 divide-y divide-border border-y border-border">
            {visibleItems.map((job, i) => {
              const applied = appliedRoles.has(job.role)
              const pending = pendingRole === job.role
              return (
                <JobItem key={job.role}>
                  <Card className="group rounded-none border-0 bg-transparent p-0 py-6 transition-colors hover:bg-muted/40">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[auto_1fr_auto] sm:gap-6">
                      <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:gap-3">
                        <span
                          aria-hidden="true"
                          className="font-mono text-[11px] tabular-nums text-muted-foreground/70"
                        >
                          {String(i + 1).padStart(3, '0')}
                        </span>
                        <Image
                          alt={job.logoAlt}
                          w={100}
                          h={100}
                          loading="lazy"
                          className="size-12 shrink-0 rounded-none border border-border object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1.5 flex flex-wrap items-center gap-3">
                          <h3 className="font-serif text-lg font-bold tracking-tight text-foreground">
                            {job.role}
                          </h3>
                          {job.badge ? (
                            <span
                              className={cn(
                                'inline-flex rotate-[-2deg] items-center border px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em]',
                                job.badge === 'New'
                                  ? 'border-primary text-primary'
                                  : 'border-foreground/60 text-foreground',
                              )}
                            >
                              {job.badge}
                            </span>
                          ) : null}
                        </div>
                        <p className="mb-3 font-mono text-xs uppercase tracking-[0.08em] text-muted-foreground">
                          {job.company}
                        </p>
                        <div className="mb-3 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span
                              key={tag}
                              className="border border-border px-2 py-0.5 font-mono text-[11px] tabular-nums text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <p className="line-clamp-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                          {job.description}
                        </p>
                      </div>
                      <div className="flex flex-row items-center justify-between gap-3 sm:flex-col sm:items-end sm:justify-start sm:gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">
                          {job.posted}
                        </span>
                        <button
                          type="button"
                          aria-busy={pending}
                          disabled={pending || applied}
                          onClick={() => {
                            setPendingRole(job.role)
                            void jobActions
                              .apply({
                                company: job.company,
                                role: job.role,
                              })
                              .then(
                                () => setPendingRole(''),
                                () => setPendingRole(''),
                              )
                          }}
                          className="inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-none bg-primary px-5 text-sm font-medium text-primary-foreground transition-[background-color,transform] hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-70"
                        >
                          {pending
                            ? 'Applying'
                            : applied
                              ? 'Applied'
                              : applyLabel}
                        </button>
                      </div>
                    </div>
                  </Card>
                </JobItem>
              )
            })}
            {!visibleItems.length ? (
              <Card className="rounded-none border-dashed p-8 text-center font-mono text-sm text-muted-foreground">
                No jobs match the current search.
              </Card>
            ) : null}
          </JobList>

          <div className="mt-10 flex justify-center">
            <button
              type="button"
              aria-busy={jobActions.loadMorePending}
              disabled={
                jobActions.loadMorePending ||
                visibleItems.length >= matchingItems.length
              }
              onClick={() => {
                void jobActions.loadMore()
              }}
              className="inline-flex min-h-11 items-center justify-center rounded-none border-2 border-foreground px-6 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-[background-color,color,transform] hover:bg-foreground hover:text-background active:translate-y-px disabled:pointer-events-none disabled:opacity-50"
            >
              {jobActions.loadMorePending ? 'Loading' : loadMore}
            </button>
          </div>
        </Container>
      </section>
    )
  },
})
