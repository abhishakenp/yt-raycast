import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * PortfolioLogos — mono client / brand wordmark ledger strip for an
 * editorial-personal portfolio. A hairline-bordered band on a faint muted wash
 * pairs a fixed mono "Trusted by" micro-label with a left-aligned, wrapping row
 * of client wordmarks rendered as dimmed mono uppercase text (not images), each
 * brightening to full foreground on hover and routing through section-kit route
 * links. Content sits inside a plain Container for consistent page gutters. Use
 * directly under the hero to signal notable clients on a designer, motion or 3D
 * artist, studio, or freelance creative site. Renders fully with no props via
 * baked-in default client names.
 */
export const PortfolioLogos = defineCapsule({
  name: 'PortfolioLogos',
  description:
    'Mono client / brand wordmark ledger strip for an editorial-personal portfolio: a hairline-bordered band on a faint muted wash pairing a fixed mono "Trusted by" micro-label with a left-aligned, wrapping row of client wordmarks rendered as dimmed mono uppercase text (not images), each brightening to full foreground on hover and routing through section-kit route links. Content sits inside a plain Container for consistent page gutters. Use directly under the hero to signal notable clients on a designer, motion or 3D artist, studio, or freelance creative site.',
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
          'border-y border-border bg-muted/20 py-12',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-10">
            <MonoTag tone="faint" className="shrink-0" aria-hidden="true">
              Trusted by
            </MonoTag>
            <span
              aria-hidden="true"
              className="hidden h-px w-10 shrink-0 bg-border sm:block"
            />
            <LogoStripItems
              layout="flex"
              className="flex-1 justify-start gap-x-8 gap-y-4"
            >
              {clients.filter(Boolean).map((logo) => (
                <LogoStripItem
                  key={logo}
                  variant="text-bold"
                  className="whitespace-nowrap font-mono text-[13px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70 transition-colors hover:text-foreground"
                  asChild
                >
                  <NavbarRouteLink href={homeTarget}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
