#!/bin/bash
# Test script for versioned API endpoints

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Function to test an endpoint
test_endpoint() {
    local url=$1
    local expected_status=$2
    local description=$3
    
    echo -e "${YELLOW}Testing: $description${NC}"
    echo "URL: $url"
    
    # Make the request and capture the status code
    status_code=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [ "$status_code" -eq "$expected_status" ]; then
        echo -e "${GREEN}✓ Success: Got expected status $status_code${NC}"
    else
        echo -e "${RED}✗ Failed: Expected status $expected_status but got $status_code${NC}"
    fi
    echo ""
}

# Basic endpoints
test_endpoint "http://localhost:3000/" 200 "Home page (should work)"
test_endpoint "http://localhost:3000/v1" 200 "Versioned base route (should redirect to home or login)"

# Auth endpoints
test_endpoint "http://localhost:3000/v1/auth/login" 200 "Login page"
test_endpoint "http://localhost:3000/v1/auth/register" 200 "Registration page"

# Admin endpoints
test_endpoint "http://localhost:3000/v1/admin" 302 "Admin dashboard (should redirect to login)"
test_endpoint "http://localhost:3000/v1/admin/users" 302 "Admin users list (should redirect to login)"
test_endpoint "http://localhost:3000/v1/admin/puzzles" 302 "Admin puzzles list (should redirect to login)"
test_endpoint "http://localhost:3000/v1/admin/import-puzzles" 302 "Admin import puzzles (should redirect to login)"

# Game endpoints
test_endpoint "http://localhost:3000/v1/game/dashboard" 302 "Game dashboard (should redirect to login)"
test_endpoint "http://localhost:3000/v1/achievements" 302 "Achievements page (should redirect to login)"

# Check CSS endpoints
test_endpoint "http://localhost:3000/v1/styles.css" 200 "Styles CSS file"
test_endpoint "http://localhost:3000/v1/admin-styles.css" 200 "Admin styles CSS file"
test_endpoint "http://localhost:3000/v1/message-styles.css" 200 "Message styles CSS file"

echo -e "${GREEN}All tests completed!${NC}"
