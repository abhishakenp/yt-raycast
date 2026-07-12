import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * AgencyFooter — slim bottom footer for a creative digital-agency site. A
 * single bordered-top row (stacks on mobile): a gradient brand-initial logo
 * tile + studio name on the left, an auto-updating copyright line in the
 * center, and a set of legal/utility links on the right. The brand button and
 * every link route through useNavigate. Use as the closing site footer for
 * agencies, studios, branding shops, or any minimal premium landing page.
 * Renders fully with no props via baked-in "Studio Rise" defaults.
 */
export const AgencyFooter = defineCapsule({
  name: 'AgencyFooter',
  description:
    'Slim bottom footer for a creative digital-agency site: a single bordered-top row (stacks on mobile) with a gradient brand-initial logo tile + studio name on the left, an auto-updating copyright line in the center, and a set of legal/utility links on the right. The brand button and every link route through useNavigate. Use as the closing site footer for agencies, studios, branding shops, or any minimal premium landing page.',
  props: z.object({
    /** Brand / studio name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels on the right. */
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Studio Rise'
    const note = props.note ?? 'All rights reserved.'
    const links = props.links?.length ? props.links : ['Privacy', 'Terms']
    const homeTarget = props.homeTarget ?? 'Services'

    const LogoMark = ({ className }) => (
      <span
        className={cn(
          'grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent font-black text-primary-foreground',
          className,
        )}
        aria-hidden="true"
      >
        {brand.charAt(0).toUpperCase()}
      </span>
    )

    return (
      <footer className={cn('border-t border-border py-10', props.className)}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground md:flex-row">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-muted-foreground"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-6 text-xs" />}
              className="size-6"
            />
          </button>
          <div>
            © {new Date().getFullYear()} {brand}. {note}
          </div>
          <div className="flex items-center gap-6">
            {links.map((link) => (
              <button
                key={link}
                type="button"
                onClick={() => go(link)}
                className="transition-colors hover:text-foreground"
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    )
  },
})
