import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * DatingAppLogos — playful-geometric press rail for a dating / matchmaking
 * landing page. A hairline-bordered band: a left-aligned mono micro-label
 * ("Featured in" with a rounded-full primary dot and a tabular press count)
 * runs along a hairline rule, above a wrapping row of bold tight-tracked press
 * wordmarks separated by tiny rounded-full dot markers; wordmarks sharpen to
 * full foreground on hover and route through section-kit route links. Use
 * directly below the hero as social-proof / credibility for dating apps,
 * singles platforms, or any consumer product citing press mentions. Renders
 * fully with no props via baked-in press defaults.
 */
export const DatingAppLogos = defineCapsule({
  name: 'DatingAppLogos',
  description:
    "Playful-geometric press rail for a dating / matchmaking landing page: a hairline-bordered band with a left-aligned mono micro-label ('Featured in' plus a rounded-full primary dot and tabular press count) on a hairline rule, above a wrapping row of bold tight-tracked press wordmarks separated by tiny rounded-full dot markers that sharpen to full foreground on hover, routed through section-kit route links. Use directly below the hero as social-proof / credibility for dating apps, singles platforms, or any consumer product citing press mentions.",
  props: z.object({
    /** Small uppercase label above the logo grid. */
    label: z.string().optional(),
    /** Press / publication names shown in the strip. */
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosLabel = props.label ?? 'Featured in'
    const logoNames = props.names?.length
      ? props.names
      : [
          'TechCrunch',
          'Forbes',
          'Wired',
          'The Verge',
          'Bloomberg',
          'Cosmopolitan',
        ]

    return (
      <LogoStrip
        className={cn('border-y border-border bg-background', props.className)}
      >
        <Container className="py-10">
          <div className="flex items-center gap-4">
            <LogoStripLabel className="flex shrink-0 items-center gap-2 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-primary"
              />
              {logosLabel}
            </LogoStripLabel>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60 tabular-nums"
            >
              {String(logoNames.filter(Boolean).length).padStart(2, '0')}{' '}
              outlets
            </span>
          </div>
          <LogoStripItems
            layout="flex"
            className="mt-7 justify-start gap-x-4 gap-y-4 sm:gap-x-6"
          >
            {logoNames.filter(Boolean).map((logo, i) => (
              <span key={logo} className="flex items-center gap-4 sm:gap-6">
                {i > 0 && (
                  <span
                    aria-hidden="true"
                    className="size-1.5 rounded-full bg-border"
                  />
                )}
                <LogoStripItem
                  variant="opacity-hover"
                  asChild
                  className="font-bold tracking-tight"
                >
                  <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              </span>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
