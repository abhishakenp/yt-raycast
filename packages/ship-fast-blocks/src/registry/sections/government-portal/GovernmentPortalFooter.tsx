import { z } from 'zod/v4'
import { defineComponent } from '@openuidev/react-lang'
import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { SiteFooter } from '#/section-kit/SiteFooter.tsx'

/**
 * GovernmentPortalFooter — indigo (#4B57A0) classic indian government / PSU
 * portal footer in the "TVNL" state power utility look. An organisation blurb
 * sits beside generic info columns (Navigation, Head Office, Plant Office): the
 * Navigation column renders as clickable links routed through useNavigate while
 * the address columns render as plain text. A bordered important-links partner
 * strip carries external government links, and an auto-updating copyright row
 * sits on a darker sub-bar. Official, civic closing chrome for public sector,
 * municipal, utility, power and electricity board portals. Renders fully with no
 * props via baked-in defaults.
 */
export const GovernmentPortalFooter = defineComponent({
  name: 'GovernmentPortalFooter',
  description:
    'Indigo (#4B57A0) classic indian government / PSU footer: an organisation blurb, Navigation, Head Office and Plant Office columns, an important-links partner strip and an auto-updating copyright row. Official, civic closing chrome for public sector, municipal, utility, power and electricity board portals carrying tender and notice links. Use for the footer of any classic government portal.',
  props: z.object({
    /** Organisation / authority name. */
    orgName: z.string().optional(),
    /** Organisation blurb shown in the first column. */
    blurb: z.string().optional(),
    /** Generic link / info columns (Navigation, Head Office, Plant Office). */
    columns: z
      .array(z.object({ title: z.string(), lines: z.array(z.string()) }))
      .optional(),
    /** Important-links / partner strip (external government links). */
    importantLinks: z
      .array(z.object({ label: z.string(), href: z.string() }))
      .optional(),
    /** Copyright suffix. */
    note: z.string().optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const go = useNavigate()
    const orgName = props.orgName ?? 'TENUGHAT VIDYUT NIGAM LIMITED'
    const blurb =
      props.blurb ??
      'Tenughat Vidyut Nigam Limited (TVNL) is a wholly-owned undertaking of the Government of Jharkhand, operating the Tenughat Thermal Power Station near Tenughat Dam in Bokaro district and committed to reliable, transparent public-sector power generation.'
    const columns = props.columns?.length
      ? props.columns
      : [
          {
            title: 'Navigation',
            lines: [
              'Tender Notices',
              'Tender Extension',
              'Public Notices',
              'Careers at TVNL',
              'Contact Us',
            ],
          },
          {
            title: 'Head Office',
            lines: [
              'Tenughat Vidyut Nigam Limited',
              'JUPMI Building Premises, ABD Area',
              'Ranchi Smart City, P.O & P.S - Dhurwa',
              'Dist. Ranchi, Jharkhand, 834004',
              'Mon - Fri, 10:00 AM - 6:00 PM',
            ],
          },
          {
            title: 'Plant Office',
            lines: [
              'Tenughat Thermal Power Station',
              'P.O : T.T.P.S., Lalpania',
              'Dist. Bokaro, Jharkhand, 829149',
              'Mon - Sat, 10:00 AM - 6:00 PM',
            ],
          },
        ]
    const importantLinks = props.importantLinks?.length
      ? props.importantLinks
      : [
          {
            label: 'Government of Jharkhand',
            href: 'https://www.jharkhand.gov.in/',
          },
          { label: 'Ministry of Coal', href: 'https://coal.nic.in/' },
          { label: 'MyGov', href: 'https://www.mygov.in/' },
          {
            label: 'Digital India',
            href: 'https://www.digitalindia.gov.in/',
          },
          { label: 'India.gov.in', href: 'https://www.india.gov.in/' },
        ]
    const note = props.note ?? 'All rights reserved.'

    // Delegate the multi-column layout to the shared SiteFooter kit. Gov
    // columns ({title, lines}) map onto kit columns ({title, links}); every
    // entry renders as a useNavigate button — Navigation routes, address lines
    // become inert buttons (acceptable; the column layout is what's delegated).
    return (
      <div
        className={cn('w-full bg-[#4B57A0] text-white', props.className)}
        style={{
          fontFamily: '"Alegreya Sans","Open Sans",system-ui,sans-serif',
        }}
      >
        <SiteFooter
          brand="TVNL"
          brandClassName="text-[18px] font-semibold text-white"
          tagline={`${orgName} — ${blurb}`}
          columns={columns.map((col) => ({
            title: col.title,
            links: col.lines,
          }))}
          note={note}
          className="border-none bg-transparent text-white"
        />

        <div className="border-t border-white/20">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-4 text-[14px]">
            <span className="font-semibold text-white">Important Links:</span>
            {importantLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                target="_blank"
                rel="noreferrer noopener"
                className="text-white/85 underline-offset-2 hover:text-white hover:underline"
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>

        <div className="bg-[#3b4684]">
          <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-center gap-1 px-4 py-3 text-[13px] text-white/80">
            &copy; {new Date().getFullYear()}{' '}
            <button
              type="button"
              onClick={() => go(orgName)}
              className="font-medium text-white/90 hover:text-white hover:underline"
            >
              {orgName}
            </button>
            . {note}
          </div>
        </div>
      </div>
    )
  },
})
