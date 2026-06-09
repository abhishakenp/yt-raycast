import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/clerk-react'
import { isClerkConfigured } from './provider'

export default function HeaderUser() {
  if (!isClerkConfigured()) {
    return <span className="auth-status">Clerk not configured</span>
  }

  return (
    <>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton>
          <button type="button" className="secondary-action">Sign in</button>
        </SignInButton>
      </SignedOut>
    </>
  )
}
