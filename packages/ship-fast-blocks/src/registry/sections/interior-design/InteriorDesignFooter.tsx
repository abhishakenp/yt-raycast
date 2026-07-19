import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
  FooterSocial,
  FooterSocialLink,
  FooterLink,
  FooterBottom,
  FooterCopyright,
  FooterLegal,
} from '#/section-kit/SiteFooter.tsx'
/**
 * InteriorDesignFooter — rich inverted footer on the foreground surface for an
 * upscale interior-design / architecture studio. A four-column band: a wide
 * brand column with a two-tone wordmark, an about paragraph and round social
 * initial buttons, plus two link columns (services, company); below them a
 * bordered-top bar with an auto-updating copyright line and legal links.
 * Editorial, refined and high-contrast. The brand button, socials and every
 * link route through useNavigate. Use as the closing site footer for interior
 * designers, design studios, architecture firms or renovation businesses.
 * Renders fully with no props via baked-in "Atelier Studio" defaults.
 */
export const InteriorDesignFooter = defineCapsule({
  name: 'InteriorDesignFooter',
  description:
    'Rich inverted footer on the foreground surface for an upscale interior-design / architecture studio: a four-column band with a wide brand column (two-tone wordmark + about paragraph + round social initial buttons) and two link columns (services, company), above a bordered-top bar with an auto-updating copyright line and legal links. Editorial, refined and high-contrast; the brand button, socials and every link route through useNavigate. Use as the closing site footer for interior designers, design studios, architecture firms or renovation businesses.',
  props: z.object({
    /** Brand / studio name; split into bold mark + faded suffix on a space. */
    brand: z.string().optional(),
    about: z.string().optional(),
    socials: z.array(z.string()).optional(),
    servicesTitle: z.string().optional(),
    servicesLinks: z.array(z.string()).optional(),
    companyTitle: z.string().optional(),
    companyLinks: z.array(z.string()).optional(),
    copyright: z.string().optional(),
    legalLinks: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const brand = props.brand ?? 'Atelier Studio'
    const about =
      props.about ??
      'Award-winning interior design studio based in San Francisco. Creating timeless, elegant spaces since 2014.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'LinkedIn']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service']
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{about}</FooterTagline>
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
            <FooterCopyright>{copyright}</FooterCopyright>
            <FooterLegal>
              {legalLinks.map((l) => (
                <FooterLink key={l}>{l}</FooterLink>
              ))}
            </FooterLegal>
          </FooterBottom>
        </FooterContent>
      </SiteFooter>
    )
  },
})
