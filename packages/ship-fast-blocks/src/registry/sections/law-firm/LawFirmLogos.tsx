import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { cn } from '#/lib/utils.ts'
/**
 * LawFirmLogos — a quiet "clients of record" register on the card surface,
 * bordered top and bottom. A mono tracked-uppercase heading with a hairline
 * rule and a tabular client count sits above a collapsed-border ledger of serif
 * client wordmarks — each cell numbered with a mono "No. 0x" case index and
 * routed through section-kit route links, brightening to the primary accent on
 * hover. Restrained, authoritative newsprint aesthetic with sharp binary
 * corners. Use directly under the hero on law-firm, attorney, corporate-counsel,
 * consulting or professional-services pages to establish credibility with
 * recognizable client names. Renders fully with no props via baked-in defaults.
 */
import { Container } from '#/section-kit/Container.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
export const LawFirmLogos = defineCapsule({
  name: 'LawFirmLogos',
  description:
    "Quiet 'clients of record' register on the card surface, bordered top and bottom: a mono tracked-uppercase heading with a hairline rule and a tabular client count above a collapsed-border ledger of serif client wordmarks, each cell numbered with a mono 'No. 0x' case index, routed through section-kit route links and brightening to the primary accent on hover. Restrained, authoritative newsprint aesthetic with sharp binary corners. Use directly under the hero on law-firm, attorney, corporate-counsel, consulting, accounting or professional-services pages to establish credibility with recognizable client names.",
  props: z.object({
    heading: z.string().optional(),
    items: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Trusted by Industry Leaders'
    const items = props.items?.length
      ? props.items
      : ['MORGAN', 'CITADEL', 'VENTURE', 'APEX', 'MERIDIAN', 'CONSOL']
    const clients = items.filter(Boolean)
    return (
      <section
        className={cn(
          'border-y border-border bg-card py-14 lg:py-16',
          props.className,
        )}
      >
        <Container>
          <div className="mb-8 flex items-center gap-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {heading}
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="shrink-0 font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/70"
            >
              {String(clients.length).padStart(2, '0')} of record
            </span>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-border sm:grid-cols-3 lg:grid-cols-6">
            {clients.map((logo, i) => (
              <NavbarRouteLink
                key={logo}
                href={logo}
                className="group flex flex-col gap-2 border-b border-r border-border p-5 transition-colors sm:p-6"
              >
                <span
                  aria-hidden="true"
                  className="font-mono text-[10px] uppercase tracking-[0.2em] tabular-nums text-muted-foreground/60"
                >
                  No. {String(i + 1).padStart(2, '0')}
                </span>
                <span className="font-serif text-lg tracking-tight text-muted-foreground transition-colors group-hover:text-primary">
                  {logo}
                </span>
              </NavbarRouteLink>
            ))}
          </div>
        </Container>
      </section>
    )
  },
})
