import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * FlightSimulatorFooter — a rich, multi-column closing footer for a flight
 * simulator site. Thin configuration over the shared `SiteFooter` composite: a
 * bold wordmark beside an inline winged-plane mark, an aviation tagline, a
 * social row, and a responsive grid of link columns (Product, Editions,
 * Community, Support), with an auto-updating copyright line in the bottom bar.
 * Use as the site-wide footer for flight simulators, airliner / combat sims, or
 * aviation titles. Renders fully with no props via baked-in "SkyForge Sim"
 * defaults.
 */
const WingMark = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M2 12h7l4-7 2 7h7" />
    <path d="M9 12l-3 5" />
    <path d="M22 12l-4 5" />
    <path d="M9 12l4 5" />
  </svg>
)

export const FlightSimulatorFooter = defineComponent({
  name: 'FlightSimulatorFooter',
  description:
    'Rich, multi-column closing footer for a flight-simulator site built on the shared SiteFooter composite: a bold wordmark + inline winged-plane mark, an aviation tagline, a social row, and a responsive grid of link columns (Product, Editions, Community, Support), with an auto-updating copyright line in the bottom bar. Every brand, social, and column link routes through useNavigate. Use as the site-wide footer for flight simulators, airliner / combat sims, or aviation titles.',
  props: z.object({
    /** Product / brand name shown as the wordmark. */
    brand: z.string().optional(),
    /** Short tagline below the wordmark. */
    tagline: z.string().optional(),
    /** Social channels rendered as a link row under the brand. */
    social: z
      .array(z.object({ label: z.string(), href: z.string().optional() }))
      .optional(),
    /** Link columns (Product, Editions, Community, Support, …). */
    columns: z
      .array(z.object({ title: z.string(), links: z.array(z.string()) }))
      .optional(),
    /** Copyright note appended after the brand + year. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const social = props.social?.length
      ? props.social
      : [
          { label: 'YouTube' },
          { label: 'Discord' },
          { label: 'X' },
          { label: 'Twitch' },
        ]
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Product',
            links: ['Features', 'Aircraft', 'Scenery', 'System Requirements'],
          },
          {
            title: 'Editions',
            links: ['Standard', 'Deluxe', 'Premium', 'Add-on Packs'],
          },
          {
            title: 'Community',
            links: ['Forums', 'Discord', 'Liveries', 'Events'],
          },
          {
            title: 'Support',
            links: ['Help Center', 'Patch Notes', 'Report a Bug', 'Contact'],
          },
        ]

    return (
      <SiteFooter
        brand={props.brand ?? 'SkyForge Sim'}
        brandMark={<WingMark className="size-8 text-primary" />}
        brandClassName="text-xl font-bold tracking-tight"
        tagline={
          props.tagline ??
          'The whole world is your runway. Fly anywhere, in any weather, in stunning detail.'
        }
        social={social}
        columns={columns}
        note={props.note ?? 'All rights reserved.'}
        className={props.className}
      />
    )
  },
})
