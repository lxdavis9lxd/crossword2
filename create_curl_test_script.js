// Script to test import functionality using curl commands

// Create a bash script that will test the import-puzzles functionality
const fs = require('fs');
const path = require('path');

const scriptContent = `#!/bin/bash

echo "Testing import-puzzles functionality..."

# Create a cookie jar file to store cookies between requests
COOKIE_JAR="cookie.txt"
if [ -f "$COOKIE_JAR" ]; then
    rm "$COOKIE_JAR"
fi

# Step 1: Get the login page and extract any csrf token if needed
echo -e "\\nStep 1: Getting login page..."
LOGIN_PAGE=$(curl -s -c "$COOKIE_JAR" http://localhost:3000/auth/login)

# If we needed to extract a CSRF token, we would do it here
# CSRF_TOKEN=$(echo "$LOGIN_PAGE" | grep -oP 'name="_csrf" value="\\K[^"]+')

# Step 2: Log in as admin
echo -e "\\nStep 2: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -b "$COOKIE_JAR" -c "$COOKIE_JAR" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "emailOrUsername=admin@example.com&password=Admin123!" \
    http://localhost:3000/auth/login)

echo "Login response received"

# Step 3: Debug - Check current session
echo -e "\\nStep 3: Checking session..."
SESSION_INFO=$(curl -s -b "$COOKIE_JAR" http://localhost:3000/debug-session)
echo "Session info: $SESSION_INFO"

# Step 4: Try to access the import-puzzles page
echo -e "\\nStep 4: Accessing import-puzzles page..."
IMPORT_PAGE=$(curl -s -b "$COOKIE_JAR" http://localhost:3000/admin/import-puzzles)

# Check if we got an access denied message
if echo "$IMPORT_PAGE" | grep -q "Access Denied"; then
    echo "❌ Access denied to import-puzzles page!"
    echo -e "\\nPage content (excerpt):"
    echo "$IMPORT_PAGE" | grep -A5 -B5 "Access Denied"
else
    echo "✅ Successfully accessed import-puzzles page!"
    
    # Check for form elements
    if echo "$IMPORT_PAGE" | grep -q 'form.*action="/admin/import-puzzles"'; then
        echo "✅ Import form found on page"
    else
        echo "❌ Import form not found on page"
    fi
    
    if echo "$IMPORT_PAGE" | grep -q 'input.*type="file".*name="excelFile"'; then
        echo "✅ File input field found on page"
    else
        echo "❌ File input field not found on page"
    fi
fi

# Step 5: Create a test Excel file
echo -e "\\nStep 5: Creating a test Excel file..."
# This would usually involve creating/copying an Excel file, but for this test we'll just check if temporary directory exists
TEMP_DIR="./temp"
if [ ! -d "$TEMP_DIR" ]; then
    mkdir -p "$TEMP_DIR"
    echo "Created temp directory"
fi

echo "Test completed!"
`;

const scriptPath = path.join(__dirname, 'curl_test_import.sh');
fs.writeFileSync(scriptPath, scriptContent);
fs.chmodSync(scriptPath, '755'); // Make executable

console.log(`Script created at ${scriptPath}`);
console.log('Run it with: ./curl_test_import.sh');
