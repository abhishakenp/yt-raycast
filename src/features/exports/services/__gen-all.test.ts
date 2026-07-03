import { describe, it } from 'vitest'
import { writeFileSync, mkdirSync, rmSync } from 'node:fs'
import { join } from 'node:path'
import { buildOpenUIArtifactFiles } from './openui-artifact-files'

// Rich multi-page fashion store source with commerce + newsletter interactions
const source = `home_nav = FashionStoreNavbar("Hello Kitty", ["Home", "Collections", "Shop", "Lookbook", "About", "Newsletter"], "0")
home_logos = FashionStoreLogos("Featured Partners", ["logo1.png", "logo2.png", "logo3.png", "logo4.png"])
home_collections = FashionStoreCollections("Shop by Collection", "Cute & Cozy", [{"name":"Pastel Plush Toys","count":"12","imageAlt":"Pastel plush Hello Kitty toys"},{"name":"Kawaii Apparel","count":"8","imageAlt":"Hello Kitty T-shirts and dresses"},{"name":"Sweet Accessories","count":"15","imageAlt":"Hello Kitty bags and jewelry"}])
home_lookbook = FashionStoreLookbook("Style Inspiration", "Hello Kitty Lookbook", "Mix and match pastel tones with iconic bows for the ultimate cute vibe.", "View Full Lookbook", [{"look":"look1.jpg","title":"Morning Tea Party","imageAlt":"Model in pastel dress sipping tea","size":"feature"},{"look":"look2.jpg","title":"Playdate Parade","imageAlt":"Kids wearing Hello Kitty hoodies","size":"wide"},{"look":"look3.jpg","title":"Evening Stroll","imageAlt":"Couple with Hello Kitty tote bags","size":"small"}])
home_products = FashionStoreProducts("Featured Products", "Purr-fect Picks", "Hand-picked items that every Hello Kitty fan will love.", "See All Products", "Add to Bag", [{"name":"Hello Kitty Bow Headband","price":"$12.99","variant":"One Size","imageAlt":"Pink bow headband with Hello Kitty face","badge":"Best Seller"},{"name":"Hello Kitty Plush Pillow","price":"$19.99","variant":"Medium","imageAlt":"Soft plush pillow with Hello Kitty","badge":"New"},{"name":"Hello Kitty Mini Backpack","price":"$29.99","variant":"Blue","imageAlt":"Compact backpack with Hello Kitty patch","badge":"Limited"}])
home_testimonials = FashionStoreTestimonials("What Our Fans Say", "Hello Kitty Lovers Share Their Joy", [{"quote":"I'm obsessed! The quality is as cute as the design.","name":"Mia L.","role":"Collector","avatarAlt":"Mia smiling"},{"quote":"Every piece feels like a hug from Hello Kitty herself!","name":"Tom S.","role":"Fashion Blogger","avatarAlt":"Tom holding a Hello Kitty bag"}])
home_faq = FashionStoreFaq("Need Help?", "Frequently Asked Questions", [{"q":"What sizes are available?","a":["We offer XS to XL for apparel and multiple size options for accessories."]},{"q":"Do you ship internationally?","a":["Yes! We ship to most countries with tracking included."]},{"q":"Can I return or exchange items?","a":["Absolutely. Returns are accepted within 30 days in original condition."]}], "Still have questions?", "Contact Support")
home_about = FashionStoreAbout("Our Story", ["From a tiny sketch","to a global icon"], ["Hello Kitty started as a simple, sweet character and grew into a beloved symbol of friendship and cuteness. Our store celebrates that spirit with pastel-perfect products that bring smiles to fans of all ages."], [{"value":"20","label":"Years of Love"},{"value":"1M+","label":"Units Sold"}], ["Hello Kitty factory","Fans at a Hello Kitty pop-up event"])
home_stats = FashionStoreStats("Our Impact", [{"value":"500K+","label":"Happy Customers"},{"value":"50+","label":"Countries Shipped"},{"value":"4.9","label":"Average Rating"},{"value":"100%","label":"Cuteness Guaranteed"}])
home_newsletter = FashionStoreNewsletter("Join the Hello Kitty Club", "Get exclusive offers, early access to new collections, and cute surprises in your inbox.", "Subscribe", "Enter your email", "By subscribing you agree to our Privacy Policy")
home_footer = FashionStoreFooter("Hello Kitty", "/", "Cuteness in Every Stitch", [{"title":"Shop","links":["All Products","New Arrivals","Best Sellers"]},{"title":"Info","links":["FAQ","Shipping","Returns"]},{"title":"Community","links":["Blog","Events","Fan Gallery"]}], ["instagram","twitter","facebook"], "© 2026 Hello Kitty Inc.", ["visa","mastercard","paypal"])
collections_nav = FashionStoreNavbar("Hello Kitty", ["Home", "Collections", "Shop", "Lookbook", "About", "Newsletter"], "0")
collections_grid = FashionStoreCollections("All Collections", "Browse Our Collections", [{"name":"Plush Toys","count":"12","imageAlt":"Plush toys collection"},{"name":"Apparel","count":"8","imageAlt":"Apparel collection"},{"name":"Accessories","count":"15","imageAlt":"Accessories collection"},{"name":"Home Decor","count":"6","imageAlt":"Home decor collection"}])
collections_footer = FashionStoreFooter("Hello Kitty", "/", "Cuteness in Every Stitch", [{"title":"Shop","links":["All Products","New Arrivals","Best Sellers"]}], ["instagram","twitter","facebook"], "© 2026 Hello Kitty Inc.", ["visa","mastercard","paypal"])
shop_nav = FashionStoreNavbar("Hello Kitty", ["Home", "Collections", "Shop", "Lookbook", "About", "Newsletter"], "0")
shop_products = FashionStoreProducts("All Products", "Shop All Products", "Browse our complete collection of Hello Kitty merchandise.", "Load More", "Add to Bag", [{"name":"Hello Kitty Bow Headband","price":"$12.99","variant":"One Size","imageAlt":"Pink bow headband","badge":"Best Seller"},{"name":"Hello Kitty Plush Pillow","price":"$19.99","variant":"Medium","imageAlt":"Soft plush pillow","badge":"New"},{"name":"Hello Kitty Mini Backpack","price":"$29.99","variant":"Blue","imageAlt":"Compact backpack","badge":"Limited"},{"name":"Hello Kitty T-Shirt","price":"$24.99","variant":"S","imageAlt":"Hello Kitty T-shirt"},{"name":"Hello Kitty Phone Case","price":"$14.99","variant":"Universal","imageAlt":"Phone case with Hello Kitty"},{"name":"Hello Kitty Water Bottle","price":"$9.99","variant":"500ml","imageAlt":"Water bottle with Hello Kitty"}])
shop_footer = FashionStoreFooter("Hello Kitty", "/", "Cuteness in Every Stitch", [{"title":"Shop","links":["All Products"]}], ["instagram"], "© 2026 Hello Kitty Inc.", ["visa"])
about_nav = FashionStoreNavbar("Hello Kitty", ["Home", "Collections", "Shop", "Lookbook", "About", "Newsletter"], "0")
about_content = FashionStoreAbout("Our Story", ["From a tiny sketch","to a global icon"], ["Hello Kitty started as a simple, sweet character and grew into a beloved symbol of friendship and cuteness."], [{"value":"20","label":"Years of Love"},{"value":"1M+","label":"Units Sold"}], ["Hello Kitty factory","Fans at a Hello Kitty pop-up event"])
about_footer = FashionStoreFooter("Hello Kitty", "/", "Cuteness in Every Stitch", [{"title":"Shop","links":["All Products"]}], ["instagram"], "© 2026 Hello Kitty Inc.", ["visa"])
newsletter_nav = FashionStoreNavbar("Hello Kitty", ["Home", "Collections", "Shop", "Lookbook", "About", "Newsletter"], "0")
newsletter_content = FashionStoreNewsletter("Join the Hello Kitty Club", "Get exclusive offers and cute surprises in your inbox.", "Subscribe", "Enter your email", "By subscribing you agree to our Privacy Policy")
newsletter_footer = FashionStoreFooter("Hello Kitty", "/", "Cuteness in Every Stitch", [{"title":"Shop","links":["All Products"]}], ["instagram"], "© 2026 Hello Kitty Inc.", ["visa"])
root = PageSwitch(["Home", "Collections", "Shop", "About", "Newsletter"], [home_nav, home_logos, home_collections, home_lookbook, home_products, home_testimonials, home_faq, home_about, home_stats, home_newsletter, home_footer, collections_nav, collections_grid, collections_footer, shop_nav, shop_products, shop_footer, about_nav, about_content, about_footer, newsletter_nav, newsletter_content, newsletter_footer], "", {"Home":"home","Collections":"collections","Shop":"shop","About":"about","Newsletter":"newsletter"})`

const siteSpec = JSON.stringify({
  brand: 'Hello Kitty',
  theme: 't3-chat',
  genui: {
    admin: {
      routes: [{ path: '/admin', label: 'Admin' }],
      ownerEmails: ['founder@example.com'],
    },
  },
})

describe('gen-all', () => {
  it('exports all three targets to /tmp', async () => {
    for (const target of ['next', 'react', 'lakebed'] as const) {
      const { files } = await buildOpenUIArtifactFiles({
        source,
        siteSpecJson: siteSpec,
        sessionId: 'hello-kitty',
        target,
      })
      const outDir = `/tmp/hello-kitty-${target}-review`
      rmSync(outDir, { recursive: true, force: true })
      for (const [path, content] of Object.entries(files)) {
        const fullPath = join(outDir, path)
        mkdirSync(join(fullPath, '..'), { recursive: true })
        writeFileSync(fullPath, content)
      }
      console.log(`${target}: ${Object.keys(files).length} files -> ${outDir}`)
    }
  })
})
