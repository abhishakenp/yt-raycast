# Ecommerce (luxury / DTC storefront)

Set `siteType` to `ecommerce`. Include pages and `backendFeatureHints` for a Medusa-backed store (catalog, cart, checkout flows).

## Theme
- Default luxury: light canvas (cream/off-white), near-black text, deep wine/burgundy accent on primary CTAs and ratings unless user overrides.

## Navigation
- Shop/collections, search affordance, account, cart with icon + numeric badge.
- `navigation.global`: Shop dropdown/mega-nav with children (New arrivals, Bestsellers, Gift sets, categories from prompt; optional Sale if promotions).

## Static HTML parity
- Match editorial storefront references: warm gradients, skewed bands, six+ visible SKUs, cart in chrome, layered cards — spec depth should mirror that (no one-row “shop” placeholder).

## Homepage (editorial storefront)
- Thin dark promo strip; sticky header; split hero (headline, dual CTAs, large product visual).
- Shop-by-collection horizontal strip with image tiles.
- Featured product grid: per-card add-to-cart and star ratings (use `ecommerce.products`).
- Curated sets (two-up or carousel); materials/education two-column; three review cards; inverted dark newsletter; four-column footer.
- If prompt omits layout detail, still deliver this full canvas in English unless user specifies otherwise.
- 6+ featured products when `ecommerce.products` exists; photo-forward merchandising.

## Collections
- At least one dedicated collection/category page (not only a generic grid): sorting optional; consistent product cards.
- Desktop: grid or horizontal rail with scrims; carousel dots acceptable for curated strips when multiple slides.

## PDP
- Route with gallery, variant selector (size/color), delivery/returns/warranty near CTA, cross-sell (related / complete-the-look).

## Reviews
- `testimonials` items: reviewer name, product name, verified flag, date; rating summary at section intro.

## Newsletter
- Submit label non-empty (e.g. Subscribe); helper: "No spam. Unsubscribe anytime."

## Cart / checkout
- Cart and checkout (or combined) with progress indicator, order summary (subtotal, shipping, tax, total), trust badges, guest checkout.
- Model add-to-cart, quantity, checkout progression in `interactions` or `actions` as buttons—not link-only.

## SEO
- Homepage `seo.title`: brand + concrete value prop (about six to twelve words), not generic filler.

## Spec density
- Fill `ecommerce.products` (≥6) and categories with coherent handles for storefront grids.
- Use `contentBlocks` on PDP-related sections for policy snippets and care instructions.
