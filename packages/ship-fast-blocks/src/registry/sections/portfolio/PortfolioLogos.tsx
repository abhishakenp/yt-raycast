import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { LogoStrip } from '#/section-kit/LogoStrip.tsx'

/**
 * PortfolioLogos — client / brand wordmark strip for a dark creative portfolio.
 * A short bordered band on a raised card surface holding a centered, dimmed,
 * wrapping row of brand wordmarks rendered as bold text (not images), each
 * brightening on hover and routing through useNavigate. Use directly under the
 * hero to signal trust and notable clients on a 3D artist, motion designer,
 * studio, or freelance creative site. Renders fully with no props via baked-in
 * default client names.
 */
export const PortfolioLogos = defineCapsule({
  name: 'PortfolioLogos',
  description:
    'Client / brand wordmark trust strip for a dark creative portfolio: a short bordered band on a raised card surface with a centered, dimmed, wrapping row of brand wordmarks rendered as bold text (not images), each brightening on hover and routing through useNavigate. Use directly under the hero to signal trust and notable clients on a 3D artist, motion designer, studio, or freelance creative site.',
  props: z.object({
    /** Client / brand wordmarks shown in the strip. */
    clients: z.array(z.string()).optional(),
    /** Navigation target when a wordmark is clicked. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
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
        logos={clients}
        layout="flex"
        logoStyle="text-bold"
        onClickLogo={() => go(homeTarget)}
        logoClassName="whitespace-nowrap text-[1.05rem] tracking-[-0.01em] md:text-[1.15rem]"
        aria-label="Trusted by leading brands"
        className={cn(
          'border-y border-border bg-card pt-28 pb-12 opacity-60',
          props.className,
        )}
      />
    )
  },
})
