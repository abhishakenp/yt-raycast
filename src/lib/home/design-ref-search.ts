type SiteEntry = { k: string; u: string; t: string }

const SITE_SEARCH_DB: SiteEntry[] = [
  { k: 'stripe', u: 'https://stripe.com', t: 'Stripe' },
  { k: 'linear', u: 'https://linear.app', t: 'Linear' },
  { k: 'vercel', u: 'https://vercel.com', t: 'Vercel' },
  { k: 'notion', u: 'https://notion.so', t: 'Notion' },
  { k: 'figma', u: 'https://figma.com', t: 'Figma' },
  { k: 'github', u: 'https://github.com', t: 'GitHub' },
  { k: 'slack', u: 'https://slack.com', t: 'Slack' },
  { k: 'discord', u: 'https://discord.com', t: 'Discord' },
  { k: 'spotify', u: 'https://spotify.com', t: 'Spotify' },
  { k: 'airbnb', u: 'https://airbnb.com', t: 'Airbnb' },
  { k: 'shopify', u: 'https://shopify.com', t: 'Shopify' },
  { k: 'apple', u: 'https://apple.com', t: 'Apple' },
  { k: 'tesla', u: 'https://tesla.com', t: 'Tesla' },
  { k: 'netflix', u: 'https://netflix.com', t: 'Netflix' },
  { k: 'dribbble', u: 'https://dribbble.com', t: 'Dribbble' },
  { k: 'behance', u: 'https://behance.net', t: 'Behance' },
  { k: 'twitch', u: 'https://twitch.tv', t: 'Twitch' },
  { k: 'supabase', u: 'https://supabase.com', t: 'Supabase' },
  { k: 'tailwind', u: 'https://tailwindcss.com', t: 'Tailwind CSS' },
  { k: 'nextjs', u: 'https://nextjs.org', t: 'Next.js' },
  { k: 'next', u: 'https://nextjs.org', t: 'Next.js' },
  { k: 'framer', u: 'https://framer.com', t: 'Framer' },
  { k: 'raycast', u: 'https://raycast.com', t: 'Raycast' },
  { k: 'cal', u: 'https://cal.com', t: 'Cal.com' },
  { k: 'resend', u: 'https://resend.com', t: 'Resend' },
  { k: 'openai', u: 'https://openai.com', t: 'OpenAI' },
  { k: 'anthropic', u: 'https://anthropic.com', t: 'Anthropic' },
  { k: 'midjourney', u: 'https://midjourney.com', t: 'Midjourney' },
  { k: 'uber', u: 'https://uber.com', t: 'Uber' },
  { k: 'google', u: 'https://google.com', t: 'Google' },
  { k: 'twitter', u: 'https://x.com', t: 'X (Twitter)' },
  { k: 'instagram', u: 'https://instagram.com', t: 'Instagram' },
  { k: 'youtube', u: 'https://youtube.com', t: 'YouTube' },
  { k: 'amazon', u: 'https://amazon.com', t: 'Amazon' },
  { k: 'dropbox', u: 'https://dropbox.com', t: 'Dropbox' },
  { k: 'intercom', u: 'https://intercom.com', t: 'Intercom' },
  { k: 'loom', u: 'https://loom.com', t: 'Loom' },
  { k: 'arc', u: 'https://arc.net', t: 'Arc Browser' },
  { k: 'revolut', u: 'https://revolut.com', t: 'Revolut' },
  { k: 'monzo', u: 'https://monzo.com', t: 'Monzo' },
  { k: 'wise', u: 'https://wise.com', t: 'Wise' },
]

export type DesignRefResolution = { url: string; title: string }

export const resolveDesignRefSearch = (
  raw: string,
): DesignRefResolution | null => {
  const trimmed = raw.trim().toLowerCase()
  if (!trimmed) return null
  if (
    /^https?:\/\//i.test(trimmed) ||
    /^[a-z0-9][-a-z0-9]*\.[a-z]{2,}/i.test(trimmed)
  ) {
    const url = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
    const hostname = (() => {
      try {
        return new URL(url).hostname.replace(/^www\./, '')
      } catch {
        return trimmed
      }
    })()
    const title = hostname.split('.')[0] || hostname
    return { url, title: title.charAt(0).toUpperCase() + title.slice(1) }
  }
  const match = SITE_SEARCH_DB.find(
    (s) => s.k.startsWith(trimmed) || s.t.toLowerCase().startsWith(trimmed),
  )
  return match ? { url: match.u, title: match.t } : null
}
