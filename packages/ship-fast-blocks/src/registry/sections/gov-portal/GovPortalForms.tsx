import { defineCapsule } from '#/capsules/openui.ts'
import { useState } from 'react'
import { z } from 'zod/v4'
import {
  CheckCircle2Icon,
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from 'lucide-react'

import { Card } from '#/section-kit/Card.tsx'
import { GovFormTable, GovFormRow, GovFormHeader, GovFormBody } from '#/section-kit/GovFormTable.tsx'
import { cn } from '#/lib/utils.ts'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  GovAccountButton,
  GovMutationSpinner,
  pickLang,
  useGovCatalog,
  useGovLang,
  useGrievanceForm,
  useVendorPortal,
  type GovLang,
  type GovPortalLakebed,
  type GovRow,
} from './gov-portal-interactions.tsx'

function str(row: GovRow, key: string) {
  return String(row[key] ?? '').trim()
}

const field =
  'w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'
const labelCls = 'mb-1 block text-sm font-medium text-foreground'

/**
 * GovPortalGrievance — a public grievance-redressal form (name, email, mobile,
 * subject, description, address) that writes a grievance record to Lakebed and
 * shows a confirmation. Admin staff triage submissions in the admin panel.
 */
export const GovPortalGrievance = defineCapsule({
  name: 'GovPortalGrievance',
  description:
    'Public grievance-redressal form on a government portal (name, email, mobile, subject, description, address) that records the grievance to the backend and confirms submission. Use as the grievance / complaint intake section of a government or PSU portal.',
  props: z.object({
    heading: z.string().optional(),
    description: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const form = useGrievanceForm(lakebed as GovPortalLakebed)
    const heading = pickLang(
      lang,
      props.heading ?? 'Grievance Redressal',
      'शिकायत निवारण',
    )
    const description = pickLang(
      lang,
      props.description ??
        'Submit your grievance and we will respond as per our redressal policy.',
      'अपनी शिकायत दर्ज करें; हम अपनी निवारण नीति के अनुसार उत्तर देंगे।',
    )

    return (
      <GovFormTable
        variant="muted"
        className={cn('bg-muted/30 py-16 border-0', props.className)}
      >
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>

          {form.submitted ? (
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2Icon className="size-5 shrink-0" aria-hidden />
              <span>
                {pickLang(lang, 'Your grievance', 'आपकी शिकायत')} “
                {form.submitted}”{' '}
                {pickLang(
                  lang,
                  'has been registered. Thank you.',
                  'दर्ज कर ली गई है। धन्यवाद।',
                )}
              </span>
            </div>
          ) : null}

          <form
            onSubmit={form.submit}
            className="mt-6 grid gap-4 rounded-2xl border border-border bg-card p-6 sm:grid-cols-2"
          >
            <div>
              <label className={labelCls} htmlFor="grv-name">
                {pickLang(lang, 'Name', 'नाम')} *
              </label>
              <input id="grv-name" name="name" required className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="grv-email">
                {pickLang(lang, 'Email', 'ईमेल')}
              </label>
              <input
                id="grv-email"
                name="email"
                type="email"
                className={field}
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="grv-mobile">
                {pickLang(lang, 'Mobile No.', 'मोबाइल नं.')}
              </label>
              <input id="grv-mobile" name="mobile" className={field} />
            </div>
            <div>
              <label className={labelCls} htmlFor="grv-subject">
                {pickLang(lang, 'Subject', 'विषय')} *
              </label>
              <input
                id="grv-subject"
                name="subject"
                required
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="grv-desc">
                {pickLang(lang, 'Description', 'विवरण')}
              </label>
              <textarea
                id="grv-desc"
                name="description"
                rows={3}
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={labelCls} htmlFor="grv-addr">
                {pickLang(lang, 'Address', 'पता')}
              </label>
              <textarea
                id="grv-addr"
                name="address"
                rows={2}
                className={field}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={form.isPending}
                aria-busy={form.isPending}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
              >
                {form.isPending ? <GovMutationSpinner /> : null}
                {form.isPending
                  ? pickLang(lang, 'Sending', 'भेजा जा रहा है')
                  : pickLang(lang, 'Send', 'भेजें')}
              </button>
            </div>
          </form>
        </div>
      </GovFormTable>
    )
  },
})

/**
 * GovPortalVendor — an in-stack vendor portal replacing the external SAP SRM /
 * payment gateway: register as a vendor, submit a bid against a tender, and pay
 * an RFx fee through a mock gateway (pending → paid + receipt). All records are
 * stored in Lakebed and visible to admin. Auth is via Shoo.
 */
export const GovPortalVendor = defineCapsule({
  name: 'GovPortalVendor',
  description:
    'In-stack vendor / bidder portal for a government procurement site: register as a vendor, submit a bid against a tender, and pay an RFx fee via a mock payment gateway (pending → paid with receipt). Replaces external SRM / payment portals; records are stored in the backend. Use as the vendor portal on a government tender site.',
  props: z.object({
    heading: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const vendor = useVendorPortal(lakebed as GovPortalLakebed)
    const heading = pickLang(
      lang,
      props.heading ?? 'Vendor Portal',
      'विक्रेता पोर्टल',
    )
    const [vendorMsg, setVendorMsg] = useState('')
    const [bidMsg, setBidMsg] = useState('')
    const [payMsg, setPayMsg] = useState('')

    return (
      <section className={cn('bg-background py-16', props.className)}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              {heading}
            </h2>
            <GovAccountButton
              lakebed={lakebed as GovPortalLakebed}
              label={pickLang(lang, 'Vendor login', 'विक्रेता लॉगिन')}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* register */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const company = String(data.get('company') ?? '')
                if (!company.trim()) return
                await vendor.register({
                  company,
                  gstin: String(data.get('gstin') ?? ''),
                  email: String(data.get('email') ?? ''),
                  phone: String(data.get('phone') ?? ''),
                })
                setVendorMsg(`Registered ${company.trim()}`)
                e.currentTarget.reset()
              }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-card-foreground">
                {pickLang(
                  lang,
                  'Register as a Vendor',
                  'विक्रेता के रूप में पंजीकरण',
                )}
              </h3>
              <div className="space-y-3">
                <input
                  name="company"
                  placeholder={pickLang(
                    lang,
                    'Company name *',
                    'कंपनी का नाम *',
                  )}
                  required
                  className={field}
                />
                <input
                  name="gstin"
                  placeholder={pickLang(lang, 'GSTIN', 'जीएसटीआईएन')}
                  className={field}
                />
                <input
                  name="email"
                  type="email"
                  placeholder={pickLang(lang, 'Email', 'ईमेल')}
                  className={field}
                />
                <input
                  name="phone"
                  placeholder={pickLang(lang, 'Phone', 'फोन')}
                  className={field}
                />
                <button
                  type="submit"
                  disabled={vendor.registerPending}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
                >
                  {vendor.registerPending
                    ? pickLang(lang, 'Registering', 'पंजीकरण हो रहा है')
                    : pickLang(lang, 'Register', 'पंजीकरण करें')}
                </button>
                {vendorMsg ? (
                  <p className="text-xs font-medium text-emerald-700">
                    {vendorMsg}
                  </p>
                ) : null}
              </div>
            </form>

            {/* bid */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const tenderNit = String(data.get('tenderNit') ?? '')
                if (!tenderNit.trim()) return
                await vendor.bid({
                  tenderNit,
                  company: String(data.get('company') ?? ''),
                  emdRef: String(data.get('emdRef') ?? ''),
                })
                setBidMsg(`Bid submitted for ${tenderNit.trim()}`)
                e.currentTarget.reset()
              }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-card-foreground">
                {pickLang(lang, 'Submit a Bid', 'बोली जमा करें')}
              </h3>
              <div className="space-y-3">
                <input
                  name="tenderNit"
                  placeholder={pickLang(
                    lang,
                    'Tender NIT No. *',
                    'निविदा एनआईटी सं. *',
                  )}
                  required
                  className={field}
                />
                <input
                  name="company"
                  placeholder={pickLang(lang, 'Company name', 'कंपनी का नाम')}
                  className={field}
                />
                <input
                  name="emdRef"
                  placeholder={pickLang(
                    lang,
                    'EMD / BG reference',
                    'ईएमडी / बीजी संदर्भ',
                  )}
                  className={field}
                />
                <button
                  type="submit"
                  disabled={vendor.bidPending}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-70"
                >
                  {vendor.bidPending
                    ? pickLang(lang, 'Submitting', 'जमा हो रहा है')
                    : pickLang(lang, 'Submit Bid', 'बोली जमा करें')}
                </button>
                {bidMsg ? (
                  <p className="text-xs font-medium text-emerald-700">
                    {bidMsg}
                  </p>
                ) : null}
              </div>
            </form>

            {/* pay */}
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                const rfxNo = String(data.get('rfxNo') ?? '')
                if (!rfxNo.trim()) return
                await vendor.pay({
                  rfxNo,
                  company: String(data.get('company') ?? ''),
                  amount: Number(data.get('amount') ?? 0),
                  type: 'RFx Fee',
                })
                setPayMsg(`Payment completed for ${rfxNo.trim()}`)
                e.currentTarget.reset()
              }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <h3 className="mb-3 font-semibold text-card-foreground">
                {pickLang(lang, 'Tender Payment', 'निविदा भुगतान')}
              </h3>
              <div className="space-y-3">
                <input
                  name="rfxNo"
                  placeholder={pickLang(lang, 'RFx No. *', 'आरएफएक्स सं. *')}
                  required
                  className={field}
                />
                <input
                  name="company"
                  placeholder={pickLang(
                    lang,
                    'Vendor / company',
                    'विक्रेता / कंपनी',
                  )}
                  className={field}
                />
                <input
                  name="amount"
                  type="number"
                  placeholder={pickLang(lang, 'Amount (₹)', 'राशि (₹)')}
                  className={field}
                />
                <button
                  type="submit"
                  disabled={vendor.payPending}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-70"
                >
                  {vendor.payPending
                    ? pickLang(lang, 'Processing', 'प्रोसेस हो रहा है')
                    : pickLang(lang, 'Pay (Mock)', 'भुगतान करें (मॉक)')}
                </button>
                {payMsg ? (
                  <p className="text-xs font-medium text-emerald-700">
                    {payMsg}
                  </p>
                ) : null}
              </div>
            </form>
          </div>

          {/* status tables */}
          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            <StatusList
              title={pickLang(lang, 'Registered Vendors', 'पंजीकृत विक्रेता')}
              lang={lang}
              rows={vendor.vendors}
              render={(r) =>
                `${str(r, 'company')} · ${str(r, 'vendorNo')}`.replace(
                  / · $/,
                  '',
                )
              }
            />
            <StatusList
              title={pickLang(lang, 'Submitted Bids', 'जमा की गई बोलियाँ')}
              lang={lang}
              rows={vendor.bids}
              render={(r) => `${str(r, 'tenderNit')} — ${str(r, 'status')}`}
            />
            <StatusList
              title={pickLang(lang, 'RFx Payments', 'आरएफएक्स भुगतान')}
              lang={lang}
              rows={vendor.payments}
              render={(r) =>
                `${str(r, 'rfxNo')} · ₹${str(r, 'amount')} · ${str(r, 'status')}${
                  str(r, 'receiptNo') ? ` · ${str(r, 'receiptNo')}` : ''
                }`
              }
            />
          </div>
        </div>
      </section>
    )
  },
})

function StatusList({
  title,
  rows,
  render,
  lang,
}: {
  title: string
  rows: GovRow[]
  render: (row: GovRow) => string
  lang: GovLang
}) {
  return (
    <Card
      variant="muted"
      rounded="2xl"
      padding="sm"
      className="bg-muted/30 p-5"
    >
      <GovFormHeader asChild>
        <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      </GovFormHeader>
      {rows.length ? (
        <GovFormBody asChild>
        <ul className="space-y-2 text-xs text-muted-foreground">
          {rows.slice(0, 8).map((row, i) => (
            <GovFormRow asChild key={i}>
              <li className="truncate">
                {render(row)}
              </li>
            </GovFormRow>
          ))}
        </ul>
        </GovFormBody>
      ) : (
        <p className="text-xs text-muted-foreground">
          {pickLang(lang, 'No records yet.', 'अभी कोई रिकॉर्ड नहीं।')}
        </p>
      )}
    </Card>
  )
}

const officeSchema = z.object({
  name: z.string(),
  addr: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  hours: z.string().optional(),
})

/**
 * GovPortalContact — a contact section with head-office and plant-office cards
 * (address, email, phone, hours) plus a grid of important external links.
 * Offices are props; important links are managed in Lakebed.
 */
export const GovPortalContact = defineCapsule({
  name: 'GovPortalContact',
  description:
    'Contact section for a government / PSU portal with head-office and plant-office cards (address, email, phone, working hours) plus a grid of important external government links. Use as the contact page of a government portal.',
  props: z.object({
    heading: z.string().optional(),
    headOffice: officeSchema.optional(),
    plantOffice: officeSchema.optional(),
    importantLinks: z.array(z.record(z.string(), z.any())).optional(),
    className: z.string().optional(),
  }),
  lakebed: govPortalLakebed,
  component: ({ props, lakebed }) => {
    const { lang } = useGovLang(lakebed as GovPortalLakebed)
    const catalog = useGovCatalog(lakebed as GovPortalLakebed, {
      importantLinks: props.importantLinks ?? [],
    })
    const heading = pickLang(lang, props.heading ?? 'Contact Us', 'संपर्क करें')
    const offices = [
      {
        title: pickLang(lang, 'Head Office', 'प्रधान कार्यालय'),
        office: props.headOffice,
      },
      {
        title: pickLang(lang, 'Plant Office', 'संयंत्र कार्यालय'),
        office: props.plantOffice,
      },
    ].filter((o) => o.office)
    const links = catalog.importantLinks

    return (
      <section className={cn('bg-background py-16', props.className)}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-2xl font-semibold tracking-tight text-foreground">
            {heading}
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {offices.map(({ title, office }) => (
              <Card key={title} rounded="2xl">
                <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
                  {title}
                </h3>
                <p className="font-medium text-card-foreground">
                  {office?.name}
                </p>
                {office?.addr ? (
                  <p className="mt-2 flex gap-2 text-sm text-muted-foreground">
                    <MapPinIcon
                      className="mt-0.5 size-4 shrink-0"
                      aria-hidden
                    />
                    <span>{office.addr}</span>
                  </p>
                ) : null}
                {office?.email ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <MailIcon className="size-4 shrink-0" aria-hidden />
                    <a
                      href={`mailto:${office.email}`}
                      className="hover:underline"
                    >
                      {office.email}
                    </a>
                  </p>
                ) : null}
                {office?.phone ? (
                  <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                    <PhoneIcon className="size-4 shrink-0" aria-hidden />
                    <span>{office.phone}</span>
                  </p>
                ) : null}
                {office?.hours ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {office.hours}
                  </p>
                ) : null}
              </Card>
            ))}
          </div>

          {links.length ? (
            <div className="mt-10">
              <h3 className="mb-4 text-lg font-semibold text-foreground">
                {pickLang(lang, 'Important Links', 'महत्वपूर्ण लिंक')}
              </h3>
              <div className="flex flex-wrap gap-3">
                {links.map((link, i) => (
                  <a
                    key={`${str(link, 'label')}-${i}`}
                    href={str(link, 'url') || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-input px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {str(link, 'label')}
                    <ExternalLinkIcon className="size-3.5" aria-hidden />
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    )
  },
})
