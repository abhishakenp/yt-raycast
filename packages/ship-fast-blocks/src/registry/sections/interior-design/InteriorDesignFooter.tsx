import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

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
    const go = useNavigate()
    const brand = props.brand ?? 'Atelier Studio'
    const about =
      props.about ??
      'Award-winning interior design studio based in San Francisco. Creating timeless, elegant spaces since 2014.'
    const socials = props.socials?.length
      ? props.socials
      : ['Instagram', 'Pinterest', 'LinkedIn']
    const servicesTitle = props.servicesTitle ?? 'Services'
    const servicesLinks = props.servicesLinks?.length
      ? props.servicesLinks
      : [
          'Residential Design',
          'Commercial Spaces',
          'Hospitality',
          'Furniture Curation',
          'Design Consultation',
        ]
    const companyTitle = props.companyTitle ?? 'Company'
    const companyLinks = props.companyLinks?.length
      ? props.companyLinks
      : ['About Us', 'Portfolio', 'Press', 'Careers', 'Contact']
    const copyright = props.copyright ?? 'All rights reserved.'
    const legalLinks = props.legalLinks?.length
      ? props.legalLinks
      : ['Privacy Policy', 'Terms of Service']
    const homeTarget = props.homeTarget ?? 'Projects'

    const brandParts = brand.split(' ')
    const brandMark = brandParts[0]
    const brandSuffix = brandParts.slice(1).join(' ')

    return (
      <footer
        className={cn(
          'bg-foreground px-4 py-16 text-background sm:px-6 lg:px-8',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 grid gap-12 md:grid-cols-4">
            <div className="md:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-6 flex items-center gap-2 text-2xl font-light tracking-tight"
              >
                <span>{brandMark}</span>
                {brandSuffix && (
                  <span className="text-background/60">{brandSuffix}</span>
                )}
              </button>
              <p className="mb-6 max-w-sm leading-relaxed text-background/70">
                {about}
              </p>
              <div className="flex gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="flex size-10 items-center justify-center rounded-full bg-background/10 text-background transition-colors hover:bg-background/20"
                  >
                    <span className="text-xs font-medium">
                      {social.charAt(0)}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h4 className="mb-4 font-medium text-background/80">
                {servicesTitle}
              </h4>
              <ul className="space-y-3 text-sm text-background/70">
                {servicesLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="mb-4 font-medium text-background/80">
                {companyTitle}
              </h4>
              <ul className="space-y-3 text-sm text-background/70">
                {companyLinks.map((link) => (
                  <li key={link}>
                    <button
                      type="button"
                      onClick={() => go(link)}
                      className="transition-colors hover:text-background"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/60">
              © {new Date().getFullYear()} {brand}. {copyright}
            </p>
            <div className="flex gap-6 text-sm text-background/60">
              {legalLinks.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-background"
                >
                  {link}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    )
  },
})
