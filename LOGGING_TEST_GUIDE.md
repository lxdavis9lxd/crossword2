# Testing the Logging System in cPanel

This guide provides instructions for testing the enhanced logging system in the cPanel environment. The logging system captures client-side logs from scripts.js and sends them to the server, where they are written to both the console (which Passenger captures) and a log file.

## What Was Implemented

1. **Client-Side Logging**:
   - Added `logToServer()` function to scripts.js that sends logs to a server endpoint
   - Replaced all console.log calls with logToServer() calls
   - Implemented different log levels (info, debug, warn, error)
   - Added detailed contextual information to logs

2. **Server-Side Logging**:
   - Created a new `/v1/api/log` endpoint that writes logs to both console and file
   - Set up a dedicated log file for client-side logs
   - Implemented structured logging with timestamps and log levels

3. **Error Logging**:
   - Added global error handlers in errorlogger.js
   - Captures unhandled exceptions and promise rejections
   - Enhanced error context with stack traces and URL information

## Testing in cPanel Environment

### Step 1: Deploy to cPanel
1. Ensure all files are properly uploaded to your cPanel hosting
2. Verify the logs directory exists and has proper write permissions
3. Restart the Node.js application in cPanel if necessary

### Step 2: Test Basic Logging
1. Navigate to the crossword application in your browser
2. Open the dashboard page
3. The application will automatically log various events as you interact with it
4. Check the logs using instructions below

### Step 3: Test the Load Puzzles Button
1. Select a difficulty level from the dropdown
2. Click the "Load Puzzles" button
3. This should generate multiple log entries showing:
   - Button click event
   - Fetch request details
   - API response information
   - Any errors if the request fails

### Step 4: View the Logs
Run the check_logs.sh script on your server, or check the following locations:

1. **Client Logs File**: `/path/to/app/logs/client.log`
2. **Passenger Logs**: Usually found at `/home/username/logs/error_log` or accessible via cPanel interface (Metrics → Errors)

### Step 5: Test the Dedicated Test Page
1. Navigate to `/test-logging.html` in your browser
2. Click the various test buttons to generate different types of logs
3. Check that these logs appear in both the browser console and server logs

## Common Issues and Troubleshooting

1. **Logs Not Appearing**:
   - Verify permissions on the logs directory
   - Check that the Node.js process is running
   - Ensure the API endpoint is accessible

2. **Permission Issues**:
   - In cPanel, set proper permissions on the logs directory: `chmod 755 logs`
   - Make sure the Node.js process has write access: `chown -R username:username logs`

3. **Passenger Configuration**:
   - Verify Passenger is properly configured to capture stdout/stderr
   - Check Passenger application log settings in cPanel

## Advanced Debugging

If the logging system doesn't resolve the issue with the load puzzles button, try:

1. Add more detailed logging in the loadPuzzlesForLevel function
2. Check the network tab in browser dev tools for API request/response details
3. Verify that the API endpoints are properly configured and accessible
4. Check for CORS issues if the application is hosted on a different domain
