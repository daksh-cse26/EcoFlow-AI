#!/bin/sh
set -e

# Force complete standard PATH for Render container execution
export PATH="/usr/local/bin:/usr/local/sbin:/usr/bin:/usr/sbin:/bin:/sbin:$PATH"

echo "==> [EcoFlow AI Bootloader] Container initialization started"
echo "==> Working Directory: $(pwd)"
echo "==> Active PATH: $PATH"

# Locate Python binary across all possible standard paths
PYTHON_BIN=""
for candidate in /usr/local/bin/python3 /bin/python3 /usr/bin/python3 /usr/local/bin/python /bin/python /usr/bin/python; do
    if [ -x "$candidate" ]; then
        PYTHON_BIN="$candidate"
        break
    fi
done

if [ -z "$PYTHON_BIN" ]; then
    echo "ERROR: Could not locate Python binary! Checking directory contents:"
    ls -la /usr/local/bin /bin /usr/bin 2>/dev/null || true
    exit 1
fi

echo "==> Located Python binary: $PYTHON_BIN ($($PYTHON_BIN --version 2>&1))"
echo "==> Target Port: ${PORT:-10000}"
echo "==> Launching EcoFlow AI server..."

exec "$PYTHON_BIN" -u /app/server.py
