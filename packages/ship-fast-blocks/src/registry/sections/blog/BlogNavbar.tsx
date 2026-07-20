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
} from '#/section-kit/index.ts'
import {
  PublicationAccountButton,
  PublicationMobileMenu,
  PublicationSearchButton,
  PublicationSubscribeDrawer,
} from './publication-interactions.tsx'
import { publicationLakebed } from './publication-lakebed.ts'

/**
 * BlogNavbar — sticky newsprint masthead header for a blog, magazine,
 * newsroom, or content hub. A serif wordmark beside a square ink-block quill
 * mark, mono small-caps nav links separated by hairline column rules on
 * desktop, command article search, a Shoo profile dropdown, a Lakebed
 * subscribe drawer behind a square invert-on-hover "Subscribe" button, and a
 * real mobile drawer (Sheet) on small screens. The bar keeps its backdrop blur
 * and closes with a heavy masthead rule (thick + hairline double border). No
 * phone number — editorial publications don't show one. Use as the header for
 * blogs, publications, journals, or any content site. Renders fully with no
 * props.
 */
function QuillMark({ className }: { className?: string }) {
  return (
    <span
      className={`grid size-8 shrink-0 place-items-center rounded-none bg-foreground text-background ${className ?? ''}`}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="5" cy="19" r="2" />
        <circle cx="19" cy="5" r="2" />
        <path d="M5 17C5 9 11 5 17 5" />
      </svg>
    </span>
  )
}

export const BlogNavbar = defineCapsule({
  name: 'BlogNavbar',
  description:
    "Sticky newsprint masthead header for a blog, magazine, newsroom, or content hub: a serif wordmark beside a square ink-block quill mark, mono small-caps desktop nav links separated by hairline column rules, command article search, a Shoo profile dropdown, a Lakebed subscribe drawer behind a square invert-on-hover Subscribe button, and a real mobile drawer. Keeps backdrop blur and closes with a heavy double masthead rule. No phone number — editorial publications don't show one. Use as the header for blogs, publications, journals, or any content site.",
  props: z.object({
    /** Brand / publication name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Nav link labels (must match site routes for page switching). */
    nav: z.array(z.string()).optional(),
    /** Navigation target for the logo / brand click. */
    homeTarget: z.string().optional(),
    /** Pill-shaped CTA label on the right. */
    ctaLabel: z.string().optional(),
    /** Navigation target for the pill CTA. */
    ctaTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: publicationLakebed,
  component: ({ props, lakebed }) => {
    const nav = props.nav?.length
      ? props.nav
      : ['Home', 'Design', 'Engineering', 'Product', 'About']
    const brand = props.brand ?? 'Form & Function'
    const homeTarget = props.homeTarget ?? nav[0]
    const ctaLabel = props.ctaLabel ?? 'Subscribe'
    const ctaTarget = props.ctaTarget ?? 'Subscribe'

    return (
      <SiteNav
        position="sticky"
        height="compact"
        className={cn(
          'border-b-2 border-foreground bg-background/95 shadow-[0_2px_0_0] shadow-border',
          props.className,
        )}
      >
        <NavbarBrand href={homeTarget} className="min-w-0">
          <BrandLogo brand={brand} className="flex items-center gap-2.5">
            <LogoImage fallback={<QuillMark />} className="size-8" />
            <LogoLabel className="font-serif text-xl font-bold tracking-tight text-foreground" />
          </BrandLogo>
        </NavbarBrand>

        <NavbarNav className="gap-0">
          {nav.map((label, i) => (
            <NavbarNavLink
              key={label}
              href={label}
              className={cn(
                'px-3 font-mono text-[11px] font-normal uppercase tracking-[0.18em] transition-colors hover:text-foreground',
                i > 0 && 'border-l border-border',
                label === homeTarget
                  ? 'text-foreground underline decoration-2 underline-offset-4'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </NavbarNavLink>
          ))}
        </NavbarNav>

        <NavbarActions className="gap-2.5">
          <PublicationSearchButton
            lakebed={lakebed}
            buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          />
          <PublicationAccountButton
            lakebed={lakebed}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
          />
          <PublicationSubscribeDrawer
            lakebed={lakebed}
            buttonLabel={ctaLabel}
            source={ctaTarget}
            buttonClassName="hidden rounded-none border border-foreground bg-foreground px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-background transition-colors duration-150 hover:bg-background hover:text-foreground active:translate-y-px sm:inline-flex"
          />
          <PublicationMobileMenu
            brand={brand}
            nav={nav}
            homeTarget={homeTarget}
            buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
          />
        </NavbarActions>
      </SiteNav>
    )
  },
})
