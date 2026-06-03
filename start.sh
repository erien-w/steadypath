#!/bin/bash

# Configuration
VENV_PATH="/Users/macbook/my-rasa-assistant/.venv"
PORT=8080
PORT_ACTIONS=5055

echo "--- Cleaning up existing processes ---"
lsof -ti:$PORT | xargs kill -9 2>/dev/null
lsof -ti:$PORT_ACTIONS | xargs kill -9 2>/dev/null

echo "--- Starting Action Server on port $PORT_ACTIONS ---"
$VENV_PATH/bin/rasa run actions -p $PORT_ACTIONS &

# Small delay to allow the Action Server to bind
sleep 3

echo "--- Starting Rasa Server on port $PORT ---"
$VENV_PATH/bin/rasa run \
    --enable-api \
    --cors "*" \
    --port $PORT \
    --host 0.0.0.0 \
    --credentials credentials.yml \
    --endpoints endpoints.yml \
    --debug