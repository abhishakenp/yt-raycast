import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FitnessFooter — inverted multi-column site footer for a gym or fitness studio. A
 * foreground-filled band with a brand block (square monogram tile + short wordmark +
 * tagline) beside link columns (classes, company, connect), and a divided bottom bar
 * with a copyright line and inline legal links. All links route through useNavigate.
 * Use as the closing footer on gyms, fitness studios, yoga / pilates / boxing / spin
 * studios, wellness clubs or class-booking sites.
 */
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
export const FitnessFooter = defineCapsule({
  name: 'FitnessFooter',
  description:
    'Inverted multi-column site footer for a gym or fitness studio: a foreground-filled band with a brand block (square monogram tile + short wordmark + tagline) beside link columns (classes, company, connect / social), and a divided bottom bar with a copyright line and inline legal links. All links route through useNavigate. Use as the closing footer on gyms, fitness studios, CrossFit boxes, yoga, pilates, boxing or spin / cycle studios, wellness clubs and class-booking sites.',
  props: z.object({
    /** Brand / studio name; first letter forms the monogram, first word is shown. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
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
    void go
    void brandShort
    return (
      <SiteFooter
        brand={brand}
        tagline={footerTagline}
        columns={footerColumns.map((c) => ({
          title: c.heading,
          links: c.links,
        }))}
        legal={footerLegal}
        note={footerCopyright}
        className={props.className}
      />
    )
  },
})
