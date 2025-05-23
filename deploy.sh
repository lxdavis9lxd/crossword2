#!/bin/bash

# Deployment script for Azure App Service with SQLite
# This script ensures the SQLite database is in a persistent location

echo "Starting deployment process for Crossword application with SQLite..."

# Create data directory if it doesn't exist
if [ ! -d /home/site/wwwroot/data ]; then
  echo "Creating persistent data directory..."
  mkdir -p /home/site/wwwroot/data
  
  # Set proper permissions
  chmod 775 /home/site/wwwroot/data
fi

# Check if database exists in the data directory
if [ ! -f /home/site/wwwroot/data/database.sqlite ]; then
  echo "Database not found in persistent storage. Copying..."
  
  # Check if we have a database file in the deployment
  if [ -f /home/site/wwwroot/database.sqlite ]; then
    cp /home/site/wwwroot/database.sqlite /home/site/wwwroot/data/database.sqlite
    echo "Database copied to persistent storage."
  else
    echo "No database found. Will create a new one."
    touch /home/site/wwwroot/data/database.sqlite
  fi
  
  # Set proper permissions for the database file
  chmod 664 /home/site/wwwroot/data/database.sqlite
else
  echo "Database already exists in persistent storage."
fi

# Create a backup directory if it doesn't exist
if [ ! -d /home/site/backups ]; then
  echo "Creating backup directory..."
  mkdir -p /home/site/backups
  chmod 775 /home/site/backups
fi

# Create a daily backup of the database
if [ -f /home/site/wwwroot/data/database.sqlite ]; then
  echo "Creating database backup..."
  cp /home/site/wwwroot/data/database.sqlite "/home/site/backups/database.sqlite.$(date +%Y%m%d)"
  echo "Backup created."
fi

# Set NODE_ENV environment variable if not already set
if [ -z "$NODE_ENV" ]; then
  echo "Setting NODE_ENV to production..."
  export NODE_ENV=production
fi

echo "Deployment setup complete!"
echo "Your Crossword application is ready to run with SQLite on Azure App Service."
