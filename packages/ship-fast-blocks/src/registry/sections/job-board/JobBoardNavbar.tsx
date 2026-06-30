import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import {
  JobBoardAccountButton,
  JobBoardActionButton,
  JobBoardMobileMenu,
  JobBoardMutationSpinner,
  JobBoardSearchButton,
} from './job-board-interactions.tsx'

/**
 * JobBoardNavbar — sticky, backdrop-blurred top navigation bar for a job-board /
 * careers marketplace. A border-bottomed header pinned to the top of the
 * viewport: a briefcase brand-mark tile beside the product name on the left, a
 * horizontal set of nav links in the center (desktop), and a "Sign In" text link
 * plus a solid primary "Post a Job" CTA on the right. Every link and CTA routes
 * through useNavigate so labels can drive page-switching. Use as the sticky site
 * header for job boards, careers sites, hiring marketplaces, recruiting platforms
 * or talent networks. Renders fully with no props via baked-in "WorkFlow"
 * defaults.
 */
export const JobBoardNavbar = defineCapsule({
  name: 'JobBoardNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for a job-board / careers marketplace: border-bottomed header pinned to the top with a briefcase brand-mark tile + product name on the left, horizontal nav links in the center (desktop), and a 'Sign In' text link plus a solid primary 'Post a Job' CTA on the right. Links and CTAs route through useNavigate for page-switching. Use as the sticky site header for job boards, careers sites, hiring marketplaces, recruiting platforms or talent networks.",
  props: z.object({
    /** Brand / product name shown beside the briefcase mark. */
    brand: z.string().optional(),
    /** Nav link labels (should match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Right-side secondary text link label. */
    signIn: z.string().optional(),
    /** Right-side solid primary CTA label. */
    cta: z.string().optional(),
    /** Where the logo/brand click navigates. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: jobBoardLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'WorkFlow'
    const nav = props.nav?.length
      ? props.nav
      : ['Browse Jobs', 'Companies', 'Categories', 'Success Stories']
    const signIn = props.signIn ?? 'Sign In'
    const cta = props.cta ?? 'Post a Job'
    const homeTarget = props.homeTarget ?? nav[0]

    const BriefcaseMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-primary text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        <svg
          width="60%"
          height="60%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
        </svg>
      </span>
    )

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(homeTarget)}
              className="flex items-center gap-2 text-foreground"
            >
              <BrandLogo
                brand={brand}
                fallback={<BriefcaseMark className="size-8" />}
                labelClassName="text-xl font-semibold tracking-tight"
              />
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <JobBoardSearchButton
                lakebed={lakebed}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              />
              <JobBoardAccountButton
                lakebed={lakebed}
                label={signIn}
                buttonClassName="hidden size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:inline-flex"
              />
              <JobBoardActionButton
                lakebed={lakebed}
                action={cta}
                source="navbar"
                pendingChildren={<JobBoardMutationSpinner />}
                className="hidden min-h-10 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
              >
                {cta}
              </JobBoardActionButton>
              <JobBoardMobileMenu
                brand={brand}
                homeTarget={homeTarget}
                nav={nav}
                buttonClassName="inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
