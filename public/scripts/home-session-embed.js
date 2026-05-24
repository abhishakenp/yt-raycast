// src/scripts/home-session-embed.ts
var isMarketingHomePath = () => {
  const p = location.pathname;
  return p === "/" || p === "";
};
var openEmbeddedSession = (sessionId) => {
  const idStr = String(sessionId);
  sessionStorage.setItem("sf_return_home", "1");
  location.href = `/session/${encodeURIComponent(idStr)}`;
};
export {
  isMarketingHomePath,
  openEmbeddedSession
};
