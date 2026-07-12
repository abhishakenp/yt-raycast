import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import { useNavigate } from '#/lib/use-navigate.tsx'
import { inquiryLakebed } from '../contact/inquiry-lakebed.ts'
import { useInquirySubmission } from '../contact/inquiry-interactions.tsx'

/**
 * AgencyContactCta — contact CTA + real inquiry form for a creative
 * digital-agency page. A centered heading + lead over a soft blurred glow, a
 * functional inquiry form (name, email, project-type select, message, submit
 * button with a send icon), and a footer row with an email link on the left and
 * social links on the right. Form submit writes a Lakebed inquiry; the email
 * link and each social link route through useNavigate. Use as the closing
 * "get in touch" / start-a-project conversion section for agencies, studios,
 * or any service business. Renders fully with no props via baked-in defaults.
 */
export const AgencyContactCta = defineCapsule({
  name: 'AgencyContactCta',
  description:
    "Contact CTA with a real Lakebed inquiry form for a creative digital-agency page: a centered heading and lead over a soft blurred glow, a functional form (name, email, project-type select, message, submit button with a send icon), and a footer row with an email link on the left and social links on the right. Form submit writes a shared inquiry record; the email link and each social link route through useNavigate. Use as the closing 'get in touch' / start-a-project conversion section for agencies, studios, or any service business.",
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
    const go = useNavigate()
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
      'w-full rounded-xl border border-input bg-background px-4 py-3 text-foreground placeholder-muted-foreground transition-all focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring'

    return (
      <section
        className={cn(
          'relative overflow-hidden py-24 lg:py-28',
          props.className,
        )}
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl"
        />
        <div className="relative z-10 mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              {heading}
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
          </div>

          <form
            className="mx-auto max-w-xl space-y-5"
            onSubmit={inquiry.submitForm}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="agency-name"
                  className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                  Name
                </label>
                <input
                  id="agency-name"
                  name="name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  htmlFor="agency-email"
                  className="mb-2 block text-sm font-medium text-muted-foreground"
                >
                  Email
                </label>
                <input
                  id="agency-email"
                  name="email"
                  type="email"
                  required
                  placeholder="jane@company.com"
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="agency-type"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Project type
              </label>
              <select
                id="agency-type"
                name="projectType"
                className={cn(inputCls, 'appearance-none')}
              >
                {projectTypes.map((opt) => (
                  <option key={opt} className="bg-background">
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="agency-message"
                className="mb-2 block text-sm font-medium text-muted-foreground"
              >
                Message
              </label>
              <textarea
                id="agency-message"
                name="message"
                rows={4}
                required
                placeholder="Tell us about your project, goals, and timeline."
                className={cn(inputCls, 'resize-none')}
              />
            </div>
            <button
              type="submit"
              aria-busy={inquiry.isPending}
              disabled={inquiry.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-70"
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
            </button>
            <p className="text-sm text-muted-foreground" aria-live="polite">
              {inquiry.statusText}
            </p>
          </form>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-t border-border pt-10 sm:flex-row">
            <div className="text-center sm:text-left">
              <div className="mb-1 text-sm text-muted-foreground">
                {emailLabel}
              </div>
              <button
                type="button"
                onClick={() => go(contactTarget)}
                className="text-lg font-medium transition-colors hover:text-primary"
              >
                {email}
              </button>
            </div>
            <div className="flex items-center gap-6">
              {socials.map((social) => (
                <button
                  key={social}
                  type="button"
                  aria-label={social}
                  onClick={() => go(social)}
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {social}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  },
})
