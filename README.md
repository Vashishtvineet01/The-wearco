# TheWearCo

> **Internet uniform for founders, creators and builders.**
> Drops + a Design Studio where users print their own art on premium tees, hoodies and caps.

A modern Next.js 14 ecommerce site, designed to feel like an AI/startup brand
rather than a fashion store. Built around a "Founder Culture" identity:
**Building…**, **v1.0**, **Offline Mode**, **Late Night Shipping**, etc.

## Highlights

- **Home** — Hero, animated marquee, drops timeline, community section.
- **Shop** — Filter by category & drop, sort by price.
- **Product detail** — Color/size selection, swatch previews, related products.
- **Design Studio** (the headline feature) — Upload PNG / JPG / SVG art **or** type your own line, **drag the design directly on the garment** to position it, scale and rotate, pick fabric color and size, **download a high-res PNG mockup**, and add to cart. Custom orders are clearly marked and priced.
- **Cart & Checkout** — Persistent cart (localStorage), shipping logic, demo checkout flow with confirmation screen.
- **About / Manifesto** — Brand story, community perks, shipping policy.

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** with a custom design system (`ink` neutrals, `signal` accents)
- **React Context** for cart state
- **SVG-based product mockups** — no external image assets required, fabric color updates live

## Run locally

```bash
cd thewearco
npm install
npm run dev
```

Then open http://localhost:3000.

## Folder structure

```
app/
  layout.tsx              global layout, fonts, providers
  page.tsx                home page
  shop/page.tsx           catalog with filtering
  product/[slug]/page.tsx product detail
  studio/page.tsx         the printable order tool
  cart/page.tsx           cart with persisted state
  checkout/page.tsx       demo checkout + confirmation
  about/page.tsx          manifesto + community
components/
  Navbar.tsx Footer.tsx
  ProductCard.tsx ProductMockup.tsx Marquee.tsx
  NewsletterForm.tsx      shared email-capture client component
  CartProvider.tsx
lib/
  products.ts             seed catalog + price formatting
  types.ts                cart + custom design types
  mockup.ts               canvas renderer for PNG mockup export
```

## Where to plug in real systems

This is a self-contained front-end demo. To take it to production:

1. **Products** — replace `lib/products.ts` with a CMS / database (Sanity, Shopify, Medusa, etc.).
2. **Custom prints** — when adding a custom-design item to cart, upload the
   `imageDataUrl` to S3/Cloudinary and store the URL on the order.
3. **Checkout** — wire `app/checkout/page.tsx` to Razorpay / Stripe and persist orders.
4. **QR community** — generate per-order QR codes that resolve to a Discord invite or members-only page.

## Brand voice

- Identity-first, not fashion-first.
- Quiet, premium, monospace details.
- Speaks the language of founders, creators and freelancers.
- Drops are themed: *Founder Energy*, *Internet Uniform*, *QR Layer*, *Studio*.
