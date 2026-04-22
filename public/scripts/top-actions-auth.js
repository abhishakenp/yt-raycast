import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-app.js'
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from 'https://www.gstatic.com/firebasejs/11.0.0/firebase-auth.js'

const signinBtn = document.getElementById('signin-btn')
const signoutBtn = document.getElementById('signout-btn')

const setSignedOutUi = () => {
  if (signoutBtn) signoutBtn.style.display = 'none'
  if (signinBtn) signinBtn.style.display = 'inline-flex'
}

const setSignedInUi = () => {
  if (signinBtn) signinBtn.style.display = 'none'
  if (signoutBtn) signoutBtn.style.display = 'inline-flex'
}

const main = async () => {
  if (!signinBtn && !signoutBtn) return
  let auth = null
  try {
    const response = await fetch('/api/config')
    const cfg = await response.json()
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
