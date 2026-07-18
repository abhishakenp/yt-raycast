import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Marquee } from '#/section-kit/motion.tsx'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'

/**
 * AuthLogos — the "cleared partners" registry band for Authly, a developer
 * authentication product. A centered mono eyebrow flanked by hairline rules
 * sits above a full-bleed, slightly tilted ink band: an inverted
 * foreground-colored strip where company wordmarks scroll past as
 * double-border visa-style stamps at slightly different angles. Logos are
 * token-styled text spans (logos-as-text, not images); the marquee renders a
 * static row on the server and for reduced motion. Use beneath the hero of an
 * auth platform, identity API, or developer SaaS to establish credibility.
 * Renders fully with no props.
 */
export const AuthLogos = defineCapsule({
  name: 'AuthLogos',
  description:
    "Cleared-partners registry band for a developer-auth product: a centered mono eyebrow flanked by hairline rules ('Trusted by engineering teams at') above a full-bleed, slightly tilted inverted ink band where company wordmarks scroll past as double-border visa-style stamps at varied angles (token-styled text spans, logos-as-text; static row on the server and under reduced motion). Use as a social-proof band beneath the hero of an auth platform, identity API, or developer SaaS landing page.",
  props: z.object({
    /** Centered eyebrow label above the wordmarks. */
    eyebrow: z.string().optional(),
    /** Company wordmarks rendered as styled text spans. */
    logos: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const eyebrow = props.eyebrow ?? 'Trusted by engineering teams at'
    const logos = props.logos?.length
      ? props.logos
      : [
          'Northwind',
          'Vertex Labs',
          'Cobalt',
          'Hyperline',
          'Quanta',
          'Stackforge',
        ]
    const logoLayouts = [
      'md:-rotate-1',
      'md:translate-y-1 md:rotate-2',
      'md:-translate-y-1 md:-rotate-2',
      'md:rotate-1',
      'md:-translate-y-1 md:-rotate-1',
      'md:translate-y-1 md:rotate-1',
    ]

    return (
      <LogoStrip
        className={cn(
          'overflow-hidden border-b border-border bg-background py-14',
          props.className,
        )}
      >
        <div className="mx-auto flex max-w-4xl items-center gap-5 px-5 sm:px-6">
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
          <LogoStripLabel className="shrink font-mono text-[0.68rem] font-medium tracking-[0.14em] text-muted-foreground">
            {eyebrow}
          </LogoStripLabel>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>
        <div className="mt-9 -mx-4 -rotate-1 border-y-2 border-foreground bg-foreground py-5 sm:-mx-8">
          <Marquee duration={42} gap={20} className="px-4">
            {logos.filter(Boolean).map((logo, index) => (
              <LogoStripItem
                key={logo}
                className={cn(
                  'inline-flex min-h-12 min-w-0 shrink-0 items-center justify-center rounded-lg border-[3px] border-double px-5 text-center font-mono text-xs font-bold uppercase tracking-[0.14em] sm:text-sm',
                  index % 3 === 1
                    ? 'border-primary/60 text-primary'
                    : 'border-background/40 text-background/75',
                  logoLayouts[index % logoLayouts.length],
                )}
              >
                <span className="truncate">{logo}</span>
              </LogoStripItem>
            ))}
          </Marquee>
        </div>
      </LogoStrip>
    )
  },
})
