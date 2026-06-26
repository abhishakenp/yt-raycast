import type { SectionItemLike, SectionLike } from '../contracts/page-aeo.ts'
import { escapeHtml } from '../utils.ts'

export function sectionHeadline(section: SectionLike, fallback = ''): string {
  return String(section.headline || fallback).trim()
}

export function sectionSubheadline(section: SectionLike): string {
  const value = String(section.subheadline || '').trim()
  return value ? `<p class="eyebrow">${escapeHtml(value)}</p>` : ''
}

export function sectionBody(
  section: SectionLike,
  className = 'section-body',
): string {
  const value = String(section.body || '').trim()
  return value ? `<p class="${className}">${escapeHtml(value)}</p>` : ''
}

export function renderItemList<T>(
  items: T[] = [],
  render: (item: T, index: number) => string,
): string {
  return items.map(render).join('\n')
}

export function renderGenericCard(item: SectionItemLike): string {
  return `<article class="card" data-reveal>
    <h3>${escapeHtml(item.title || item.label || '')}</h3>
    <p>${escapeHtml(item.body || item.description || item.value || '')}</p>
  </article>`
}
