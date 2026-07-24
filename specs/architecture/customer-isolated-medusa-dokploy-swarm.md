# Customer-Isolated Medusa on Dokploy/Swarm

## Summary

Build one isolated Medusa stack per paid Ship Fast customer. Each customer can
connect multiple generated ecommerce sites to that stack using separate Medusa
stores, sales channels, and publishable keys.

Use Dokploy/Swarm for launch. Preserve a provider-neutral provisioning contract
so k3s can replace Dokploy later without changing Ship Fast APIs, data
ownership, storefronts, or customer workflows.

Medusa does not natively isolate independent customers inside one runtime. Its
multi-store capability is appropriate only within one customer's stack:
https://docs.medusajs.com/resources/commerce-modules/store

## Architecture

```text
Clerk customer
    |
    +-- Commerce instance: one isolated Medusa stack
    |     +-- Medusa server
    |     +-- Medusa worker
    |     +-- dedicated PostgreSQL database and credentials
    |     +-- dedicated Redis service and volume
    |     +-- customer-scoped object-storage prefix and credentials
    |
    +-- Ecommerce store A: session + sales channel + publishable key
    +-- Ecommerce store B: session + sales channel + publishable key
```

- Ship Fast owns customer identity, payment entitlement, store bindings, and
  lifecycle state.
- A private `commerce-provisioner` service owns Dokploy/Swarm credentials and
  infrastructure operations.
- Ship Fast never accesses Docker directly and never stores Medusa database,
  JWT, cookie, Redis, or admin secrets.
- The provisioner generates runtime secrets, creates the customer stack,
  configures routing, waits for health, and returns only public URLs, provider
  references, and store publishable keys.
- Use immutable, digest-pinned Medusa images. Never build Medusa separately for
  each customer.
- Route stacks through wildcard HTTPS hostnames; expose no customer-specific
  host ports.
- Deploy each customer as a Swarm stack with unique networks, volumes, service
  names, and credentials.

## Data And Interfaces

### Convex Model

Replace deployment-bound `commerceTenants` with:

- `commerceInstances`: one row per Clerk `tokenIdentifier`; stores provider
  reference, public URLs, lifecycle status, entitlement expiry,
  suspension/deletion timestamps, and secret reference.
- `commerceStores`: one row per generated ecommerce session; references its
  customer instance and stores provider store ID, sales channel ID, publishable
  key, sync state, and optional deployment binding.
- `commerceInstanceOperations`: durable, idempotent provisioning, store
  creation, suspension, resume, upgrade, and deletion operations. Keep
  operational retries separate from stable instance records.
- Add unique lookup indexes for owner, session, deployment, provider reference,
  operation idempotency key, and lifecycle deadlines.

Lifecycle states:

```text
provisioning -> ready -> degraded -> suspending -> suspended -> resuming -> ready
```

Terminal states:

```text
failed
deleting
deleted
```

### Billing Contract

- Add `currentPeriodEnd` and `cancelAtPeriodEnd` to subscriptions.
- Normalize Stripe `current_period_end` and Razorpay `current_end` into
  milliseconds.
- A customer remains entitled while `now < currentPeriodEnd`, including after
  scheduling cancellation.
- Cancellation does not suspend Medusa early.
- At paid-period expiry, suspend the Swarm stack.
- Retain stopped databases and volumes for 30 days.
- Repayment during retention resumes the same stack and data.
- Delete infrastructure only after retention expires and entitlement is still
  absent.
- Scheduled lifecycle jobs must re-check current entitlement before suspending
  or deleting.

### Provisioning Contract

Private provisioner API:

- `PUT /v1/instances/:instanceId` - idempotently create or reconcile a customer
  stack.
- `PUT /v1/instances/:instanceId/stores/:storeId` - create or reconcile a
  Medusa store, sales channel, key, and generated products.
- `POST /v1/instances/:instanceId/suspend`
- `POST /v1/instances/:instanceId/resume`
- `POST /v1/instances/:instanceId/upgrade`
- `DELETE /v1/instances/:instanceId`
- `GET /v1/instances/:instanceId/health`

Every mutation accepts an idempotency key and returns stable provider references
and lifecycle status. Authenticate calls with a dedicated service credential
over HTTPS. Only the provisioner receives Dokploy credentials.

### Ship Fast API Behavior

- Preserve `POST /api/sessions/:sessionId/provision/medusa` as the compatibility
  entrypoint.
- Require a valid Clerk identity and paid-through entitlement; anonymous and
  unpaid requests return explicit `AUTH_REQUIRED` or `PAYMENT_REQUIRED` errors
  before infrastructure calls.
- The first ecommerce session creates the customer instance and its first store
  asynchronously.
- Later sessions reuse the existing customer instance and create only another
  Medusa store binding.
- Return `202` while work is queued or running and `200` when the store is
  ready.
- Keep existing cart gateway URLs; resolve
  `session/deployment -> commerce store -> customer instance` at request time.
- Remove global Medusa fallback credentials and URL templates after the new path
  passes production verification.

## Customer Experience

- Remove Medusa email/password fields from `CommercePanel`.
- Signed-out users see sign-in; unpaid users see upgrade; paid users see
  `Enable Commerce`.
- Show deterministic provisioning states without requiring refresh.
- `Open Admin` uses Clerk SSO; no second password is created or displayed.
- Ship Fast signs a single-use, 60-second admin token containing customer ID,
  email, commerce instance ID, audience, expiry, and nonce.
- The customer's Medusa stack verifies the signature, instance claim, expiry,
  nonce, and owner ID, then creates or loads the matching Medusa admin user.
- Store only the SSO public verification key in customer stacks; keep the
  signing key in Ship Fast.
- Reject tokens for another customer's stack even when email addresses match.
- Use Medusa's documented custom Admin authentication provider:
  https://docs.medusajs.com/resources/app/how-to-tutorials/how-to/admin/auth

## Implementation Sequence

1. Extend billing ingestion and entitlement checks with paid-through timestamps;
   test cancellation-at-period-end before touching provisioning.
2. Add customer-level commerce instance, store, and operation records and
   migrate resolver behavior behind the existing public commerce APIs.
3. Build the private provisioner and one-customer Swarm stack template with
   dedicated Postgres, Redis, volumes, routing, secrets, health checks, and
   rollback.
4. Add Medusa multi-store bootstrap, store-scoped sales channels, publishable
   keys, product sync, and Clerk SSO.
5. Replace Commerce panel credential setup with paid entitlement, asynchronous
   progress, retry, Admin SSO, and multi-store reuse.
6. Deploy one internal test customer stack, verify full commerce behavior, then
   disable the shared Medusa fallback.
7. Decommission the old shared Medusa stack only after its products and config
   are confirmed unnecessary and the isolated path passes end-to-end checks.

## Test Plan

- Unauthenticated and unpaid users cannot enqueue infrastructure work.
- A paid user creates the first ecommerce site: exactly one Swarm stack and one
  store binding.
- The same user creates a second site: stack count remains one; store, sales
  channel, products, and publishable key are distinct.
- A second user creates a site: separate stack, database, Redis, volumes,
  secrets, hostname, and Admin.
- Customer A cannot resolve, query, administer, or use keys belonging to
  customer B.
- Duplicate enable requests and provisioner retries create no duplicate stacks
  or stores.
- Server and worker restart preserves products, carts, orders, users, and store
  bindings.
- Failed deployment records a safe error and supports idempotent retry or
  rollback.
- Clerk SSO creates the correct Medusa admin and rejects expired, replayed,
  wrong-audience, and cross-instance tokens.
- Cancellation on day two keeps commerce running until the provider's cycle
  end.
- Expiry suspends compute; repayment within 30 days resumes existing data;
  retention expiry deletes only the intended customer stack.
- Real production verification: enable commerce, sync generated products, open
  Admin through SSO, add a product to cart, complete the configured payment
  provider flow, create a second store, restart services, and repeat cart
  checkout.

## Assumptions

- Launch isolation unit is one Medusa stack per paid Clerk customer, not per
  generated site.
- Data may be shared among that customer's stores but never across customers.
- Dokploy/Swarm is the only launch runtime; Proxmox and k3s are out of scope.
- Migration to k3s is triggered by fleet operations, isolation policy,
  autoscaling, or SLA pressure, not by receiving the first payment.
- The future k3s implementation must satisfy the same private provisioner API,
  allowing runtime migration without changing Ship Fast or customer-facing
  contracts.
- No existing customer migration is required because launch customer count is
  zero; old shared infrastructure remains temporarily only for cutover
  verification.

## Verification Status

UNVERIFIED: implementation and production end-to-end execution remain future
work. This plan is grounded in the current commerce, billing, Convex, Medusa,
and Dokploy interfaces.
