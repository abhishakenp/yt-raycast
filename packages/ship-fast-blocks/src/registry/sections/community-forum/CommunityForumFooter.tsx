import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { Logo as BrandLogo } from '#/section-kit/Logo.tsx'

/**
 * CommunityForumFooter — rich multi-column footer for a community-platform / discussion-forum
 * landing page. A top-bordered section with a brand column (logo + tagline + social icon buttons)
 * plus a grid of link columns, and a bottom bar with copyright and legal links. Every link and the
 * brand button route through useNavigate. Use as the closing site footer for community platforms,
 * SaaS products, or online forum services.
 */
export const CommunityForumFooter = defineCapsule({
  name: 'CommunityForumFooter',
  description:
    'Rich multi-column footer for a community-platform / discussion-forum landing page: a top-bordered section with a brand column (logo + tagline + social icon buttons) plus a grid of link columns, and a bottom bar with copyright and legal links. Every link and the brand button route through useNavigate. Use as the closing site footer for community platforms, SaaS products, or online forum services.',
  props: z.object({
    /** Brand / product name shown in the logo and copyright. */
    brand: z.string().optional(),
    /** Brand tagline under the logo. */
    tagline: z.string().optional(),
    /** Link columns: heading + link labels. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    /** Legal / utility link labels in the bottom bar. */
    legal: z.array(z.string()).optional(),
    /** Navigation target for the brand button. */
    homeTarget: z.string().optional(),
    /** Social link labels for the social icon buttons. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'Threadloom'
    const tagline =
      props.tagline ??
      'The modern platform for communities that value depth, organization, and meaningful connection.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Product',
            links: [
              'Features',
              'Pricing',
              'Integrations',
              'Changelog',
              'Roadmap',
            ],
          },
          {
            heading: 'Resources',
            links: [
              'Documentation',
              'API Reference',
              'Community',
              'Blog',
              'Guides',
            ],
          },
          {
            heading: 'Company',
            links: ['About', 'Careers', 'Contact', 'Privacy', 'Terms'],
          },
        ]
    const note = props.note ?? 'All rights reserved.'
    const legal = props.legal?.length
      ? props.legal
      : ['Status', 'Security', 'Sitemap']
    const homeTarget = props.homeTarget ?? 'Features'
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'GitHub', 'Instagram']

    const BrandMark = ({ className }: { className?: string }) => (
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        className={className}
        aria-hidden="true"
      >
        <circle cx="8" cy="16" r="3" />
        <circle cx="16" cy="16" r="3" />
        <circle cx="24" cy="16" r="3" />
      </svg>
    )

    const SocialIcon = ({ name }: { name?: string }) => {
      if (name === 'Twitter') {
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
          </svg>
        )
      }
      if (name === 'GitHub') {
        return (
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
        )
      }
      return (
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      )
    }

    return (
      <footer
        className={cn(
          'border-t border-border bg-background py-16',
          props.className,
        )}
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5 lg:gap-12">
            <div className="col-span-2 lg:col-span-2">
              <button
                type="button"
                onClick={() => go(homeTarget)}
                className="mb-4 flex items-center gap-2"
              >
                <BrandLogo
                  brand={brand}
                  fallback={<BrandMark className="size-8 text-foreground" />}
                  labelClassName="text-xl font-semibold text-foreground"
                />
              </button>
              <p className="mb-4 max-w-xs text-muted-foreground">{tagline}</p>
              <div className="flex items-center gap-4">
                {socials.map((social) => (
                  <button
                    key={social}
                    type="button"
                    aria-label={social}
                    onClick={() => go(social)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <SocialIcon name={social} />
                  </button>
                ))}
              </div>
            </div>
            {columns.map((col) => (
              <div key={col.heading}>
                <h4 className="mb-4 font-semibold text-foreground">
                  {col.heading}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <button
                        type="button"
                        onClick={() => go(link)}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} {brand} Inc. {note}
            </p>
            <div className="flex items-center gap-6">
              {legal.map((link) => (
                <button
                  key={link}
                  type="button"
                  onClick={() => go(link)}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
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
