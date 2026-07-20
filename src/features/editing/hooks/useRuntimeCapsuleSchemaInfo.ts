import { useEffect, useState } from 'react'
import {
  isRuntimeComponentName,
  loadOpenUIRuntimeComponent,
} from '@ship-fast/blocks/runtime'
import {
  hasContextInfo,
  introspectCapsuleSchema,
  type CapsuleSchemaInfo,
} from '@ship-fast/blocks/capsules'

const schemaInfoCache = new Map<string, Promise<CapsuleSchemaInfo | null>>()

export const loadRuntimeCapsuleSchemaInfo = (
  capsuleName: string,
): Promise<CapsuleSchemaInfo | null> => {
  const cached = schemaInfoCache.get(capsuleName)
  if (cached) return cached

  if (!isRuntimeComponentName(capsuleName)) {
    const missing = Promise.resolve(null)
    schemaInfoCache.set(capsuleName, missing)
    return missing
  }

  const loaded = loadOpenUIRuntimeComponent(capsuleName).then((capsule) => {
    const propsSchema = capsule.client.props
    if (!propsSchema) return null
    const info = introspectCapsuleSchema(propsSchema)
    return hasContextInfo(info) ? info : null
  })
  schemaInfoCache.set(capsuleName, loaded)
  return loaded
}

export const useRuntimeCapsuleSchemaInfo = (
  capsuleName: string,
): CapsuleSchemaInfo | null => {
  const [schemaInfo, setSchemaInfo] = useState<CapsuleSchemaInfo | null>(null)

  useEffect(() => {
    let cancelled = false
    setSchemaInfo(null)
    void loadRuntimeCapsuleSchemaInfo(capsuleName)
      .then((nextSchemaInfo) => {
        if (!cancelled) setSchemaInfo(nextSchemaInfo)
      })
      .catch(() => {
        if (!cancelled) setSchemaInfo(null)
      })

    return () => {
      cancelled = true
    }
  }, [capsuleName])

  return schemaInfo
}
