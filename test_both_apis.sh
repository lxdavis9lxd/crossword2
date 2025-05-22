#!/bin/bash
# filepath: /workspaces/crossword2/test_both_apis.sh

# Script to test both the standard and versioned APIs

echo "====================================================="
echo "TESTING BOTH STANDARD AND VERSIONED APIs"
echo "====================================================="

# Start the standard server
echo "Starting standard server..."
./run_server.sh --standard &
SERVER_PID=$!

# Wait for server to initialize
echo "Waiting for server to initialize..."
sleep 5

# Run the standard API test
echo -e "\n\n====================================================="
echo "RUNNING STANDARD API TEST"
echo "====================================================="
./test_excel_upload.sh

# Kill the standard server
echo "Stopping standard server..."
kill $SERVER_PID
sleep 2

# Start the versioned server
echo -e "\n\n====================================================="
echo "Starting server with API versioning..."
./run_server.sh --versioned &
SERVER_PID=$!

# Wait for server to initialize
echo "Waiting for server to initialize..."
sleep 5

# Run the versioned API test
echo -e "\n\n====================================================="
echo "RUNNING VERSIONED API TEST"
echo "====================================================="
./test_excel_upload_v1.sh

# Kill the versioned server
echo "Stopping versioned server..."
kill $SERVER_PID

echo -e "\n\n====================================================="
echo "TESTS COMPLETED"
echo "====================================================="
echo "Review the output above to compare the behavior of both APIs"
echo "For detailed results, see API_VERSIONING_FINAL.md"
