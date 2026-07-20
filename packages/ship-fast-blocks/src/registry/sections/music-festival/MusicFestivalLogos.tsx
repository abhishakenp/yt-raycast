import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * MusicFestivalLogos — a partner / sponsor logo strip for a kinetic-poster
 * festival landing page. A top-and-bottom hairline-bordered band, wrapped in
 * the shared Container, with a small mono uppercase "presented in partnership
 * with" label above a wrapping, centered row of bold uppercase text wordmarks
 * that brighten from muted to full ink on hover. Each wordmark routes through
 * section-kit route links. Use beneath the hero on music festivals, arts
 * festivals, concert series, or any sponsored multi-day event to lend
 * credibility.
 */
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const MusicFestivalLogos = defineCapsule({
  name: 'MusicFestivalLogos',
  description:
    "Partner / sponsor logo strip for a kinetic-poster festival landing page: a top-and-bottom hairline-bordered band wrapped in the shared Container, with a small mono uppercase 'presented in partnership with' label above a wrapping, centered row of bold uppercase text wordmarks that brighten from muted to full ink on hover. Each wordmark routes through section-kit route links. Use beneath the hero on music festivals, arts festivals, concert series, sponsored events, or any multi-day ticketed event to lend credibility and showcase partners.",
  props: z.object({
    /** Label above the logo row. */
    label: z.string().optional(),
    /** Partner / sponsor wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Presented in partnership with'
    const items = props.items?.length
      ? props.items
      : ['PITCHFORK', 'SPOTIFY', 'SONOS', 'RED BULL', 'BEATS', 'VANS']
    return (
      <LogoStrip
        className={cn('border-y border-border py-14 lg:py-16', props.className)}
      >
        <Container>
          <LogoStripLabel className="font-mono text-[11px] tracking-[0.2em]">
            {label}
          </LogoStripLabel>
          <LogoStripItems layout="flex" className="mt-8 gap-x-10 gap-y-5">
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem
                key={logo}
                variant="text-bold"
                asChild
                className="text-lg font-extrabold uppercase tracking-tight"
              >
                <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
