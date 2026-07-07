export type BrandProfile = {
  verified?: boolean
  requestedName?: string
  officialName?: string
  officialUrl?: string
  logoUrl?: string
  description?: string
  emails?: string[]
  phones?: string[]
  addresses?: string[]
  sourceUrls?: string[]
  socials?: Array<{ network?: string; url?: string }>
}

function listLine(label: string, values: string[] = []) {
  if (!values.length) return ''
  return `- ${label}: ${values.join(', ')}`
}

export function brandProfilePromptBlock(
  brandProfile: BrandProfile | null = null,
) {
  if (!brandProfile || brandProfile.verified !== true) return ''

  const socialLines = (brandProfile.socials || [])
    .slice(0, 6)
    .map((item) => `${item.network}: ${item.url}`)

  const lines = [
    'VERIFIED BRAND PROFILE (web-grounded, use as source of truth):',
    `- Requested brand name: ${brandProfile.requestedName || brandProfile.officialName || 'Unknown brand'}`,
    `- Official brand name: ${brandProfile.officialName || brandProfile.requestedName || 'Unknown brand'}`,
    brandProfile.officialUrl
      ? `- Official website: ${brandProfile.officialUrl}`
      : '',
    brandProfile.logoUrl ? `- Official logo URL: ${brandProfile.logoUrl}` : '',
    brandProfile.description
      ? `- Brand summary: ${brandProfile.description}`
      : '',
    listLine('Email', (brandProfile.emails || []).slice(0, 3)),
    listLine('Phone', (brandProfile.phones || []).slice(0, 3)),
    listLine('Address', (brandProfile.addresses || []).slice(0, 2)),
    listLine('Social', socialLines),
    listLine('Sources', (brandProfile.sourceUrls || []).slice(0, 3)),
    '',
    'Brand rules:',
    '- Use only the verified logo, website, contact details, and social links above.',
    '- If a field is missing, omit it instead of inventing one.',
    '- Prefer the official logo URL in nav/footer branding when it exists.',
    '- Use the official website and social links for footer/contact/visit sections.',
  ].filter(Boolean)

  return `\n\n${lines.join('\n')}\n`
}
