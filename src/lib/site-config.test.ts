import { afterEach, describe, expect, it, vi } from 'vitest'

const importSiteConfig = async () => {
  vi.resetModules()
  return import('./site-config')
}

describe('site-config', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('publishes stable public defaults for app metadata', async () => {
    const config = await importSiteConfig()

    expect(config.SITE_NAME).toBe('Ship Fast')
    expect(config.SITE_URL).toBe('https://ship-fast.ai')
    expect(config.BASE_DOMAIN).toBe('ship-fast.ai')
    expect(config.PLAUSIBLE_DOMAIN).toBe('ship-fast.ai')
    expect(config.HOME_TITLE).toBe('Ship Fast - AI Website Generator')
    expect(config.HOME_DESCRIPTION).toContain('Generate a public homepage')
    expect(config.HOME_KEYWORDS).toContain('ai website generator')
    expect(config.OG_IMAGE_PATH).toBe('/og-image.png')
  })

  it('trims configured public URLs before deriving metadata', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_NAME', 'Launch Studio')
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://launch.example.test///')
    vi.stubEnv('NEXT_PUBLIC_BASE_DOMAIN', 'launch.example.test')
    vi.stubEnv('NEXT_PUBLIC_LEGAL_CONTROLLER_NAME', ' Example LLC ')
    vi.stubEnv('NEXT_PUBLIC_PRIVACY_CONTACT_EMAIL', ' privacy@example.test ')
    const config = await importSiteConfig()

    expect(config.SITE_NAME).toBe('Launch Studio')
    expect(config.SITE_URL).toBe('https://launch.example.test')
    expect(config.BASE_DOMAIN).toBe('launch.example.test')
    expect(config.PLAUSIBLE_DOMAIN).toBe('launch.example.test')
    expect(config.HOME_TITLE).toBe('Launch Studio - AI Website Generator')
    expect(config.LEGAL_CONTROLLER_NAME).toBe('Example LLC')
    expect(config.PRIVACY_CONTACT_EMAIL).toBe('privacy@example.test')
  })

  it('uses an explicit Plausible domain when analytics is configured separately', async () => {
    vi.stubEnv('NEXT_PUBLIC_SITE_URL', 'https://www.ship-fast.test')
    vi.stubEnv('NEXT_PUBLIC_PLAUSIBLE_DOMAIN', 'ship-fast.ai')
    const config = await importSiteConfig()

    expect(config.SITE_URL).toBe('https://www.ship-fast.test')
    expect(config.PLAUSIBLE_DOMAIN).toBe('ship-fast.ai')
  })
})
