import { useCallback, useEffect, useMemo, useRef } from 'react'
import type { LakebedClientRuntime } from '@ship-fast/lakebed/react'

import type {
  logisticsLakebed,
  LogisticsShipmentInput,
  LogisticsTrackingInput,
} from './logistics-lakebed.ts'

export type LogisticsLakebed = LakebedClientRuntime<typeof logisticsLakebed>

export function shipmentItem({
  destination,
  estimatedDelivery,
  origin,
  status,
  trackingId,
}: LogisticsShipmentInput): LogisticsShipmentInput {
  return {
    destination: destination ?? '',
    estimatedDelivery: estimatedDelivery ?? '',
    origin: origin ?? '',
    status: status ?? '',
    trackingId,
  }
}

export function useSyncShipmentCatalog(
  lakebed: LogisticsLakebed,
  items: LogisticsShipmentInput[],
) {
  const syncShipments = lakebed.useMutation('syncShipments')
  const syncShipmentsRef = useRef(syncShipments)
  const itemKey = useMemo(() => JSON.stringify(items), [items])
  const stableItems = useMemo(
    () => items.map((item) => shipmentItem(item)),
    [itemKey],
  )

  useEffect(() => {
    syncShipmentsRef.current = syncShipments
  }, [syncShipments])

  useEffect(() => {
    if (!stableItems.length) return
    void syncShipmentsRef.current({ items: stableItems })
  }, [stableItems])
}

export function useShipmentTracking(lakebed: LogisticsLakebed) {
  const state = lakebed.useQuery('trackShipment')
  const setTrackingSearch = lakebed.useMutation('setTrackingSearch')

  const submitTracking = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      if (setTrackingSearch.isPending) return

      const form = event.currentTarget
      const formData = new FormData(form)
      const input: LogisticsTrackingInput = {
        trackingId: String(formData.get('trackingId') ?? ''),
      }

      void setTrackingSearch(input)
    },
    [setTrackingSearch],
  )

  const chooseTracking = useCallback(
    (input: LogisticsTrackingInput) => {
      if (setTrackingSearch.isPending) return
      void setTrackingSearch(input)
    },
    [setTrackingSearch],
  )

  return {
    chooseTracking,
    isPending: setTrackingSearch.isPending,
    state,
    submitTracking,
  }
}
