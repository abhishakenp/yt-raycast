import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Logo as BrandLogo, LogoImage, LogoLabel } from '#/section-kit/Logo.tsx'
import {
  NavbarActions,
  NavbarBrand,
  NavbarNav,
  NavbarNavLink,
  SiteNav,
} from '#/section-kit/SiteNav.tsx'
import { jobBoardLakebed } from './job-board-lakebed.ts'
import {
  JobBoardAccountButton,
  JobBoardActionButton,
  JobBoardMobileMenu,
  JobBoardMutationSpinner,
  JobBoardSearchButton,
} from './job-board-interactions.tsx'

/**
 * JobBoardNavbar — newsprint classifieds masthead navigation for a job-board /
 * careers marketplace. A backdrop-blurred paper-surface header pinned to the top
 * with a hairline briefcase glyph + serif wordmark on the left, mono uppercase
 * index-style nav links in the center (desktop), and a right-side cluster of
 * square hairline search / account chips plus a sharp-cornered primary
 * "Post a Job" stamp CTA with press feedback. Every link and CTA routes through
 * route hrefs so labels can drive page-switching; links beyond the fifth demote
 * to large screens. Use as the sticky site header for job boards, careers sites,
 * hiring marketplaces, recruiting platforms or talent networks. Renders fully
 * with no props via baked-in "WorkFlow" defaults.
 */
export const JobBoardNavbar = defineCapsule({
  name: 'JobBoardNavbar',
  description:
    "Newsprint classifieds masthead navigation for a job-board / careers marketplace: a backdrop-blurred paper-surface sticky header with a hairline briefcase glyph + serif wordmark on the left, mono uppercase index-style nav links in the center (desktop), and a right-side cluster of square hairline search / account chips plus a sharp-cornered primary 'Post a Job' stamp CTA with press feedback. Links and CTAs route through route hrefs for page-switching. Use as the sticky site header for job boards, careers sites, hiring marketplaces, recruiting platforms or talent networks.",
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
    const brand = props.brand ?? 'WorkFlow'
    const nav = props.nav?.length
      ? props.nav
      : ['Browse Jobs', 'Companies', 'Categories', 'Success Stories']
    const signIn = props.signIn ?? 'Sign In'
    const cta = props.cta ?? 'Post a Job'
    const homeTarget = props.homeTarget ?? nav[0]

    const BriefcaseMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="7" width="20" height="14" rx="2" />
        <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
      </svg>
    )

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn('bg-background/80 backdrop-blur-md', props.className)}
      >
        <NavbarBrand href={homeTarget} className="flex items-center gap-2">
          <BrandLogo brand={brand} className="flex items-center gap-2">
            <LogoImage
              className="size-7"
              fallback={<BriefcaseMark className="size-7 text-foreground" />}
            />
            <LogoLabel className="font-serif text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-1">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'rounded-none font-mono text-[11px] uppercase tracking-[0.14em]',
                i >= 5 && 'hidden lg:inline-flex',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2 sm:gap-3">
          <JobBoardSearchButton
            lakebed={lakebed}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px"
          />
          <JobBoardAccountButton
            lakebed={lakebed}
            label={signIn}
            buttonClassName="hidden size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px sm:inline-flex"
          />
          <JobBoardActionButton
            lakebed={lakebed}
            action={cta}
            source="navbar"
            pendingChildren={<JobBoardMutationSpinner />}
            className="hidden min-h-9 items-center justify-center whitespace-nowrap rounded-none bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:translate-y-px disabled:pointer-events-none disabled:opacity-60 md:inline-flex"
          >
            {cta}
          </JobBoardActionButton>
          <JobBoardMobileMenu
            brand={brand}
            homeTarget={homeTarget}
            nav={nav}
            buttonClassName="inline-flex size-9 items-center justify-center rounded-none border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground active:translate-y-px md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
