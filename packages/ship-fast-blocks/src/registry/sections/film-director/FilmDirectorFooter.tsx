import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * FilmDirectorFooter — a slim, inverted "end of reel" footer for a film director
 * or cinematographer portfolio. A bg-foreground/text-background band (token-driven
 * so it flips with the theme) whose left column stacks a mono "[ END OF REEL ]"
 * slate tag, a giant credits-style UPPERCASE extrabold wordmark, and a mono
 * dynamic-year copyright line (brand + note), beside a right-aligned stack of
 * mono, tracked block links that brighten on hover. Links route through
 * section-kit route links. Use as the closing site footer for filmmakers,
 * directors, DPs, or production houses.
 */
import {
  SiteFooter,
  FooterContent,
  FooterCopyright,
} from '#/section-kit/SiteFooter.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'
export const FilmDirectorFooter = defineCapsule({
  name: 'FilmDirectorFooter',
  description:
    'Slim, inverted "end of reel" footer for a film director or cinematographer portfolio: a bg-foreground/text-background band (token-driven, theme-adaptive) pairing a mono end-of-reel slate tag, a giant credits-style UPPERCASE extrabold wordmark, and a mono dynamic-year copyright line (brand + note) on the left with a right-aligned stack of mono tracked block links that brighten on hover. Links route through section-kit route links. Use as the closing site footer for filmmakers, directors, DPs, or production houses.',
  props: z.object({
    /** Director / studio name shown in the copyright line. */
    brand: z.string().optional(),
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Marcus Chen'
    const footerNote = props.note ?? 'All rights reserved.'
    const footerLinks = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Credits']
    const year = new Date().getFullYear()
    return (
      <SiteFooter
        className={cn(
          'border-t-0 bg-foreground text-background',
          props.className,
        )}
      >
        <FooterContent className="flex flex-col gap-10 py-14 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <span className="block font-mono text-[11px] uppercase tracking-[0.3em] text-background/50">
              [ End of Reel ]
            </span>
            <p className="text-3xl font-extrabold uppercase leading-[0.9] tracking-tight md:text-5xl">
              {brand}
            </p>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
              © {year} {brand} — {footerNote}
            </FooterCopyright>
          </div>
          <nav className="flex flex-col gap-3 md:items-end">
            {footerLinks.map((link) => (
              <NavbarRouteLink
                key={link}
                href={link}
                className="block w-fit font-mono text-[11px] uppercase tracking-[0.2em] text-background/60 transition-colors hover:text-background"
              >
                {link}
              </NavbarRouteLink>
            ))}
          </nav>
        </FooterContent>
      </SiteFooter>
    )
  },
})
