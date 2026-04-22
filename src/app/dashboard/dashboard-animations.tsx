'use client'

import { useEffect } from 'react'
import { CmsifyAnimation } from '@/lib/cmsiffy-animation'
import { EcommercifyAnimation } from '@/lib/ecommercify-animation'

export function DashboardAnimationBridge() {
  useEffect(() => {
    const win = window as Window & {
      CmsifyAnimation?: typeof CmsifyAnimation
      EcommercifyAnimation?: typeof EcommercifyAnimation
    }

    win.CmsifyAnimation = CmsifyAnimation
    win.EcommercifyAnimation = EcommercifyAnimation
  }, [])

  return null
}
