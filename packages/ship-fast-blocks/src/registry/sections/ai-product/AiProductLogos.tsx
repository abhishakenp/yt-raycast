import { Fragment } from 'react'
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
 * AiProductLogos — kinetic tech-editorial "trusted by" ticker strip for an AI
 * SaaS / product page. A slim hairline-bordered band styled like a data
 * readout: a mono uppercase micro-label anchored left, then a single-row rail
 * of mono uppercase wordmark buttons separated by dimmed slash glyphs that
 * scrolls horizontally on small screens and inks to foreground on hover. Each
 * wordmark routes through section-kit route links. Use directly beneath a hero
 * to establish credibility on AI tools, SaaS apps, startups, or any marketing
 * site that lists customer or partner brands. Renders fully with no props.
 */
export const AiProductLogos = defineCapsule({
  name: 'AiProductLogos',
  description:
    "Kinetic tech-editorial 'trusted by' ticker strip for an AI SaaS / product page: a slim hairline-bordered band styled like a data readout, with a mono uppercase micro-label anchored left and a single-row rail of mono uppercase wordmark buttons separated by dimmed slash glyphs, horizontally scrollable on small screens and inking to foreground on hover. Each wordmark routes through section-kit route links. Place directly beneath a hero to establish credibility for AI tools, SaaS apps, startups, or any marketing site listing customer or partner brands.",
  props: z.object({
    /** Small uppercase label above the wordmarks. */
    label: z.string().optional(),
    /** Customer / partner brand wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Trusted by teams at'
    const items = props.items?.length
      ? props.items
      : ['Notion', 'Figma', 'Stripe', 'Linear', 'Vercel', 'Shopify']

    return (
      <LogoStrip
        className={cn('border-y border-border bg-background', props.className)}
      >
        <Container className="flex flex-col gap-3 py-5 sm:flex-row sm:items-center sm:gap-8">
          <LogoStripLabel className="shrink-0 text-left font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </LogoStripLabel>
          <LogoStripItems
            layout="flex"
            className="mt-0 flex-nowrap justify-start gap-x-4 overflow-x-auto whitespace-nowrap py-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:gap-x-5"
          >
            {items.filter(Boolean).map((logo, i) => (
              <Fragment key={logo}>
                {i > 0 && (
                  <span aria-hidden="true" className="text-border">
                    /
                  </span>
                )}
                <LogoStripItem
                  variant="opacity-hover"
                  className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors duration-150 active:translate-y-px"
                  asChild
                >
                  <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              </Fragment>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
