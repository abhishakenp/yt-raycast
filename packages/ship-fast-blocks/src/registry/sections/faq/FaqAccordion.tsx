import { defineCapsule } from '#/capsules/openui.ts'
import { z } from 'zod/v4'

import { cn } from '#/lib/utils.ts'
import {
  FaqAccordion as KitFaqAccordion,
  FaqAnswer,
  FaqItem,
  FaqQuestion,
  FaqQuestionIcon,
} from '#/section-kit/FaqAccordion.tsx'
import { Container } from '#/section-kit/Container.tsx'
import { Watermark, MonoTag } from '#/section-kit/Decor.tsx'
import { NavbarRouteLink } from '#/section-kit/index.ts'

/**
 * FaqAccordion — the "Editorial Q&A" ledger: a hairline-divided
 * frequently-asked-questions accordion for a help-center / support page. An
 * asymmetric 4/8 split with a sticky left rail (mono eyebrow, heading, intro line +
 * underlined "contact support" link, and a mono question count) beside a right column
 * of native details/summary rows separated only by hairline rules. Each row leads
 * with an oversized ghost "Q.0N" mono numeral that lights up on open, the question in
 * a tight-tracked heading, and a square plus icon that rotates to a cross; answers
 * open under an "A." mono marker as relaxed body paragraphs. A giant faint "?"
 * watermark bleeds behind the rail. The first item is open by default. The contact
 * link routes through section-kit route links. Use as the FAQ / questions section on
 * SaaS knowledge bases, help centers, or support pages. Renders fully with no props
 * via eight baked-in multi-paragraph Q&As.
 */
export const FaqAccordion = defineCapsule({
  name: 'FaqAccordion',
  description:
    "The 'Editorial Q&A' ledger: a hairline-divided frequently-asked-questions accordion for a help-center / support page. An asymmetric 4/8 split with a sticky left rail (mono eyebrow, heading, intro line + underlined 'contact support' link, and a mono question count) beside a right column of native details/summary rows separated by hairline rules. Each row leads with an oversized ghost 'Q.0N' mono numeral that lights up on open, the question in a tight-tracked heading, and a square plus icon that rotates to a cross; answers open under an 'A.' mono marker as relaxed body paragraphs. A giant faint '?' watermark bleeds behind the rail; the first item is open by default. The contact link routes through section-kit route links. Use as the FAQ / questions section on SaaS knowledge bases, help centers, or support pages.",
  props: z.object({
    /** Section heading. */
    heading: z.string().optional(),
    /** Intro line before the contact link. */
    intro: z.string().optional(),
    /** Inline contact-support link label. */
    contactLink: z.string().optional(),
    /** FAQ items: question + one or more answer paragraphs. */
    items: z
      .array(
        z.object({
          question: z.string(),
          answers: z.array(z.string()),
        }),
      )
      .optional(),
    className: z.string().optional(),
  }),
  component: ({ props }) => {
    const heading = props.heading ?? 'Frequently Asked Questions'
    const intro =
      props.intro ??
      "Quick answers to common questions. Can't find what you're looking for?"
    const contactLink = props.contactLink ?? 'Contact our support team'
    const items = props.items?.length
      ? props.items
      : [
          {
            question: 'What is included in the free plan?',
            answers: [
              "The FlowSync Free plan includes unlimited personal projects, up to 3 team members, 5GB of file storage, and access to core features like kanban boards, task assignments, and basic reporting. It's perfect for individuals and small teams getting started with project management.",
              'Free workspaces have a 1,000 task limit per project and standard email support with a 48-hour response time. No credit card is required to sign up, and you can use the free plan indefinitely.',
            ],
          },
          {
            question: 'How do I upgrade or downgrade my subscription?',
            answers: [
              "You can change your plan at any time from your workspace Settings → Billing page. Upgrades take effect immediately, and you'll be charged a prorated amount for the remainder of your billing cycle.",
              "When downgrading, the change takes effect at the end of your current billing period. Your data remains accessible, but features exceeding your new plan's limits will be read-only until you upgrade again or reduce usage.",
              'We accept payments via credit card (Visa, Mastercard, American Express) and PayPal. Enterprise customers can also pay by invoice with net-30 terms.',
            ],
          },
          {
            question: 'Can I invite external clients or guests to my projects?',
            answers: [
              "Yes! FlowSync supports Guest access on Team plans and above. Guests have limited permissions and can only see the specific projects you invite them to. They cannot access workspace settings, billing information, or other members' private projects.",
              "Guest seats are priced at $8/month per user and don't count against your member seat allocation. You can have unlimited guests on Business and Enterprise plans. Guests can comment, upload files, and complete assigned tasks, making them ideal for client collaboration and contractor management.",
            ],
          },
          {
            question: 'What integrations are available?',
            answers: [
              'FlowSync integrates with over 50 popular tools including Slack, Microsoft Teams, GitHub, GitLab, Figma, Adobe Creative Cloud, Google Drive, Dropbox, Zoom, Salesforce, HubSpot, and Zapier. Our Slack integration allows you to create tasks, receive notifications, and update project status directly from Slack channels.',
              'For development teams, our GitHub and GitLab integrations link commits, pull requests, and issues directly to FlowSync tasks. The Figma integration embeds design files in task descriptions and automatically notifies stakeholders when designs are updated.',
              'Enterprise customers also get access to our SCIM provisioning API for automatic user management and custom webhooks for building internal integrations.',
            ],
          },
          {
            question: 'How secure is my data on FlowSync?',
            answers: [
              'Security is our top priority. FlowSync uses industry-standard AES-256 encryption for data at rest and TLS 1.3 for data in transit. Our infrastructure runs on AWS with SOC 2 Type II certification, and we undergo annual third-party security audits.',
              "Enterprise plans include advanced security features like SAML-based single sign-on (SSO), SCIM user provisioning, audit logs with 1-year retention, and custom data retention policies. We're GDPR compliant and offer data residency options in the US, EU, and Australia.",
              'For highly regulated industries, our Enterprise plan supports HIPAA BAA agreements and includes features like automatic PII redaction in task descriptions and IP-based access restrictions.',
            ],
          },
          {
            question: 'Do you offer discounts for nonprofits and education?',
            answers: [
              'Yes! We offer 50% discounts on all paid plans for registered nonprofit organizations and accredited educational institutions. Students and teachers can also apply for our free Education plan, which includes most Business plan features for up to 25 users.',
              'To apply, submit your 501(c)(3) documentation or .edu email address through our education verification form. Approval typically takes 1-2 business days. Open source projects with 1,000+ GitHub stars are also eligible for free Business plan access.',
            ],
          },
          {
            question: 'How do I export my data if I want to leave?',
            answers: [
              'You own your data, and we make it easy to take it with you. All plans include CSV and JSON export options for projects, tasks, and activity logs. Business and Enterprise plans can also export in Microsoft Project (.mpp) format and PDF reports.',
              'To export, go to Settings → Data Export in your workspace admin panel. Full workspace exports typically complete within 24 hours and are delivered as secure download links valid for 7 days. Enterprise customers can also use our API to programmatically extract data at any time.',
              'If you cancel your subscription, your data is retained for 90 days (or longer per your contract) before being permanently deleted, giving you ample time to export or reactivate.',
            ],
          },
          {
            question: 'What support options are available?',
            answers: [
              'All users have access to our comprehensive Help Center, video tutorials, and community forums. Free plan users receive email support with a 48-hour response guarantee. Team plans include priority email support with 24-hour response times.',
              'Business plans add live chat support during business hours (9am-6pm EST, Monday-Friday) and phone support for critical issues. Enterprise customers receive dedicated account managers, 24/7 phone support, custom training sessions, and guaranteed 4-hour response times for critical issues.',
              'Enterprise customers also get access to our professional services team for onboarding assistance, workflow optimization consulting, and custom integration development.',
            ],
          },
        ]

    return (
      <section
        className={cn(
          'relative overflow-hidden border-t border-border bg-background py-14 sm:py-20 lg:py-24',
          props.className,
        )}
      >
        {/* Giant ghost "?" watermark behind the rail. */}
        <Watermark className="-left-8 top-24 font-serif text-[13rem] leading-none sm:text-[18rem] lg:text-[24rem]">
          ?
        </Watermark>

        <Container className="relative">
          <div className="grid gap-10 md:grid-cols-12 md:gap-12 lg:gap-16">
            {/* Sticky editorial rail. */}
            <div className="md:col-span-4">
              <div className="md:sticky md:top-24">
                <MonoTag>[ FAQ ] — Answers</MonoTag>
                <h2 className="mt-5 text-3xl font-extrabold leading-[0.95] tracking-tighter text-foreground sm:text-4xl lg:text-5xl">
                  {heading}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {intro}{' '}
                  <NavbarRouteLink
                    className="font-medium text-foreground underline decoration-primary underline-offset-4 hover:decoration-2"
                    href={contactLink}
                  >
                    {contactLink}
                  </NavbarRouteLink>
                  .
                </p>
                <div className="mt-8 flex items-center gap-3 border-t border-border pt-5">
                  <span aria-hidden="true" className="size-1.5 bg-primary" />
                  <MonoTag tone="faint" className="tabular-nums">
                    {String(items.length).padStart(2, '0')} Questions
                  </MonoTag>
                </div>
              </div>
            </div>

            {/* Hairline-divided Q&A ledger. */}
            <div className="md:col-span-8">
              <KitFaqAccordion variant="divided" className="border-t-0 md:mt-1">
                {items.map((item, i) => (
                  <FaqItem
                    key={item.question}
                    variant="divided"
                    open={i === 0}
                    className="group py-6"
                  >
                    <FaqQuestion className="items-start gap-5 py-0">
                      <span className="flex flex-1 items-start gap-5">
                        <span
                          aria-hidden="true"
                          className="shrink-0 font-mono text-xl tabular-nums leading-none tracking-tight text-foreground/25 transition-colors group-open:text-primary sm:text-2xl"
                        >
                          Q.{String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="flex-1 pt-0.5 text-base font-semibold leading-snug tracking-tight text-foreground sm:text-lg">
                          {item.question}
                        </span>
                      </span>
                      <FaqQuestionIcon
                        variant="plus"
                        className="mt-1 flex size-8 items-center justify-center rounded-none border border-border text-muted-foreground transition-all group-open:border-foreground group-open:text-foreground"
                      />
                    </FaqQuestion>
                    <FaqAnswer
                      asChild
                      className="mt-5 flex gap-5 pr-8 text-sm sm:pl-0"
                    >
                      <div>
                        <span
                          aria-hidden="true"
                          className="hidden shrink-0 font-mono text-xl tabular-nums leading-none text-primary/30 sm:block sm:text-2xl"
                        >
                          A.
                        </span>
                        <div className="flex-1 space-y-3">
                          {item.answers.map((a, j) => (
                            <p
                              key={j}
                              className={cn(
                                j === 0 &&
                                  'font-serif text-base italic leading-relaxed text-foreground/90 sm:text-lg',
                              )}
                            >
                              {a}
                            </p>
                          ))}
                        </div>
                      </div>
                    </FaqAnswer>
                  </FaqItem>
                ))}
              </KitFaqAccordion>
            </div>
          </div>
        </Container>
      </section>
    )
  },
})
