import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { hasForeignTopLevelAssignment } from './orchestrator.ts'

const here = dirname(fileURLToPath(import.meta.url))
const source = readFileSync(join(here, 'orchestrator.ts'), 'utf8')

describe('GenUI orchestrator language context', () => {
  it('passes the full build request into per-page content generation', () => {
    expect(source).toContain('Build request: ${fullPrompt}')
    expect(source).toContain('pageUser(prompt, plan.brand, labels, page, plan.tagline)')
  })

  it('repairs invalid page modules before falling back to block defaults', () => {
    expect(source).toContain('repairPageUser(prompt, plan.brand, labels, page, plan.tagline')
    expect(source).toContain('module_repair')
  })

  it('rejects module text that leaks another page assignment', () => {
    expect(
      hasForeignTopLevelAssignment(
        'OnlineCourse = OnlineCourseKimiPage("शांत योग", {heading:"टूटा हुआ\nMembershipClub = MembershipClubKimiPage("शांत योग")',
        'OnlineCourse',
      ),
    ).toBe(true)
    expect(
      hasForeignTopLevelAssignment(
        'OnlineCourse = OnlineCourseKimiPage("शांत योग", {heading:"कोर्स"})',
        'OnlineCourse',
      ),
    ).toBe(false)
  })
})
