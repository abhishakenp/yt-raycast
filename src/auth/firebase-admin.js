// @ts-check
import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

const firebasePrivateKeyRaw = process.env.FIREBASE_PRIVATE_KEY?.trim()
const firebasePrivateKey = firebasePrivateKeyRaw
  ? firebasePrivateKeyRaw.replace(/^"|"$/g, '').replace(/\\n/g, '\n')
  : undefined

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: firebasePrivateKey,
    }),
  })
}

/** @type {import('firebase-admin/firestore').Firestore} */
export const db = getFirestore()

/**
 * Verifies a Firebase ID token and returns the decoded token.
 * @param {string} token
 * @returns {Promise<import('firebase-admin/auth').DecodedIdToken>}
 */
export async function verifyIdToken(token) {
  return getAuth().verifyIdToken(token)
}
