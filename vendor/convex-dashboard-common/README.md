# Convex Dashboard Common Source

This folder vendors the Convex `dashboard-common` data UI source used as the reference for Ship Fast auto-admin.

- Source: https://github.com/get-convex/convex-backend/tree/main/npm-packages/dashboard-common
- Copied commit: `f7869f700d93974ed85ed207b689bd4bfbd037be`
- License: `FSL-1.1-Apache-2.0` future license, preserved in `LICENSE.md`

Only the data component subtree is copied here. The runtime admin adapter lives in `src/features/admin` and replaces Convex dashboard deployment APIs with Lakebed `sessionData.data` reads and writes.
