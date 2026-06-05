import type { SitePageLike } from '../contracts/page-aeo.ts'

export type FaqItem = {
  question: string
  answer: string
}

export function extractFaqItems(page: SitePageLike | null | undefined): FaqItem[] {
  return (page?.sections || [])
    .filter((section) => section.type === 'faq')
    .flatMap((section) => section.items || [])
    .map((item) => ({
      question: String(item?.title || '').trim(),
      answer: String(item?.body || '').trim(),
    }))
    .filter((item) => item.question && item.answer)
}
