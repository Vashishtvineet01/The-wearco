#!/usr/bin/env bash
# ============================================================
#  TheWearCo · one-click APK for external testers
# ============================================================
# Double-click this file. In ~30 seconds you'll get:
#   • A public HTTPS URL for your backend (via Cloudflare tunnel)
#   • A fresh ~/Desktop/TheWearCo.apk built against that URL
#
# Testers on ANY network can install the APK and everything
# (products, cart, checkout, order lookup) will work — as long
# as THIS Terminal window stays open. Close it to shut down the
# tunnel.
# ============================================================

set -e

REPO="/Users/charpixeltechnologies/Desktop/Wear co/thewearco"
cd "$REPO"

# ---------------------------------------------------- deps check
if ! command -v cloudflared >/dev/null 2>&1; then
  echo "Installing cloudflared..."
  brew install cloudflared
fi
if ! command -v flutter >/dev/null 2>&1; then
  echo "Flutter is not installed. Please install Flutter first."
  exit 1
fi

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# ---------------------------------------------------- backend up
if ! curl -sS -o /dev/null --max-time 2 http://127.0.0.1:3000/api/v1/health 2>&1; then
  echo ""
  echo "Next.js prod server isn't running on port 3000."
  echo "Starting it in the background..."
  # Rebuild if there's no .next directory yet
  if [ ! -d ".next" ]; then
    echo "Running npm run build (first time)..."
    npm run build
  fi
  nohup npm run start > /tmp/wearco-next.log 2>&1 < /dev/null &
  disown
  echo "Waiting for server to come up..."
  for i in $(seq 1 20); do
    if curl -sS -o /dev/null --max-time 2 http://127.0.0.1:3000/api/v1/health 2>&1; then break; fi
    sleep 1
  done
fi
echo "✓ Backend is live at http://127.0.0.1:3000"

# ---------------------------------------------------- tunnel
echo ""
echo "Starting Cloudflare tunnel (free, no auth)..."
LOG="/tmp/wearco-tunnel.log"
> "$LOG"
cloudflared tunnel --no-autoupdate --protocol http2 --url http://127.0.0.1:3000 \
  > "$LOG" 2>&1 &
CF_PID=$!

# Wait for the tunnel URL
URL=""
for i in $(seq 1 45); do
  URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$LOG" 2>/dev/null | head -1)
  if [ -n "$URL" ] && grep -q "Registered tunnel connection" "$LOG" 2>/dev/null; then break; fi
  sleep 1
done

if [ -z "$URL" ]; then
  echo "❌ Tunnel never came up. See $LOG for details."
  kill $CF_PID 2>/dev/null
  exit 1
fi

# Verify end-to-end
sleep 2
HTTP=$(curl -sS -o /dev/null --max-time 10 -w "%{http_code}" "$URL/api/v1/health" || echo 000)
if [ "$HTTP" != "200" ]; then
  echo "⚠️  Tunnel URL came up ($URL) but health check returned $HTTP."
  echo "    Testing a few more times..."
  for i in 1 2 3; do
    sleep 2
    HTTP=$(curl -sS -o /dev/null --max-time 10 -w "%{http_code}" "$URL/api/v1/health" || echo 000)
    echo "    attempt $i: $HTTP"
    if [ "$HTTP" = "200" ]; then break; fi
  done
fi

echo ""
echo "============================================================"
echo "  Public backend URL: $URL"
echo "  Health check:       HTTP $HTTP"
echo "============================================================"

# ---------------------------------------------------- build APK
echo ""
echo "Building APK with API_BASE_URL=$URL/api/v1 ..."
cd "$REPO/mobile"
flutter build apk --release --dart-define=API_BASE_URL="$URL/api/v1"
cp build/app/outputs/flutter-apk/app-release.apk ~/Desktop/TheWearCo.apk
echo ""
echo "✓ APK built: ~/Desktop/TheWearCo.apk ($(du -h ~/Desktop/TheWearCo.apk | cut -f1))"
echo ""
echo "============================================================"
echo "  SHARE THIS WITH TESTERS"
echo "============================================================"
echo "  APK file: ~/Desktop/TheWearCo.apk"
echo "  Tell them: install on Android, open, shop. Nothing else"
echo "  to configure — the backend is baked in."
echo ""
echo "  IMPORTANT: this terminal window keeps the tunnel alive."
echo "  Close it and testers lose connection. Rebuild with a new"
echo "  URL by running this script again."
echo "============================================================"
echo ""
echo "Press Ctrl+C to stop the tunnel and exit."
echo ""

# Hand control back to cloudflared so it runs in foreground
wait $CF_PID
