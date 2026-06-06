# TestSprite MCP Test Report — Ship Fast

## 1️⃣ Document Metadata
- **Project:** ship-fast
- **Date:** 2026-06-06
- **Scope:** Frontend, codebase, dev server (`http://localhost:7420`)
- **Tests run:** 15 of 18 (dev-mode cap; TC016–TC018 skipped)

## 2️⃣ Requirement Validation Summary

### Homepage & Session Creation
| Test | Status | Notes |
|------|--------|-------|
| TC001 Create generation session | ✅ Passed | Prompt submit → session created |
| TC002 Auth prompt on quota exhaustion | ✅ Passed | Overlay shown when limit hit |
| TC003 Live generation progress | ⛔ Blocked | Used invalid session → "Session not found" |

### Authentication
| Test | Status | Notes |
|------|--------|-------|
| TC008 Email sign-in | ❌ Failed | `auth/invalid-credential` (placeholder creds) |
| TC012 Sign out | ⛔ Blocked | Sign-in prerequisite failed (`auth/network-request-failed`) |

### Session Dashboard & Preview
| Test | Status | Notes |
|------|--------|-------|
| TC007 Chat refinement | ✅ Passed | Chat flow reachable |
| TC010 Refresh preview | ⛔ Blocked | Hardcoded `example-session` not found |
| TC014 Toggle preview size | ⛔ Blocked | Same invalid session ID |
| TC009 Inline text edit | ⛔ Blocked | Sanity/chat overlay blocked preview |
| TC011 Inline style edit | ✅ Passed | Style editing worked |
| TC013 History restore | ❌ Failed | History/restore UI not discoverable |

### Export & Payments
| Test | Status | Notes |
|------|--------|-------|
| TC004 Stripe checkout | ❌ Failed | App uses Razorpay, not Stripe |
| TC005 Download export | ⛔ Blocked | Auth failed |
| TC006 Export targets / subscription | ⛔ Blocked | Auth failed |

### CMS
| Test | Status | Notes |
|------|--------|-------|
| TC015 CMS site settings | ✅ Passed | Settings form save worked |

## 3️⃣ Coverage & Matching Metrics
- **Passed:** 5 / 15 (33%)
- **Failed:** 3
- **Blocked:** 7

## 4️⃣ Key Gaps / Risks
1. **Test credentials** — Firebase tests need a real test account configured in bootstrap; placeholder creds caused most auth-related blocks.
2. **Session fixtures** — Several tests used hardcoded session IDs instead of creating a session first.
3. **Payment provider mismatch** — Test plan assumes Stripe; production UI shows Razorpay.
4. **Preview editor discoverability** — History/restore controls were not found by the agent; may need clearer UI labels or test selectors.
5. **CMS overlay** — Sanity studio/chat overlay can block inline preview editing flows.

Full raw report: `testsprite_tests/tmp/raw_report.md`  
Dashboard: https://www.testsprite.com/dashboard/mcp/tests/7bc2f6e3-06bb-46f0-b778-22552efebee3/
