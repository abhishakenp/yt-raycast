import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'

import { Container } from '#/section-kit/Container.tsx'
import {
  SiteFooter,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'

/**
 * LandscapingFooter — calm, organic-editorial closing footer for a landscaping /
 * outdoor-design company on a muted wash. A hairline mono meta rail opens the
 * band above an asymmetric brand column (layered-diamond line mark + wordmark
 * over a short tagline); a bordered sub-bar below spreads an auto-updating
 * copyright line against a wrapping row of routed legal links (each a
 * block-level w-fit target). Stacks on mobile, spreads on desktop; every link
 * routes through section-kit route links. Tokens-only with a restrained sage
 * accent. Use as the closing site footer for landscapers, lawn-care services,
 * garden designers, hardscaping contractors or grounds-keeping companies.
 * Renders fully with no props via baked-in "Earth & Edge" defaults.
 */
export const LandscapingFooter = defineCapsule({
  name: 'LandscapingFooter',
  description:
    'Calm, organic-editorial closing footer for a landscaping / outdoor-design company on a muted wash: a hairline mono meta rail above an asymmetric brand column (layered-diamond line mark + wordmark over a short tagline), and a bordered sub-bar spreading an auto-updating copyright line against a wrapping row of routed legal links (each a block-level w-fit target). Stacks on mobile, spreads on desktop; every link routes through section-kit route links. Tokens-only with a restrained sage accent. Use as the closing site footer for landscapers, lawn-care services, garden designers, hardscaping contractors or grounds-keeping companies.',
  props: z.object({
    /** Brand / company name shown beside the mark. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    note: z.string().optional(),
    links: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Earth & Edge'
    const tagline =
      props.tagline ??
      'Premium outdoor design, installation, and maintenance for Portland homes and businesses.'
    const note = props.note ?? 'All rights reserved.'
    const links = props.links?.length
      ? props.links
      : ['Privacy', 'Terms', 'Careers']
    const LogoMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn('text-primary', className)}
        aria-hidden="true"
      >
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    )

    return (
      <SiteFooter className={cn('bg-muted/30', props.className)}>
        <Container className="py-14">
          <div className="mb-10 flex items-center gap-4 border-b border-border pb-4">
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground"
            >
              Earth & Edge / Est. 2008
            </span>
            <span aria-hidden="true" className="h-px flex-1 bg-border" />
            <span
              aria-hidden="true"
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60"
            >
              Portland, OR
            </span>
          </div>
          <FooterGrid className="md:grid-cols-2">
            <FooterBrand
              brand={brand}
              brandMark={<LogoMark />}
              className="max-w-md"
            >
              <FooterTagline>{tagline}</FooterTagline>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.16em]">
              {note}
            </FooterCopyright>
            <FooterLegal>
              {links.map((l) => (
                <FooterLink
                  key={l}
                  className="block w-fit font-mono text-[11px] uppercase tracking-[0.16em]"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </Container>
      </SiteFooter>
    )
  },
})
