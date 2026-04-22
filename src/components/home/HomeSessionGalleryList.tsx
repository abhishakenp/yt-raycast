'use client'

import { useShipFastHomeAuth } from '@/components/home/ship-fast-home-auth-provider'
import { memo, useEffect } from 'react'

export const HomeSessionGalleryList = memo(() => <ul className="session-list" id="session-list" />)

HomeSessionGalleryList.displayName = 'HomeSessionGalleryList'

export const HomeGalleryImperativeSync = () => {
  const { authReady } = useShipFastHomeAuth()

  useEffect(() => {
    const w = window as Window & { __sfHomeScriptReady?: boolean }
    const sync = () => window.dispatchEvent(new CustomEvent('sf-sync-home-gallery'))
    if (w.__sfHomeScriptReady) {
      sync()
      return
    }
    window.addEventListener('sf-home-script-ready', sync, { once: true })
  }, [])

  useEffect(() => {
    if (!authReady) return
    const w = window as Window & { __sfHomeScriptReady?: boolean }
    if (!w.__sfHomeScriptReady) return
    let cancelled = false
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!cancelled) window.dispatchEvent(new CustomEvent('sf-sync-home-gallery'))
      })
    })
    return () => {
      cancelled = true
    }
  }, [authReady])

  return null
}
