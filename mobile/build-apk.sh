#!/usr/bin/env bash
#
# TheWearCo Android APK builder
# -----------------------------
# Usage:
#   ./build-apk.sh <API_BASE_URL>
#
# Examples:
#   # Permanent — Vercel production
#   ./build-apk.sh https://the-wearco.vercel.app/api/v1
#
#   # Temporary — Cloudflare quick tunnel (free, no account)
#   #   In another terminal:  cloudflared tunnel --url http://localhost:3000
#   #   Grab the printed https://…trycloudflare.com URL and pass it here:
#   ./build-apk.sh https://<your-tunnel>.trycloudflare.com/api/v1
#
#   # LAN only (phone + Mac on same WiFi)
#   ./build-apk.sh http://$(ipconfig getifaddr en0):3000/api/v1
#
# Output:
#   mobile/build/app/outputs/flutter-apk/app-release.apk    (canonical)
#   ~/Desktop/TheWearCo.apk                                 (convenience copy)

set -euo pipefail

API_BASE_URL="${1:-}"
if [[ -z "$API_BASE_URL" ]]; then
  echo "❌  Missing API_BASE_URL."
  echo "    Usage: $0 <API_BASE_URL>"
  echo "    Example: $0 https://the-wearco.vercel.app/api/v1"
  exit 1
fi

# Verify the API actually responds before wasting 8 minutes of Gradle time
echo "🔎  Probing $API_BASE_URL/products …"
HTTP=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$API_BASE_URL/products" || true)
if [[ "$HTTP" != "200" ]]; then
  echo "⚠️   $API_BASE_URL/products returned HTTP $HTTP (expected 200)."
  echo "    The APK will still build, but it won't load products on launch."
  read -r -p "    Build anyway? [y/N] " confirm
  [[ "$confirm" == "y" || "$confirm" == "Y" ]] || exit 1
else
  echo "✅  API is reachable."
fi

# Find the Flutter/Android toolchain even when run outside Cursor
export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "🏗️   Building release APK (this takes 2–8 min on first run)…"
flutter build apk --release --dart-define=API_BASE_URL="$API_BASE_URL"

APK="$SCRIPT_DIR/build/app/outputs/flutter-apk/app-release.apk"
SIZE=$(du -h "$APK" | cut -f1)
cp "$APK" ~/Desktop/TheWearCo.apk

echo ""
echo "🎉  Done."
echo "    APK:     $APK  ($SIZE)"
echo "    Copy:    ~/Desktop/TheWearCo.apk"
echo "    Backend: $API_BASE_URL"
echo ""
echo "    Share: upload ~/Desktop/TheWearCo.apk to Drive / WhatsApp / Telegram"
echo "    Install locally: adb install ~/Desktop/TheWearCo.apk"
