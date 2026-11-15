# TheWearCo — Mobile App

Flutter 3.22+ shell app for TheWearCo. Talks to the Next.js backend over the public `/api/v1/*` REST API documented in [`../API_DOCS.md`](../API_DOCS.md).

**Phase 4 / shipped in this pass:** Shop · Product · Cart · Checkout · Bulk enquiry (read-only / write-order flow).
**Coming next:** Design Studio port (upload, drag-to-position, canvas mockup export).

---

## Prerequisites

```bash
flutter --version   # 3.22.0 or newer
flutter doctor      # should pass for iOS / Android / macOS
```

If Flutter isn't installed: https://docs.flutter.dev/get-started/install

---

## First-time setup

```bash
cd mobile
flutter pub get
```

---

## Run it

The app needs the Next.js backend running somewhere. There are three common setups:

### 1. iOS Simulator + local backend

```bash
# Terminal 1: start the backend
cd ..
DATABASE_URL="file:./dev.db" npm run dev
# -> http://localhost:3000

# Terminal 2: run the app
cd mobile
flutter run -d "iPhone 15 Pro"
```

iOS simulator can reach `localhost` directly, so no extra config needed.

### 2. Android Emulator + local backend

Android emulators can't reach `localhost` — they need the special `10.0.2.2` alias:

```bash
flutter run -d emulator-5554 \
  --dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1
```

### 3. Physical device + deployed backend

```bash
flutter run \
  --dart-define=API_BASE_URL=https://thewearco.vercel.app/api/v1
```

---

## Architecture

```
lib/
  main.dart              # App entry — ProviderScope + system chrome
  app.dart               # MaterialApp.router — theme + go_router routes
  core/
    config/env.dart      # API_BASE_URL + absolute-url helper
    theme/app_theme.dart # Brand palette + typography
    api/
      api_client.dart    # Shared Dio + ApiException
      api_providers.dart # Riverpod providers (products, orders, health)
    models/              # Immutable DTOs (product, cart_item, order)
    util/format.dart     # INR formatter + hex->ARGB
  features/
    shop/                # Product grid + category chips + mockup painter
    product/             # Product detail + add-to-cart
    cart/                # Cart controller (persisted) + cart screen
    checkout/            # Form + POST /orders + success screen
    bulk/                # Bulk enquiry form -> POST /bulk/quote
```

**State management:** `flutter_riverpod`. One `cartProvider` (persisted via `shared_preferences`), per-screen `FutureProvider`s for products.

**Routing:** `go_router` with declarative routes. Deep links like `thewearco://product/<slug>` would just need the platform URL scheme registered.

**Networking:** `dio` with a 10s connect / 15s receive timeout. Errors are normalized through `ApiException` and shown inline on each screen.

**Theming:** All brand colors mirror `tailwind.config.ts` so the app looks native to the brand. Fonts (`Space Grotesk`, `Inter`, `JetBrains Mono`) are pulled live via `google_fonts` for the shell — swap to bundled assets for App Store builds (avoids the runtime font fetch).

---

## What's deliberately NOT in this phase

- **Design Studio** — image upload, drag-to-position, mockup export. Needs a `CustomPainter` port of `lib/mockup.ts` plus the image picker — it's the next sprint.
- **Payments SDK** — checkout calls `POST /orders` which just persists the order. Hook up Razorpay or Stripe in a follow-up.
- **Auth / order history** — the web storefront is also guest-checkout for now. Once customer auth lands on the backend, mirror it here with `flutter_secure_storage`.
- **Push notifications** — requires backend + Firebase/APNs setup.
- **Deep links** — the router is already URL-shaped (`/product/<slug>`), just needs platform URL schemes.

---

## Build for release

```bash
# iOS
flutter build ipa --release \
  --dart-define=API_BASE_URL=https://your-domain.com/api/v1

# Android
flutter build apk --release \
  --dart-define=API_BASE_URL=https://your-domain.com/api/v1
```

---

## Troubleshooting

**"Failed to reach TheWearCo API" on the Shop screen**
- Confirm the backend is up: `curl http://localhost:3000/api/v1/health`
- Android emulator? Use `--dart-define=API_BASE_URL=http://10.0.2.2:3000/api/v1`
- Physical device + `localhost`? Point `API_BASE_URL` at the deployed Vercel URL instead.

**"CocoaPods not installed" on iOS**
```bash
sudo gem install cocoapods
cd ios && pod install
```

**Google Fonts "ClientException: Connection refused"**
The google_fonts package fetches fonts at runtime. If the device has no network, fonts fall back to the system default. For offline-capable release builds, bundle the font files instead (`pubspec.yaml` → `fonts:` section).
