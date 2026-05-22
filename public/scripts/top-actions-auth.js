// src/scripts/top-actions-auth.ts
import { initializeApp } from "firebase/app";
import {
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut
} from "firebase/auth";
var GITHUB_TOKEN_STORAGE_KEY = "sf:github-access-token";
var signinBtn = document.getElementById("signin-btn");
var signoutBtn = document.getElementById("signout-btn");
var authOverlay = document.getElementById("auth-overlay");
var authErrorEl = document.getElementById("auth-error");
var setSignedOutUi = () => {
  if (signoutBtn) signoutBtn.style.display = "none";
  if (signinBtn) signinBtn.style.display = "inline-flex";
};
var setSignedInUi = () => {
  if (signinBtn) signinBtn.style.display = "none";
  if (signoutBtn) signoutBtn.style.display = "inline-flex";
};
var openOverlay = () => {
  if (!authOverlay) return;
  if (authErrorEl) authErrorEl.textContent = "";
  authOverlay.classList.remove("hidden");
};
var closeOverlay = () => {
  if (!authOverlay) return;
  authOverlay.classList.add("hidden");
  if (authErrorEl) authErrorEl.textContent = "";
};
var showAuthError = (err) => {
  if (!authErrorEl) return;
  authErrorEl.textContent = err instanceof Error ? err.message : "Sign-in failed";
};
var main = async () => {
  if (!signinBtn && !signoutBtn) return;
  let auth = null;
  try {
    const response = await fetch("/api/config");
    const cfg = await response.json();
    if (!cfg?.apiKey) throw new Error("missing");
    auth = getAuth(initializeApp(cfg));
  } catch {
    setSignedOutUi();
    window.__sfAuthUnavailable = true;
    window.dispatchEvent(new CustomEvent("sf-home-auth-state", { detail: { user: null } }));
    window.dispatchEvent(new CustomEvent("sf-firebase-ready", { detail: { auth: null } }));
    return;
  }
  window.__sfFirebaseAuth = auth;
  window.__sfAuthApi = {
    signInGoogle: async () => {
      if (!auth) return;
      await signInWithPopup(auth, new GoogleAuthProvider());
    },
    signInGithub: async () => {
      if (!auth) return;
      const provider = new GithubAuthProvider();
      provider.addScope("repo");
      const result = await signInWithPopup(auth, provider);
      const accessToken = GithubAuthProvider.credentialFromResult(result)?.accessToken;
      if (accessToken) sessionStorage.setItem(GITHUB_TOKEN_STORAGE_KEY, accessToken);
    },
    signInEmail: async (email, password) => {
      if (!auth) return;
      await signInWithEmailAndPassword(auth, email, password);
    },
    signUpEmail: async (email, password) => {
      if (!auth) return;
      await createUserWithEmailAndPassword(auth, email, password);
    },
    signOut: async () => {
      if (!auth) return;
      sessionStorage.removeItem(GITHUB_TOKEN_STORAGE_KEY);
      await signOut(auth);
    }
  };
  window.dispatchEvent(new CustomEvent("sf-firebase-ready", { detail: { auth } }));
  onAuthStateChanged(auth, (user) => {
    if (user) {
      setSignedInUi();
      closeOverlay();
    } else {
      setSignedOutUi();
    }
    window.dispatchEvent(new CustomEvent("sf-home-auth-state", { detail: { user: user ?? null } }));
  });
  signoutBtn?.addEventListener("click", () => {
    void window.__sfAuthApi?.signOut();
  });
  signinBtn?.addEventListener("click", () => {
    window.dispatchEvent(new CustomEvent("sf-request-auth-overlay"));
    if (window.parent && window.parent !== window) {
      window.parent.dispatchEvent(new CustomEvent("sf-request-auth-overlay"));
    }
  });
  window.addEventListener("sf-request-auth-overlay", () => openOverlay());
  authOverlay?.addEventListener("click", (event) => {
    if (event.target === authOverlay && !auth?.currentUser) closeOverlay();
  });
  const wrap = (fn) => (event) => {
    event.preventDefault();
    if (authErrorEl) authErrorEl.textContent = "";
    fn().catch(showAuthError);
  };
  document.getElementById("google-signin-btn")?.addEventListener("click", wrap(() => window.__sfAuthApi.signInGoogle()));
  document.getElementById("github-signin-btn")?.addEventListener("click", wrap(() => window.__sfAuthApi.signInGithub()));
  const emailInput = document.getElementById("auth-email");
  const passwordInput = document.getElementById("auth-password");
  const readEmailCreds = () => {
    const email = emailInput?.value.trim() ?? "";
    const password = passwordInput?.value ?? "";
    if (!email || !password) {
      if (authErrorEl) authErrorEl.textContent = "Email and password required";
      return null;
    }
    return { email, password };
  };
  document.getElementById("email-signin-btn")?.addEventListener(
    "click",
    wrap(async () => {
      const creds = readEmailCreds();
      if (!creds) return;
      await window.__sfAuthApi.signInEmail(creds.email, creds.password);
    })
  );
  document.getElementById("email-signup-btn")?.addEventListener(
    "click",
    wrap(async () => {
      const creds = readEmailCreds();
      if (!creds) return;
      await window.__sfAuthApi.signUpEmail(creds.email, creds.password);
    })
  );
};
void main();
