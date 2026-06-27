import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import {
  AutoAccountButton,
  AutoLeadActionButton,
  AutoLeadBadge,
  AutoMobileMenu,
  AutoMutationSpinner,
  AutoSearchButton,
} from './auto-dealership-interactions.tsx'
import { autoDealershipLakebed } from './auto-dealership-lakebed.ts'

/**
 * AutoDealershipNavbar — sticky, blurred top navigation bar for an auto
 * dealership / used-car site. A border-bottomed header pinned to the top with a
 * wordmark brand button on the left, a horizontal set of nav links in the
 * center (desktop), plus vehicle search, Shoo account, latest lead badge, phone
 * and a solid primary "Book Test Drive" CTA on the right. Nav links route through
 * useNavigate; phone and CTA write Lakebed lead/test-drive intents. Use as the sticky site header
 * for car dealerships, used-car lots, certified pre-owned sellers, auto sales
 * groups, or EV/hybrid showrooms. Renders fully with no props via baked-in
 * "Meridian Motors" defaults.
 */
export const AutoDealershipNavbar = defineCapsule({
  name: 'AutoDealershipNavbar',
  description:
    "Sticky backdrop-blurred top navigation bar for an auto dealership / used-car site: a border-bottomed header pinned to the top with a wordmark brand button on the left, horizontal nav links in the center (desktop), and vehicle command search, Shoo account dropdown, latest lead badge, phone action, solid primary 'Book Test Drive' CTA, and Sheet mobile menu on the right. Nav links route through useNavigate; phone and CTA write Lakebed lead/test-drive intents. Use as the sticky site header for car dealerships, used-car lots, certified pre-owned sellers, auto sales groups, or EV/hybrid showrooms.",
  props: z.object({
    /** Dealership brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Nav link labels; the first item also drives the brand/home target. */
    nav: z.array(z.string()).optional(),
    /** Phone number shown as a routable link (desktop). */
    phone: z.string().optional(),
    /** Solid primary CTA label on the right. */
    cta: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: autoDealershipLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Meridian Motors'
    const nav = props.nav?.length
      ? props.nav
      : ['Inventory', 'Financing', 'About', 'Reviews', 'FAQ']
    const phone = props.phone ?? '(555) 0127-456'
    const cta = props.cta ?? 'Book Test Drive'

    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm',
          props.className,
        )}
      >
        <nav
          className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex h-16 items-center justify-between lg:h-20">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2 text-xl font-semibold tracking-tight lg:text-2xl"
            >
              {brand}
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
            <div className="flex items-center gap-4">
              <AutoLeadBadge lakebed={lakebed} />
              <AutoSearchButton
                lakebed={lakebed}
                buttonClassName="hidden p-2 text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              />
              <AutoAccountButton
                lakebed={lakebed}
                buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground"
              />
              <AutoLeadActionButton
                lakebed={lakebed}
                action="call"
                label={phone}
                intentKey="navbar-phone"
                source="navbar"
                className="hidden text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:block"
              >
                {phone}
              </AutoLeadActionButton>
              <AutoLeadActionButton
                lakebed={lakebed}
                action="test_drive"
                label={cta}
                intentKey="navbar-test-drive"
                source="navbar"
                pendingChildren={
                  <>
                    <AutoMutationSpinner />
                    Sending
                  </>
                }
                className="hidden items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70 sm:inline-flex"
              >
                {cta}
              </AutoLeadActionButton>
              <AutoMobileMenu
                brand={brand}
                ctaLabel={cta}
                homeTarget={nav[0]}
                lakebed={lakebed}
                nav={nav}
                buttonClassName="p-2 text-muted-foreground transition-colors hover:text-foreground md:hidden"
              />
            </div>
          </div>
        </nav>
      </header>
    )
  },
})
