import { PRICING_PAGE_MAIN_HTML } from "./pricing-main-html"

export const getPricingMainBodyHtml = () =>
  PRICING_PAGE_MAIN_HTML.replace(/\n\s*<script>[\s\S]*<\/script>\s*$/, "")
