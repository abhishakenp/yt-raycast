import {
  HOME_DESCRIPTION,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
} from './site-config'

export function homeStructuredDataJson(descriptionOverride?: string) {
  const desc = descriptionOverride ?? HOME_DESCRIPTION
  const ogImage = `${SITE_URL}${OG_IMAGE_PATH}`
  return JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: SITE_NAME,
      url: SITE_URL,
      operatingSystem: 'Web',
      applicationCategory: 'DeveloperApplication',
      description: desc,
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      screenshot: ogImage,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: SITE_URL,
      description: desc,
    },
  ])
}
