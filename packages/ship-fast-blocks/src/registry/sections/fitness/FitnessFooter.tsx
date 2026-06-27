import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FitnessFooter — inverted multi-column site footer for a gym or fitness studio. A
 * foreground-filled band with a brand block (square monogram tile + short wordmark +
 * tagline) beside link columns (classes, company, connect), and a divided bottom bar
 * with a copyright line and inline legal links. All links route through useNavigate.
 * Use as the closing footer on gyms, fitness studios, yoga / pilates / boxing / spin
 * studios, wellness clubs or class-booking sites.
 */
export const FitnessFooter = defineCapsule({
  name: 'FitnessFooter',
  description:
    'Inverted multi-column site footer for a gym or fitness studio: a foreground-filled band with a brand block (square monogram tile + short wordmark + tagline) beside link columns (classes, company, connect / social), and a divided bottom bar with a copyright line and inline legal links. All links route through useNavigate. Use as the closing footer on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios, wellness clubs and class-booking sites.',
  props: z.object({
    /** Brand / studio name; first letter forms the monogram, first word is shown. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(z.object({ heading: z.string(), links: z.array(z.string()) }))
      .optional(),
    copyright: z.string().optional(),
    legal: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Base Fitness Studio'
    const brandShort = brand.split(/\s+/)[0]?.toUpperCase() ?? 'BASE'
    const footerTagline =
      props.tagline ??
      'Strength through movement. A fitness community built on progress, not perfection.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Classes',
            links: [
              'Strength Training',
              'Power Yoga',
              'Cycle',
              'HIIT',
              'Pilates',
              'Boxing',
            ],
          },
          {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Partners', 'Contact'],
          },
          {
            heading: 'Connect',
            links: ['Instagram', 'Facebook', 'YouTube', 'Spotify Playlists'],
          },
        ]
    const footerCopyright = props.copyright ?? 'All rights reserved.'
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Settings']

    return (
      <footer
        className={cn(
          'border-t border-border bg-foreground py-12 text-background',
          props.className,
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid gap-8 md:grid-cols-4">
            <div>
              <div className="mb-4 flex items-center gap-2">
                <span
                  className="grid size-8 place-items-center rounded-sm bg-background text-sm font-bold text-foreground"
                  aria-hidden="true"
                >
                  {brandShort.charAt(0)}
                </span>
                <span className="text-lg font-semibold tracking-tight text-background">
                  {brandShort}
                </span>
              </div>
              <p className="text-sm text-background/60">{footerTagline}</p>
            </div>

            {footerColumns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-medium text-background">
                  {col.heading}
                </h4>
                <ul className="space-y-2 text-sm text-background/60">
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

          <div className="flex flex-col items-center justify-between gap-4 border-t border-background/20 pt-8 md:flex-row">
            <p className="text-sm text-background/50">
              © {new Date().getFullYear()} {brand}. {footerCopyright}
            </p>
            <div className="flex gap-6 text-sm text-background/60">
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
