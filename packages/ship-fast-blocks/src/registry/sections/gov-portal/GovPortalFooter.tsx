import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'
import { govPortalLakebed } from './gov-portal-lakebed.ts'
import {
  pickLang,
  useGovLang,
  type GovPortalLakebed,
} from './gov-portal-interactions.tsx'
import {
  SiteFooter,
  FooterContent,
  FooterGrid,
  FooterBrand,
  FooterTagline,
} from '#/section-kit/SiteFooter.tsx'
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
    return (
      <SiteFooter className={props.className}>
        <FooterContent>
          <FooterGrid>
            <FooterBrand brand={brand}>
              <FooterTagline>{about}</FooterTagline>
            </FooterBrand>
          </FooterGrid>
        </FooterContent>
      </SiteFooter>
    )
  },
})
