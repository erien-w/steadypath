#!/bin/bash

# Start the action server in the background
rasa run actions -p $PORT_ACTIONS &

# Start the rasa server on the port provided by Railway (default 8080)
rasa run --enable-api --cors "*" --port ${PORT:-8080} --interface 0.0.0.0
