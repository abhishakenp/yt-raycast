import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * ComingSoonFooter — kinetic slim two-row footer for a "launching soon" /
 * waitlist pre-launch landing page. A heavy 2px top rule over two rows (stack
 * on mobile): the top row has the brand wordmark plus sharp-cornered bordered
 * mono social chips with press feedback; the bottom row pairs the mono
 * uppercase launch note with mono legal links, separated by a hairline. Every
 * brand button and legal link routes through section-kit route links. Use as
 * the closing site footer for SaaS waitlists, app pre-launch pages, beta
 * sign-ups, or any minimal coming-soon page. Renders fully with no props via
 * baked-in defaults.
 */
export const ComingSoonFooter = defineCapsule({
  name: 'ComingSoonFooter',
  description:
    "Kinetic slim two-row footer for a 'launching soon' / waitlist pre-launch landing page: heavy 2px top rule over two rows (stacks on mobile) — brand wordmark plus sharp-cornered bordered mono social chips with press feedback on top; mono uppercase launch note beside mono legal links under a hairline below. Every brand button and legal link routes through section-kit route links. Use as the closing site footer for SaaS waitlists, app pre-launch pages, beta sign-ups, or minimal coming-soon pages.",
  props: z.object({
    /** Brand / product name shown in the footer. */
    brand: z.string().optional(),
    /** Launch timing note shown beside the brand. */
    note: z.string().optional(),
    /** Social link labels. */
    socials: z.array(z.string()).optional(),
    /** Legal link labels. */
    legal: z.array(z.string()).optional(),
    /** Copyright text (falls back to auto-generated). */
    copyright: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Nexus'
    const note = props.note ?? 'Launching March 2025'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'LinkedIn', 'GitHub']
    const legal = props.legal?.length ? props.legal : ['Privacy', 'Terms']
    return (
      <SiteFooter
        className={`border-t-2 border-foreground bg-background ${props.className ?? ''}`}
      >
        <FooterContent className="py-10">
          <FooterGrid className="gap-6 md:grid-cols-1">
            <FooterBrand
              brand={brand}
              brandClassName="font-extrabold uppercase tracking-tighter"
              className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between md:col-span-1"
            >
              <FooterSocial className="mt-0 gap-2 sm:mt-0">
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink
                      key={s.label}
                      className="rounded-none border border-border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground transition-colors duration-100 hover:border-foreground hover:text-foreground active:translate-y-px"
                    >
                      {s.label}
                    </FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom className="mt-8 border-border pt-5">
            <FooterCopyright className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
              {note}
            </FooterCopyright>
            <FooterLegal className="gap-5">
              {legal.map((l) => (
                <FooterLink
                  key={l}
                  className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l}
                </FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
