import { describe, expect, it } from 'vitest'

import { changeGroups } from './verify-change-groups'
import {
  reviewAuditPath,
  reviewReadinessProofs,
  verifyReviewReadinessFromTexts,
} from './verify-review-readiness'

function completeTexts() {
  const audit = [
    '# Quality Consolidation Audit',
    '## Reviewable Change Groups',
    '## 11/10 Exit Criteria',
    'bun run verify:change-report',
    ...changeGroups.map((group) => group.title),
  ].join('\n')

  const report = changeGroups
    .map((group) => `## ${group.title} (1)\n\n- \`example.ts\``)
    .join('\n\n')

  const proofDocuments = Object.fromEntries(
    Object.values(reviewReadinessProofs)
      .flatMap((proof) => proof.documents)
      .map((document) => [document.path, document.requiredText.join('\n')]),
  )

  return { audit, proofDocuments, report }
}

describe('review readiness verification', () => {
  it('keeps every change group mapped to review proof documents', () => {
    expect(Object.keys(reviewReadinessProofs).sort()).toEqual(
      changeGroups.map((group) => group.id).sort(),
    )
  })

  it('accepts complete audit, manifest, and proof document evidence', () => {
    expect(verifyReviewReadinessFromTexts(completeTexts())).toEqual(
      changeGroups.map((group) => ({
        documentCount: reviewReadinessProofs[group.id].documents.length,
        group,
      })),
    )
  })

  it('fails when the top-level audit omits a review group', () => {
    const texts = completeTexts()
    texts.audit = texts.audit.replace('OpenUI runtime and bundle boundary', '')

    expect(() => verifyReviewReadinessFromTexts(texts)).toThrow(
      `${reviewAuditPath} does not mention OpenUI runtime and bundle boundary`,
    )
  })

  it('fails when a proof document omits required verification evidence', () => {
    const texts = completeTexts()
    texts.proofDocuments[
      'specs/architecture/frontend_workflow_preview_verification.md'
    ] = '# Frontend Workflow And Preview Verification'

    expect(() => verifyReviewReadinessFromTexts(texts)).toThrow(
      /frontend_workflow_preview_verification\.md is missing required proof text/,
    )
  })
})
