#!/bin/bash
# filepath: /workspaces/crossword2/run_server.sh

# Script to run the server with API versioning

# Kill any existing Node.js processes
echo "Stopping any running servers..."
pkill -f "node app" || true
sleep 1

# Start the server with API versioning
echo "Starting server with API versioning support (/v1 prefix)..."
node app.js
