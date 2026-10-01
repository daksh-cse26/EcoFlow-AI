#!/bin/sh
set -e

echo "==> [EcoFlow AI Bootloader] Container initialization started"
echo "==> Working Directory: $(pwd)"
echo "==> System User: $(whoami 2>/dev/null || id -u)"
echo "==> Container Arguments: $@"
echo "==> Target Port: ${PORT:-10000}"

# Run server directly with unbuffered output
echo "==> Launching EcoFlow AI server..."
exec python3 -u /app/server.py
