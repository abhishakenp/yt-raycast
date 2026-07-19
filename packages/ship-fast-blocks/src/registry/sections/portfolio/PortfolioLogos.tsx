import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * PortfolioLogos — client / brand wordmark strip for a dark creative portfolio.
 * A short bordered band on a raised card surface holding a centered, dimmed,
 * wrapping row of brand wordmarks rendered as bold text (not images), each
 * brightening on hover and routing through section-kit route links. Use directly under the
 * hero to signal trust and notable clients on a 3D artist, motion designer,
 * studio, or freelance creative site. Renders fully with no props via baked-in
 * default client names.
 */
export const PortfolioLogos = defineCapsule({
  name: 'PortfolioLogos',
  description:
    'Client / brand wordmark trust strip for a dark creative portfolio: a short bordered band on a raised card surface with a centered, dimmed, wrapping row of brand wordmarks rendered as bold text (not images), each brightening on hover and routing through section-kit route links. Use directly under the hero to signal trust and notable clients on a 3D artist, motion designer, studio, or freelance creative site.',
  props: z.object({
    /** Client / brand wordmarks shown in the strip. */
    clients: z.array(z.string()).optional(),
    /** Navigation target when a wordmark is clicked. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const clients = props.clients?.length
      ? props.clients
      : [
          'Nike',
          'Spotify',
          'Apple',
          'Google',
          'Riot Games',
          'Sonos',
          'Epic Games',
          'Netflix',
        ]
    const homeTarget = props.homeTarget ?? 'Work'

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-card pt-28 pb-12 opacity-60',
          props.className,
        )}
      >
        <LogoStripItems layout="flex">
          {clients.filter(Boolean).map((logo) => (
            <LogoStripItem
              key={logo}
              variant="text-bold"
              className="whitespace-nowrap text-[1.05rem] tracking-[-0.01em] md:text-[1.15rem]"
              asChild
            >
              <NavbarRouteLink href={homeTarget}>{logo}</NavbarRouteLink>
            </LogoStripItem>
          ))}
        </LogoStripItems>
      </LogoStrip>
    )
  },
})
