import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { useNavigate } from '#/lib/use-navigate.tsx'

/**
 * FoodDeliveryFooter — muted multi-column site footer for a food-delivery /
 * restaurant-marketplace site. A wide branded column (location-pin mark + brand
 * name + tagline) beside several link columns (company / resources / legal),
 * then a bordered bottom bar with a copyright line and a row of social icons.
 * The brand click, every link, and the social icons route through useNavigate.
 * Use as the closing footer for food-delivery apps, restaurant aggregators,
 * online-ordering platforms, or takeout services. Renders fully with no props
 * via baked-in "nosh" defaults.
 */
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'
export const FoodDeliveryFooter = defineCapsule({
  name: 'FoodDeliveryFooter',
  description:
    'Muted multi-column site footer for a food-delivery / restaurant-marketplace site: a wide branded column (location-pin mark + brand name + tagline) beside several link columns (company / resources / legal), then a bordered bottom bar with a copyright line and a row of social icons. Brand click, links, and social icons route through useNavigate. Use as the closing footer for food-delivery apps, restaurant aggregators, online-ordering platforms, or takeout services.',
  props: z.object({
    /** Brand name shown beside the pin mark. */
    brand: z.string().optional(),
    /** Target label for the brand/logo click (usually the home route). */
    homeTarget: z.string().optional(),
    /** Tagline paragraph under the brand. */
    description: z.string().optional(),
    /** Trailing copyright note after the year + brand. */
    note: z.string().optional(),
    /** Footer link columns. */
    columns: z
      .array(
        z.object({
          heading: z.string(),
          links: z.array(z.string()),
        }),
      )
      .optional(),
    /** Social icon labels (aria-label + navigate target); icon by name. */
    socials: z.array(z.string()).optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const brand = props.brand ?? 'nosh'
    const homeTarget = props.homeTarget ?? 'Home'
    const footerDesc =
      props.description ??
      'Your favorite food, delivered fast. Connecting you with the best local restaurants since 2020.'
    const footerNote = props.note ?? 'All rights reserved.'
    const footerColumns = props.columns?.length
      ? props.columns
      : [
          {
            heading: 'Company',
            links: ['About Us', 'Careers', 'Press', 'Contact'],
          },
          {
            heading: 'Resources',
            links: ['Partner with Us', 'Driver Jobs', 'Help Center', 'Blog'],
          },
          {
            heading: 'Legal',
            links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
          },
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram']
    const PinMark = ({ className }: { className?: string }) => (
      <svg
        className={className}
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    )
    const socialPaths: Record<string, string> = {
      Twitter:
        'M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z',
      Instagram:
        'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z',
    }
    const fallbackSocialPath =
      'M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.891h2.54V9.797c0-2.508 1.493-3.891 3.777-3.891 1.094 0 2.238.195 2.238.195v2.461h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.891h-2.33v6.987C18.343 21.128 22 16.991 22 12z'
    void go
    void homeTarget
    void footerDesc
    void PinMark
    void fallbackSocialPath
    void socialPaths
    return (
      <SiteFooter
        brand={brand}
        columns={footerColumns.map((c) => ({
          title: c.heading,
          links: c.links,
        }))}
        social={socials.map((s) => ({ label: s }))}
        note={footerNote}
        className={props.className}
      />
    )
  },
})
