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
 * FintechLogos — Swiss-fintech trusted-by band for a neobank landing page. A
 * hairline-bordered muted band whose content sits in a plain Container: a mono
 * micro-label lead line with a tabular partner count sits above a collapsed-
 * border grid of partner wordmark cells (shared hairline rules, binary radius,
 * no gaps). Each cell is a clickable route link that dims to full ink on hover.
 * Precise, calm, institutional social proof; use for digital-banking, payments,
 * SaaS, or any trust-forward product page. Renders fully with no props via
 * baked-in defaults.
 */
export const FintechLogos = defineCapsule({
  name: 'FintechLogos',
  description:
    'Swiss-fintech trusted-by band for a neobank landing page: a hairline-bordered muted band whose content sits in a plain Container, with a mono micro-label lead line + tabular partner count above a collapsed-border grid of clickable partner wordmark cells (shared hairline rules, binary radius, dim-to-ink hover). Each logo routes through route links for page-switching. Use as calm, institutional social-proof for digital-banking, payments, SaaS or any trust-forward product page.',
  props: z.object({
    /** Heading label above the logo grid. */
    label: z.string().optional(),
    /** Logo brand names (rendered as bold text). */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const label =
      props.label ?? 'Trusted by over 50,000 businesses and individuals'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Slack', 'Figma', 'Webflow', 'Vercel']
    const cells = items.filter(Boolean)

    return (
      <LogoStrip
        className={cn(
          'border-y border-border bg-muted/40 py-14 lg:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center justify-between gap-4 border-b border-border pb-4">
            <MonoTag>{label}</MonoTag>
            <MonoTag
              aria-hidden="true"
              tone="faint"
              className="shrink-0 tabular-nums"
            >
              {String(cells.length).padStart(2, '0')} partners
            </MonoTag>
          </div>
          <LogoStripItems
            layout="grid"
            className="grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {cells.map((logo, i) => (
              <LogoStripItem
                key={logo}
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
