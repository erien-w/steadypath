#!/bin/bash

# Configuration
PORT="${PORT:-8080}"
PORT_ACTIONS="${PORT_ACTIONS:-5055}"

# Resolve the rasa binary from PATH
RASA_BIN="$(which rasa)"
if [ -z "$RASA_BIN" ]; then
    echo "ERROR: 'rasa' not found in PATH. Ensure Rasa is installed." >&2
    exit 1
fi

echo "--- Using rasa binary: $RASA_BIN ---"

echo "--- Starting Action Server on port $PORT_ACTIONS ---"
"$RASA_BIN" run actions -p "$PORT_ACTIONS" &

sleep 3

echo "--- Starting Rasa Server on port $PORT ---"
"$RASA_BIN" run \
    --host 0.0.0.0 \
    --port "$PORT" \
    --enable-api \
    --cors "*" \
    --credentials credentials.yml \
    --endpoints endpoints.yml \
    --debug