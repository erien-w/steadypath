#!/bin/bash

# Print port info for debugging
echo "Starting Rasa on port ${PORT:-8080}..."
echo "Starting Action Server on port $PORT_ACTIONS..."

# Start the action server in the background
rasa run actions -p $PORT_ACTIONS --auto-reload &

# Start the rasa server
# We explicitly specify credentials and endpoints to be safe
rasa run \
    --enable-api \
    --cors "*" \
    --port ${PORT:-8080} \
    --interface 0.0.0.0 \
    --credentials credentials.yml \
    --endpoints endpoints.yml \
    --debug
