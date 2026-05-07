export function buildHeuristicBusinessProfile({ prompt = '', siteType = 'landing', ctx = {} }) {
  const lower = String(prompt).toLowerCase()
  const st = String(siteType || ctx?.site_type || 'landing').toLowerCase()

  let customerModel = 'B2B SaaS'
  let industry = 'Software publishing (ISV)'
  let industryCode = { system: 'NACE', code: '62.01', label: 'Computer programming services' }
  let legalForm = ''
  let jurisdiction = 'United States'
  let segment = 'Growth / mid-market'
  let revenueModel = 'Subscription + usage-based (typical)'
  let taxFootprint = 'Follow applicable sales / VAT rules for your contracts; consult a tax advisor for cross-border B2B.'
  const trustSignals = []

  const mentionsEu =
    /\b(eu|europe|gdpr|berlin|amsterdam|paris|madrid|stockholm|gmbh|bv\b|ltd\.?\s*uk)\b/i.test(prompt) ||
    /\b(european|eu-central)\b/i.test(prompt)
  if (mentionsEu) {
    jurisdiction = 'European Union'
    taxFootprint = 'EU VAT / reverse charge for qualifying B2B; GDPR for personal data.'
    legalForm = legalForm || 'Private limited (example: BV / GmbH) — align with your registrar'
  }

  if (/\b(fintech|payments|banking|lending|neobank)\b/.test(lower)) {
    customerModel = 'B2B / B2C financial services'
    industry = 'Financial technology'
    industryCode = { system: 'NACE', code: '64.19', label: 'Other monetary intermediation' }
    trustSignals.push('Financial compliance posture varies by license — surface disclosures where required')
  } else if (/\b(health|medical|hipaa|clinic|pharma|patient)\b/.test(lower)) {
    customerModel = 'B2B healthcare / providers'
    industry = 'Health technology / regulated health services'
    industryCode = { system: 'NACE', code: '62.01', label: 'Computer programming (health software)' }
    trustSignals.push('Health data handling must match jurisdiction (e.g. HIPAA in US)')
  } else if (st === 'ecommerce' || /\b(dtc|direct.to.consumer|online store|shop|cart|checkout|retail)\b/.test(lower)) {
    const b2bWholesale = /\b(b2b|wholesale|trade)\b/.test(lower)
    customerModel = b2bWholesale ? 'B2B wholesale / retail' : 'B2C / DTC'
    industry = /\b(fashion|apparel|leather|luxury|jewelry)\b/.test(lower)
      ? 'Retail — apparel & accessories'
      : 'Retail e-commerce'
    industryCode = {
      system: 'NACE',
      code: '47.91',
      label: 'Retail sale via mail order houses or via Internet',
    }
    revenueModel = 'Product revenue + shipping & fulfillment'
  } else if (st === 'institutional' || /\b(government|public sector|ministry|municipal|psu)\b/.test(lower)) {
    customerModel = 'Citizens & stakeholders (public service)'
    industry = 'Public sector / institutional services'
    industryCode = { system: 'NACE', code: '84.11', label: 'General public administration activities' }
    revenueModel = 'Appropriations / budget (non-commercial)'
    taxFootprint = 'Not a consumer storefront; procurement and transparency rules apply'
  } else if (/\b(nonprofit|ngo|charity|foundation|501)\b/.test(lower)) {
    customerModel = 'Donors, beneficiaries & partners'
    industry = 'Nonprofit / charitable organization'
    industryCode = { system: 'NACE', code: '88.99', label: 'Other social work activities without accommodation' }
    revenueModel = 'Donations, grants, and program fees'
  } else if (/\b(marketplace|platform|two-sided|buyers and sellers)\b/.test(lower)) {
    customerModel = 'Multi-sided platform (buyers & sellers)'
    industry = 'Platform / marketplace technology'
    revenueModel = 'Take rate, listing fees, and / or subscriptions'
  } else if (/\b(agency|studio|consulting|services firm)\b/.test(lower)) {
    customerModel = 'B2B professional services'
    industry = 'Professional, scientific and technical services'
    industryCode = { system: 'NACE', code: '70.22', label: 'Business and management consultancy' }
    revenueModel = 'Time & materials, retainers, fixed projects'
  }

  if (/\b(enterprise|fortune|global 2000)\b/.test(lower)) segment = 'Enterprise'
  else if (/\b(smb|small business|startup|seed)\b/.test(lower)) segment = 'SMB / startup'

  if (/\b(soc\s*2|soc2|iso\s*27001)\b/.test(lower)) trustSignals.push('SOC2 / security program (as stated in prompt)')

  return {
    customerModel,
    industry,
    industryCode,
    legalForm: legalForm || undefined,
    jurisdiction,
    segment,
    revenueModel,
    taxFootprint,
    trustSignals: trustSignals.length ? trustSignals : ['Match copy to your actual certifications — do not invent badges'],
  }
}

export function normalizeBusinessProfile(raw, fallback) {
  const base = fallback && typeof fallback === 'object' ? fallback : buildHeuristicBusinessProfile({})
  if (!raw || typeof raw !== 'object') return { ...base }

  const ic = raw.industryCode && typeof raw.industryCode === 'object' ? raw.industryCode : {}
  return {
    customerModel: typeof raw.customerModel === 'string' && raw.customerModel.trim() ? raw.customerModel : base.customerModel,
    industry: typeof raw.industry === 'string' && raw.industry.trim() ? raw.industry : base.industry,
    industryCode: {
      system: typeof ic.system === 'string' && ic.system.trim() ? ic.system : base.industryCode.system,
      code: typeof ic.code === 'string' && ic.code.trim() ? ic.code : base.industryCode.code,
      label: typeof ic.label === 'string' && ic.label.trim() ? ic.label : base.industryCode.label,
    },
    legalForm: typeof raw.legalForm === 'string' && raw.legalForm.trim() ? raw.legalForm : base.legalForm,
    jurisdiction: typeof raw.jurisdiction === 'string' && raw.jurisdiction.trim() ? raw.jurisdiction : base.jurisdiction,
    segment: typeof raw.segment === 'string' && raw.segment.trim() ? raw.segment : base.segment,
    revenueModel: typeof raw.revenueModel === 'string' && raw.revenueModel.trim() ? raw.revenueModel : base.revenueModel,
    taxFootprint: typeof raw.taxFootprint === 'string' && raw.taxFootprint.trim() ? raw.taxFootprint : base.taxFootprint,
    trustSignals: Array.isArray(raw.trustSignals) ? raw.trustSignals.map((s) => String(s)).filter(Boolean) : base.trustSignals,
  }
}
