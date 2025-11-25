#!/bin/bash

# Start NGINX in the background
nginx -g 'daemon off;' &
NGINX_PID=$!


cd /app || exit 1
yarn run start:backend &
DUNA_PID=$!

# Function to clean up when the script exits
cleanup() {
    echo "Stopping duna..."
    kill "$DUNA_PID" 2>/dev/null
    echo "Stopping NGINX..."
    kill "$NGINX_PID" 2>/dev/null
    exit 0
}

# Trap termination signals to clean up properly
trap cleanup SIGTERM SIGINT

# Wait for either process to exit
wait -n "$NGINX_PID" "$DUNA_PID"

# If one process exits, clean up the other
cleanup
