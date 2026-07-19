// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('#/lib/use-navigate.tsx', () => ({
  useNavigate: () => vi.fn(),
}))

const { cleanup, render } = await import('@testing-library/react')

const { AccountingFirmTeam } = await import(
  './accounting-firm/AccountingFirmTeam.tsx'
)
const { DentalTeam } = await import('./dental/DentalTeam.tsx')
const { HealthcareDoctors } = await import('./healthcare/HealthcareDoctors.tsx')
const { MentalHealthTeam } = await import(
  './mental-health/MentalHealthTeam.tsx'
)
const { FitnessTrainers } = await import('./fitness/FitnessTrainers.tsx')
const { LawFirmAttorneys } = await import('./law-firm/LawFirmAttorneys.tsx')
const { EventSpeakers } = await import('./event/EventSpeakers.tsx')
const { BootcampMentors } = await import('./bootcamp/BootcampMentors.tsx')
const { NewsroomAuthors } = await import('./newsroom/NewsroomAuthors.tsx')
const { PodcastAuthors } = await import('./podcast/PodcastAuthors.tsx')
const { WebinarAuthors } = await import('./webinar/WebinarAuthors.tsx')
const { BlogAuthors } = await import('./blog/BlogAuthors.tsx')
const { NewsAuthors } = await import('./news/NewsAuthors.tsx')
const { BlogPostAuthors } = await import('./blog-post/BlogPostAuthors.tsx')

afterEach(cleanup)

function cards(root: HTMLElement) {
  return Array.from(root.querySelectorAll('[data-slot="person-card"]'))
}

function firstCard(root: HTMLElement) {
  const el = cards(root)[0]
  if (!el) throw new Error('no person-card rendered')
  return el
}

describe('PersonCard adoption — capsules render person cards', () => {
  it('AccountingFirmTeam: 4 outlined rounded-lg cards with name/role/bio', () => {
    const { container } = render(<AccountingFirmTeam.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    const card = firstCard(container)
    expect(card.tagName).toBe('ARTICLE')
    expect(card.className).toContain('border')
    expect(card.className).toContain('bg-card')
    expect(card.className).toContain('rounded-lg')
    expect(container.textContent).toContain('Robert Northridge')
    expect(container.textContent).toContain('Founder & Managing Partner, CPA')
    // sub-slots present
    expect(
      container.querySelector('[data-slot="person-card-name"]'),
    ).not.toBeNull()
    expect(
      container.querySelector('[data-slot="person-card-role"]'),
    ).not.toBeNull()
    expect(
      container.querySelector('[data-slot="person-card-bio"]'),
    ).not.toBeNull()
  })

  it('DentalTeam: 4 elevated (shadow, no border) rounded-2xl cards', () => {
    const { container } = render(<DentalTeam.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    const card = firstCard(container)
    expect(card.className).toContain('shadow-sm')
    expect(card.className).toContain('rounded-2xl')
    expect(card.className).not.toContain('border-border')
    // primary-coloured role preserved
    const role = container.querySelector('[data-slot="person-card-role"]')
    expect(role?.className).toContain('text-primary')
    expect(container.textContent).toContain('Dr. Sarah Chen, DDS')
  })

  it('HealthcareDoctors: 4 bare cards (no surface), specialty as role', () => {
    const { container } = render(<HealthcareDoctors.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    const card = firstCard(container)
    expect(card.className).not.toContain('border-border')
    expect(card.className).not.toContain('bg-card')
    expect(container.textContent).toContain('Internal Medicine')
  })

  it('MentalHealthTeam: 4 bare cards keep tall image + primary role', () => {
    const { container } = render(<MentalHealthTeam.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    expect(container.querySelector('.h-80')).not.toBeNull()
    const role = container.querySelector('[data-slot="person-card-role"]')
    expect(role?.className).toContain('text-primary')
  })

  it('FitnessTrainers: 4 bare centered cards', () => {
    const { container } = render(<FitnessTrainers.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    expect(firstCard(container).className).toContain('text-center')
  })

  it('LawFirmAttorneys: 6 plain (bg-card, no border) serif cards', () => {
    const { container } = render(<LawFirmAttorneys.component props={{}} />)
    expect(cards(container)).toHaveLength(6)
    const card = firstCard(container)
    expect(card.className).toContain('bg-card')
    expect(card.className).not.toContain('border-border')
    const name = container.querySelector('[data-slot="person-card-name"]')
    expect(name?.className).toContain('font-serif')
    // serif name is normal-weight, not the default semibold
    expect(name?.className).toContain('font-normal')
  })

  it('EventSpeakers: 8 clickable button cards (asChild)', () => {
    const { container } = render(<EventSpeakers.component props={{}} />)
    expect(cards(container)).toHaveLength(8)
    const card = firstCard(container)
    expect(card.tagName).toBe('BUTTON')
    expect(card.className).toContain('border')
    expect(card.className).toContain('rounded-2xl')
  })

  it('BootcampMentors: 4 bare clickable cards (name + role only)', () => {
    const { container } = render(<BootcampMentors.component props={{}} />)
    expect(cards(container)).toHaveLength(4)
    expect(firstCard(container).tagName).toBe('BUTTON')
    expect(container.querySelector('[data-slot="person-card-bio"]')).toBeNull()
  })

  it('NewsroomAuthors: 8 outlined cards, serif primary uppercase role', () => {
    const { container } = render(<NewsroomAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(8)
    const role = container.querySelector('[data-slot="person-card-role"]')
    expect(role?.className).toContain('uppercase')
    expect(role?.className).toContain('text-primary')
  })

  it('PodcastAuthors: 3 outlined p-8 cards', () => {
    const { container } = render(<PodcastAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(3)
    expect(firstCard(container).className).toContain('p-8')
  })

  it('WebinarAuthors: 3 outlined centered cards', () => {
    const { container } = render(<WebinarAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(3)
    expect(firstCard(container).className).toContain('items-center')
    expect(container.textContent).toContain('Catalyst Labs')
  })

  it('BlogAuthors: 6 outlined rounded-xl horizontal cards', () => {
    const { container } = render(<BlogAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(6)
    const card = firstCard(container)
    expect(card.className).toContain('rounded-xl')
    expect(card.className).toContain('border')
  })

  it('NewsAuthors: 8 outlined+shadow cards', () => {
    const { container } = render(<NewsAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(8)
    const card = firstCard(container)
    expect(card.className).toContain('border')
    expect(card.className).toContain('shadow-sm')
  })

  it('BlogPostAuthors: single card, name preserved as h2', () => {
    const { container } = render(<BlogPostAuthors.component props={{}} />)
    expect(cards(container)).toHaveLength(1)
    const name = container.querySelector('[data-slot="person-card-name"]')
    expect(name?.tagName).toBe('H2')
    expect(container.textContent).toContain('Jordan Avery')
  })
})
