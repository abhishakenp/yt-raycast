import { shouldUseSwiper } from '../src/lib/swiper-policy.js'

if (shouldUseSwiper({ siteType: 'ecommerce' }) !== true) process.exit(1)
if (shouldUseSwiper({ userPrompt: 'Build a carousel of team photos' }) !== true) process.exit(1)
if (shouldUseSwiper({ userPrompt: 'image gallery for portfolio' }) !== true) process.exit(1)
if (shouldUseSwiper({ userPrompt: 'simple landing page' }) !== false) process.exit(1)
if (shouldUseSwiper(null) !== false) process.exit(1)
if (shouldUseSwiper({}) !== false) process.exit(1)
