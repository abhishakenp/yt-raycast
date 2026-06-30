import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * MarketingFooter — a slim single-row footer for a SaaS / product-marketing
 * landing page. A border-top band laying out, on one row (stacking on mobile),
 * an indigo brand-initial logo tile + product name on the left, a wrapping row
 * of muted text links in the middle, and a copyright line on the right. Clean
 * premium indigo-on-light aesthetic; brand button + links route through
 * useNavigate. Use as the closing footer for B2B SaaS, productivity, or
 * developer-platform pages.
 */
export const MarketingFooter = defineCapsule({
  name: 'MarketingFooter',
  description:
    'Slim single-row footer for a SaaS / product-marketing landing page: a border-top band laying out, on one row (stacking on mobile), an indigo brand-initial logo tile + product name on the left, a wrapping row of muted text links in the middle, and a copyright line on the right. Clean premium indigo-on-light aesthetic; brand button + links route through useNavigate. Use as the closing footer for B2B SaaS, productivity, or developer-platform pages.',
  props: z.object({
    /** Brand / product name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Navigation target for the brand logo button (e.g. nav[0]). */
    homeTarget: z.string().optional(),
    links: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Flowstate'
    const homeTarget = props.homeTarget ?? 'Features'
    const links = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Security', 'Contact']
    const copyright =
      props.copyright ??
      `© ${new Date().getFullYear()} ${brand}, Inc. All rights reserved.`

    // Brand logo mark — indigo tile + brand initial (decorative brand asset).
    const LogoMark = ({ className }: { className?: string }) => (
      <span
        className={cn(
          'grid size-8 place-items-center rounded-lg bg-primary text-sm font-bold text-primary-foreground',
          className,
        )}
      >
        {brand.charAt(0)}
      </span>
    )

    return (
      <footer className={cn('border-t border-border py-10', props.className)}>
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-center sm:flex-row sm:text-left">
          <button
            type="button"
            onClick={() => go(homeTarget)}
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-foreground"
          >
            <BrandLogo
              brand={brand}
              fallback={<LogoMark className="size-6 text-xs" />}
              className="size-6"
            />
          </button>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
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
          <p className="text-sm text-muted-foreground">{copyright}</p>
        </div>
      </footer>
    )
  },
})
