// src/scripts/home-session-embed.ts
var STATE_KEY = "sfEmbeddedSession";
var shell = null;
var frame = null;
var listenersBound = false;
var isMarketingHomePath = () => {
  const p = location.pathname;
  return p === "/" || p === "";
};
var setMainInert = (on) => {
  if (!shell) return;
  for (const el of Array.from(document.body.children)) {
    if (el === shell) continue;
    if (on) el.setAttribute("inert", "");
    else el.removeAttribute("inert");
  }
};
var hideShell = () => {
  if (!shell) return;
  shell.hidden = true;
  setMainInert(false);
};
var clearStrayEmbedInert = () => {
  const el = document.getElementById("sf-home-session-shell");
  if (el && !el.hidden) return;
  document.querySelectorAll("body > [inert]").forEach((node) => {
    if (node.id !== "sf-home-session-shell") node.removeAttribute("inert");
  });
};
var bindListeners = () => {
  if (listenersBound) return;
  listenersBound = true;
  window.addEventListener("pageshow", clearStrayEmbedInert);
  window.addEventListener("popstate", (ev) => {
    const state = ev.state;
    const id = state && state[STATE_KEY];
    if (id) {
      showShellForSession(String(id));
      try {
        frame?.focus();
      } catch {
      }
    } else {
      hideShell();
    }
  });
  window.addEventListener("message", (ev) => {
    if (ev.origin !== location.origin) return;
    if (ev.data?.type !== "sf-close-embedded-session") return;
    if (!shell || shell.hidden) return;
    if (history.state?.[STATE_KEY]) {
      history.back();
    } else {
      history.replaceState(null, "", "/");
      hideShell();
    }
  });
};
var ensureShell = () => {
  if (shell && frame) {
    bindListeners();
    return;
  }
  shell = document.createElement("div");
  shell.id = "sf-home-session-shell";
  shell.className = "sf-home-session-shell";
  shell.hidden = true;
  shell.setAttribute("role", "dialog");
  shell.setAttribute("aria-modal", "true");
  shell.setAttribute("aria-label", "Live session dashboard");
  frame = document.createElement("iframe");
  frame.className = "sf-home-session-frame";
  frame.setAttribute("title", "Live session dashboard");
  document.body.appendChild(shell);
  shell.appendChild(frame);
  bindListeners();
};
var showShellForSession = (sessionId) => {
  ensureShell();
  const idStr = String(sessionId);
  const path = `/session/${encodeURIComponent(idStr)}?embed=1`;
  const wasHidden = !!shell?.hidden;
  if (frame && (frame.dataset.sfSessionId !== idStr || wasHidden)) {
    frame.dataset.sfSessionId = idStr;
    frame.src = path;
  }
  if (shell) {
    shell.hidden = false;
  }
  setMainInert(true);
};
var openEmbeddedSession = (sessionId) => {
  const idStr = String(sessionId);
  if (!isMarketingHomePath()) {
    location.href = `/session/${idStr}`;
    return;
  }
  ensureShell();
  history.pushState({ [STATE_KEY]: idStr }, "", `/session/${idStr}`);
  showShellForSession(idStr);
  try {
    frame?.focus();
  } catch {
  }
};
export {
  isMarketingHomePath,
  openEmbeddedSession
};
