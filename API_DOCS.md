# TheWearCo REST API — v1

Base URL (local dev): `http://localhost:3000/api/v1`
Base URL (production): `https://<your-vercel-domain>/api/v1`

All responses are JSON. All endpoints are CORS-enabled (`Access-Control-Allow-Origin: *`) so they can be consumed from any mobile app, web client, or server.

Prices are always in **INR**, as integers (no decimals).

---

## GET `/health`

Simple liveness + version check. Use this from your mobile app's splash screen to verify the backend is reachable.

```bash
curl https://your-domain.com/api/v1/health
```

```json
{
  "ok": true,
  "name": "TheWearCo API",
  "version": "v1",
  "timestamp": "2026-11-15T17:00:00.000Z"
}
```

---

## GET `/products`

List all **active** products. Optional `?category=` filter.

Valid categories: `tee`, `hoodie`, `sweatshirt`, `cap`, `sleeve`, `mug`, `badge`, `poster`.

```bash
curl "https://your-domain.com/api/v1/products"
curl "https://your-domain.com/api/v1/products?category=mug"
```

```json
{
  "products": [
    {
      "slug": "v1-hoodie",
      "name": "v1.0 Premium Hoodie",
      "tagline": "The first version is the bravest version.",
      "category": "hoodie",
      "price": 2499,
      "drop": "Drop 01 — Founder Energy",
      "printArea": { "x": 32, "y": 32, "w": 36, "h": 28 },
      "printShape": "rect",
      "colors": [
        { "name": "Obsidian", "hex": "#0a0a0a", "fabric": "#0e0e10", "printDefault": "#f7f7f7" }
      ],
      "sizes": ["S", "M", "L", "XL"],
      "description": "...",
      "details": ["400 GSM brushed fleece", "..."],
      "customizable": true
    }
  ]
}
```

## GET `/products/[slug]`

Fetch one product by slug.

```bash
curl https://your-domain.com/api/v1/products/v1-hoodie
```

Returns `{ "product": {...} }` or `404 { "error": "Product not found" }`.

---

## POST `/orders`

Place an order.

```bash
curl -X POST https://your-domain.com/api/v1/orders \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "aarav@startup.in",
    "name": "Aarav Mehta",
    "phone": "+919876543210",
    "paymentMethod": "upi",
    "address": {
      "line1": "42 Koramangala",
      "city": "Bengaluru",
      "state": "Karnataka",
      "pincode": "560034",
      "country": "India"
    },
    "items": [
      {
        "slug": "v1-hoodie",
        "name": "v1.0 Premium Hoodie",
        "price": 2499,
        "qty": 1,
        "size": "L",
        "color": "Obsidian"
      }
    ]
  }'
```

Response:
```json
{ "ok": true, "orderNumber": "TWC-A1B2C3", "orderId": "...", "total": 2499 }
```

### Item schema

Each item requires `slug`, `name`, `price`, `qty`, `size`, `color`. Optional `custom` object for Design Studio orders:

```json
{
  "custom": {
    "text": "Building…",
    "textColor": "#d8ff36",
    "font": "'Space Grotesk', sans-serif",
    "imageUrl": "/uploads/designs/abc.png",
    "posX": 0, "posY": 0, "scale": 1, "rotation": 0
  }
}
```

`paymentMethod`: `"upi" | "card" | "cod"`. Shipping is auto-calculated: free ≥ ₹1499, else ₹99. COD adds ₹49.

## GET `/orders/[orderNumber]`

Public order lookup for post-purchase tracking. Returns only the fields a stranger with the order number should see (status, totals, items). Personal data (email, phone, address) is stripped.

```bash
curl https://your-domain.com/api/v1/orders/TWC-A1B2C3
```

---

## POST `/uploads/design`

`multipart/form-data` with a single `file` field. Max 5 MB. Accepts PNG, JPG, WEBP, SVG.

```bash
curl -X POST https://your-domain.com/api/v1/uploads/design \
  -F 'file=@my-design.png'
```

Response: `{ "url": "/uploads/designs/<uuid>.png" }`. Use that URL as `custom.imageUrl` when placing an order.

> ⚠️ Vercel's filesystem is ephemeral. Uploads survive the lifetime of a single deployment. For production you should swap `lib/uploads.ts` to use S3 / R2 / UploadThing. The REST contract stays the same.

---

## POST `/bulk/quote`

Submit a bulk-order enquiry (teams, conferences, YC batches).

```bash
curl -X POST https://your-domain.com/api/v1/bulk/quote \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "ops@teamname.co",
    "name": "Priya Rao",
    "company": "TeamName",
    "qty": 50,
    "productSlug": "v1-hoodie",
    "productName": "v1.0 Premium Hoodie",
    "category": "hoodie",
    "color": "Obsidian",
    "size": "L",
    "message": "50 hoodies for our offsite in Goa. Need by Dec 20.",
    "deadline": "2026-12-20",
    "estimatedUnitPrice": 1949,
    "estimatedTotal": 97450,
    "tierDiscountPercent": 22
  }'
```

Response: `{ "ok": true, "id": "...", "message": "..." }`

## GET `/bulk/pricing`

Live calculator — returns the tier structure + a quote for a specific (category, basePrice, qty) combo. No DB write.

```bash
curl "https://your-domain.com/api/v1/bulk/pricing?category=hoodie&basePrice=2499&qty=50"
```

```json
{
  "baseUnitPrice": 2499,
  "qty": 50,
  "tier": { "minQty": 50, "discountPct": 22 },
  "discountPct": 22,
  "unitPrice": 1949,
  "total": 97450,
  "savings": 54500,
  "requiresQuote": false,
  "tiers": [
    { "minQty": 10, "discountPct": 10 },
    { "minQty": 25, "discountPct": 15 },
    { "minQty": 50, "discountPct": 22 },
    { "minQty": 100, "discountPct": 28 },
    { "minQty": 250, "discountPct": 35, "requiresQuote": true }
  ]
}
```

---

## POST `/newsletter`

```bash
curl -X POST https://your-domain.com/api/v1/newsletter \
  -H 'Content-Type: application/json' \
  -d '{ "email": "me@example.com" }'
```

---

## Error shape

All errors come back as:
```json
{ "error": "Human-readable message", "details": { ... optional Zod issues ... } }
```
with an appropriate HTTP status (`400` for validation, `404` for not-found, `500` for unexpected).

---

## Versioning

The `/api/v1/*` namespace is frozen — breaking changes will ship under a new `/api/v2/*` prefix so mobile clients in the wild don't break.

Internal endpoints under `/api/*` (without `/v1/`) are for first-party web use and are not covered by this contract.
