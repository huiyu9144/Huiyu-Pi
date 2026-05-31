#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

# ===== Detect LAN IP (cross-platform Linux/macOS) =====
LAN_IP=""
if [[ "$(uname)" == "Darwin" ]]; then
  LAN_IP=$(ifconfig | grep 'inet ' | grep -v '127.0.0.1' | awk '{print $2}' | head -1)
elif command -v ip &>/dev/null; then
  LAN_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
fi
if [ -z "$LAN_IP" ]; then
  LAN_IP="127.0.0.1"
fi

echo "========================================"
echo "  Huiyu Pi - LAN Access"
echo ""
echo "  Local:"
echo "    http://localhost:9144"
echo ""
echo "  LAN (other devices):"
echo "    http://${LAN_IP}:9144"
echo "========================================"
echo ""

# ===== Step 1: Install dependencies =====
if [ ! -d "node_modules" ]; then
  echo "[1/1] First run - installing dependencies..."
  npm install
  echo "[1/1] Done."
else
  echo "[1/1] Dependencies already installed, skip."
fi

echo ""
echo "[2/2] Starting server..."
echo ""

export HOST=0.0.0.0
PORT=9144

# ===== Step 2: Build server if needed =====
if [ -f "packages/server/dist/index.js" ]; then
  echo "[API] Using pre-built server (fast start)"
else
  echo "[API] First run: building server..."
  npm run build -w packages/server
  echo "[API] Build done."
fi

# ===== Step 3: Kill any lingering server on port 9144 =====
lsof -ti tcp:9144 2>/dev/null | xargs kill -9 2>/dev/null || true

# ===== Step 4: Start API server in background =====
HOST=0.0.0.0 PORT=9144 node packages/server/dist/index.js &
API_PID=$!

# Cleanup on exit: kill the background server when this script exits.
trap "kill $API_PID 2>/dev/null || true" EXIT INT TERM

# ===== Step 5: Wait for API server =====
echo "Waiting for API server..."
for i in $(seq 1 30); do
  if curl -s -o /dev/null -w "%{http_code}" http://localhost:9144/api/v1/health 2>/dev/null | grep -q "200"; then
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[ERROR] API server failed to start within 30 seconds."
    exit 1
  fi
  sleep 1
done

echo ""
echo "========================================"
echo "  Server ready!"
echo "  LAN: http://${LAN_IP}:9144"
echo "  Opening browser..."
echo "========================================"
echo ""

# ===== Step 6: Open browser (macOS -> open, Linux -> xdg-open) =====
if command -v open &>/dev/null; then
  open "http://${LAN_IP}:9144"
elif command -v xdg-open &>/dev/null; then
  xdg-open "http://${LAN_IP}:9144"
fi

# ===== Wait for server process =====
echo "Press Ctrl+C to stop the server."
wait $API_PID
