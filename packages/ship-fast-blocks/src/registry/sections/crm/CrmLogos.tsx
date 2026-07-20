import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
import {
  LogoStrip,
  LogoStripLabel,
  LogoStripItems,
  LogoStripItem,
} from '#/section-kit/LogoStrip.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
/**
 * CrmLogos — collapsed-border trusted-by ledger strip for a CRM / SaaS landing
 * page. A hairline-bottomed band where a left-aligned mono micro-label caption
 * (with a primary tick) sits beside a hairline rule, above a collapsed-border
 * grid of wordmark cells (2 cols on mobile up to 6 on desktop) — every cell
 * shares hairline borders, carries a dimmed semibold wordmark and brightens on
 * hover. Each logo routes through section-kit route links. Use right beneath a
 * hero to establish social proof for CRM, sales-pipeline or B2B SaaS products.
 * Renders fully with no props.
 */
export const CrmLogos = defineCapsule({
  name: 'CrmLogos',
  description:
    'Collapsed-border trusted-by ledger strip for a CRM / SaaS landing page: a hairline-bottomed band with a left-aligned mono micro-label caption beside a hairline rule, above a collapsed-border grid of wordmark cells (2 cols on mobile up to 6 on desktop) that share hairline borders and brighten on hover. Each logo routes through section-kit route links. Use right beneath a hero to establish social proof for CRM, sales-pipeline or B2B SaaS products.',
  props: z.object({
    /** Caption above the logo row. */
    heading: z.string().optional(),
    /** Company wordmark labels. */
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading =
      props.heading ?? 'Trusted by sales teams at leading companies'
    const items = props.items?.length
      ? props.items
      : ['Stripe', 'Notion', 'Vercel', 'Slack', 'Figma', 'Mastercard']
    return (
      <LogoStrip
        className={cn('border-b border-border bg-background', props.className)}
      >
        <Container className="py-10 sm:py-12">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="size-1.5 shrink-0 bg-primary" />
            <LogoStripLabel className="min-w-0 text-left font-mono text-[11px] font-normal uppercase tracking-[0.2em] text-muted-foreground sm:shrink-0">
              {heading}
            </LogoStripLabel>
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 bg-border sm:block"
            />
          </div>
          <LogoStripItems
            layout="grid"
            className="mt-8 grid-cols-2 gap-0 border-l border-t border-border sm:grid-cols-3 md:grid-cols-6"
          >
            {items.filter(Boolean).map((logo) => (
              <LogoStripItem key={logo} variant="opacity-hover" asChild>
                <NavbarRouteLink
                  href={logo}
                  className="border-b border-r border-border px-3 py-5 tracking-tight transition-colors hover:bg-muted/60"
                >
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
