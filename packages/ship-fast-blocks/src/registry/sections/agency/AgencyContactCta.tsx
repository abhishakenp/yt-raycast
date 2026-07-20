import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  CtaBand,
  CtaBandInner,
  CtaBandTitle,
  CtaBandSubtitle,
} from '#/section-kit/CtaBand.tsx'
import {
  ContactForm,
  ContactFormField,
  ContactFormLabel,
  ContactFormInput,
  ContactFormSelect,
  ContactFormTextarea,
  ContactFormSubmit,
  ContactFormFooter,
} from '#/section-kit/ContactForm.tsx'
import { ResponsiveGrid } from '#/section-kit/ResponsiveGrid.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'
import { NavbarRouteLink } from '#/section-kit/SiteNav.tsx'
import { MonoTag, Watermark } from '#/section-kit/Decor.tsx'

/**
 * AgencyContactCta — neo-brutalist contact CTA + real inquiry form for a
 * creative digital-agency page. An asymmetric 5:7 split over a giant ghost
 * "@" watermark: on the left a mono "06 / Contact" index, a slab uppercase
 * heading and lead, the email link as a big underlined block, and social
 * links as bordered sticker chips with press feedback; on the right the
 * functional inquiry form (name, email, project-type select, message) inside
 * a thick 2px-bordered plate with a hard 10px offset shadow — sharp
 * 2px-bordered inputs, mono uppercase labels, and a block primary submit
 * button with hard offset shadow, press feedback and a send icon. Form submit
 * writes a Lakebed inquiry; the email link and each social chip route through
 * section-kit route links. Use as the closing "get in touch" /
 * start-a-project conversion section for agencies, studios, or any service
 * business. Renders fully with no props via baked-in defaults.
 */
export const AgencyContactCta = defineCapsule({
  name: 'AgencyContactCta',
  description:
    "Neo-brutalist contact CTA with a real Lakebed inquiry form for a creative digital-agency page: an asymmetric 5:7 split over a giant ghost '@' watermark — mono index, slab uppercase heading and lead, big underlined email link and bordered sticker social chips on the left; on the right the functional form (name, email, project-type select, message, block primary submit with hard offset shadow, press feedback and send icon) inside a thick 2px-bordered plate with a hard 10px offset shadow. Form submit writes a shared inquiry record; the email link and each social chip route through section-kit route links. Use as the closing 'get in touch' / start-a-project conversion section for agencies, studios, or any service business.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Lead paragraph under the heading. */
    description: z.string().optional(),
    /** Submit button label. */
    submit: z.string().optional(),
    /** Label above the email link. */
    emailLabel: z.string().optional(),
    /** Email address shown as a routable link. */
    email: z.string().optional(),
    /** Project-type options for the select. */
    projectTypes: z.array(z.string()).optional(),
    /** Social link labels on the right of the footer row. */
    socials: z.array(z.string()).optional(),
    /** Navigation target used on email click. */
    contactTarget: z.string().optional(),
    className: z.string().optional(),
  }),
  lakebed: inquiryLakebed,
  component: ({ props, lakebed }) => {
    const heading = props.heading ?? "Let's build something great together."
    const description =
      props.description ??
      "Have a project in mind? We'd love to hear about it. Share your vision and we'll respond within 24 hours."
    const submit = props.submit ?? 'Send message'
    const emailLabel = props.emailLabel ?? 'Prefer email?'
    const email = props.email ?? 'hello@studiorise.co'
    const projectTypes = props.projectTypes?.length
      ? props.projectTypes
      : [
          'Brand Strategy',
          'Web Design & Development',
          'Digital Marketing',
          'Motion Design',
          'Other',
        ]
    const socials = props.socials?.length
      ? props.socials
      : ['Twitter', 'Instagram', 'LinkedIn', 'Dribbble']
    const contactTarget = props.contactTarget ?? 'Contact'
    const inquiry = useInquirySubmission({
      lakebed,
      source: 'Agency contact',
      successMessage:
        "Thanks. We've received your project inquiry and will respond shortly.",
    })

    const inputCls =
      'w-full rounded-none border-2 border-foreground bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:outline-none focus:ring-2 focus:ring-primary'
    const labelCls =
      'font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground'

    return (
      <CtaBand
        tone="muted"
        className={cn(
          'relative overflow-hidden bg-background',
          props.className,
        )}
      >
        <Watermark className="-bottom-24 -right-10 text-[16rem] text-foreground/[0.04] sm:text-[26rem]">
          @
        </Watermark>
        <CtaBandInner className="max-w-6xl gap-0 py-14 text-left sm:py-20 lg:py-28">
          <div className="relative grid w-full gap-12 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-5">
              <MonoTag aria-hidden="true">06 / Contact</MonoTag>
              <CtaBandTitle className="mt-4 text-left text-4xl font-black uppercase leading-[0.95] tracking-tighter sm:text-5xl lg:text-6xl">
                {heading}
              </CtaBandTitle>
              <CtaBandSubtitle className="mx-0 mt-5 max-w-md text-left text-base leading-relaxed text-muted-foreground sm:text-lg">
                {description}
              </CtaBandSubtitle>

              <div className="mt-10 border-t-2 border-foreground pt-8">
                <MonoTag className="text-muted-foreground">
                  {emailLabel}
                </MonoTag>
                <div className="mt-2">
                  <NavbarRouteLink
                    className="text-xl font-black tracking-tight underline decoration-primary decoration-4 underline-offset-8 transition-colors hover:text-primary sm:text-2xl"
                    href={contactTarget}
                  >
                    {email}
                  </NavbarRouteLink>
                </div>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  {socials.map((social, i) => (
                    <NavbarRouteLink
                      key={social}
                      aria-label={social}
                      className={cn(
                        'inline-flex items-center rounded-full border-2 border-foreground bg-background px-4 py-1.5 font-mono text-[11px] font-bold uppercase tracking-[0.15em] text-foreground shadow-[3px_3px_0_0] shadow-foreground transition-all duration-100 hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none',
                        i % 2 === 1 ? '-rotate-1' : 'rotate-1',
                      )}
                      href={social}
                    >
                      {social}
                    </NavbarRouteLink>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <ContactForm
                className="relative border-2 border-foreground bg-background p-5 shadow-[10px_10px_0_0] shadow-foreground sm:p-8"
                onSubmit={inquiry.submitForm}
              >
                <span
                  aria-hidden="true"
                  className="absolute -top-3.5 left-5 inline-flex -rotate-2 items-center rounded-full border-2 border-foreground bg-primary px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-primary-foreground shadow-[3px_3px_0_0] shadow-foreground sm:left-8"
                >
                  New brief
                </span>
                <div className="space-y-5 pt-2">
                  <ResponsiveGrid cols="1-2" className="gap-5 gap-0">
                    <ContactFormField className="mb-0">
                      <ContactFormLabel
                        htmlFor="agency-name"
                        className={labelCls}
                      >
                        Name
                      </ContactFormLabel>
                      <ContactFormInput
                        id="agency-name"
                        name="name"
                        type="text"
                        required
                        placeholder="Jane Doe"
                        className={inputCls}
                      />
                    </ContactFormField>
                    <ContactFormField className="mb-0">
                      <ContactFormLabel
                        htmlFor="agency-email"
                        className={labelCls}
                      >
                        Email
                      </ContactFormLabel>
                      <ContactFormInput
                        id="agency-email"
                        name="email"
                        type="email"
                        required
                        placeholder="jane@company.com"
                        className={inputCls}
                      />
                    </ContactFormField>
                  </ResponsiveGrid>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="agency-type"
                      className={labelCls}
                    >
                      Project type
                    </ContactFormLabel>
                    <ContactFormSelect
                      id="agency-type"
                      name="projectType"
                      className={cn(inputCls, 'appearance-none')}
                    >
                      {projectTypes.map((opt) => (
                        <option key={opt} className="bg-background">
                          {opt}
                        </option>
                      ))}
                    </ContactFormSelect>
                  </ContactFormField>
                  <ContactFormField className="mb-0">
                    <ContactFormLabel
                      htmlFor="agency-message"
                      className={labelCls}
                    >
                      Message
                    </ContactFormLabel>
                    <ContactFormTextarea
                      id="agency-message"
                      name="message"
                      rows={4}
                      required
                      placeholder="Tell us about your project, goals, and timeline."
                      className={cn(inputCls, 'resize-none')}
                    />
                  </ContactFormField>
                  <ContactFormSubmit
                    type="submit"
                    aria-busy={inquiry.isPending}
                    disabled={inquiry.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-none border-2 border-foreground bg-primary py-4 font-mono text-sm font-bold uppercase tracking-[0.18em] text-primary-foreground shadow-[6px_6px_0_0] shadow-foreground transition-all duration-100 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:bg-primary hover:shadow-[8px_8px_0_0] hover:shadow-foreground active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:pointer-events-none disabled:opacity-70"
                  >
                    {inquiry.isPending ? 'Sending' : submit}
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </ContactFormSubmit>
                  <ContactFormFooter
                    className="font-mono text-xs text-muted-foreground"
                    aria-live="polite"
                  >
                    {inquiry.statusText}
                  </ContactFormFooter>
                </div>
              </ContactForm>
            </div>
          </div>
        </CtaBandInner>
      </CtaBand>
    )
  },
})
