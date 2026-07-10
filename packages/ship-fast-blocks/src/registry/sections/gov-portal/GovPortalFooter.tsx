import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { MailIcon, MapPinIcon, PhoneIcon } from 'lucide-react'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  pickLang,
  useGovLang,
  type GovPortalLakebed,
} from './gov-portal-interactions.tsx'

const officeSchema = z.object({
  name: z.string(),
  nameHi: z.string().optional(),
  addr: z.string().optional(),
  addrHi: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
  hoursHi: z.string().optional(),
})

/**
 * GovPortalFooter — indigo government-portal footer with an about blurb, a
 * navigation column, and two office cards (head office + plant office) each
 * showing address, email, phone and working hours. Generic across any PSU /
 * department; content is props. Named *Footer so it is treated as chrome and
 * excluded from the admin data tables.
 */
export const GovPortalFooter = defineCapsule({
  name: 'GovPortalFooter',
  description:
    'Indigo government / PSU portal footer with an about blurb, a navigation column of page links, and two office cards (head office + plant office) each with address, email, phone and working hours. Use as the closing footer on a government or civic portal.',
  props: z.object({
    /** Organisation name. */
    brand: z.string().optional(),
    /** Organisation name (Hindi). */
    brandHi: z.string().optional(),
    /** Short about / description blurb. */
    about: z.string().optional(),
    /** Short about / description blurb (Hindi). */
    aboutHi: z.string().optional(),
    /** Footer navigation links. */
    navLinks: z
      .array(
        z.object({
          label: z.string(),
          labelHi: z.string().optional(),
          target: z.string().optional(),
        }),
      )
      .optional(),
    /** Head office details. */
    headOffice: officeSchema.optional(),
    /** Plant / field office details. */
    plantOffice: officeSchema.optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const go = useNavigate()
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const brand = pickLang(
      lang,
      props.brand ?? 'Government Portal',
      props.brandHi ?? props.brand ?? 'सरकारी पोर्टल',
    )
    const about = pickLang(
      lang,
      props.about ??
        'An official undertaking committed to transparent public service and reliable delivery.',
      props.aboutHi ??
        props.about ??
        'पारदर्शी जनसेवा और विश्वसनीय आपूर्ति के लिए प्रतिबद्ध एक आधिकारिक उपक्रम।',
    )
    const navLinks = props.navLinks?.length
      ? props.navLinks
      : [
          {
            label: 'Tender Notices',
            labelHi: 'निविदा सूचनाएँ',
            target: 'Tenders',
          },
          {
            label: 'Extension Notices',
            labelHi: 'विस्तार सूचनाएँ',
            target: 'Tenders',
          },
          {
            label: 'Contact Us',
            labelHi: 'संपर्क करें',
            target: 'Contact Us',
          },
        ]

    const OfficeCard = ({
      title,
      office,
    }: {
      title: string
      office?: z.infer<typeof officeSchema>
    }) => {
      if (!office) return null
      return (
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/90">
            {title}
          </h3>
          <p className="text-sm font-medium text-primary-foreground">
            {pickLang(lang, office.name, office.nameHi ?? office.name)}
          </p>
          {office.addr ? (
            <p className="mt-1 flex gap-2 text-sm text-primary-foreground/70">
              <MapPinIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {pickLang(lang, office.addr, office.addrHi ?? office.addr)}
              </span>
            </p>
          ) : null}
          {office.email ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/70">
              <MailIcon className="size-4 shrink-0" aria-hidden />
              <a href={`mailto:${office.email}`} className="hover:underline">
                {office.email}
              </a>
            </p>
          ) : null}
          {office.phone ? (
            <p className="mt-1 flex items-center gap-2 text-sm text-primary-foreground/70">
              <PhoneIcon className="size-4 shrink-0" aria-hidden />
              <span>{office.phone}</span>
            </p>
          ) : null}
          {office.hours ? (
            <p className="mt-1 text-xs text-primary-foreground/50">
              {pickLang(lang, office.hours, office.hoursHi ?? office.hours)}
            </p>
          ) : null}
        </div>
      )
    }

    return (
      <footer
        className={cn('bg-primary text-primary-foreground', props.className)}
      >
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="lg:col-span-1">
            <h2 className="mb-3 text-base font-bold uppercase tracking-tight">
              {brand}
            </h2>
            <p className="text-sm text-primary-foreground/70">{about}</p>
          </div>
          <nav aria-label="Footer">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary-foreground/90">
              {pickLang(lang, 'Navigation', 'नेविगेशन')}
            </h3>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button
                    type="button"
                    onClick={() => go(link.target ?? link.label)}
                    className="text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground hover:underline"
                  >
                    {pickLang(lang, link.label, link.labelHi ?? link.label)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
          <OfficeCard
            title={pickLang(lang, 'Head Office', 'प्रधान कार्यालय')}
            office={props.headOffice}
          />
          <OfficeCard
            title={pickLang(lang, 'Plant Office', 'संयंत्र कार्यालय')}
            office={props.plantOffice}
          />
        </div>
        <div className="border-t border-primary-foreground/15">
          <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-primary-foreground/60 sm:px-6 lg:px-8">
            © {brand}.{' '}
            {pickLang(lang, 'All rights reserved.', 'सर्वाधिकार सुरक्षित।')}
          </div>
        </div>
      </footer>
    )
  },
})
