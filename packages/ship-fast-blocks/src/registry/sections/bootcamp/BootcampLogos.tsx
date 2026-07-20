import { defineCapsule } from '#/capsules/openui.ts'
import { Fragment } from 'react'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * BootcampLogos — "Terminal Classroom" employer ledger strip for a coding
 * bootcamp / career-school landing page. A hairline-bordered band holding a
 * single asymmetric ledger row: a mono `$`-prefixed label on the left and a
 * slash-separated run of clickable mono uppercase company wordmarks on the
 * right; each wordmark routes through section-kit route links. Use immediately
 * after the hero to build credibility for bootcamps, dev academies, or
 * vocational programs by showing where graduates are placed.
 */
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const BootcampLogos = defineCapsule({
  name: 'BootcampLogos',
  description:
    'Terminal-styled employer ledger strip for a coding bootcamp / career-school landing page: a hairline-bordered band with a mono "$"-prefixed label on the left and a slash-separated run of clickable mono uppercase company wordmarks on the right, each routing through section-kit route links. Use immediately after the hero to build credibility for bootcamps, dev academies, or vocational programs by showing where graduates are placed.',
  props: z.object({
    /** Label above the logo strip. */
    label: z.string().optional(),
    /** Company name strings shown as clickable logo items. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel =
      props.label ?? 'Our graduates work at leading tech companies'
    const logoItems = props.items?.length
      ? props.items
      : ['GitHub', 'Google', 'Stripe', 'Airbnb', 'Shopify', 'Spotify']
    return (
      <LogoStrip
        className={cn('border-y border-border bg-background', props.className)}
      >
        <Container className="flex flex-col gap-4 py-8 lg:flex-row lg:items-center lg:gap-10">
          <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] normal-case tracking-[0.18em] text-foreground lg:max-w-56">
            <span aria-hidden="true" className="text-primary">
              ${' '}
            </span>
            {logosLabel}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="mt-0 justify-start gap-x-5 gap-y-3"
          >
            {logoItems.filter(Boolean).map((logo, i) => (
              <Fragment key={logo}>
                {i > 0 ? (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                ) : null}
                <LogoStripItem variant="opacity-hover" asChild>
                  <NavbarRouteLink
                    href={logo}
                    className="font-mono text-sm uppercase tracking-[0.15em]"
                  >
                    {logo}
                  </NavbarRouteLink>
                </LogoStripItem>
              </Fragment>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
