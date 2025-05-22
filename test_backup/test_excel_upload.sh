#!/bin/bash

echo "Testing Excel file upload functionality..."

# Create a cookie jar file to store cookies between requests
COOKIE_JAR="cookie.txt"
if [ -f "$COOKIE_JAR" ]; then
    rm "$COOKIE_JAR"
fi

# Path to the test Excel file
TEST_EXCEL_FILE="./temp/test-import-puzzle.xlsx"

# Step 1: Log in as admin
echo -e "\nStep 1: Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_JAR" -b "$COOKIE_JAR" -X POST \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "emailOrUsername=admin@example.com&password=Admin123!" \
    http://localhost:3000/v1/auth/login)

echo "Login completed"

# Step 2: Check session to confirm we're logged in as admin
echo -e "\nStep 2: Checking session..."
SESSION_INFO=$(curl -s -b "$COOKIE_JAR" http://localhost:3000/v1/debug-session)
echo "Session info: $SESSION_INFO"

# Check if we're logged in as admin
if echo "$SESSION_INFO" | grep -q '"role":"admin"'; then
    echo "✅ Logged in as admin"
else
    echo "❌ Not logged in as admin"
    exit 1
fi

# Step 3: Upload the Excel file
echo -e "\nStep 3: Uploading Excel file..."
echo "File to upload: $TEST_EXCEL_FILE"

# Check if the test file exists
if [ ! -f "$TEST_EXCEL_FILE" ]; then
    echo "❌ Test file not found at: $TEST_EXCEL_FILE"
    exit 1
fi

# Upload the file
UPLOAD_RESPONSE=$(curl -s -b "$COOKIE_JAR" -X POST \
    -F "puzzleFile=@$TEST_EXCEL_FILE" \
    -o upload_response.html \
    -w "%{http_code}" \
    http://localhost:3000/v1/admin/import-puzzles)

HTTP_CODE=$UPLOAD_RESPONSE
echo "HTTP response code: $HTTP_CODE"    # Check if the upload was successful
if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ File uploaded successfully"
    
    # Check for import results page
    if grep -q "Import Results" upload_response.html; then
        echo "✅ Import successful! Redirected to results page."
        
        # Try to find success count
        if grep -q "Successfully Imported:" upload_response.html; then
            SUCCESS_COUNT=$(grep -A1 "Successfully Imported:" upload_response.html | tail -n1 | grep -o "[0-9]\+")
            echo "Imported $SUCCESS_COUNT puzzles"
        fi
    # Check if the response contains success message on the same page
    elif grep -q "Successfully imported" upload_response.html; then
        echo "✅ Import successful!"
        SUCCESS_COUNT=$(grep -o "Successfully imported [0-9]\+ puzzles" upload_response.html | grep -o "[0-9]\+")
        echo "Imported $SUCCESS_COUNT puzzles"
    else
        echo "❌ Import failed or couldn't find success message. Checking for errors..."
        if grep -q "error" upload_response.html; then
            ERROR_MSG=$(grep -o "error.*</div>" upload_response.html)
            echo "Error message: $ERROR_MSG"
        fi
    fi
else
    echo "❌ Upload failed with HTTP code: $HTTP_CODE"
fi

# Step 4: Verify the imported puzzle exists in the database
echo -e "\nStep 4: Verifying imported puzzle..."
# This would require DB access, but we'll check the puzzles page instead

PUZZLES_PAGE=$(curl -s -b "$COOKIE_JAR" http://localhost:3000/v1/admin/puzzles)
echo "Checking admin puzzles page for our test puzzle..."

if echo "$PUZZLES_PAGE" | grep -q "Test Puzzle 1"; then
    echo "✅ Found imported puzzle 'Test Puzzle 1' in the puzzles list"
else
    echo "❌ Could not find imported puzzle in the puzzles list"
fi

echo -e "\nTest completed!"
