import { existsSync, readFileSync } from 'node:fs'

import {
  changeGroupReportPath,
  changeGroups,
  type ChangeGroupId,
} from './verify-change-groups'

export const reviewAuditPath =
  'specs/architecture/quality_consolidation_audit.md'

type ProofDocument = {
  path: string
  requiredText: string[]
}

type ReviewReadinessProof = {
  documents: ProofDocument[]
}

export const reviewReadinessProofs = {
  'convex-session-decomposition': {
    documents: [
      {
        path: 'specs/architecture/convex_session_decomposition_verification.md',
        requiredText: [
          'Change group: Convex session decomposition',
          '## Verification Run',
          'bun run verify:prepush',
          '## GitNexus Review',
        ],
      },
    ],
  },
  'quality-gates-local-enforcement': {
    documents: [
      {
        path: 'specs/architecture/quality_gates_verification.md',
        requiredText: [
          'Change group: quality gates and local enforcement',
          'bun run verify:change-groups',
          'bun run verify:change-report',
          'bun run verify:prepush',
        ],
      },
    ],
  },
  'openui-runtime-bundle-boundary': {
    documents: [
      {
        path: 'specs/architecture/openui_runtime_bundle_boundary_verification.md',
        requiredText: [
          '# OpenUI Runtime And Bundle Boundary Verification',
          '## Verification Commands',
          'bun run verify:bundle',
          '## GitNexus Impact',
        ],
      },
    ],
  },
  'engine-regression-coverage': {
    documents: [
      {
        path: 'specs/architecture/engine_regression_coverage_verification.md',
        requiredText: [
          '# Engine Regression Coverage Verification',
          '## Verification Commands',
          '## GitNexus Impact',
        ],
      },
    ],
  },
  'frontend-workflow-preview': {
    documents: [
      {
        path: 'specs/architecture/frontend_workflow_preview_verification.md',
        requiredText: [
          '# Frontend Workflow And Preview Verification',
          '## Verification Commands',
          'bun run verify:dashboard-browser',
          'bun run verify:chat-browser',
          'bun run verify:cms-browser',
        ],
      },
    ],
  },
  'commerce-external-integration': {
    documents: [
      {
        path: 'specs/architecture/commerce_external_integration_verification.md',
        requiredText: [
          '# Commerce And External Integration Verification',
          '## Verification Commands',
          'src/routes/api/-medusa-store-routes.test.ts',
          '## GitNexus Impact',
        ],
      },
    ],
  },
  'quality-documentation': {
    documents: [
      {
        path: 'specs/architecture/code_quality_assessment.md',
        requiredText: [
          '# Code Quality Assessment Report',
          'Mode:',
          '## Repository Metrics Dashboard',
          'Overall Rating:',
        ],
      },
      {
        path: reviewAuditPath,
        requiredText: [
          '# Quality Consolidation Audit',
          '## Reviewable Change Groups',
          '## 11/10 Exit Criteria',
          'bun run verify:change-report',
        ],
      },
    ],
  },
} satisfies Record<ChangeGroupId, ReviewReadinessProof>

type ReviewReadinessTexts = {
  audit: string
  report: string
  proofDocuments: Record<string, string>
}

function missingProofConfigs() {
  const expectedIds = changeGroups.map((group) => group.id)
  const configuredIds = Object.keys(reviewReadinessProofs)

  return {
    extra: configuredIds.filter(
      (id) => !expectedIds.includes(id as ChangeGroupId),
    ),
    missing: expectedIds.filter((id) => !configuredIds.includes(id)),
  }
}

function findMissingText(
  text: string,
  requiredText: string[],
  options: { caseSensitive?: boolean } = {},
) {
  if (options.caseSensitive === false) {
    const lowerText = text.toLowerCase()
    return requiredText.filter(
      (needle) => !lowerText.includes(needle.toLowerCase()),
    )
  }

  return requiredText.filter((needle) => !text.includes(needle))
}

export function verifyReviewReadinessFromTexts({
  audit,
  proofDocuments,
  report,
}: ReviewReadinessTexts) {
  const failures: string[] = []
  const { extra, missing } = missingProofConfigs()

  if (missing.length > 0) {
    failures.push(
      `Missing review proof config for groups: ${missing.join(', ')}`,
    )
  }

  if (extra.length > 0) {
    failures.push(`Unknown review proof config groups: ${extra.join(', ')}`)
  }

  for (const group of changeGroups) {
    const auditMissing = findMissingText(audit, [group.title], {
      caseSensitive: false,
    })
    const reportMissing = findMissingText(report, [`## ${group.title} (`])
    const proof = reviewReadinessProofs[group.id]

    if (auditMissing.length > 0) {
      failures.push(`${reviewAuditPath} does not mention ${group.title}`)
    }

    if (reportMissing.length > 0) {
      failures.push(`${changeGroupReportPath} does not include ${group.title}`)
    }

    for (const document of proof.documents) {
      const text = proofDocuments[document.path]
      if (text === undefined) {
        failures.push(`Missing proof document text for ${document.path}`)
        continue
      }

      const missingRequiredText = findMissingText(text, document.requiredText)
      if (missingRequiredText.length > 0) {
        failures.push(
          `${document.path} is missing required proof text:\n- ${missingRequiredText.join('\n- ')}`,
        )
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(
      `Review readiness verification failed:\n\n${failures.join('\n\n')}`,
    )
  }

  return changeGroups.map((group) => ({
    documentCount: reviewReadinessProofs[group.id].documents.length,
    group,
  }))
}

function readRequiredFile(path: string) {
  if (!existsSync(path)) {
    throw new Error(`Missing required review-readiness file: ${path}`)
  }

  return readFileSync(path, 'utf8')
}

export function verifyReviewReadiness() {
  const proofDocuments: Record<string, string> = {}
  for (const proof of Object.values(reviewReadinessProofs)) {
    for (const document of proof.documents) {
      proofDocuments[document.path] = readRequiredFile(document.path)
    }
  }

  return verifyReviewReadinessFromTexts({
    audit: readRequiredFile(reviewAuditPath),
    proofDocuments,
    report: readRequiredFile(changeGroupReportPath),
  })
}

if (process.argv[1]?.endsWith('verify-review-readiness.ts')) {
  const summaries = verifyReviewReadiness()
  console.log('Review readiness proof is complete for quality groups:')
  for (const { documentCount, group } of summaries) {
    console.log(`- ${group.title}: ${documentCount} proof document(s)`)
  }
}
