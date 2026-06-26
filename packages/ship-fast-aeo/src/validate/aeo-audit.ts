import type { SitePageLike, SiteSpecLike } from '../contracts/page-aeo.ts'
import { resolvePageSeo } from '../seo/resolve-page-seo.ts'

export type AeoAuditIssue = {
  level: 'error' | 'warn'
  code: string
  message: string
  pageRoute?: string
}

export function auditSiteSpecAeo(
  siteSpec: SiteSpecLike,
  htmlByRoute: Record<string, string> = {},
): AeoAuditIssue[] {
  const issues: AeoAuditIssue[] = []
  const pages = siteSpec.pages || []

  for (const page of pages) {
    const route = page.route || '/'
    const seo = resolvePageSeo(siteSpec, page)

    if (!seo.title) {
      issues.push({
        level: 'error',
        code: 'missing_title',
        message: 'Page is missing SEO title',
        pageRoute: route,
      })
    }
    if (!seo.description) {
      issues.push({
        level: 'error',
        code: 'missing_description',
        message: 'Page is missing meta description',
        pageRoute: route,
      })
    }

    if (route === '/') {
      const hasDirectAnswer = (page.sections || []).some(
        (section) => section.type === 'direct-answer',
      )
      if (!hasDirectAnswer) {
        issues.push({
          level: 'warn',
          code: 'missing_direct_answer',
          message:
            'Home page should include a direct-answer section near the top',
          pageRoute: route,
        })
      }
    }

    const html = htmlByRoute[route]
    if (html) {
      const h1Count = (html.match(/<h1\b/gi) || []).length
      if (h1Count !== 1) {
        issues.push({
          level: h1Count === 0 ? 'error' : 'warn',
          code: 'h1_count',
          message: `Expected exactly one <h1>, found ${h1Count}`,
          pageRoute: route,
        })
      }
      if (!/<main\b/i.test(html)) {
        issues.push({
          level: 'warn',
          code: 'missing_main',
          message: 'Page HTML should include a <main> landmark',
          pageRoute: route,
        })
      }
    }
  }

  const faqSections = pages.flatMap((page) =>
    (page.sections || [])
      .filter((section) => section.type === 'faq')
      .map((section) => ({ page, section })),
  )

  for (const { page, section } of faqSections) {
    const visibleCount = (section.items || []).filter(
      (item) => item.title && item.body,
    ).length
    if (visibleCount < 3) {
      issues.push({
        level: 'warn',
        code: 'thin_faq',
        message: 'FAQ section should include at least 3 complete Q&A items',
        pageRoute: page.route,
      })
    }
  }

  return issues
}

export function homePageFromSpec(
  siteSpec: SiteSpecLike,
): SitePageLike | undefined {
  return (siteSpec.pages || []).find((page) => (page.route || '/') === '/')
}

export function siteSpecPassesAeoAudit(
  siteSpec: SiteSpecLike,
  htmlByRoute: Record<string, string> = {},
  { allowWarnings = true }: { allowWarnings?: boolean } = {},
) {
  const issues = auditSiteSpecAeo(siteSpec, htmlByRoute)
  const errors = issues.filter((issue) => issue.level === 'error')
  const warnings = issues.filter((issue) => issue.level === 'warn')
  return {
    ok: errors.length === 0 && (allowWarnings || warnings.length === 0),
    issues,
    errors,
    warnings,
  }
}
