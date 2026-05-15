#!/usr/bin/env bash
# Verify that edit-mode code is fully stripped from the production bundle and
# that the /api/content endpoint refuses requests when NODE_ENV=production.
# Run this before pushing to main (or before merging anything that touches
# src/lib/edit-mode, src/components/edit-mode, or src/app/api/content).
#
# Exit codes:
#   0 — all checks passed
#   1 — at least one check failed (details printed)

set -u

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

fail=0
fail_msg() { echo -e "${RED}FAIL${NC} $1"; fail=1; }
pass_msg() { echo -e "${GREEN}PASS${NC} $1"; }
info_msg() { echo -e "${YELLOW}…${NC}    $1"; }

# Discover the build output dir. The local turbopack workaround writes to
# ~/.cache/yasha-portfolio-next; Vercel uses .next. We check both.
if [ -d ".next" ]; then
  BUILD_DIR=".next"
elif [ -d "$HOME/.cache/yasha-portfolio-next" ]; then
  BUILD_DIR="$HOME/.cache/yasha-portfolio-next"
else
  BUILD_DIR=""
fi

info_msg "Building production bundle (next build)…"
NODE_ENV=production npm run build > /tmp/yasha-prod-build.log 2>&1
if [ $? -ne 0 ]; then
  fail_msg "next build failed — see /tmp/yasha-prod-build.log"
  exit 1
fi
pass_msg "next build succeeded"

if [ -d ".next" ]; then
  BUILD_DIR=".next"
elif [ -d "$HOME/.cache/yasha-portfolio-next" ]; then
  BUILD_DIR="$HOME/.cache/yasha-portfolio-next"
elif [ -d "Users/yashapetrunin/.cache/yasha-portfolio-next" ]; then
  # Turbopack quirk: with `•` in project path, the absolute distDir from
  # next.config.ts gets created project-relative.
  BUILD_DIR="Users/yashapetrunin/.cache/yasha-portfolio-next"
else
  fail_msg "No build output directory found (.next, ~/.cache/..., or project-relative variant)"
  exit 1
fi
info_msg "Inspecting build output in $BUILD_DIR/"

# Edit-mode logic strings that MUST NOT appear in prod client bundle.
# We deliberately do NOT check for component names like "EditToggleButton" —
# Turbopack keeps those in its export manifest even when the body is fully
# tree-shaken to `function(){return null}`. Instead we check for strings that
# are unique to the live logic: storage keys, on-screen labels, key handlers.
declare -a FORBIDDEN_SYMBOLS=(
  "edit-toggle-button-position"
  "edit-mode-enabled"
  "Done editing"
  "Cmd+B bold"
  "✏️ Edit"
)

for sym in "${FORBIDDEN_SYMBOLS[@]}"; do
  matches=$(grep -r --include="*.js" --include="*.json" -l "$sym" "$BUILD_DIR/static" 2>/dev/null | wc -l)
  if [ "$matches" -gt 0 ]; then
    fail_msg "Found \"$sym\" in $matches client bundle file(s) — should be tree-shaken"
    grep -rln --include="*.js" "$sym" "$BUILD_DIR/static" 2>/dev/null | head -3 | sed 's/^/        /'
  else
    pass_msg "No \"$sym\" in client bundle"
  fi
done

# Boot prod server and check /api/content returns 403.
info_msg "Starting production server on :3001…"
PORT=3001 NODE_ENV=production npm run start > /tmp/yasha-prod-server.log 2>&1 &
SERVER_PID=$!

# Wait up to 30s for server to be ready.
ready=0
for _ in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/ | grep -q "200"; then
    ready=1
    break
  fi
  sleep 1
done

if [ "$ready" -ne 1 ]; then
  fail_msg "Production server did not become ready in 30s — see /tmp/yasha-prod-server.log"
  kill $SERVER_PID 2>/dev/null
  exit 1
fi
pass_msg "Production server up on :3001"

# Now hit /api/content with a benign POST. Must return 403.
api_status=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3001/api/content \
  -H "Content-Type: application/json" \
  -d '{"fileKey":"about","fieldPath":["howText"],"value":"PROBE"}')

if [ "$api_status" = "403" ]; then
  pass_msg "POST /api/content returned 403 in production"
else
  fail_msg "POST /api/content returned $api_status (expected 403)"
fi

# Cleanup
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo
if [ "$fail" -eq 0 ]; then
  echo -e "${GREEN}All prod-safety checks passed.${NC}"
  exit 0
else
  echo -e "${RED}Prod-safety checks FAILED — do not push.${NC}"
  exit 1
fi
