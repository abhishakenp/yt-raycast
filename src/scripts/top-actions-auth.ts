import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth'

const signinBtn: HTMLElement | null = document.getElementById('signin-btn')
const signoutBtn: HTMLElement | null = document.getElementById('signout-btn')

const setSignedOutUi = (): void => {
  if (signoutBtn) signoutBtn.style.display = 'none'
  if (signinBtn) signinBtn.style.display = 'inline-flex'
}

const setSignedInUi = (): void => {
  if (signinBtn) signinBtn.style.display = 'none'
  if (signoutBtn) signoutBtn.style.display = 'inline-flex'
}

const main = async (): Promise<void> => {
  if (!signinBtn && !signoutBtn) return

  let auth: ReturnType<typeof getAuth> | null = null

  try {
    const response = await fetch('/api/config')
    const cfg: { apiKey?: string } = await response.json()
    if (!cfg?.apiKey) throw new Error('missing')
    auth = getAuth(initializeApp(cfg))
  } catch {
    setSignedOutUi()
    return
  }

  onAuthStateChanged(auth, (user) => {
    if (user) setSignedInUi()
    else setSignedOutUi()
  })

  signoutBtn?.addEventListener('click', () => {
    void signOut(auth)
  })

  signinBtn?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('sf-request-auth-overlay'))
    if (window.parent && window.parent !== window) {
      window.parent.dispatchEvent(new CustomEvent('sf-request-auth-overlay'))
    }
  })
}

void main()
