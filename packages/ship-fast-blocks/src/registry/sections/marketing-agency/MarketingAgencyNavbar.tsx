import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'
import { MobileNavDrawer } from '#/section-kit/MobileNavDrawer.tsx'

/**
 * MarketingAgencyNavbar — sticky, translucent top navigation bar for a growth /
 * digital marketing-agency site. A backdrop-blurred, border-bottomed header
 * pinned to the top with a layered-diamond brand glyph beside the agency name on
 * the left, horizontal nav links plus a rounded pill primary CTA on the right
 * (desktop), and a hamburger menu button on mobile. The last nav item drives the
 * CTA target; every link routes through useNavigate for page-switching. Use as
 * the sticky site header for marketing / growth agencies, SEO / paid-ads shops,
 * lead-gen consultancies, or B2B SaaS growth firms. Renders fully with no props.
 */
import { Container } from '#/section-kit/Container.tsx'
export const MarketingAgencyNavbar = defineCapsule({
  name: 'MarketingAgencyNavbar',
  description:
    'Sticky translucent top navigation bar for a growth / digital marketing-agency site: backdrop-blurred, border-bottomed header pinned to the top with a layered-diamond brand glyph + agency name on the left, horizontal nav links and a rounded pill primary CTA on the right (desktop), and a hamburger menu button on mobile. The last nav item drives the CTA target; links route through useNavigate for page-switching. Use as the sticky site header for marketing / growth agencies, SEO / paid-ads shops, lead-gen consultancies, or B2B SaaS growth firms.',
  props: z.object({
    /** Agency / brand name shown beside the logo glyph. */
    brand: z.string().optional(),
    /** Nav link labels; last item also drives the pill CTA target. */
    nav: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Nexus Growth'
    const nav = props.nav?.length
      ? props.nav
      : ['Services', 'Case Studies', 'Pricing', 'FAQ', 'Get Started']
    const navCta = nav[nav.length - 1]
    const LogoMark = ({ className }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className={className}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    )
    return (
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md',
          props.className,
        )}
      >
        <Container>
          <div className="flex h-16 items-center justify-between">
            <button
              type="button"
              onClick={() => go(nav[0])}
              className="flex items-center gap-2"
            >
              <BrandLogo
                brand={brand}
                fallback={<LogoMark className="size-8 text-foreground" />}
                labelClassName="text-lg font-semibold tracking-tight"
              />
            </button>
            <div className="hidden items-center gap-8 md:flex">
              {nav.slice(0, -1).map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => go(label)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => go(navCta)}
                className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {navCta}
              </button>
            </div>
            <MobileNavDrawer
              brand={brand}
              nav={nav}
              homeTarget={nav[0]}
              cta={{
                label: navCta,
                target: navCta,
              }}
              label="Menu"
              buttonClassName="p-2 text-foreground md:hidden"
            />
          </div>
        </Container>
      </header>
    )
  },
})
