import { normalizeBusinessProfile, buildHeuristicBusinessProfile } from '../spec/business-profile.js'

export function businessProfilePromptBlock(businessProfile = null) {
  if (!businessProfile || typeof businessProfile !== 'object') return ''
  const p = normalizeBusinessProfile(businessProfile, buildHeuristicBusinessProfile({}))
  const ic = p.industryCode || {}
  const codeLine =
    ic.system && ic.code ? `${ic.system} ${ic.code}${ic.label ? ` — ${ic.label}` : ''}` : ''

  const lines = [
    'ORGANIZATION & BUSINESS TYPE (use for realistic copy, pricing tone, compliance hints, footer/legal context; do not fabricate registration numbers or fake certificates):',
    `- Customer / go-to-market model: ${p.customerModel}`,
    `- Industry: ${p.industry}`,
    codeLine ? `- Industry classification: ${codeLine}` : '',
    p.legalForm ? `- Legal form (if stated): ${p.legalForm}` : '',
    `- Primary jurisdiction: ${p.jurisdiction}`,
    `- Segment: ${p.segment}`,
    `- Revenue model: ${p.revenueModel}`,
    `- Tax / invoicing note (high level): ${p.taxFootprint}`,
    p.trustSignals?.length ? `- Trust / compliance hints: ${p.trustSignals.join('; ')}` : '',
    '',
    'Business-type rules:',
    '- Reflect this profile in headlines, social proof, plan naming, and contact/privacy tone where relevant.',
    '- For B2B: prefer ROI, security, procurement, and integration language.',
    '- For B2C / DTC: prefer merchandising, shipping, returns, and reviews.',
    '- For public / nonprofit: avoid aggressive sales pressure; emphasize service mission or transparency.',
    '- Never invent specific company registration IDs, VAT numbers, or license numbers unless provided in the user prompt or verified brand block.',
  ].filter(Boolean)

  return `\n\n${lines.join('\n')}\n`
}
