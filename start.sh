#!/bin/bash

PORT="${PORT:-8080}"
PORT_ACTIONS="${PORT_ACTIONS:-5055}"

echo "--- Starting Action Server on port $PORT_ACTIONS ---"
rasa run actions -p "$PORT_ACTIONS" &

sleep 5

echo "--- Starting Rasa Server on port $PORT ---"
rasa run \
    --host 0.0.0.0 \
    --port "$PORT" \
    --enable-api \
    --cors "*" \
    --credentials credentials.yml \
    --endpoints endpoints.yml \
    --debug \
    models/