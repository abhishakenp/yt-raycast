# Ship Fast — Market Study

## Context

- Swiss business
- Digital SaaS product
- Target users include India
- Payments: Stripe + UPI

**Romanization (future, paid):** Transliteration to or from Latin for prompts and generated copy is planned for a later release and is expected to be a **paid** capability, not part of the initial free tier.

---

## 1. Payment Architecture

Use two payment rails.

**Global users → Stripe**
**Indian users → UPI gateway**

**Reason:**

- UPI is India's dominant payment system used by hundreds of millions of users.
- Card-only checkout reduces conversion in India.
- Stripe is the best API and works perfectly for global SaaS.

---

### Stripe (primary global payments)

Use Stripe for:

- Cards
- Apple Pay
- Google Pay
- Global subscriptions

**Advantages:**

- Fastest integration
- Global compliance
- Strong developer tooling

Stripe supports businesses in many countries including Switzerland and allows selling worldwide.

---

### UPI Gateway (India)

Add a UPI-capable payment provider.

**Options:**

- Razorpay
- Cashfree
- PayU

Razorpay supports UPI subscriptions through UPI Autopay, allowing recurring payments via mandates.

UPI is widely used because it enables instant bank-to-bank transfers via mobile apps.

---

### Checkout Routing Logic

```
if country == India
   show UPI checkout
else
   show Stripe checkout
```

**Implementation methods:**

- IP detection
- Billing country selection
- Payment selector

---

## 2. Pricing Model

Launch with a simple SaaS structure.

### Free

- Generate preview
- Limited templates
- No ZIP export

**Goal:**

- Viral adoption
- SEO traffic
- Product discovery

---

### Pro (main plan)

**₹399 / month ≈ $5**

Includes:

- Unlimited generation
- Unlimited download
- Template library
- AI iteration
- Community
- Monthly drops

---

### Early Adopter Offer

Displayed on landing page:

> **Pro plan launching soon**
>
> Early adopters get **50% OFF forever**

**Normal price →** ₹399
**Early adopter price →** ₹199

**Conditions:**

- Valid for first 500–1000 users
- Discount locked while subscription stays active
- Cancel → lose discount

**Purpose:**

- Create urgency
- Seed first users
- Generate testimonials

---

### Optional Credit Packs

For non-subscription users.


| Pack         | Price |
| ------------ | ----- |
| 3 downloads  | ₹199  |
| 10 downloads | ₹399  |


This captures revenue from casual users.

---

## 3. Final Pricing Structure

```
Free
  ↓
Early adopter Pro — ₹199/month
  ↓
Normal Pro — ₹399/month
  ↓
Optional credit packs
```

---

## 4. Payment Stack Architecture

```
Frontend
  ↓
Payment selector
  ├── Stripe (global cards, Apple Pay, subscriptions)
  └── Razorpay (UPI, India subscriptions)

User pays → Webhook → Activate subscription → Unlock generation
```

---

## 5. Landing Page Pricing Layout

**Structure:**

```
Hero: "Build and ship SaaS faster"

┌─────────────────┐  ┌──────────────────────────┐
│      FREE        │  │    PRO (Most Popular)     │
│       ₹0         │  │  ₹199/month early adopter │
│                   │  │  ₹399 later               │
│ • preview gen     │  │                            │
│ • limited tpl     │  │ • unlimited generation     │
│                   │  │ • unlimited download       │
│                   │  │ • AI iteration             │
│                   │  │ • community                │
└─────────────────┘  └──────────────────────────┘

CTA: "Lock lifetime discount"
```

**Key conversion triggers:**

- "Most popular" badge
- Lifetime discount
- Limited seats
- Price increase countdown

---

## 6. Critical Business Rule

Revenue will not depend primarily on payment methods. It will depend on **retention**.

Ship regularly:

- Monthly templates
- Launch checklists
- Growth tools
- SEO generator
- Deployment automation

Otherwise users generate once and leave.

---

## 7. Final Complete Strategy


| Area            | Decision                             |
| --------------- | ------------------------------------ |
| Payments        | Stripe + UPI gateway                 |
| Pricing         | Free → ₹199 early adopter → ₹399 Pro |
| Generation cost | ~$0.05/site — margins are strong     |
| Acquisition     | SEO + dev communities                |


---

## Implementation Notes

### Liquid glass pill (shared UI control)

The product is standardizing on a **liquid-glass pill button** for marketing and in-app chrome as the redesign rolls out. Do not copy the full layered markup by hand; use the shared assets.


| Piece                    | Path                                                                                                                      |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| Styles                   | `public/styles/liquid-glass-button.css`                                                                                   |
| Browser widget           | `public/scripts/liquid-glass-button.js` — registers `<sf-glass-pill>` (injects the SVG displacement filter once per page) |
| Server-rendered HTML     | `src/server/liquid-glass-button.js` — `sfGlassPillSvgDefs()` once per document plus `sfGlassPillButton({ label, ... })`   |
| Visual trial / reference | `public/liquid-glass-trials.html` (served as a static page; links the shared CSS and script)                              |


**Static pages:** link the CSS, load the script as `type="module"`, use `<sf-glass-pill>Label</sf-glass-pill>` or `label="..."` on the element; optional attributes (`type`, `id`, `name`, `disabled`, `form`, ARIA, `data-pill-class`) are applied to the inner real `<button class="pill">`.

**Server HTML:** emit `sfGlassPillSvgDefs()` near the start of `<body>` if the page does not load the client module (avoid duplicate `#sf-glass-lens` IDs).

The dashboard now supports:

- Persistent session theme overrides for preview reloads and exported ZIPs
- Razorpay UPI checkout for Indian ZIP downloads
- Razorpay subscription checkout for UPI Autopay mandates

### Required Environment Variables

```bash
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_ZIP_PRICE_INR=199
RAZORPAY_UPI_AUTOPAY_PLAN_ID=
RAZORPAY_UPI_AUTOPAY_PRICE_INR=199
RAZORPAY_UPI_AUTOPAY_TOTAL_COUNT=12
```

### Razorpay Webhook

Configure the Razorpay webhook to point at:

```text
/api/payments/razorpay/webhook
```

Recommended events:

- `payment.authorized`
- `payment.captured`
- `payment.failed`
- `subscription.activated`
- `subscription.charged`
- `subscription.pending`
- `subscription.halted`
- `subscription.cancelled`
| Retention | Monthly drops + community + templates |

---

## 8. Growth Mechanisms ($1M ARR Playbook)

Three growth mechanisms that repeatedly appear in developer tools that scale quickly.

---

### 1) The "Open-Source Trojan Horse"

Give away something valuable for free, but ensure the free artifact advertises the paid product.

```
Free tool → Developers use it → They include it in projects → Product spreads automatically
```

**How to implement it:**

The generator should output code containing:

**README.md in generated projects:**

> Built with ShipFast
> Generate your own SaaS starter: [https://ship-fast.io](https://ship-fast.io)

**Footer in generated apps:**

> "Built with ShipFast"

Every GitHub repo becomes marketing.

---

### 2) The "Template SEO Engine"

Every template becomes a Google landing page.

**Structure:**

```
https://ship-fast.io/templates/
  saas-dashboard
  ai-saas
  stripe-subscription
  saas-landing-page
  nextjs-saas
```

Each page contains:

- Preview
- Generated example
- Prompt
- SEO keywords

**Growth loop:**

```
Google search → template page → generate project → subscribe
```

Dev tools typically get 70%+ traffic from SEO after a year.

---

### 3) Founder-Led Distribution

Developer tools grow fastest when the founder becomes the marketing channel.

**Channels:** Twitter, LinkedIn, YouTube, Reddit, Hacker News

**Example content:**

> "I built a SaaS starter generator that creates a product in 20 seconds"

Developers love watching tools being built.

---

### The Full Growth System

Combine all three into a self-reinforcing loop:

```
Templates SEO
  ↓
Users generate apps
  ↓
Projects contain attribution
  ↓
Repos appear on GitHub
  ↓
People discover the tool
  ↓
Founder content amplifies
  ↓
More users
```

---

### The One Feature You Must Add

**"Push project to GitHub" button after generation.**

```
Generate → Push to GitHub → Repo includes ShipFast attribution → GitHub exposure
```

This single feature can drive continuous discovery. Code artifacts spread naturally through GitHub, NPM, and open-source projects. Most SaaS cannot do this — developer tools can.

---

### The $1M ARR Formula


| Lever               | Role                 |
| ------------------- | -------------------- |
| SEO templates       | Organic acquisition  |
| GitHub distribution | Passive viral spread |
| Founder content     | Amplification        |
| Freemium product    | Conversion engine    |


That combination repeatedly appears in dev tools that scale.