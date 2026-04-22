"use client"

import { useEffect } from "react"

const TARGET = new Date("2026-05-23T00:00:00+05:30")

const pad = (n: number) => String(n).padStart(2, "0")

export const PricingCountdown = () => {
  useEffect(() => {
    const el = document.getElementById("countdown-text")
    if (!el) return
    const tick = () => {
      const now = new Date()
      const diff = TARGET.getTime() - now.getTime()
      if (diff <= 0) {
        el.textContent = "Slots filled — price locked in"
        return
      }
      const days = Math.floor(diff / 86400000)
      const hours = Math.floor((diff % 86400000) / 3600000)
      const mins = Math.floor((diff % 3600000) / 60000)
      el.textContent = `Price increases in ${days}d ${pad(hours)}h ${pad(mins)}m`
    }
    tick()
    const id = setInterval(tick, 30000)
    return () => clearInterval(id)
  }, [])
  return null
}
