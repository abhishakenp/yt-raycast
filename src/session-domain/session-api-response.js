import { toSessionDTO } from './filesystem-session-repository.js'

function integrationConfig(session) {
  return {
    sanity: {
      enabled: Boolean(session.sanityConfig?.projectId || session.sanityConfig?.dataset),
      config: session.sanityConfig
        ? {
            projectId: session.sanityConfig.projectId,
            dataset: session.sanityConfig.dataset,
            apiVersion: session.sanityConfig.apiVersion,
          }
        : null,
    },
    medusa: {
      enabled: Boolean(session.medusaConfig?.backendUrl || session.medusaConfig?.adminBaseUrl),
      config: session.medusaConfig
        ? {
            backendUrl: session.medusaConfig.backendUrl || session.medusaConfig.adminBaseUrl || null,
            storefrontUrl: session.medusaConfig.storefrontUrl || null,
          }
        : null,
    },
  }
}

export function buildSessionApiResponse(session, { exportTargets = [], payment = null } = {}) {
  const dto = toSessionDTO(session)
  if (!dto) return null
  return {
    id: dto.id,
    prompt: dto.prompt,
    createdAt: dto.createdAt,
    deployment: dto.deployment || null,
    homepageReady: dto.homepageReady,
    siteSpecReady: dto.siteSpecReady,
    preferredExportTarget: dto.preferredExportTarget,
    preferredLanguage: dto.preferredLanguage,
    exportTargets,
    payment,
    themeOverride: dto.themeOverride,
    taskCount: dto.taskCount,
    done: dto.done,
    tasks: Array.isArray(session.tasks) ? session.tasks : [],
    elapsed: dto.elapsed,
    cost: dto.cost,
    isAnonymous: dto.owner.type === 'anonymous',
    ecommerce: false,
    openuiReady: dto.openuiReady,
    integrations: integrationConfig(session),
    medusaAdminEmbed: { show: false, url: null },
  }
}
