#!/bin/bash

# Start the action server in the background
rasa run actions -p $PORT_ACTIONS &

# Start the rasa server
rasa run --enable-api --cors "*" --port $PORT
