#!/bin/bash
# filepath: /workspaces/crossword2/check_logs.sh
# Script to check logs in the cPanel environment

# Colors for better readability
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Checking Server Logs ===${NC}"

# Check if logs directory exists
if [ ! -d "logs" ]; then
  echo -e "${YELLOW}Logs directory not found. Creating it...${NC}"
  mkdir -p logs
fi

# Check client logs
if [ -f "logs/client.log" ]; then
  echo -e "${GREEN}=== Recent Client Logs ===${NC}"
  tail -n 50 logs/client.log
else
  echo -e "${YELLOW}No client logs found. They will be created when the app runs.${NC}"
fi

# Check application logs (if using pm2)
if command -v pm2 &> /dev/null; then
  echo -e "${GREEN}=== PM2 Logs (if available) ===${NC}"
  pm2 logs --lines 20 2>/dev/null || echo "No PM2 logs available"
fi

# Check passenger logs in cPanel (this would be on a real cPanel server)
echo -e "${GREEN}=== Instructions for checking Passenger logs on cPanel ===${NC}"
echo "On your cPanel server, check these locations:"
echo "1. Error logs: /home/username/logs/error_log"
echo "2. Application logs: /home/username/logs/nodejs.log"
echo "3. Or via cPanel interface: Metrics → Errors"

# If running locally, show Node.js process output
echo -e "${GREEN}=== Node.js Process Output (local only) ===${NC}"
ps aux | grep node | grep -v grep

echo -e "${GREEN}=== End of Log Check ===${NC}"
