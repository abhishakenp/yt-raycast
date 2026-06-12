import { json, type RequestEvent } from '@tanstack/react-start'

import { shareBonusIps } from '@/lib/rate-limit'

const SITE_URL = 'https://ship-fast.io'

const SHARE_MESSAGES = {
  en: `I just built a site in minutes with Ship Fast — try it free: ${SITE_URL}`,
  hi: `मैंने Ship Fast से मिनटों में साइट बनाई — आप भी बनाएं: ${SITE_URL}`,
  ta: `Ship Fast மூலம் நிமிடங்களில் தளம் உருவாக்கினேன் — நீங்களும் முயற்சிக்கவும்: ${SITE_URL}`,
  te: `Ship Fast తో నిమిషాల్లో సైట్ చేశాను — మీరూ ట్రై చేయండి: ${SITE_URL}`,
  bn: `Ship Fast দিয়ে মিনিটে সাইট বানিয়েছি — আপনিও চেষ্টা করুন: ${SITE_URL}`,
  mr: `Ship Fast ने मिनिटांत साइट बनवली — तुम्हीही बनवा: ${SITE_URL}`,
  kn: `Ship Fast ನಿಂದ ನಿಮಿಷಗಳಲ್ಲಿ ಸೈಟ್ ಮಾಡಿದೆ — ನೀವೂ ಮಾಡಿ: ${SITE_URL}`,
  ml: `Ship Fast ഉപയോഗിച്ച് മിനിറ്റുകളിൽ സൈറ്റ് ഉണ്ടാക്കി — നിങ്ങളും ചെയ്യൂ: ${SITE_URL}`,
  pa: `Ship Fast ਨਾਲ ਮਿੰਟਾਂ 'ਚ ਸਾਈਟ ਬਣਾਈ — ਤੁਸੀਂ ਵੀ ਬਣਾਓ: ${SITE_URL}`,
  gu: `Ship Fast વડે મિનિટોમાં સાઇટ બનાવી — તમે પણ બનાવો: ${SITE_URL}`,
}

function getClientIp(event: RequestEvent): string {
  const forwarded = event.request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  return event.request.headers.get('cf-connecting-ip') || 'unknown'
}

export async function GET({ request }: RequestEvent) {
  const ip = getClientIp({ request } as RequestEvent)
  const stored = shareBonusIps.get(ip)
  const today = new Date().toISOString().slice(0, 10)
  const claimed = stored === today

  return json({ claimed })
}

export async function POST({ request }: RequestEvent) {
  const ip = getClientIp({ request } as RequestEvent)
  const today = new Date().toISOString().slice(0, 10)
  const stored = shareBonusIps.get(ip)

  // Already claimed today
  if (stored === today) {
    return json({ claimed: true, success: false })
  }

  // Grant bonus
  shareBonusIps.set(ip, today)
  return json({ claimed: true, success: true })
}
