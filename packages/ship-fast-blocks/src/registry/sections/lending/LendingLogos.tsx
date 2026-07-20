import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * LendingLogos — Swiss-fintech "featured in" / press-and-trust band for a lending
 * or fintech marketing page. A hairline-bordered muted band whose content sits in
 * a plain Container: a mono micro-label caption with a tabular partner count sits
 * above a collapsed-border grid of press wordmark cells (shared hairline rules,
 * binary radius, no gaps), each a route link that dims to full ink on hover with
 * a mono index numeral. Every wordmark routes through section-kit route links.
 * Use directly under a hero for calm, institutional social proof from press
 * mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or any
 * conversion landing page. Renders fully with no props via baked-in defaults.
 */
import {
  LogoStrip,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LendingLogos = defineCapsule({
  name: 'LendingLogos',
  description:
    "Swiss-fintech 'featured in' / press-and-trust band for a lending or fintech marketing page: a hairline-bordered muted band whose content sits in a plain Container, with a mono micro-label caption + tabular partner count above a collapsed-border grid of press wordmark cells (shared hairline rules, binary radius, mono index numerals, dim-to-ink hover). Each wordmark routes through section-kit route links. Use directly under a hero for calm, institutional social proof from press mentions, partner brands, or trust-signal logos on loan, fintech, SaaS, or conversion landing pages.",
  props: z.object({
    caption: z.string().optional(),
    names: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const logosCaption =
      props.caption ?? 'Featured in and trusted by over 250,000 borrowers'
    const logoNames = props.names?.length
      ? props.names
      : ['TechCrunch', 'Forbes', 'Bloomberg', 'CNBC', 'NerdWallet', 'Bankrate']
    const cells = logoNames.filter(Boolean)
    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-14 lg:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag>{logosCaption}</MonoTag>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              {String(cells.length).padStart(2, '0')} sources
            </MonoTag>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {cells.map((logo, i) => (
              <LogoStripItem
                key={logo}
                variant="opacity-hover"
                className="flex items-center justify-center border-b border-r border-border px-4 py-7 text-base font-semibold tracking-tight text-foreground/55 transition-colors hover:text-foreground"
                asChild
              >
                <NavbarRouteLink href={logo}>
                  <span
                    aria-hidden="true"
                    className="mr-2 font-mono text-[10px] tabular-nums text-muted-foreground/40"
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {logo}
                </NavbarRouteLink>
              </LogoStripItem>
            ))}
          </LogoStripItems>
        </Container>
      </LogoStrip>
    )
  },
})
