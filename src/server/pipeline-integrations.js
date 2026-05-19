import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { syncSiteSettingsFromSiteSpec } from '../sanity/cms-sync.js'
import { syncProductsToMedusa, isMedusaSyncConfigured } from './sync-medusa-catalog.js'
import { writeFile } from '@ship-fast/engine/pipeline/workspace.js'
import {
  injectMedusaVariantDataAttributes,
  injectStorefrontCartUi,
  stripStorefrontCartUi,
} from '@ship-fast/engine/pipeline/storefront-cart-ui.js'

const SESSION_META_FILE = '.session.json'

const readWorkspaceSanityConfig = (workspace) => {
  try {
    const metaPath = join(workspace, SESSION_META_FILE)
    if (!existsSync(metaPath)) return null
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8'))
    return meta?.sanityConfig || null
  } catch {
    return null
  }
}

/** Hooks optional CMS / catalog sync after the engine persists `site-spec.json`. */
export function createDefaultPipelineIntegrations() {
  return {
    async afterSiteSpecSaved({ workspace, siteSpec, log, status }) {
      const tenantSanity = readWorkspaceSanityConfig(workspace)
      void syncSiteSettingsFromSiteSpec(siteSpec, tenantSanity)
      if (
        siteSpec?.siteType !== 'ecommerce' ||
        !siteSpec?.ecommerce?.products?.length ||
        !isMedusaSyncConfigured()
      ) {
        return
      }
      try {
        const medusaResult = await syncProductsToMedusa(siteSpec.ecommerce.products, { workspace })
        status?.(
          `Cargo synced: ${medusaResult.synced} unit(s) to station${medusaResult.errors.length ? ` (${medusaResult.errors.length} drift)` : ''}`,
          'medusa_sync',
        )
        log?.(
          `  medusa: synced ${medusaResult.synced} product(s)${medusaResult.errors.length ? ` (${medusaResult.errors.length} failed)` : ''}`,
        )
        const indexPath = join(workspace, 'index.html')
        if (
          medusaResult?.byTitle &&
          Object.keys(medusaResult.byTitle).length &&
          existsSync(indexPath)
        ) {
          let h = readFileSync(indexPath, 'utf8')
          h = injectMedusaVariantDataAttributes(h, medusaResult.byTitle)
          h = stripStorefrontCartUi(h)
          h = injectStorefrontCartUi(h, { workspace, variantMap: medusaResult, force: true })
          writeFile(workspace, 'index.html', h)
        }
      } catch (err) {
        console.warn(`medusa: catalog auto-sync skipped – ${err.message}`)
      }
    },
  }
}
