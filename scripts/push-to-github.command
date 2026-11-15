#!/usr/bin/env bash
# One-click push to GitHub. Double-click this file on Desktop and
# it will:
#   1) If this Mac has never authenticated to GitHub, open the GitHub
#      device-code approval screen in your default browser. You approve
#      once — no password typed — and a token gets saved to macOS
#      Keychain permanently.
#   2) Wire git up to use that token for github.com (one-time).
#   3) `git push origin main`.
#
# After the first run you can just double-click this file again later
# and it jumps straight to step 3. No prompts, no passwords.

set -e

REPO_DIR="/Users/charpixeltechnologies/Desktop/Wear co/thewearco"
cd "$REPO_DIR"

# ---------------------------------------------------------------- deps
if ! command -v gh >/dev/null 2>&1; then
  echo ""
  echo "GitHub CLI isn't installed yet. Installing with Homebrew..."
  echo ""
  brew install gh
fi

# -------------------------------------------------------------- authN
if ! gh auth status --hostname github.com >/dev/null 2>&1; then
  echo ""
  echo "============================================================"
  echo " First-time GitHub setup"
  echo "============================================================"
  echo ""
  echo "A browser window is about to open. Approve the 8-character"
  echo "code shown below. After that, this Mac will push to GitHub"
  echo "forever without any password prompts."
  echo ""
  # --web uses the browser device-code flow (no password typed)
  gh auth login --hostname github.com --git-protocol https --web --skip-ssh-key
  gh auth setup-git --hostname github.com
  echo ""
  echo "Auth stored in macOS Keychain. You're set."
fi

# -------------------------------------------------------------- push
echo ""
echo "Pushing latest commits to origin/main..."
git push origin main
echo ""
echo "Done. Vercel should auto-deploy in ~60 seconds."
echo ""
read -n 1 -s -r -p "Press any key to close..."
