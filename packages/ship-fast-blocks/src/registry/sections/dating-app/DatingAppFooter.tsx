import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * DatingAppFooter — a multi-column site footer for a dating / matchmaking app. A
 * muted bordered-top band: a wide brand column with a rose/primary heart-glyph logo
 * tile + app name, a tagline, and round social icon buttons (Twitter / Instagram /
 * LinkedIn), followed by link columns (Product / Company / Support); a bottom row
 * holds an auto-updating copyright note and a set of legal links. The brand button
 * and every link route through useNavigate. Use as the closing footer for dating
 * apps, singles platforms, or social-connection products. Renders fully with no
 * props via baked-in "HeartLink" defaults.
 */
export const DatingAppFooter = defineCapsule({
  name: 'DatingAppFooter',
  description:
    'Multi-column site footer for a dating / matchmaking app: a muted bordered-top band with a wide brand column (rose/primary heart-glyph logo tile + app name, a tagline, and round social icon buttons for Twitter / Instagram / LinkedIn) followed by link columns (Product / Company / Support); a bottom row holds an auto-updating copyright note and a set of legal links. The brand button and every link route through useNavigate. Use as the closing footer for dating apps, singles platforms, or social-connection products.',
  props: z.object({
    /** Brand / app name shown beside the heart logo. */
    brand: z.string().optional(),
    tagline: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Social icon labels (rendered in Twitter/Instagram/LinkedIn glyph order). */
    socials: z.array(z.string()).optional(),
    /** Copyright line shown bottom-left. */
    note: z.string().optional(),
    /** Legal / utility link labels bottom-right. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'HeartLink'
    const footerTagline =
      props.tagline ??
      'Helping millions find meaningful connections through genuine compatibility matching.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Premium', 'Safety', 'Success Stories'],
          },
          {
            title: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Blog'],
          },
          {
            title: 'Support',
            links: [
              'Help Center',
              'Contact Us',
              'Community Guidelines',
              'Terms of Service',
            ],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn']
    const footerNote = props.note ?? `© 2024 ${brand} Inc. All rights reserved.`
    const footerLegal = props.legal?.length
      ? props.legal
      : ['Privacy Policy', 'Terms of Service', 'Cookie Policy']
    const homeTarget = props.homeTarget ?? 'How It Works'

    const HeartGlyph = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    )

    const socialPaths = [
      'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
      'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
      'M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z',
    ]

    return (
      <footer
        className={cn('border-t border-border bg-muted/50', props.className)}
      >
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
            <div className="col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                  <HeartGlyph className="size-5" />
                </span>
                <span className="text-xl font-bold text-foreground">
                  {brand}
                </span>
              </button>
              <p className="mb-4 max-w-xs text-muted-foreground">
                {footerTagline}
              </p>
              <div className="flex gap-4">
                {socials.map((social, i) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="grid size-10 place-items-center rounded-full bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="size-5"
                      aria-hidden="true"
                    >
                      <path d={socialPaths[i % socialPaths.length]} />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="mb-4 font-semibold text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
            <p className="text-sm text-muted-foreground">{footerNote}</p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              {footerLegal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="transition-colors hover:text-foreground"
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
