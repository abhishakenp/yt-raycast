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
 * ComingSoonFooter — slim two-row footer for a "launching soon" / waitlist
 * pre-launch landing page. A bordered-top footer with two rows (stack on mobile):
 * the top row has the brand name + launch note on the left and social links on the
 * right; the bottom row has the copyright on the left and legal links on the right.
 * Every brand button, social, and legal link routes through section-kit route links. Use as the
 * closing site footer for SaaS waitlists, app pre-launch pages, beta sign-ups, or
 * any minimal coming-soon page. Renders fully with no props via baked-in defaults.
 */
export const ComingSoonFooter = defineCapsule({
  name: 'ComingSoonFooter',
  description:
    "Slim two-row footer for a 'launching soon' / waitlist pre-launch landing page: bordered-top footer with two rows (stacks on mobile). Top row has brand name + launch note on the left and social links on the right; bottom row has copyright on the left and legal links on the right. Every brand button, social, and legal link routes through section-kit route links. Use as the closing site footer for SaaS waitlists, app pre-launch pages, beta sign-ups, or minimal coming-soon pages.",
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
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterSocial>
                {socials
                  .map((s) => ({ label: s }))
                  .map((s) => (
                    <FooterSocialLink key={s.label}>{s.label}</FooterSocialLink>
                  ))}
              </FooterSocial>
            </FooterBrand>
          </FooterGrid>
          <FooterBottom>
            <FooterCopyright>{note}</FooterCopyright>
            <FooterLegal>
              {legal.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
