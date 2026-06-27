import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { SectionHeading } from '#/section-kit/SectionHeading.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * GovernmentPortalContact — classic Indian-government / public-sector (PSU)
 * "Contact us" band: Head Office + Plant Office address cards (address, phone,
 * email) beside a working grievance / enquiry form (name, email, subject,
 * message) that writes a shared Lakebed inquiry record, plus an optional
 * officials directory table (Name / Designation / Email). Gov-blue panel
 * headers (#3346B5), #640032 directory accents, #333 body. Use for the
 * official Contact us, head-office, grievance or staff-directory section of any
 * classic government, civic, municipal, PSU, utility or public-sector portal.
 */
export const GovernmentPortalContact = defineCapsule({
  name: 'GovernmentPortalContact',
  description:
    'Classic Indian-government / public-sector (PSU) Contact us band: Head Office + Plant Office address cards (address, phone, email) beside a working Lakebed grievance / enquiry form (name, email, subject, message) that writes a shared inquiry record, plus an optional officials directory table (Name / Designation / Email). Handles citizen grievances, tender / notice queries and general enquiries. Gov-blue #3346B5 panel headers, #640032 directory accents, #333 body. Use for the official Contact us, head-office, plant-office, grievance or staff-directory section of any classic government, civic, municipal, PSU, utility or public-sector portal.',
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Office address cards (Head Office / Plant Office). */
    offices: z
      .array(
        z.object({
          name: z.string(),
          address: z.string(),
          phone: z.string().optional(),
          email: z.string().optional(),
        }),
      )
      .optional(),
    /** Optional officials directory rows. */
    directory: z
      .array(
        z.object({
          name: z.string(),
          designation: z.string(),
          email: z.string().optional(),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? 'Contact Us'
    const offices = props.offices?.length
      ? props.offices
      : [
          {
            name: 'Head Office',
            address:
              'JUPMI Building Premises, ABD Area\nRanchi Smart City, P.O & P.S — Dhurwa\nDist. Ranchi, Jharkhand — 834004',
            phone: '+91 651 244 0000',
            email: 'info@gov-portal.in',
          },
          {
            name: 'Plant Office',
            address:
              'Thermal Power Station, P.O — Lalpania\nDist. Bokaro, Jharkhand — 829149',
            phone: '+91 6549 270 000',
            email: 'plant@gov-portal.in',
          },
        ]
    const directory = props.directory?.length
      ? props.directory
      : [
          {
            name: 'Shri Anil Kumar Sharma',
            designation: 'Managing Director',
            email: 'md@gov-portal.in',
          },
          {
            name: 'Shri Ghanshyam Kumar',
            designation: 'ESE (Commercial)',
            email: 'ese.comm@gov-portal.in',
          },
          {
            name: 'Shri Dipak Kumar Singh',
            designation: 'Company Secretary',
            email: 'cs@gov-portal.in',
          },
        ]

    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Government portal grievance',
      successMessage:
        'Thank you — your enquiry has been received.',
    })

    const fieldClass =
      'w-full rounded-sm border border-[#ccc] bg-white px-3 py-2 text-[14px] text-[#333] outline-none transition-colors focus:border-[#0792D0]'
    const labelClass = 'mb-1 block text-[13px] font-medium text-[#555]'

    return (
      <section
        className={cn('px-6 py-12 lg:px-8', props.className)}
        style={{ fontFamily: '"Open Sans", "Alegreya Sans", sans-serif' }}
        aria-label={heading}
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeading
            title={heading}
            align="left"
            titleClassName="text-2xl font-semibold text-[#3346B5]"
            className="mb-6"
          />

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Office address cards */}
            <div className="space-y-6">
              {offices.map((office, i) => (
                <section
                  key={`${office.name}-${i}`}
                  className="rounded-sm border border-[#dfdfdf] bg-white shadow-sm"
                >
                  <h3 className="border-b border-[#dfdfdf] bg-[#f4f7fa] px-4 py-3 text-[16px] font-medium text-[#3346B5]">
                    {office.name}
                  </h3>
                  <ul className="space-y-3 p-5 text-[14px] leading-[21px] text-[#333]">
                    <li className="whitespace-pre-line">{office.address}</li>
                    {office.phone ? (
                      <li>
                        <span className="font-medium text-[#640032]">
                          Phone:{' '}
                        </span>
                        <a
                          href={`tel:${office.phone}`}
                          className="text-[#0792D0] hover:underline"
                        >
                          {office.phone}
                        </a>
                      </li>
                    ) : null}
                    {office.email ? (
                      <li>
                        <span className="font-medium text-[#640032]">
                          Email:{' '}
                        </span>
                        <a
                          href={`mailto:${office.email}`}
                          className="text-[#0792D0] hover:underline"
                        >
                          {office.email}
                        </a>
                      </li>
                    ) : null}
                  </ul>
                </section>
              ))}
            </div>

            {/* Grievance / enquiry form */}
            <section className="rounded-sm border border-[#dfdfdf] bg-white shadow-sm">
              <h3 className="border-b border-[#dfdfdf] bg-[#f4f7fa] px-4 py-3 text-[16px] font-medium text-[#3346B5]">
                Grievance / Enquiry
              </h3>
              <form onSubmit={inquiry.submitForm} className="space-y-4 p-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="gov-contact-name" className={labelClass}>
                      Name
                    </label>
                    <input
                      id="gov-contact-name"
                      name="name"
                      type="text"
                      required
                      placeholder="Name"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="gov-contact-email" className={labelClass}>
                      E-mail
                    </label>
                    <input
                      id="gov-contact-email"
                      name="email"
                      type="email"
                      required
                      placeholder="E-mail"
                      className={fieldClass}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="gov-contact-subject" className={labelClass}>
                    Subject
                  </label>
                  <input
                    id="gov-contact-subject"
                    name="subject"
                    type="text"
                    placeholder="Subject"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="gov-contact-message" className={labelClass}>
                    Message
                  </label>
                  <textarea
                    id="gov-contact-message"
                    name="message"
                    required
                    placeholder="Message"
                    className={cn(fieldClass, 'min-h-28 resize-y')}
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    aria-busy={inquiry.isPending}
                    disabled={inquiry.isPending}
                    className="rounded-sm bg-[#3346B5] px-6 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#2a3a99] disabled:pointer-events-none disabled:opacity-70"
                  >
                    {inquiry.isPending ? 'Sending' : 'Submit'}
                  </button>
                  <span
                    className="text-[13px] text-[#1a7a3a]"
                    aria-live="polite"
                  >
                    {inquiry.statusText}
                  </span>
                </div>
              </form>
            </section>
          </div>

          {/* Optional officials directory */}
          {directory.length > 0 ? (
            <section className="mt-8">
              <h3 className="mb-3 rounded-sm bg-[#f3d9e8] px-4 py-2.5 text-center text-[16px] font-medium text-[#640032]">
                Officials Directory
              </h3>
              <div className="overflow-x-auto rounded-sm border border-[#dfdfdf] bg-white">
                <table className="w-full border-collapse text-[14px] text-[#333]">
                  <thead>
                    <tr className="bg-[#f4f7fa] text-left text-[#3346B5]">
                      <th className="border-b border-[#dfdfdf] px-4 py-2.5 font-medium">
                        Name
                      </th>
                      <th className="border-b border-[#dfdfdf] px-4 py-2.5 font-medium">
                        Designation
                      </th>
                      <th className="border-b border-[#dfdfdf] px-4 py-2.5 font-medium">
                        Email Id
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {directory.map((row, i) => (
                      <tr
                        key={`${row.name}-${i}`}
                        className="odd:bg-white even:bg-[#fafbfe]"
                      >
                        <td className="border-b border-[#eee] px-4 py-2.5">
                          {row.name}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-2.5">
                          {row.designation}
                        </td>
                        <td className="border-b border-[#eee] px-4 py-2.5">
                          {row.email ? (
                            <a
                              href={`mailto:${row.email}`}
                              className="text-[#0792D0] hover:underline"
                            >
                              {row.email}
                            </a>
                          ) : (
                            ''
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}
        </div>
      </section>
    )
  },
})
