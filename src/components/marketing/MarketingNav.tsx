import Link from "next/link"

type NavKey = "home" | "pricing" | "privacy"

const links: { href: string; label: string; key: NavKey }[] = [
  { href: "/", label: "Home", key: "home" },
  { href: "/pricing", label: "Pricing", key: "pricing" },
  { href: "/privacy", label: "Privacy", key: "privacy" },
]

const NavLogo = () => (
  <Link href="/" className="nav-brand" aria-label="SHIP FAST home">
    <svg width="18" height="18" viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M26 4L8 20L14 22L26 10L38 22L44 20L26 4Z" fill="url(#sfMarketingRocketG1)" opacity="0.9" />
      <path d="M14 22L14 40L22 36V24L14 22Z" fill="url(#sfMarketingRocketG1)" opacity="0.8" />
      <path d="M38 22L38 40L30 36V24L38 22Z" fill="url(#sfMarketingRocketG1)" opacity="0.8" />
      <path d="M22 24V36L26 38L30 36V24L26 20L22 24Z" fill="url(#sfMarketingRocketG2)" />
      <path d="M22 38L26 48L30 38L26 40L22 38Z" fill="#a78bfa" opacity="0.7" />
      <circle cx="26" cy="16" r="2" fill="#c4b5fd" />
      <defs>
        <linearGradient id="sfMarketingRocketG1" x1="8" y1="4" x2="44" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="sfMarketingRocketG2" x1="14" y1="22" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#6d28d9" />
          <stop offset="1" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
    </svg>
    <span className="nav-logo-text">SHIP FAST</span>
  </Link>
)

export const MarketingNav = ({ active }: { active: NavKey }) => (
  <nav className="site-nav" aria-label="Main navigation">
    <div className="nav-inner">
      <NavLogo />
      <div className="nav-links">
        {links.map(({ href, label, key }) => (
          <Link
            key={key}
            href={href}
            className={active === key ? "active" : undefined}
            {...(active === key ? { "aria-current": "page" as const } : {})}
          >
            {label}
          </Link>
        ))}
      </div>
      <Link href="/" className="nav-cta">
        Get started
      </Link>
    </div>
  </nav>
)

export const SiteFooter = () => (
  <footer className="site-footer">
    <p>© {new Date().getFullYear()} SHIP FAST. All rights reserved.</p>
  </footer>
)
