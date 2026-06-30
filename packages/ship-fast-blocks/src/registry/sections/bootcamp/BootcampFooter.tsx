import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * BootcampFooter — 4-column dark footer for a coding bootcamp / career-school
 * landing page. A full-width footer on a foreground-colored band: left column
 * shows a brand-initial logo tile + academy name + tagline + social links;
 * remaining columns show titled link lists. Every link and the brand button
 * route through useNavigate. Use as the closing site footer for coding
 * bootcamps, dev academies, or any cohort-based education brand.
 */
export const BootcampFooter = defineCapsule({
  name: 'BootcampFooter',
  description:
    '4-column dark footer for a coding bootcamp / career-school landing page: full-width footer on a foreground-colored band. Left column shows a brand-initial logo tile + academy name + tagline + social links; remaining columns show titled link lists. Every link and the brand button route through useNavigate. Use as the closing site footer for coding bootcamps, dev academies, or cohort-based education brands.',
  props: z.object({
    /** Brand / academy name shown beside the logo tile. */
    brand: z.string().optional(),
    /** Tagline under the brand name. */
    tagline: z.string().optional(),
    /** Titled footer link columns. */
    columns: z
      .array(
        z.object({
          title: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social link labels (text-only). */
    socials: z.array(z.string()).optional(),
    /** Legal link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'CodeCraft Academy'
    const footerTagline =
      props.tagline ??
      'Transforming careers through accessible, hands-on coding education since 2019.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Program',
            links: ['Curriculum', 'Mentors', 'Pricing', 'Schedule a Call'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Blog', 'Press'],
          },
          {
            title: 'Support',
            links: ['FAQ', 'Contact', 'Student Login', 'Employer Partners'],
          },
        ]
    const footerSocials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'LinkedIn']
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const homeTarget = props.homeTarget ?? 'Curriculum'

    return (
      <footer
        className={cn(
          'bg-foreground py-12 text-background/70 lg:py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-12">
            <div>
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <BrandLogo
                  brand={brand}
                  fallback={
                    <span
                      aria-hidden="true"
                      className="grid size-8 place-items-center rounded-lg bg-background text-sm font-bold text-foreground"
                    >
                      {brand
                        .split(' ')
                        .map((w) => w.charAt(0))
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  }
                  labelClassName="text-lg font-semibold text-background"
                />
              </button>
              <p className="mb-4 text-sm">{footerTagline}</p>
              <div className="flex gap-4">
                {footerSocials.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={s}
                    onClick={() => go(s)}
                    className="text-sm font-medium text-background/60 transition-colors hover:text-background"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-background">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-sm">
                  {col.links.map((link) => (
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
            ))}
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 text-sm md:flex-row">
            <p>
              © {new Date().getFullYear()} {brand}. All rights reserved.
            </p>
            <div className="flex gap-6">
              {footerLegal.map((link) => (
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
