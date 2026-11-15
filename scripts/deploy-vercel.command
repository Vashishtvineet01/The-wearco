#!/usr/bin/env bash
# ============================================================
#  TheWearCo · deploy web + mobile to Vercel (permanent)
# ============================================================
# Double-click this file. It will:
#   1) Log in to Vercel if you haven't already (one browser click)
#   2) Deploy the Next.js web + API to the-wearco.vercel.app
#   3) Rebuild the APK pointed at the production URL
#   4) Copy fresh APK to Desktop
#
# After this your testers can install the APK from ANY network
# and it will keep working forever — even when your Mac is off.
# No tunnel, no "same wifi" requirement, nothing to babysit.
# ============================================================

set -e

REPO="/Users/charpixeltechnologies/Desktop/Wear co/thewearco"
cd "$REPO"

export JAVA_HOME="${JAVA_HOME:-/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home}"
export ANDROID_HOME="${ANDROID_HOME:-/opt/homebrew/share/android-commandlinetools}"
export PATH="$JAVA_HOME/bin:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

# ---------------------------------------------------- vercel login
if ! vercel whoami >/dev/null 2>&1; then
  echo ""
  echo "============================================================"
  echo "  First-time Vercel setup"
  echo "============================================================"
  echo ""
  echo "A browser window will open. Sign in and approve. After that"
  echo "every future deploy from this Mac is one-click."
  echo ""
  vercel login
fi

WHO=$(vercel whoami 2>/dev/null)
echo "✓ Logged in as $WHO"

# ---------------------------------------------------- deploy web
echo ""
echo "Deploying to production (the-wearco.vercel.app)..."
echo ""
DEPLOY_URL=$(vercel --prod --yes 2>&1 | tee /tmp/vercel-deploy.log | grep -oE 'https://[a-z0-9.-]+\.vercel\.app' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
  echo "❌ Deploy did not return a URL. Log:"
  tail -20 /tmp/vercel-deploy.log
  exit 1
fi

# Prefer the canonical domain if the project is aliased to it
PROD_URL="https://the-wearco.vercel.app"
HTTP=$(curl -sS -o /dev/null --max-time 15 -w "%{http_code}" "$PROD_URL/api/v1/health" || echo 000)
if [ "$HTTP" != "200" ]; then
  echo "Canonical URL returned $HTTP — falling back to deploy URL $DEPLOY_URL"
  PROD_URL="$DEPLOY_URL"
fi

echo ""
echo "✓ Web deployed: $PROD_URL"
echo "  Health check: HTTP $(curl -sS -o /dev/null --max-time 15 -w "%{http_code}" "$PROD_URL/api/v1/health")"

# ---------------------------------------------------- build APK
echo ""
echo "Rebuilding APK with API_BASE_URL=$PROD_URL/api/v1 ..."
cd "$REPO/mobile"
flutter build apk --release --dart-define=API_BASE_URL="$PROD_URL/api/v1"
cp build/app/outputs/flutter-apk/app-release.apk ~/Desktop/TheWearCo.apk

echo ""
echo "============================================================"
echo "  DONE"
echo "============================================================"
echo "  Web:  $PROD_URL"
echo "  APK:  ~/Desktop/TheWearCo.apk"
echo ""
echo "  Share the APK with testers. Works from any network,"
echo "  any time. No need to keep your Mac on."
echo "============================================================"
echo ""
read -n 1 -s -r -p "Press any key to close..."
