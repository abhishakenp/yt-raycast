import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { Container } from '#/section-kit/Container.tsx'
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * BakeryLogos — "Featured in" press / media strip for an artisan-bakery site,
 * as a warm primary-washed band between chunky 2px rules. A single editorial
 * row (stacking on mobile): a mono uppercase label with a small primary dot on
 * the left, then a wrapping run of publication wordmarks rendered as
 * alternately-rotated rounded-full sticker chips — serif italic type inside
 * chunky-bordered pills that flood to foreground-on-background on hover with
 * press feedback. Each wordmark routes through section-kit route links. Use as
 * a social-proof / press-mentions strip directly beneath the hero for
 * bakeries, patisseries, cafes, restaurants, or any local maker citing media
 * coverage. Renders fully with no props via baked-in default publications.
 */
export const BakeryLogos = defineCapsule({
  name: 'BakeryLogos',
  description:
    "'Featured in' press / media strip for an artisan-bakery site as a warm primary-washed band between chunky 2px rules: a mono uppercase label with a small primary dot beside a wrapping run of publication wordmarks rendered as alternately-rotated rounded-full sticker chips — serif italic type in chunky-bordered pills that flood to foreground-on-background on hover with press feedback — each routing through section-kit route links. Use as a social-proof / press-mentions strip directly beneath the hero for bakeries, patisseries, cafes, restaurants, or any local food maker citing media coverage.",
  props: z.object({
    /** Uppercase label above the logo row. */
    label: z.string().optional(),
    /** Publication / press wordmarks. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label = props.label ?? 'Featured in'
    const items = props.items?.length
      ? props.items
      : [
          'Portland Monthly',
          'Eater PDX',
          'Bon Appétit',
          'The Oregonian',
          'Food & Wine',
        ]

    return (
      <LogoStrip
        className={cn(
          'border-y-2 border-foreground/10 bg-primary/5 py-8 sm:py-10',
          props.className,
        )}
      >
        <Container>
          <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-8">
            <MonoTag className="inline-flex shrink-0 items-center gap-2 text-foreground">
              <span
                aria-hidden="true"
                className="size-2 rounded-full bg-primary"
              />
              {label}
            </MonoTag>
            <LogoStripItems
              layout="flex"
              className="justify-start gap-x-3 gap-y-3 sm:justify-end sm:gap-x-4"
            >
              {items.filter(Boolean).map((logo, i) => (
                <LogoStripItem
                  key={logo}
                  variant="opacity-hover"
                  asChild
                  className={cn(
                    'inline-flex items-center rounded-full border-2 border-foreground/20 bg-background px-4 py-1.5 font-serif text-base italic text-muted-foreground transition-all duration-100 hover:border-foreground hover:bg-foreground hover:text-background active:translate-y-px sm:px-5 sm:text-lg',
                    i % 2 === 0 ? '-rotate-1' : 'rotate-1',
                  )}
                >
                  <NavbarRouteLink href={logo}>{logo}</NavbarRouteLink>
                </LogoStripItem>
              ))}
            </LogoStripItems>
          </div>
        </Container>
      </LogoStrip>
    )
  },
})
