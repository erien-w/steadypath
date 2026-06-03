#!/bin/bash

# Configuration
# In the Railway container, Rasa is installed globally via pip and available on PATH.
PORT="${PORT:-8080}"
PORT_ACTIONS="${PORT_ACTIONS:-5055}"

# Resolve the rasa binary from PATH so the script works in any environment.
RASA_BIN="$(which rasa)"
if [ -z "$RASA_BIN" ]; then
    echo "ERROR: 'rasa' not found in PATH. Ensure Rasa is installed." >&2
    exit 1
fi

echo "--- Using rasa binary: $RASA_BIN ---"

echo "--- Starting Action Server on port $PORT_ACTIONS ---"
"$RASA_BIN" run actions -p "$PORT_ACTIONS" &

# Small delay to allow the Action Server to bind
sleep 3

echo "--- Starting Rasa Server on port $PORT ---"
"$RASA_BIN" run \
    --enable-api \
    --cors "*" \
    --port "$PORT" \
    --host 0.0.0.0 \
    --credentials credentials.yml \
    --endpoints endpoints.yml \
    --debug